# React 基礎講座

## 📚 React とは？

Reactは「UIを部品（コンポーネント）に分けて作るライブラリ」です。

```tsx
// 例：ボタンというUI部品
function MyButton() {
  return <button>クリック</button>
}
```

---

## 1. コンポーネント（UI部品）

### 基本的な書き方

```tsx
// 関数として定義
function Welcome() {
  return <h1>ようこそ！</h1>
}

// 使う時
<Welcome />
```

### JSX（HTMLっぽい書き方）

```tsx
function Card() {
  return (
    <div className="card">
      <h2>タイトル</h2>
      <p>説明文</p>
    </div>
  )
}
```

💡 **ポイント**:
- `return` の中にHTMLっぽく書ける
- `class` じゃなくて `className` を使う
- 複数の要素は1つの親要素で囲む必要がある

---

## 2. useState（状態管理）

### 何ができる？
「覚えておく値」を作れる。値が変わると画面が自動更新される。

### 基本的な使い方

```tsx
import { useState } from 'react'

function Counter() {
  // [現在の値, 更新する関数] = useState(初期値)
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>カウント: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        +1する
      </button>
    </div>
  )
}
```

### 型を指定する（TypeScript）

```tsx
// 文字列
const [name, setName] = useState<string>('')

// 数値
const [age, setAge] = useState<number>(0)

// オブジェクト or null
const [user, setUser] = useState<User | null>(null)

// 配列
const [items, setItems] = useState<string[]>([])
```

### よくあるパターン

```tsx
// 値を直接設定
setCount(5)

// 前の値をもとに計算
setCount(count + 1)

// オブジェクトを更新（新しいオブジェクトを作る）
setUser({ name: '太郎', age: 25 })

// 配列に追加（スプレッド構文）
setItems([...items, '新しいアイテム'])
```

---

## 3. useEffect（副作用の処理）

### 何ができる？
- コンポーネントが画面に表示された時に処理を実行
- 特定の値が変わった時に処理を実行
- API呼び出し、タイマー設定などに使う

### 基本的な使い方

```tsx
import { useEffect } from 'react'

useEffect(() => {
  // ここに実行したい処理
  console.log('実行された！')
}, [依存する値の配列])
```

### パターン1: 最初に1回だけ実行

```tsx
useEffect(() => {
  console.log('コンポーネントが表示された！')
}, [])  // 空配列 = 最初だけ
```

### パターン2: 値が変わった時に実行

```tsx
const [count, setCount] = useState(0)

useEffect(() => {
  console.log(`カウントが ${count} に変わった！`)
}, [count])  // countが変わるたびに実行
```

### パターン3: クリーンアップ（後片付け）

```tsx
useEffect(() => {
  // タイマーを設定
  const timer = setInterval(() => {
    console.log('1秒経過')
  }, 1000)

  // return で後片付け処理
  return () => {
    clearInterval(timer)  // タイマーを停止
  }
}, [])
```

---

## 4. イベント処理

### ボタンクリック

```tsx
function MyButton() {
  const handleClick = () => {
    console.log('クリックされた！')
  }

  return <button onClick={handleClick}>クリック</button>
}
```

### フォーム入力

```tsx
function MyForm() {
  const [text, setText] = useState('')

  return (
    <input
      value={text}
      onChange={(e) => setText(e.target.value)}
    />
  )
}
```

💡 **ポイント**:
- `e.target.value` で入力された値が取れる
- `onChange` で入力のたびに実行される

### フォーム送信

```tsx
function MyForm() {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()  // ← 重要！ページリロードを防ぐ
    console.log('送信された！')
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">送信</button>
    </form>
  )
}
```

---

## 5. 条件分岐で表示を変える

### if文で分岐

```tsx
function Greeting({ isLoggedIn }: { isLoggedIn: boolean }) {
  if (isLoggedIn) {
    return <h1>おかえりなさい！</h1>
  }
  return <h1>ログインしてください</h1>
}
```

### 三項演算子で分岐

```tsx
function Status({ isActive }: { isActive: boolean }) {
  return (
    <div>
      {isActive ? 'アクティブ' : '非アクティブ'}
    </div>
  )
}
```

### && で条件付き表示

```tsx
function Message({ showMessage }: { showMessage: boolean }) {
  return (
    <div>
      {showMessage && <p>メッセージを表示</p>}
    </div>
  )
}
```

---

## 6. リスト表示（配列のレンダリング）

```tsx
function TodoList() {
  const todos = ['買い物', '掃除', '勉強']

  return (
    <ul>
      {todos.map((todo, index) => (
        <li key={index}>{todo}</li>
      ))}
    </ul>
  )
}
```

💡 **重要**: `key` 属性は必須！Reactが要素を識別するために使う。

---

## 7. Props（親から子へデータを渡す）

### 基本的な使い方

```tsx
// 子コンポーネント
function Greeting({ name }: { name: string }) {
  return <h1>こんにちは、{name}さん！</h1>
}

// 親コンポーネント
function App() {
  return <Greeting name="太郎" />
}
```

### 複数のPropsを渡す

```tsx
type UserCardProps = {
  name: string
  age: number
  email: string
}

function UserCard({ name, age, email }: UserCardProps) {
  return (
    <div>
      <h2>{name}</h2>
      <p>年齢: {age}</p>
      <p>メール: {email}</p>
    </div>
  )
}

// 使う
<UserCard name="太郎" age={25} email="taro@example.com" />
```

---

## 8. Context（深い階層へデータを渡す）

### 問題：Propsの連鎖

```tsx
// 悪い例：Propsをバケツリレー
<親 user={user}>
  <中間1 user={user}>
    <中間2 user={user}>
      <子 user={user} />  ← 最終的にここで使いたい
    </中間2>
  </中間1>
</親>
```

### 解決：Context

```tsx
// 1. Contextを作成
const UserContext = createContext<User | null>(null)

// 2. Providerで囲む（親コンポーネント）
function App() {
  const [user, setUser] = useState<User | null>(null)

  return (
    <UserContext.Provider value={user}>
      <子コンポーネント />
    </UserContext.Provider>
  )
}

// 3. どこからでも取得できる（子コンポーネント）
function 子コンポーネント() {
  const user = useContext(UserContext)
  return <div>{user?.name}</div>
}
```

---

## 9. async/await（非同期処理）

### 何に使う？
- API呼び出し
- データベース操作
- 時間がかかる処理

### 基本的な使い方

```tsx
// async をつける
const fetchData = async () => {
  // await で結果を待つ
  const response = await fetch('https://api.example.com/data')
  const data = await response.json()
  return data
}

// 使う
const handleClick = async () => {
  const data = await fetchData()
  console.log(data)
}
```

### エラー処理

```tsx
const fetchData = async () => {
  try {
    const response = await fetch('https://api.example.com/data')
    const data = await response.json()
    return data
  } catch (error) {
    console.error('エラー:', error)
    throw error  // エラーを再度投げる
  }
}
```

---

## 10. TypeScriptの型

### 基本的な型

```tsx
// 文字列
const name: string = '太郎'

// 数値
const age: number = 25

// 真偽値
const isActive: boolean = true

// 配列
const numbers: number[] = [1, 2, 3]

// オブジェクト
type User = {
  name: string
  age: number
}
const user: User = { name: '太郎', age: 25 }
```

### Union型（どちらか）

```tsx
// stringかnumber
let value: string | number
value = "こんにちは"  // OK
value = 123          // OK

// オブジェクトかnull
let user: User | null = null
```

### Optional（省略可能）

```tsx
type User = {
  name: string
  age?: number  // ← ? で省略可能
}

const user1: User = { name: '太郎' }           // OK
const user2: User = { name: '次郎', age: 30 }  // OK
```

---

## ✅ まとめ：よく使う構文一覧

```tsx
import { useState, useEffect, useContext, createContext } from 'react'

function MyComponent() {
  // 状態管理
  const [count, setCount] = useState(0)

  // 副作用（最初に1回）
  useEffect(() => {
    console.log('マウント時')
  }, [])

  // イベントハンドラ
  const handleClick = () => {
    setCount(count + 1)
  }

  // 条件分岐
  if (count > 10) {
    return <div>10以上です</div>
  }

  return (
    <div>
      <p>{count}</p>
      <button onClick={handleClick}>+1</button>
      {count > 5 && <p>5を超えました</p>}
    </div>
  )
}
```

---

次は Supabase の基礎を学びましょう！
→ `02_supabase_basics.md`
