import { NextResponse } from 'next/server';
import { ensureDb, listEvents, resolveEventDocRef, convertEventDocToEvent, withServerTimestamps } from '@/lib/eventsFirestore';

export async function GET() {
    try {
        const db = ensureDb();
        const events = await listEvents(db);
        return NextResponse.json(events);
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        if (!body || !body.title) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });

        const db = ensureDb();

        if (body.id) {
            const ref = resolveEventDocRef(db, body.id);
            const snap = await ref.get();
            const payload = { ...body };
            delete payload.id;
            if (snap.exists) {
                await ref.update(withServerTimestamps(payload, false));
            } else {
                await ref.set(withServerTimestamps(payload, true));
            }
            const out = convertEventDocToEvent(await ref.get());
            return NextResponse.json(out, { status: 201 });
        }

        const ref = await db.collection('events').add(withServerTimestamps(body, true));
        const created = convertEventDocToEvent(await ref.get());
        return NextResponse.json(created, { status: 201 });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

        const db = ensureDb();
        await resolveEventDocRef(db, id).delete();
        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        if (!body || !body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });

        const db = ensureDb();
        const ref = resolveEventDocRef(db, body.id);
        const snap = await ref.get();
        if (!snap.exists) return NextResponse.json({ error: 'not found' }, { status: 404 });
        const payload = { ...body };
        delete payload.id;
        await ref.update(withServerTimestamps(payload, false));
        const updated = convertEventDocToEvent(await ref.get());
        return NextResponse.json(updated);
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
