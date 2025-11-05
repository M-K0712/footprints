  'use client';

  import { useState } from 'react';
  import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
  import 'leaflet/dist/leaflet.css';
  import L from 'leaflet';

  // アイコンの修正（Leafletのバグ対応）
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });

  // ピンの型定義
  type Pin = {
    id: number;
    position: [number, number];
    name: string;
  };

  // 地図クリックを検知するコンポーネント
  function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
    useMapEvents({
      click: (e) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      },
    });
    return null;
  }

  export default function Map() {
    // ピンのリストを管理
    const [pins, setPins] = useState<Pin[]>([
      {
        id: 1,
        position: [35.6762, 139.6503],
        name: '東京駅',
      },
    ]);

    // 地図がクリックされたときの処理
    const handleMapClick = (lat: number, lng: number) => {
      const newPin: Pin = {
        id: Date.now(),
        position: [lat, lng],
        name: `ピン ${pins.length + 1}`,
      };

      setPins([...pins, newPin]);
      console.log('新しいピンを追加:', newPin);
    };

    // ピンを削除する処理
    const handleDeletePin = (id: number) => {
      // filter: 指定したIDと一致しないピンだけを残す
      const newPins = pins.filter((pin) => pin.id !== id);
      setPins(newPins);
      console.log('ピンを削除しました。ID:', id);
    };

    return (
      <div>
        <div className="bg-blue-50 p-4 mb-4 rounded">
          <p className="text-sm text-gray-700">
            📍 地図をクリックするとピンが追加されます
          </p>
          <p className="text-sm text-gray-600 mt-1">
            現在のピン数: <span className="font-bold text-blue-600">{pins.length}</span>
          </p>
        </div>

        <MapContainer
          center={[35.6762, 139.6503]}
          zoom={13}
          style={{ height: '500px', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapClickHandler onMapClick={handleMapClick} />

          {/* すべてのピンを表示 */}
          {pins.map((pin) => (
            <Marker key={pin.id} position={pin.position}>
              <Popup>
                <div className="text-center">
                  <strong className="text-lg">{pin.name}</strong>
                  <div className="text-sm text-gray-600 mt-1">
                    緯度: {pin.position[0].toFixed(4)}
                    <br />
                    経度: {pin.position[1].toFixed(4)}
                  </div>
                  <button
                    onClick={(e) => { 
                        e.stopPropagation();
                        handleDeletePin(pin.id)
                    }}
                    className="mt-3 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition text-sm"
                  >
                    🗑️ 削除
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    );
  }