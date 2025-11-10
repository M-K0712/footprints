-- ==========================================
-- Footprints アプリのデータベース設定
-- ==========================================

-- 1. public.users テーブルを作成
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  nickname TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. footprints テーブルを作成
CREATE TABLE IF NOT EXISTS public.footprints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  lat FLOAT NOT NULL,
  lng FLOAT NOT NULL,
  title TEXT DEFAULT '無題',
  description TEXT,
  photo_url TEXT,
  visited_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 3. インデックスを作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS footprints_user_id_idx ON public.footprints(user_id);
CREATE INDEX IF NOT EXISTS footprints_created_at_idx ON public.footprints(created_at DESC);

-- 4. Row Level Security を有効化
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footprints ENABLE ROW LEVEL SECURITY;

-- 5. users テーブルのポリシー
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 6. footprints テーブルのポリシー
DROP POLICY IF EXISTS "Users can view their own footprints" ON public.footprints;
CREATE POLICY "Users can view their own footprints"
  ON public.footprints FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own footprints" ON public.footprints;
CREATE POLICY "Users can insert their own footprints"
  ON public.footprints FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own footprints" ON public.footprints;
CREATE POLICY "Users can update their own footprints"
  ON public.footprints FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own footprints" ON public.footprints;
CREATE POLICY "Users can delete their own footprints"
  ON public.footprints FOR DELETE
  USING (auth.uid() = user_id);

-- 7. トリガー関数: 新規ユーザー作成時に自動で public.users にも追加
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, nickname)
  VALUES (
    NEW.id,
    NEW.email,
    SPLIT_PART(NEW.email, '@', 1)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. トリガーを設定
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 9. updated_at を自動更新する関数
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. updated_at の自動更新トリガー
DROP TRIGGER IF EXISTS set_updated_at ON public.users;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_updated_at ON public.footprints;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.footprints
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 完了！
