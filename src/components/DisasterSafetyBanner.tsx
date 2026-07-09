'use client';

import useSWR from 'swr';

interface SafetyData {
  city: string;
  prefecture: string;
  message: string;
  status: 'safe' | 'warning' | 'danger';
  weatherIcon: string;
  temperature?: number;
  isActiveEvent: boolean;
  eventName?: string;
  lastUpdated: string;
}

interface DisasterSafetyBannerProps {
  hasConsent: boolean;
  location?: { lat: number; lon: number };
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function DisasterSafetyBanner({ hasConsent, location }: DisasterSafetyBannerProps) {
  const queryParams = new URLSearchParams();
  if (location) {
    queryParams.append('lat', location.lat.toString());
    queryParams.append('lon', location.lon.toString());
  }

  const { data, error, isLoading } = useSWR<SafetyData>(
    hasConsent ? `/api/safety-status?${queryParams.toString()}` : null,
    fetcher,
    {
      refreshInterval: 300000, // 5分ごとに自動更新
      revalidateOnFocus: true,
    }
  );

  if (!hasConsent) return null;

  if (isLoading) {
    return (
      <div className="animate-pulse bg-gray-100 h-16 rounded-xl mb-5 border border-gray-200">
        <div className="h-full flex items-center justify-center">
          <span className="text-gray-400 text-sm">読み込み中...</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  // ステータスに応じたスタイル設定
  const statusConfig = {
    safe: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: '✅',
    },
    warning: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: '⚠️',
    },
    danger: {
      bg: 'bg-red-50',
      text: 'text-red-700',
      border: 'border-red-200',
      icon: '🚨',
    },
  };

  const config = statusConfig[data.status];

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-xl border ${config.bg} ${config.text} ${config.border} transition-all duration-500 mb-5 shadow-sm`}
    >
      <span className="text-2xl flex-shrink-0">{data.weatherIcon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider opacity-70">
          {data.isActiveEvent ? '🎉 イベント情報' : '📍 あなたの街の安全'}
        </p>
        <p className="text-sm font-semibold leading-tight">
          {data.prefecture || '現在地'}
          {data.city && `・${data.city}`}
        </p>
        <p className="text-xs text-current opacity-90 mt-1">{data.message}</p>
      </div>
      <div className="text-xs opacity-60 flex-shrink-0 text-right">
        <p>更新: {new Date(data.lastUpdated).toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</p>
      </div>
    </div>
  );
}
