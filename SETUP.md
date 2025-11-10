# Footprints アプリ セットアップガイド

## 🎯 実装済みの機能

✅ ユーザー認証（ログイン・新規登録・ログアウト）
✅ 地図表示
✅ 地図クリックで足跡を保存
✅ 保存した足跡をマーカーで表示
✅ 足跡の詳細情報を編集（タイトル・説明）
✅ 足跡の削除

---

## 📋 セットアップ手順

### ステップ1: Supabase にテーブルを作成

1. https://supabase.com にログイン
2. プロジェクトを選択
3. 左サイドバーから「SQL Editor」をクリック
4. プロジェクトルートにある `supabase_setup.sql` の内容をコピー
5. SQL Editor に貼り付けて「Run」をクリック

これで以下が作成されます：
- `public.users` テーブル
- `public.footprints` テーブル
- Row Level Security ポリシー
- 自動トリガー（新規ユーザー作成時に自動でプロフィール作成）

### ステップ2: 動作確認

1. 開発サーバーが起動していることを確認
   ```bash
   npm run dev
   ```

2. ブラウザで http://localhost:3000 にアクセス

3. 新規登録
   - 「新規登録はこちら」をクリック
   - メールアドレスとパスワードを入力して登録

4. 地図をクリックして足跡を追加
   - 地図の好きな場所をクリック
   - マーカーが追加される

5. マーカーをクリックして詳細を表示
   - タイトルと説明を編集できる
   - 削除もできる

---

## 🗄️ データベース構造

### users テーブル

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | auth.users.id と同じ（主キー） |
| email | TEXT | メールアドレス |
| nickname | TEXT | ニックネーム |
| avatar_url | TEXT | プロフィール画像URL |
| bio | TEXT | 自己紹介 |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

### footprints テーブル

| カラム | 型 | 説明 |
|--------|-----|------|
| id | UUID | 主キー |
| user_id | UUID | ユーザーID（users.id を参照） |
| lat | FLOAT | 緯度 |
| lng | FLOAT | 経度 |
| title | TEXT | タイトル |
| description | TEXT | 説明 |
| photo_url | TEXT | 写真URL（未実装） |
| visited_at | DATE | 訪問日 |
| created_at | TIMESTAMP | 作成日時 |
| updated_at | TIMESTAMP | 更新日時 |

---

## 🔒 セキュリティ

Row Level Security（RLS）が有効化されています：

- ユーザーは自分のデータだけ閲覧・編集できる
- 他のユーザーのデータは見えない
- データベースレベルでセキュリティが保証される

---

## 🚀 使い方

### 足跡の追加
1. 地図の好きな場所をクリック
2. 自動的に足跡が保存される

### 足跡の編集
1. マーカーをクリック
2. ポップアップが表示される
3. 「編集」ボタンをクリック
4. タイトルと説明を編集
5. 「保存」ボタンをクリック

### 足跡の削除
1. マーカーをクリック
2. 「削除」ボタンをクリック
3. 確認ダイアログで「OK」をクリック

---

## 📂 ファイル構造

```
footprints/
├── app/
│   ├── components/
│   │   └── Map.tsx           # 地図コンポーネント（全機能実装済み）
│   ├── login/
│   │   └── page.tsx          # ログインページ
│   ├── layout.tsx            # ルートレイアウト
│   └── page.tsx              # トップページ
├── lib/
│   ├── AuthContext.tsx       # 認証コンテキスト
│   ├── supabase.ts           # Supabase クライアント
│   └── types.ts              # 型定義
├── supabase_setup.sql        # データベースセットアップSQL
└── SETUP.md                  # このファイル
```

---

## 🐛 トラブルシューティング

### エラー: `relation "public.users" does not exist`

**原因**: テーブルが作成されていない

**解決策**: `supabase_setup.sql` を実行してください

### エラー: `new row violates row-level security policy`

**原因**: Row Level Security のポリシーが正しく設定されていない

**解決策**: `supabase_setup.sql` を再実行してください

### 足跡が保存されない

**原因1**: ログインしていない
- トップページに戻ってログイン状態を確認

**原因2**: テーブルが作成されていない
- Supabase ダッシュボードで Table Editor > footprints を確認

**原因3**: Row Level Security のエラー
- ブラウザの開発者ツール（F12）でエラーを確認

---

## 📝 今後の拡張案

現在実装済みの機能に加えて、以下を追加できます：

- 📷 写真のアップロード（Supabase Storage 連携）
- 🗺️ 足跡の一覧表示ページ
- 🔍 足跡の検索・フィルタリング
- 📊 統計情報（訪問した場所の数、都道府県制覇率など）
- 🌐 他のユーザーの公開足跡を見る機能
- 💬 足跡へのコメント機能
- ⭐ 評価・お気に入り機能

---

## 💡 ヒント

### データの確認

Supabase ダッシュボード > Table Editor で直接データを確認できます：

```
Table Editor > users       # ユーザー一覧
Table Editor > footprints  # 足跡一覧
```

### SQL で確認

SQL Editor で以下のクエリを実行：

```sql
-- ユーザーと足跡の数を確認
SELECT
  u.email,
  u.nickname,
  COUNT(f.id) AS footprint_count
FROM users u
LEFT JOIN footprints f ON u.id = f.user_id
GROUP BY u.id, u.email, u.nickname;
```

---

## 🎉 完成！

これで Footprints アプリの基本機能が全て実装されました。
地図をクリックして、あなたの旅の思い出を記録しましょう！
