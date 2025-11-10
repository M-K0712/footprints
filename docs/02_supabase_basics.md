# Supabase 基礎講座

## 📚 Supabase とは？

**Supabase = Firebase の代替品（オープンソース版）**

提供する機能：
- 🗄️ **データベース**（PostgreSQL）
- 🔐 **認証**（ログイン・ログアウト）
- 📁 **ストレージ**（画像などのファイル保存）
- 🔔 **リアルタイム**（データの変更を即座に反映）

今回使うのは主に「認証」機能です。

---

## 1. Supabaseクライアントの初期化

### すでに作成済みのファイル

`lib/supabase.ts`:
```tsx
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

💡 **説明**:
- `createClient`: Supabaseに接続するクライアントを作成
- `process.env.NEXT_PUBLIC_SUPABASE_URL`: 環境変数からURLを取得
- `!`: TypeScriptに「この値は絶対にある」と教える記号
- `export`: 他のファイルから使えるようにする

---

## 2. Supabase Auth（認証）の基本

### 2.1 新規登録（Sign Up）

```tsx
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
})

if (error) {
  console.error('登録エラー:', error.message)
} else {
  console.log('登録成功:', data)
}
```

💡 **ポイント**:
- `await` で結果を待つ
- 戻り値は `{ data, error }` の形
- エラーがあれば `error` に入る
- 成功したら `data` にユーザー情報が入る

### 2.2 ログイン（Sign In）

```tsx
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})

if (error) {
  console.error('ログインエラー:', error.message)
} else {
  console.log('ログイン成功:', data)
}
```

### 2.3 ログアウト（Sign Out）

```tsx
const { error } = await supabase.auth.signOut()

if (error) {
  console.error('ログアウトエラー:', error.message)
} else {
  console.log('ログアウト成功')
}
```

---

## 3. 現在のログイン状態を取得

### 3.1 セッション情報を取得

```tsx
const { data: { session }, error } = await supabase.auth.getSession()

if (session) {
  console.log('ログイン中:', session.user.email)
} else {
  console.log('ログアウト状態')
}
```

💡 **セッション（session）とは？**:
- ログイン状態を保持する仕組み
- ブラウザを閉じても、一定期間ログイン状態が続く
- `session.user` でユーザー情報にアクセス

### 3.2 ユーザー情報の構造

```tsx
session.user = {
  id: 'ユーザーID',
  email: 'user@example.com',
  created_at: '2024-01-01T00:00:00Z',
  // その他の情報...
}
```

---

## 4. 認証状態の変化を監視

### なぜ必要？
ログイン/ログアウトした時に自動的に画面を更新したい

### 使い方

```tsx
const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
  console.log('認証イベント:', event)  // 'SIGNED_IN', 'SIGNED_OUT' など
  console.log('セッション:', session)
})

// 監視を停止する時（クリーンアップ）
subscription.unsubscribe()
```

💡 **イベントの種類**:
- `SIGNED_IN`: ログインした
- `SIGNED_OUT`: ログアウトした
- `TOKEN_REFRESHED`: トークンが更新された
- `USER_UPDATED`: ユーザー情報が更新された

### Reactでの使用例

```tsx
useEffect(() => {
  // 認証状態の変化を監視
  const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      console.log('ログインしました')
    }
    if (event === 'SIGNED_OUT') {
      console.log('ログアウトしました')
    }
  })

  // コンポーネントが消える時に監視を停止
  return () => {
    subscription.unsubscribe()
  }
}, [])
```

---

## 5. エラーハンドリング

### 基本パターン

```tsx
try {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error  // エラーを投げる

  console.log('成功:', data)
} catch (error: any) {
  console.error('エラー:', error.message)
  // エラーメッセージをユーザーに表示
}
```

### よくあるエラー

| エラーメッセージ | 意味 |
|---|---|
| `Invalid login credentials` | メールアドレスかパスワードが間違っている |
| `Email not confirmed` | メール確認がまだ済んでいない |
| `User already registered` | すでに登録済みのメールアドレス |

---

## 6. 実際の使用例（完全版）

```tsx
'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleLogin = async () => {
    try {
      setError('')  // エラーをクリア

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      console.log('ログイン成功:', data.user.email)
      // ログイン成功後の処理...

    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="メールアドレス"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="パスワード"
      />
      <button onClick={handleLogin}>ログイン</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}
```

---

## 7. TypeScript の型

### Userの型

```tsx
import type { User } from '@supabase/supabase-js'

const [user, setUser] = useState<User | null>(null)
```

### Sessionの型

```tsx
import type { Session } from '@supabase/supabase-js'

const [session, setSession] = useState<Session | null>(null)
```

---

## ✅ まとめ：Supabase Auth の主要メソッド

```tsx
import { supabase } from '@/lib/supabase'

// 新規登録
await supabase.auth.signUp({ email, password })

// ログイン
await supabase.auth.signInWithPassword({ email, password })

// ログアウト
await supabase.auth.signOut()

// セッション取得
await supabase.auth.getSession()

// 認証状態の監視
supabase.auth.onAuthStateChange((event, session) => {
  // 処理
})
```

---

次は実際に認証機能を実装してみましょう！
→ `03_auth_implementation.md`
