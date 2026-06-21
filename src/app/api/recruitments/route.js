import { NextResponse } from 'next/server';
import { listRecruitments, saveRecruitmentToFile, deleteRecruitmentFile } from '../../../lib/recruitmentsMarkdown';
import { saveRecruitmentToGitHub, deleteRecruitmentFromGitHub } from '../../../lib/recruitmentsGitHub';

const isDev = process.env.NODE_ENV === 'development';

async function saveRecruitment(data) {
    if (isDev) return saveRecruitmentToFile(data);
    return saveRecruitmentToGitHub(data);
}

async function deleteRecruitment(id) {
    if (isDev) return deleteRecruitmentFile(id);
    return deleteRecruitmentFromGitHub(id);
}

export async function GET() {
    try {
        const items = listRecruitments();
        return NextResponse.json(items);
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const body = await request.json();
        if (!body || !body.title) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        const saved = await saveRecruitment(body);
        return NextResponse.json(saved, { status: 201 });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const body = await request.json();
        if (!body || !body.id) return NextResponse.json({ error: 'id required' }, { status: 400 });
        const saved = await saveRecruitment(body);
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
        const ok = await deleteRecruitment(id);
        if (!ok) return NextResponse.json({ error: 'not found' }, { status: 404 });
        return NextResponse.json({ ok: true });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
