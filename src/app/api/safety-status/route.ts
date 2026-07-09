import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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

/**
 * IP アドレスから位置情報を取得
 */
async function getLocationFromIP(ip: string): Promise<{ city: string; prefecture: string } | null> {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    return {
      city: data.city || '不明',
      prefecture: data.region || '不明',
    };
  } catch (error) {
    console.error('Failed to get location from IP:', error);
    return null;
  }
}

/**
 * 気象庁の気象警報・注意報情報を取得（簡易版）
 * 実運用では、気象庁の公式APIやWebスクレイピングを利用してください
 */
async function getWeatherWarnings(prefecture: string): Promise<{ hasWarning: boolean; message: string }> {
  // 簡易実装: 実際には気象庁APIやLアラートを利用
  // ここでは常に「平常」を返す
  return {
    hasWarning: false,
    message: `${prefecture}に気象警報は出ていません。穏やかな天気です`,
  };
}

/**
 * Supabase から現在のアクティブなスケジュールを取得
 */
async function getActiveSchedule(): Promise<{ isActive: boolean; eventName?: string } | null> {
  try {
    const now = new Date().toISOString();
    const { data, error } = await supabase
      .from('business_card_schedules')
      .select('*')
      .eq('is_active', true)
      .lte('start_at', now)
      .gte('end_at', now)
      .single();

    if (error || !data) {
      return { isActive: false };
    }

    return {
      isActive: true,
      eventName: data.token,
    };
  } catch (error) {
    console.error('Failed to get active schedule:', error);
    return { isActive: false };
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<SafetyData>> {
  try {
    // クライアント IP を取得
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0] ||
      request.headers.get('x-real-ip') ||
      '8.8.8.8'; // フォールバック

    // 位置情報を取得
    const location = await getLocationFromIP(ip);
    const city = location?.city || '不明';
    const prefecture = location?.prefecture || '不明';

    // 気象情報を取得
    const weatherData = await getWeatherWarnings(prefecture);

    // アクティブなスケジュールを確認
    const scheduleData = await getActiveSchedule();

    // ステータスを決定
    let status: 'safe' | 'warning' | 'danger' = 'safe';
    let weatherIcon = '☀️';

    if (weatherData.hasWarning) {
      status = 'warning';
      weatherIcon = '⚠️';
    }

    if (scheduleData?.isActive) {
      status = 'warning';
      weatherIcon = '🎉';
    }

    const safetyData: SafetyData = {
      city,
      prefecture,
      message: scheduleData?.isActive
        ? `🎉 イベント開催中: ${scheduleData.eventName}`
        : weatherData.message,
      status,
      weatherIcon,
      isActiveEvent: scheduleData?.isActive || false,
      eventName: scheduleData?.eventName,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(safetyData, {
      headers: {
        'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Error in safety-status API:', error);
    return NextResponse.json(
      {
        city: '不明',
        prefecture: '不明',
        message: 'データ取得中...',
        status: 'safe',
        weatherIcon: '⏳',
        isActiveEvent: false,
        lastUpdated: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
