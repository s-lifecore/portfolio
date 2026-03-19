// src/lib/fetchArticles.js
import Parser from 'rss-parser';

export async function fetchQiitaArticles(username) {
    try {
        const res = await fetch(`https://qiita.com/api/v2/users/${username}/items`);
        const data = await res.json();
        return data.map(post => ({
            title: post.title,
            url: post.url,
            date: post.created_at,
            source: 'Qiita',
            private: post.private
        }));
    } catch (error) {
        console.error('Qiita API Error:', error);
        return [];
    }
}

export async function fetchRssArticles(rssUrl, sourceName) {
    try {
        const res = await fetch(`https://api.allorigins.win/raw?url=${encodeURIComponent(rssUrl)}`);
        const data = await res.text();

        // 一部のプロキシやレスポンスがJSONラップされている場合に対応
        let xml = data;
        try {
            const trimmed = data.trim();
            if (trimmed.startsWith('{')) {
                const maybeJson = JSON.parse(trimmed);
                if (maybeJson && typeof maybeJson.contents === 'string') {
                    xml = maybeJson.contents;
                }
            }
        } catch (e) {
            // JSONでなければそのまま進める
        }

        // レスポンスに不要なヘッダやテキストが先頭に付与されている場合、最初の'<'から切り出す
        const firstTag = xml.indexOf('<');
        if (firstTag > 0) {
            xml = xml.slice(firstTag);
        }

        // XMLっぽくない場合はエラーとして扱い、パースを試みない
        if (!xml.trim().startsWith('<')) {
            console.error(`RSS Feed Error (${sourceName}): response is not XML. Preview:`, xml.slice(0, 200));
            return [];
        }

        const parser = new Parser();
        const feed = await parser.parseString(xml);

        // noteの場合の特別な処理
        if (sourceName === 'Note') {
            // noteの記事URLに含まれる特定のパラメータや
            // メタデータを確認して限定公開状態を判定
            return feed.items.map(item => ({
                title: item.title,
                url: item.link,
                date: item.pubDate || item.isoDate,
                source: sourceName,
                // noteの限定公開判定ロジックを追加
                private: item.link.includes('private') || // 例: URLに'private'が含まれる
                    item.categories?.includes('private') || // 例: カテゴリーに'private'が含まれる
                    false // デフォルトは非限定公開
            }));
        }

        // note以外の記事の処理（既存のコード）
        return feed.items.map(item => ({
            title: item.title,
            url: item.link,
            date: item.pubDate || item.isoDate,
            source: sourceName,
            private: false
        }));
    } catch (error) {
        console.error(`RSS Feed Error (${sourceName}):`, error);
        return [];
    }
}
