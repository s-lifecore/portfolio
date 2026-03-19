import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const { password } = await request.json();
        const adminPassword = process.env.ADMIN_PASSWORD || '';

        if (!adminPassword) {
            return NextResponse.json({ error: 'Server not configured' }, { status: 500 });
        }

        if (password === adminPassword) {
            const res = NextResponse.json({ ok: true });
            res.cookies.set('admin', '1', { httpOnly: true, path: '/', maxAge: 60 * 60 * 24 * 7 });
            return res;
        }

        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE() {
    const res = NextResponse.json({ ok: true });
    res.cookies.set('admin', '', { path: '/', maxAge: 0 });
    return res;
}
