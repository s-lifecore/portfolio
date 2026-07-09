'use client';

import { useState, useEffect } from 'react';

interface ConsentManagerProps {
  onConsentChange: (consented: boolean, location?: { lat: number; lon: number }) => void;
}

export default function ConsentManager({ onConsentChange }: ConsentManagerProps) {
  const [showBanner, setShowBanner] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // 保存された同意状態を確認
    const savedConsent = localStorage.getItem('user-privacy-consent');
    if (!savedConsent) {
      setShowBanner(true);
    } else if (savedConsent === 'granted') {
      onConsentChange(true);
    }
  }, [onConsentChange]);

  const handleAccept = () => {
    setIsProcessing(true);
    
    // 位置情報の取得を試みる
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lon: position.coords.longitude
          };
          localStorage.setItem('user-privacy-consent', 'granted');
          setShowBanner(false);
          setIsProcessing(false);
          onConsentChange(true, location);
        },
        (error) => {
          console.warn("Geolocation error:", error);
          // 位置情報が拒否されても、クッキー同意自体は「許可」として進める（IPフォールバック用）
          localStorage.setItem('user-privacy-consent', 'granted');
          setShowBanner(false);
          setIsProcessing(false);
          onConsentChange(true);
        },
        { timeout: 10000 }
      );
    } else {
      localStorage.setItem('user-privacy-consent', 'granted');
      setShowBanner(false);
      setIsProcessing(false);
      onConsentChange(true);
    }
  };

  const handleDecline = () => {
    localStorage.setItem('user-privacy-consent', 'declined');
    setShowBanner(false);
    onConsentChange(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white/95 backdrop-blur shadow-2xl border-t border-gray-200 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
            🛡️ プライバシーと位置情報の利用について
          </h3>
          <p className="text-xs text-gray-600 mt-1 leading-relaxed">
            当サイトでは、あなたの現在地に合わせた**リアルタイム防災情報**を提供するため、位置情報およびクッキーを使用します。
            取得したデータは防災情報の表示のみに使用され、外部に保存・共有されることはありません。
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleDecline}
            disabled={isProcessing}
            className="px-4 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            同意しない
          </button>
          <button
            onClick={handleAccept}
            disabled={isProcessing}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full shadow-lg shadow-blue-200 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                確認中...
              </>
            ) : (
              '同意して情報を表示'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
