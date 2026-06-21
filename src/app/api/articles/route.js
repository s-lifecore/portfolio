import { NextResponse } from 'next/server';
import { fetchQiitaArticles, fetchRssArticles } from '../../../lib/fetchArticles';

export async function GET() {
    try {
        const qiita = await fetchQiitaArticles('takumi1227');
        const zenn = await fetchRssArticles('https://zenn.dev/sudo_dev/feed', 'Zenn');
        const note = await fetchRssArticles('https://note.com/link_sudo/rss', 'Note');
        
        const articles = [...qiita, ...zenn, ...note]
            .filter(a => a.private)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        return NextResponse.json(articles);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}