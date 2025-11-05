  'use client';

  import dynamic from 'next/dynamic';

  // 地図コンポーネントを動的にインポート（SSR無効化）
  const Map = dynamic(() => import('./components/Map'), {
    ssr: false,
  });

  export default function Home() {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">
            Footprints
          </h1>
          <p className="text-gray-600 mb-8">
            旅の思い出を地図に記録しよう
          </p>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <Map />
          </div>
        </div>
      </div>
    );
  }