import { NextResponse } from 'next/server';
import admin from 'firebase-admin';
import getFirestore from '@/lib/firebaseAdmin';

function ensureDb() {
    const db = getFirestore();
    if (!db) throw new Error('Firestore not configured');
    return db;
}

function convertDoc(d) {
    const data = (d && typeof d.data === 'function') ? d.data() : {};
    let date = data.date;
    if (date && typeof date === 'object' && typeof date.toDate === 'function') {
        try { date = date.toDate().toISOString().split('T')[0]; } catch (e) { date = String(date); }
    }
    let createdAt = data.createdAt;
    if (createdAt && typeof createdAt === 'object' && typeof createdAt.toDate === 'function') {
        try { createdAt = createdAt.toDate().toISOString(); } catch (e) { createdAt = String(createdAt); }
    }
    let updatedAt = data.updatedAt;
    if (updatedAt && typeof updatedAt === 'object' && typeof updatedAt.toDate === 'function') {
        try { updatedAt = updatedAt.toDate().toISOString(); } catch (e) { updatedAt = String(updatedAt); }
    }
    return { id: d.id, ...data, date, createdAt, updatedAt };
}

export async function GET() {
    try {
        const db = ensureDb();
        const snap = await db.collection('events').orderBy('date', 'desc').get();
        const events = snap.docs.map(convertDoc);
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
        const col = db.collection('events');

        if (body.id) {
            const ref = col.doc(body.id);
            const snap = await ref.get();
            if (snap.exists) {
                await ref.update({ ...body, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
            } else {
                await ref.set({ ...body, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() });
            }
            const out = convertDoc(await ref.get());
            return NextResponse.json(out, { status: 201 });
        }

        const ref = await col.add({ ...body, createdAt: admin.firestore.FieldValue.serverTimestamp(), updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        const created = convertDoc(await ref.get());
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
        await db.collection('events').doc(id).delete();
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
        const ref = db.collection('events').doc(body.id);
        const snap = await ref.get();
        if (!snap.exists) return NextResponse.json({ error: 'not found' }, { status: 404 });
        await ref.update({ ...body, updatedAt: admin.firestore.FieldValue.serverTimestamp() });
        const updated = convertDoc(await ref.get());
        return NextResponse.json(updated);
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
