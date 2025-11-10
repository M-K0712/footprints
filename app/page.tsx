'use client'

import dynamic from 'next/dynamic'
import { useAuth } from '@/lib/AuthContext'
import { useRouter } from 'next/navigation'

// 地図コンポーネントを動的にインポート（SSR無効化）
const Map = dynamic(() => import('./components/Map'), {
  ssr: false,
})

export default function Home() {
  const { user, signOut, loading } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('ログアウトエラー:', error)
    }
  }

  // 読み込み中の表示
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        読み込み中...
      </div>
    )
  }

  // 未ログインならログインページへ
  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <div className="h-screen flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white shadow-md p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-blue-600">Footprints</h1>
          <p className="text-sm text-gray-600">旅の思い出を地図に記録しよう</p>
        </div>
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

      {/* 地図部分 */}
      <main className="flex-1">
        <div className="h-full">
          <Map />
        </div>
      </main>
    </div>
  )
}
