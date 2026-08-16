import { NextResponse } from 'next/server';
import { listEvents, saveEventToFile, setEventArchived } from '../../../lib/eventsMarkdown';
import { saveEventToGitHub, setEventArchivedOnGitHub } from '../../../lib/eventsGitHub';

const isDev = process.env.NODE_ENV === 'development';

/**
 * イベントを保存する（ローカルはfsへ直書き、本番はGitHub API経由）
 */
async function saveEvent(eventData) {
    if (isDev) {
        return saveEventToFile(eventData);
    }
    return saveEventToGitHub(eventData);
}

/**
 * イベントをアーカイブ/復元する（ファイルは削除しない。ローカルはfsへ直書き、本番はGitHub API経由）
 */
async function archiveEvent(id, archived) {
    if (isDev) {
        return setEventArchived(id, archived);
    }
    return setEventArchivedOnGitHub(id, archived);
}

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const includeArchived = searchParams.get('includeArchived') === 'true';
        const events = listEvents({ includeArchived });
        return NextResponse.json(events);
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        if (!body || !body.title) {
            return NextResponse.json({ error: 'Invalid payload: title is required' }, { status: 400 });
        }
        // idがあれば更新、なければ新規作成
        const saved = await saveEvent(body);
        return NextResponse.json(saved, { status: 201 });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        if (!body || !body.id) {
            return NextResponse.json({ error: 'id required' }, { status: 400 });
        }
        const saved = await saveEvent(body);
        return NextResponse.json(saved);
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

/**
 * イベントをアーカイブ/復元する（?id=...&archived=true|false）
 * ファイルとGitHub上の履歴は残したまま、一覧表示から出し入れする
 */
export async function PATCH(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'id required' }, { status: 400 });
        }
        const archived = searchParams.get('archived') !== 'false';
        const updated = await archiveEvent(id, archived);
        if (!updated) {
            return NextResponse.json({ error: 'not found' }, { status: 404 });
        }
        return NextResponse.json(updated);
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
