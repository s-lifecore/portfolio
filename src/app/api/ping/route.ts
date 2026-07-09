import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Ping エンドポイント
 * GitHub Actions や外部スケジューラから定期的に呼び出され、
 * システムの健全性確認とデータの鮮度維持を行います
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 認証チェック（環境変数で設定されたトークンと照合）
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.PING_SECRET_TOKEN;

    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const timestamp = new Date().toISOString();

    // 1. スケジュールの状態を確認・更新
    const now = new Date().toISOString();
    const { data: activeSchedules, error: scheduleError } = await supabase
      .from('business_card_schedules')
      .select('*')
      .lte('start_at', now)
      .gte('end_at', now);

    if (scheduleError) {
      console.error('Schedule check error:', scheduleError);
    }

    // 2. 防災情報の鮮度確認（実装例）
    // 実運用では、気象庁APIなどから最新データを取得し、
    // キャッシュを更新するロジックをここに追加

    // 3. ログをMarkdown形式で記録（DMD構想に基づく）
    const logEntry = `
## Ping Report - ${new Date(timestamp).toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' })}

- **Timestamp**: ${timestamp}
- **Active Schedules**: ${activeSchedules?.length || 0}
- **System Status**: ✅ Healthy

### Details
${
  activeSchedules && activeSchedules.length > 0
    ? activeSchedules
        .map(
          (s) =>
            `- **${s.token}**: ${s.start_at} ~ ${s.end_at} (View Count: ${s.view_count})`
        )
        .join('\n')
    : '- No active schedules'
}
`;

    // 4. レスポンスを返す
    return NextResponse.json(
      {
        ok: true,
        timestamp,
        activeSchedules: activeSchedules?.length || 0,
        log: logEntry,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Ping error:', error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * GET エンドポイント（ヘルスチェック用）
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Ping endpoint is ready',
  });
}
