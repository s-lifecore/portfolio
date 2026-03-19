import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const jsonPath = path.join(process.cwd(), 'lib', 'events.json');

async function readEvents() {
    try {
        const raw = await fs.readFile(jsonPath, 'utf-8');
        return JSON.parse(raw);
    } catch (e) {
        return [];
    }
}

async function writeEvents(events) {
    await fs.writeFile(jsonPath, JSON.stringify(events, null, 2), 'utf-8');
}

export async function GET() {
    const events = await readEvents();
    return NextResponse.json(events);
}

export async function POST(request) {
    try {
        const body = await request.json();
        if (!body || !body.title) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        const events = await readEvents();
        const id = body.id || `e${Date.now()}`;
        const newEvent = { ...body, id };
        events.unshift(newEvent);
        await writeEvents(events);

        return NextResponse.json(newEvent, { status: 201 });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

        const events = await readEvents();
        const filtered = events.filter((e) => e.id !== id);
        await writeEvents(filtered);

        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        if (!body || !body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

        const events = await readEvents();
        const idx = events.findIndex((e) => e.id === body.id);
        if (idx === -1) return NextResponse.json({ error: 'not found' }, { status: 404 });

        events[idx] = { ...events[idx], ...body };
        await writeEvents(events);

        return NextResponse.json(events[idx]);
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
