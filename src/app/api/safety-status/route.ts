import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

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
 * 緯度経度から住所（都道府県・市区町村）を取得（逆ジオコーディング）
 * 国土地理院の無料APIを使用
 */
async function getLocationFromCoords(lat: string, lon: string): Promise<{ city: string; prefecture: string } | null> {
  try {
    const response = await fetch(
      `https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=${lat}&lon=${lon}`,
      { signal: AbortSignal.timeout(5000) }
    );
    if (!response.ok) return null;
    const data = await response.json();
    const result = data?.results;
    if (!result) return null;

    // 国土地理院APIのレスポンス: muniCd（市区町村コード）, lv01Nm（市区町村名）
    // 都道府県名は市区町村コードの先頭2桁から引く
    const prefCode = result.muniCd?.slice(0, 2);
    const prefecture = PREF_MAP[prefCode] || '';
    const city = result.lv01Nm || '';

    return { city, prefecture };
  } catch (error) {
    console.error('Failed to reverse geocode:', error);
    return null;
  }
}

/**
 * IP アドレスから位置情報を取得（フォールバック用）
 */
async function getLocationFromIP(ip: string): Promise<{ city: string; prefecture: string } | null> {
  try {
    const response = await fetch(`https://ipapi.co/${ip}/json/`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    const city = data.city || '';
    const prefecture = data.region || '';
    if (!city && !prefecture) return null;
    return { city, prefecture };
  } catch (error) {
    console.error('Failed to get location from IP:', error);
    return null;
  }
}

/**
 * 気象庁の気象警報・注意報情報を取得（簡易版）
 * 実運用では、気象庁の公式APIやLアラートを利用してください
 */
async function getWeatherWarnings(prefecture: string): Promise<{ hasWarning: boolean; message: string }> {
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
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    // 位置情報の取得：ブラウザ座標 → 逆ジオコーディング → IPフォールバックの順で試みる
    let location: { city: string; prefecture: string } | null = null;

    if (lat && lon) {
      // ブラウザの Geolocation API から取得した座標を優先（国土地理院で逆ジオコーディング）
      location = await getLocationFromCoords(lat, lon);
    }

    if (!location) {
      // 座標が取得できない場合はIPベースにフォールバック
      const ip =
        request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        '';
      if (ip) {
        location = await getLocationFromIP(ip);
      }
    }

    const city = location?.city || '';
    const prefecture = location?.prefecture || '';
    const hasLocation = !!(city || prefecture);

    // 位置情報が取得できた場合のみ気象情報を取得
    const weatherData = hasLocation
      ? await getWeatherWarnings(prefecture || city)
      : { hasWarning: false, message: '位置情報を取得できませんでした' };

    // アクティブなスケジュールを確認
    const scheduleData = await getActiveSchedule();

    // ステータスを決定
    let status: 'safe' | 'warning' | 'danger' = 'safe';
    let weatherIcon = hasLocation ? '☀️' : '📍';

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
        city: '',
        prefecture: '',
        message: '情報を取得できませんでした',
        status: 'safe',
        weatherIcon: '⏳',
        isActiveEvent: false,
        lastUpdated: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// 都道府県コード → 都道府県名マッピング（国土地理院API用）
const PREF_MAP: Record<string, string> = {
  '01': '北海道', '02': '青森県', '03': '岩手県', '04': '宮城県', '05': '秋田県',
  '06': '山形県', '07': '福島県', '08': '茨城県', '09': '栃木県', '10': '群馬県',
  '11': '埼玉県', '12': '千葉県', '13': '東京都', '14': '神奈川県', '15': '新潟県',
  '16': '富山県', '17': '石川県', '18': '福井県', '19': '山梨県', '20': '長野県',
  '21': '岐阜県', '22': '静岡県', '23': '愛知県', '24': '三重県', '25': '滋賀県',
  '26': '京都府', '27': '大阪府', '28': '兵庫県', '29': '奈良県', '30': '和歌山県',
  '31': '鳥取県', '32': '島根県', '33': '岡山県', '34': '広島県', '35': '山口県',
  '36': '徳島県', '37': '香川県', '38': '愛媛県', '39': '高知県', '40': '福岡県',
  '41': '佐賀県', '42': '長崎県', '43': '熊本県', '44': '大分県', '45': '宮崎県',
  '46': '鹿児島県', '47': '沖縄県',
};
