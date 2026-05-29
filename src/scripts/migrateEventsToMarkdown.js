/**
 * lib/events.json の既存データを content/events/*.md に変換する移行スクリプト
 * 使い方: node src/scripts/migrateEventsToMarkdown.js
 */
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(process.cwd(), 'lib', 'events.json');
const outputDir = path.join(process.cwd(), 'content', 'events');

if (!fs.existsSync(jsonPath)) {
    console.error('lib/events.json が見つかりません。');
    process.exit(1);
}

const raw = fs.readFileSync(jsonPath, 'utf-8');
let events = [];
try {
    events = JSON.parse(raw);
} catch (e) {
    console.error('lib/events.json のパースに失敗しました:', e.message);
    process.exit(1);
}

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const now = new Date().toISOString();

for (const ev of events) {
    const id = ev.id || `e${Date.now()}${Math.random().toString(36).slice(2, 6)}`;
    const date = ev.date || '1970-01-01';
    const description = ev.description || '';

    const frontmatter = {
        id,
        title: ev.title || '',
        date,
        tags: Array.isArray(ev.tags) ? ev.tags : [],
        ...(ev.host ? { host: ev.host } : {}),
        ...(ev.venue ? { venue: ev.venue } : {}),
        ...(ev.url ? { url: ev.url } : {}),
        ...(ev.reviewUrl ? { reviewUrl: ev.reviewUrl } : {}),
        createdAt: ev.createdAt || now,
        updatedAt: ev.updatedAt || now,
    };

    const yamlLines = Object.entries(frontmatter).map(([k, v]) => {
        if (Array.isArray(v)) {
            if (v.length === 0) return `${k}: []`;
            return `${k}:\n${v.map((item) => `  - "${item}"`).join('\n')}`;
        }
        return `${k}: "${String(v).replace(/"/g, '\\"')}"`;
    });

    const content = `---\n${yamlLines.join('\n')}\n---\n\n${description}\n`;

    const filename = `${date}-${id}.md`;
    const filepath = path.join(outputDir, filename);
    fs.writeFileSync(filepath, content, 'utf-8');
    console.log(`-> 書き込み: content/events/${filename}`);
}

console.log(`\n移行完了: ${events.length} 件のイベントを Markdown に変換しました。`);
