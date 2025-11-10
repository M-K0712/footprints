// Footprints アプリの型定義

export type User = {
  id: string
  email: string
  nickname: string
  avatar_url: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

export type Footprint = {
  id: string
  user_id: string
  lat: number
  lng: number
  title: string
  description: string | null
  photo_url: string | null
  visited_at: string
  created_at: string
  updated_at: string
}

export type FootprintWithUser = Footprint & {
  users: Pick<User, 'nickname' | 'avatar_url'>
}
