import { NextResponse } from 'next/server';
import { listEvents, saveEventToFile, deleteEventFile } from '@/lib/eventsMarkdown';
import { saveEventToGitHub, deleteEventFromGitHub } from '@/lib/eventsGitHub';

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
 * イベントを削除する（ローカルはfsから削除、本番はGitHub API経由）
 */
async function deleteEvent(id) {
    if (isDev) {
        return deleteEventFile(id);
    }
    return deleteEventFromGitHub(id);
}

export async function GET() {
    try {
        const events = listEvents();
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

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) {
            return NextResponse.json({ error: 'id required' }, { status: 400 });
        }
        const deleted = await deleteEvent(id);
        if (!deleted) {
            return NextResponse.json({ error: 'not found' }, { status: 404 });
        }
        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
