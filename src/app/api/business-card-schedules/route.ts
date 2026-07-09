import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

/**
 * GET: スケジュール一覧を取得
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    let query = supabase.from('business_card_schedules').select('*');

    if (token) {
      query = query.eq('token', token);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch schedules' },
      { status: 500 }
    );
  }
}

/**
 * POST: 新しいスケジュールを作成
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // 管理者認証チェック
    const adminCookie = request.cookies.get('admin')?.value;
    if (adminCookie !== '1') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { token, start_at, end_at, is_active } = body;

    if (!token || !start_at || !end_at) {
      return NextResponse.json(
        { error: 'Missing required fields: token, start_at, end_at' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('business_card_schedules')
      .insert([
        {
          token,
          start_at,
          end_at,
          is_active: is_active ?? true,
          view_count: 0,
        },
      ])
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data?.[0], { status: 201 });
  } catch (error) {
    console.error('Error creating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to create schedule' },
      { status: 500 }
    );
  }
}

/**
 * PUT: スケジュールを更新
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    // 管理者認証チェック
    const adminCookie = request.cookies.get('admin')?.value;
    if (adminCookie !== '1') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, token, start_at, end_at, is_active, view_count } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (token !== undefined) updateData.token = token;
    if (start_at !== undefined) updateData.start_at = start_at;
    if (end_at !== undefined) updateData.end_at = end_at;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (view_count !== undefined) updateData.view_count = view_count;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('business_card_schedules')
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data?.[0]);
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update schedule' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: スケジュールを削除
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // 管理者認証チェック
    const adminCookie = request.cookies.get('admin')?.value;
    if (adminCookie !== '1') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 });
    }

    const { error } = await supabase
      .from('business_card_schedules')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return NextResponse.json(
      { error: 'Failed to delete schedule' },
      { status: 500 }
    );
  }
}
