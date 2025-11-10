# 認証機能 実装ガイド

React と Supabase の基礎を学んだので、実際に認証機能を作りましょう！

---

## 🎯 これから作るもの

1. **AuthContext**: アプリ全体でログイン状態を共有する仕組み
2. **ログインページ**: メールアドレスとパスワードでログイン
3. **ログアウト機能**: トップページにログアウトボタン

---

## Step 1: AuthContext を作る

### 📝 考え方

**問題**:
- トップページでもログイン状態を知りたい
- プロフィールページでもログイン状態を知りたい
- 全ページで同じログイン状態を共有したい

**解決策**:
React の Context を使って、アプリ全体でログイン状態を共有する

### 🛠️ 実装

#### 1. ファイルを作成
```
lib/AuthContext.tsx
```

#### 2. ファイルの構成

以下の順番で実装してください：

```tsx
'use client'

// === 1. import ===
// React から必要なものをインポート
// Supabase から必要なものをインポート

// === 2. 型定義 ===
// AuthContextType を定義（user, loading, signIn, signUp, signOut）

// === 3. Context 作成 ===
// createContext で AuthContext を作成

// === 4. Provider コンポーネント ===
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 4-1. State を作成（user, loading）

  // 4-2. useEffect でログイン状態をチェック

  // 4-3. ログイン関数を実装

  // 4-4. 新規登録関数を実装

  // 4-5. ログアウト関数を実装

  // 4-6. Provider を return
}

// === 5. Custom Hook ===
export function useAuth() {
  // useContext で AuthContext を取得
  // エラーチェック
  // return context
}
```

### 💡 ヒント

<details>
<summary>1. import の答え</summary>

```tsx
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'
```
</details>

<details>
<summary>2. 型定義の答え</summary>

```tsx
type AuthContextType = {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}
```
</details>

<details>
<summary>3. Context 作成の答え</summary>

```tsx
const AuthContext = createContext<AuthContextType | undefined>(undefined)
```
</details>

<details>
<summary>4-1. State の答え</summary>

```tsx
const [user, setUser] = useState<User | null>(null)
const [loading, setLoading] = useState(true)
```
</details>

<details>
<summary>4-2. useEffect の答え</summary>

```tsx
useEffect(() => {
  // 最初にセッションを取得
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user ?? null)
    setLoading(false)
  })

  // 認証状態の変化を監視
  const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
    setUser(session?.user ?? null)
  })

  // クリーンアップ
  return () => subscription.unsubscribe()
}, [])
```

**説明**:
- `session?.user`: session が null じゃなければ user を取得
- `?? null`: 左側が null/undefined なら右側を使う
</details>

<details>
<summary>4-3. ログイン関数の答え</summary>

```tsx
const signIn = async (email: string, password: string) => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })
  if (error) throw error
}
```
</details>

<details>
<summary>4-4. 新規登録関数の答え</summary>

```tsx
const signUp = async (email: string, password: string) => {
  const { error } = await supabase.auth.signUp({
    email,
    password
  })
  if (error) throw error
}
```
</details>

<details>
<summary>4-5. ログアウト関数の答え</summary>

```tsx
const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
```
</details>

<details>
<summary>4-6. Provider の答え</summary>

```tsx
return (
  <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
    {children}
  </AuthContext.Provider>
)
```
</details>

<details>
<summary>5. Custom Hook の答え</summary>

```tsx
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```
</details>

### ✅ 確認

- [ ] `lib/AuthContext.tsx` を作成した
- [ ] エラーが出ていない
- [ ] 全ての関数を実装した

---

## Step 2: アプリ全体に AuthProvider を適用

### 📝 考え方

AuthProvider で全ページを囲むことで、どのページからでも `useAuth()` が使えるようになる。

### 🛠️ 実装

#### 1. `app/layout.tsx` を編集

現在のファイルを開いて、以下のように**修正**してください：

```tsx
import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthContext";  // ← これを追加

export const metadata: Metadata = {
  title: "Footprints",
  description: "旅の思い出記録アプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>  {/* ← これを追加 */}
          {children}
        </AuthProvider>  {/* ← これを追加 */}
      </body>
    </html>
  );
}
```

### ✅ 確認

- [ ] `app/layout.tsx` を編集した
- [ ] エラーが出ていない
- [ ] ブラウザで http://localhost:3000 を開いて地図が表示されることを確認

---

## Step 3: ログインページを作る

### 📝 考え方

ログインページに必要なもの：
- メールアドレスの入力欄
- パスワードの入力欄
- ログインボタン
- 新規登録ボタン
- エラーメッセージ表示

### 🛠️ 実装

#### 1. ファイルを作成
```
app/login/page.tsx
```

#### 2. 基本構造

以下を参考に実装してください：

```tsx
'use client'

// === 1. import ===
// useState, useAuth, useRouter をインポート

export default function LoginPage() {
  // === 2. State を作成 ===
  // email, password, isSignUp, error, loading

  // === 3. useAuth から関数を取得 ===
  // const { signIn, signUp } = useAuth()

  // === 4. useRouter を取得 ===
  // const router = useRouter()

  // === 5. フォーム送信処理 ===
  const handleSubmit = async (e: React.FormEvent) => {
    // e.preventDefault() でリロードを防ぐ
    // エラーをクリア
    // ローディング開始

    // try-catch でエラーハンドリング
    // isSignUp に応じて signUp か signIn を呼ぶ
    // 成功したらトップページへ遷移（router.push('/')）
  }

  // === 6. JSX を return ===
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1>{/* タイトル */}</h1>

        <form onSubmit={handleSubmit}>
          {/* メールアドレス入力 */}
          {/* パスワード入力 */}
          {/* エラー表示 */}
          {/* 送信ボタン */}
        </form>

        {/* ログイン⇔新規登録 切り替えボタン */}
      </div>
    </div>
  )
}
```

### 💡 ヒント

<details>
<summary>フォーム送信処理の答え</summary>

```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setError('')
  setLoading(true)

  try {
    if (isSignUp) {
      await signUp(email, password)
      alert('確認メールを送信しました')
    } else {
      await signIn(email, password)
      router.push('/')  // トップページへ
    }
  } catch (err: any) {
    setError(err.message || 'エラーが発生しました')
  } finally {
    setLoading(false)
  }
}
```
</details>

<details>
<summary>入力欄の例</summary>

```tsx
<div>
  <label className="block text-sm font-medium mb-1">
    メールアドレス
  </label>
  <input
    type="email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    required
    className="w-full px-3 py-2 border rounded-lg"
  />
</div>
```
</details>

### ✅ 確認

- [ ] `app/login/page.tsx` を作成した
- [ ] ブラウザで http://localhost:3000/login にアクセスしてフォームが表示される

---

## Step 4: トップページにログアウトボタンを追加

### 📝 考え方

トップページで：
1. ログイン状態をチェック
2. ログインしていなければログインページへリダイレクト
3. ログインしていればログアウトボタンを表示

### 🛠️ 実装

#### 1. `app/page.tsx` を編集

現在のファイルを開いて、以下のように**修正**してください：

```tsx
'use client'

// === 1. import に追加 ===
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'

// 既存の import は残す

export default function Home() {
  // === 2. 認証情報を取得 ===
  const { user, signOut, loading } = useAuth()
  const router = useRouter()

  // 既存の State（pins）は残す
  const [pins, setPins] = useState<Array<{ lat: number; lng: number }>>([])

  // === 3. ログアウト処理 ===
  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('ログアウトエラー:', error)
    }
  }

  // === 4. 読み込み中の表示 ===
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">読み込み中...</div>
  }

  // === 5. 未ログインならログインページへ ===
  if (!user) {
    router.push('/login')
    return null
  }

  // === 6. JSX を修正 ===
  return (
    <div className="h-screen flex flex-col">
      {/* ヘッダーを追加 */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Footprints</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">{user.email}</span>
          <button
            onClick={handleSignOut}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            ログアウト
          </button>
        </div>
      </header>

      {/* 既存の地図部分 */}
      <main className="flex-1">
        <MapView pins={pins} setPins={setPins} />
      </main>
    </div>
  )
}
```

### ✅ 確認

- [ ] `app/page.tsx` を編集した
- [ ] ブラウザで動作確認（次のセクション）

---

## ✅ 動作確認

### 1. 新規登録

1. http://localhost:3000 にアクセス
2. ログインページにリダイレクトされる
3. 「新規登録はこちら」をクリック
4. メールアドレスとパスワード（6文字以上）を入力
5. 「登録」ボタンをクリック

**重要**: Supabaseの設定によっては、メール確認が必要です。

#### メール確認を無効にする（開発用）

1. Supabase ダッシュボード https://supabase.com にアクセス
2. プロジェクトを選択
3. Authentication → Settings → Email Confirmations を **OFF** にする

### 2. ログイン

1. 登録したメールアドレスとパスワードを入力
2. 「ログイン」ボタンをクリック
3. 地図画面が表示されたら成功！
4. 右上にメールアドレスとログアウトボタンが表示される

### 3. ログアウト

1. ログアウトボタンをクリック
2. ログインページにリダイレクトされる

---

## 🐛 よくあるエラーと対処法

### エラー1: `useAuth must be used within an AuthProvider`

**原因**: AuthProviderで囲まれていないコンポーネントでuseAuth()を使った

**対処**: `app/layout.tsx` でAuthProviderが正しく設定されているか確認

### エラー2: `'use client' が必要です`

**原因**: ブラウザの機能を使っているのに宣言がない

**対処**: ファイルの最初に `'use client'` を追加

### エラー3: ログインできない

**原因**: Supabaseでメール確認が必要

**対処**: 上記の「メール確認を無効にする」を実行

---

## 🎉 完成！

認証機能の実装が完了しました！

学んだこと：
- ✅ Context でデータをアプリ全体で共有
- ✅ Supabase Auth の基本的な使い方
- ✅ フォームの作成とイベント処理
- ✅ 条件分岐でページを保護

---

## 📝 次のステップ

認証機能ができたので、次は：
1. **footprints（足跡）の保存**: 地図でクリックした場所をSupabaseに保存
2. **保存した足跡の表示**: データベースから取得して地図に表示
3. **詳細情報の追加**: 写真、感想、評価などを追加

準備ができたら教えてください！
