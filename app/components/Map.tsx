'use client'

import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/AuthContext'
import type { Footprint } from '@/lib/types'

// アイコンの修正（Leafletのバグ対応）
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

// 地図クリックを検知するコンポーネント
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng.lat, e.latlng.lng)
    },
  })
  return null
}

export default function Map() {
  const { user } = useAuth()
  const [footprints, setFootprints] = useState<Footprint[]>([])
  const [loading, setLoading] = useState(true)
  const [editingFootprint, setEditingFootprint] = useState<Footprint | null>(null)

  // 足跡を取得
  const fetchFootprints = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from('footprints')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('足跡の取得エラー:', error)
      return
    }

    setFootprints(data || [])
    setLoading(false)
  }

  // 初回読み込み
  useEffect(() => {
    fetchFootprints()
  }, [user])

  // 地図クリック時: 足跡を保存
  const handleMapClick = async (lat: number, lng: number) => {
    if (!user) return

    const { data, error } = await supabase
      .from('footprints')
      .insert({
        user_id: user.id,
        lat,
        lng,
        title: '新しい場所',
        description: ''
      })
      .select()
      .single()

    if (error) {
      console.error('足跡の保存エラー:', error)
      alert('保存に失敗しました')
      return
    }

    setFootprints([data, ...footprints])
  }

  // 足跡を削除
  const handleDelete = async (id: string) => {
    if (!confirm('この足跡を削除しますか？')) return

    const { error } = await supabase
      .from('footprints')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('削除エラー:', error)
      alert('削除に失敗しました')
      return
    }

    setFootprints(footprints.filter(fp => fp.id !== id))
  }

  // 足跡を更新
  const handleUpdate = async (id: string, updates: Partial<Footprint>) => {
    const { data, error } = await supabase
      .from('footprints')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('更新エラー:', error)
      alert('更新に失敗しました')
      return
    }

    setFootprints(footprints.map(fp => fp.id === id ? data : fp))
    setEditingFootprint(null)
  }

  if (loading) {
    return <div className="text-center p-8">読み込み中...</div>
  }

  return (
    <div>
      <div className="bg-blue-50 p-4 mb-4 rounded">
        <p className="text-sm text-gray-700">
          📍 地図をクリックすると足跡が追加されます
        </p>
        <p className="text-sm text-gray-600 mt-1">
          現在の足跡数: <span className="font-bold text-blue-600">{footprints.length}</span>
        </p>
      </div>

      <MapContainer
        center={[35.6762, 139.6503]}
        zoom={13}
        style={{ height: '500px', width: '100%' }}
      >
        <TileLayer
          attribution='Tiles &copy; Esri'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
        />

        <MapClickHandler onMapClick={handleMapClick} />

        {/* 足跡を表示 */}
        {footprints.map((footprint) => (
          <Marker key={footprint.id} position={[footprint.lat, footprint.lng]}>
            <Popup>
              <div className="min-w-[200px]">
                {editingFootprint?.id === footprint.id ? (
                  // 編集モード
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editingFootprint.title}
                      onChange={(e) => setEditingFootprint({
                        ...editingFootprint,
                        title: e.target.value
                      })}
                      className="w-full px-2 py-1 border rounded"
                      placeholder="タイトル"
                    />
                    <textarea
                      value={editingFootprint.description || ''}
                      onChange={(e) => setEditingFootprint({
                        ...editingFootprint,
                        description: e.target.value
                      })}
                      className="w-full px-2 py-1 border rounded"
                      placeholder="説明"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleUpdate(footprint.id, {
                          title: editingFootprint.title,
                          description: editingFootprint.description
                        })}
                        className="flex-1 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                      >
                        保存
                      </button>
                      <button
                        onClick={() => setEditingFootprint(null)}
                        className="flex-1 bg-gray-500 text-white px-3 py-1 rounded text-sm hover:bg-gray-600"
                      >
                        キャンセル
                      </button>
                    </div>
                  </div>
                ) : (
                  // 表示モード
                  <div>
                    <h3 className="font-bold text-lg mb-2">{footprint.title}</h3>
                    {footprint.description && (
                      <p className="text-sm text-gray-700 mb-2">{footprint.description}</p>
                    )}
                    <div className="text-xs text-gray-500 mb-3">
                      <div>緯度: {footprint.lat.toFixed(4)}</div>
                      <div>経度: {footprint.lng.toFixed(4)}</div>
                      <div>訪問日: {footprint.visited_at}</div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingFootprint(footprint)
                        }}
                        className="flex-1 bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
                      >
                        編集
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(footprint.id)
                        }}
                        className="flex-1 bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
