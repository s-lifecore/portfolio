import { NextResponse } from 'next/server';
import { listTemplates, getTemplateById, saveTemplateToFile, deleteTemplateFile } from '../../../lib/templatesMarkdown';
import { listTemplatesFromGitHub, getTemplateFromGitHub, saveTemplateToGitHub, deleteTemplateFromGitHub } from '../../../lib/templatesGitHub';

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (id) {
            if (process.env.NODE_ENV === 'development') {
                const tpl = getTemplateById(id);
                if (!tpl) return NextResponse.json({ error: 'not found' }, { status: 404 });
                return NextResponse.json(tpl);
            }
            const tpl = await getTemplateFromGitHub(id);
            if (!tpl) return NextResponse.json({ error: 'not found' }, { status: 404 });
            return NextResponse.json(tpl);
        }
        if (process.env.NODE_ENV === 'development') {
            const items = listTemplates();
            return NextResponse.json(items);
        }
        const items = await listTemplatesFromGitHub();
        return NextResponse.json(items);
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        if (!body || !body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
        if (process.env.NODE_ENV === 'development') {
            const saved = saveTemplateToFile(body.id, body.content || '');
            return NextResponse.json(saved, { status: 201 });
        }
        const saved = await saveTemplateToGitHub(body.id, body.content || '');
        return NextResponse.json(saved, { status: 201 });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        if (!body || !body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
        if (process.env.NODE_ENV === 'development') {
            const saved = saveTemplateToFile(body.id, body.content || '');
            return NextResponse.json(saved);
        }
        const saved = await saveTemplateToGitHub(body.id, body.content || '');
        return NextResponse.json(saved);
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function DELETE(request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });
        if (process.env.NODE_ENV === 'development') {
            const ok = deleteTemplateFile(id);
            if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 });
            return NextResponse.json({ ok: true });
        }
        const ok = await deleteTemplateFromGitHub(id);
        if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 });
        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
