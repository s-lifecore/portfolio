/**
 * Markdown ファイルベースのイベント管理ライブラリ
 * content/events/*.md を読み込み、パースして返す
 */
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const EVENTS_DIR = path.join(process.cwd(), 'content', 'events');

/**
 * ファイル名からイベントIDを生成する（ファイル名が {date}-{id}.md の形式）
 */
function idFromFilename(filename) {
    // "2027-03-19-e1773894107798.md" -> "e1773894107798"
    const base = filename.replace(/\.md$/, '');
    const parts = base.split('-');
    // 最初の3パーツが日付 (YYYY-MM-DD)、残りがID
    if (parts.length > 3) {
        return parts.slice(3).join('-');
    }
    return base;
}

/**
 * Markdown ファイルのパスからイベントオブジェクトに変換する
 */
function parseEventFile(filepath) {
    const raw = fs.readFileSync(filepath, 'utf-8');
    const { data, content } = matter(raw);
    const filename = path.basename(filepath);
    return {
        id: data.id || idFromFilename(filename),
        title: data.title || '',
        date: data.date || '',
        description: content.trim(),
        tags: Array.isArray(data.tags) ? data.tags : [],
        host: data.host || '',
        venue: data.venue || '',
        url: data.url || '',
        reviewUrl: data.reviewUrl || '',
        archived: data.archived === true || data.archived === 'true',
        createdAt: data.createdAt || '',
        updatedAt: data.updatedAt || '',
    };
}

/**
 * 全イベントを日付降順で返す（デフォルトではアーカイブ済みを除く）
 */
export function listEvents({ includeArchived = false } = {}) {
    if (!fs.existsSync(EVENTS_DIR)) return [];
    const files = fs.readdirSync(EVENTS_DIR).filter((f) => f.endsWith('.md'));
    let events = files.map((f) => parseEventFile(path.join(EVENTS_DIR, f)));
    if (!includeArchived) events = events.filter((e) => !e.archived);
    events.sort((a, b) => new Date(b.date) - new Date(a.date));
    return events;
}

/**
 * IDでイベントを1件取得する
 */
export function getEventById(id) {
    if (!fs.existsSync(EVENTS_DIR)) return null;
    const files = fs.readdirSync(EVENTS_DIR).filter((f) => f.endsWith('.md'));
    for (const f of files) {
        const ev = parseEventFile(path.join(EVENTS_DIR, f));
        if (ev.id === id) return { ...ev, _filename: f };
    }
    return null;
}

/**
 * イベントを新規作成または更新する（ローカル fs 書き込み）
 * @param {object} eventData - イベントデータ（idがあれば更新、なければ新規）
 * @returns {object} 保存されたイベントオブジェクト
 */
export function saveEventToFile(eventData) {
    if (!fs.existsSync(EVENTS_DIR)) {
        fs.mkdirSync(EVENTS_DIR, { recursive: true });
    }

    const now = new Date().toISOString();
    let id = eventData.id;
    let isCreate = false;

    // 既存ファイルを探す
    let existingFilename = null;
    if (id) {
        const files = fs.readdirSync(EVENTS_DIR).filter((f) => f.endsWith('.md'));
        for (const f of files) {
            const ev = parseEventFile(path.join(EVENTS_DIR, f));
            if (ev.id === id) {
                existingFilename = f;
                break;
            }
        }
    }

    if (!id) {
        id = `e${Date.now()}`;
        isCreate = true;
    } else if (!existingFilename) {
        isCreate = true;
    }

    const date = eventData.date || new Date().toISOString().split('T')[0];
    const description = eventData.description || '';
    const tags = Array.isArray(eventData.tags) ? eventData.tags : [];

    // 既存ファイルのcreatedAtを引き継ぐ
    let createdAt = now;
    if (existingFilename) {
        const existing = parseEventFile(path.join(EVENTS_DIR, existingFilename));
        createdAt = existing.createdAt || now;
    }

    const frontmatter = {
        id,
        title: eventData.title || '',
        date,
        tags,
        ...(eventData.host ? { host: eventData.host } : {}),
        ...(eventData.venue ? { venue: eventData.venue } : {}),
        ...(eventData.url ? { url: eventData.url } : {}),
        ...(eventData.reviewUrl ? { reviewUrl: eventData.reviewUrl } : {}),
        archived: eventData.archived === true,
        createdAt,
        updatedAt: now,
    };

    const yamlLines = Object.entries(frontmatter).map(([k, v]) => {
        if (Array.isArray(v)) {
            if (v.length === 0) return `${k}: []`;
            return `${k}:\n${v.map((item) => `  - "${item}"`).join('\n')}`;
        }
        if (typeof v === 'boolean') return `${k}: ${v}`;
        return `${k}: "${String(v).replace(/"/g, '\\"')}"`;
    });

    const fileContent = `---\n${yamlLines.join('\n')}\n---\n\n${description}\n`;

    // 日付が変わった場合は古いファイルを削除して新しいファイル名で保存
    const newFilename = `${date}-${id}.md`;
    if (existingFilename && existingFilename !== newFilename) {
        fs.unlinkSync(path.join(EVENTS_DIR, existingFilename));
    }

    fs.writeFileSync(path.join(EVENTS_DIR, newFilename), fileContent, 'utf-8');

    return {
        id,
        title: frontmatter.title,
        date,
        description,
        tags,
        host: frontmatter.host || '',
        venue: frontmatter.venue || '',
        url: frontmatter.url || '',
        reviewUrl: frontmatter.reviewUrl || '',
        archived: frontmatter.archived,
        createdAt,
        updatedAt: now,
    };
}

/**
 * IDでイベントをアーカイブ/復元する（ファイルは削除せず archived フラグのみ更新）
 * @param {string} id
 * @param {boolean} archived
 * @returns {object|null} 更新後のイベント、見つからなければ null
 */
export function setEventArchived(id, archived = true) {
    const existing = getEventById(id);
    if (!existing) return null;
    const { _filename, ...data } = existing;
    return saveEventToFile({ ...data, archived });
}
