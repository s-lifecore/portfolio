/**
 * 本番環境（Vercel等）でのイベント管理: GitHub API 経由でMDファイルを直接コミットする
 *
 * 必要な環境変数:
 *   GITHUB_TOKEN   - リポジトリへの write 権限を持つ Personal Access Token
 *   GITHUB_OWNER   - リポジトリオーナー名 (例: s-lifecore)
 *   GITHUB_REPO    - リポジトリ名 (例: portfolio)
 *   GITHUB_BRANCH  - ブランチ名 (デフォルト: main)
 */

const GITHUB_API = 'https://api.github.com';

function getConfig() {
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'main';
    if (!token || !owner || !repo) {
        throw new Error(
            'GitHub連携に必要な環境変数が設定されていません。GITHUB_TOKEN / GITHUB_OWNER / GITHUB_REPO を設定してください。'
        );
    }
    return { token, owner, repo, branch };
}

function headers(token) {
    return {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
    };
}

/**
 * リポジトリ内のファイルのSHAを取得する（更新時に必要）
 */
async function getFileSha(owner, repo, branch, filePath, token) {
    const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
    const res = await fetch(url, { headers: headers(token) });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`GitHub API エラー (SHA取得): ${res.status}`);
    const data = await res.json();
    return data.sha || null;
}

/**
 * content/events/ 以下のファイル一覧を取得する
 */
async function listEventFiles(owner, repo, branch, token) {
    const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/content/events?ref=${branch}`;
    const res = await fetch(url, { headers: headers(token) });
    if (res.status === 404) return [];
    if (!res.ok) throw new Error(`GitHub API エラー (一覧取得): ${res.status}`);
    const files = await res.json();
    return Array.isArray(files) ? files.filter((f) => f.name.endsWith('.md')) : [];
}

/**
 * ファイルの内容をBase64デコードして返す
 */
async function getFileContent(owner, repo, branch, filePath, token) {
    const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
    const res = await fetch(url, { headers: headers(token) });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.content) return null;
    return Buffer.from(data.content, 'base64').toString('utf-8');
}

/**
 * イベントデータからMarkdownファイル内容を生成する
 */
function buildMarkdownContent(eventData, createdAt) {
    const now = new Date().toISOString();
    const id = eventData.id;
    const date = eventData.date || new Date().toISOString().split('T')[0];
    const description = eventData.description || '';
    const tags = Array.isArray(eventData.tags) ? eventData.tags : [];

    const frontmatter = {
        id,
        title: eventData.title || '',
        date,
        tags,
        ...(eventData.host ? { host: eventData.host } : {}),
        ...(eventData.venue ? { venue: eventData.venue } : {}),
        ...(eventData.url ? { url: eventData.url } : {}),
        ...(eventData.reviewUrl ? { reviewUrl: eventData.reviewUrl } : {}),
        createdAt: createdAt || now,
        updatedAt: now,
    };

    const yamlLines = Object.entries(frontmatter).map(([k, v]) => {
        if (Array.isArray(v)) {
            if (v.length === 0) return `${k}: []`;
            return `${k}:\n${v.map((item) => `  - "${item}"`).join('\n')}`;
        }
        return `${k}: "${String(v).replace(/"/g, '\\"')}"`;
    });

    return `---\n${yamlLines.join('\n')}\n---\n\n${description}\n`;
}

/**
 * gray-matter なしで Frontmatter の特定フィールドを取得する（サーバーレス環境向け簡易パーサー）
 */
function extractFrontmatterField(content, field) {
    const match = content.match(new RegExp(`^${field}:\\s*"([^"]*)"`, 'm'));
    return match ? match[1] : null;
}

/**
 * イベントをGitHub経由で保存する（新規作成 or 更新）
 */
export async function saveEventToGitHub(eventData) {
    const { token, owner, repo, branch } = getConfig();
    const now = new Date().toISOString();
    let id = eventData.id;
    const isCreate = !id;
    if (!id) {
        id = `e${Date.now()}`;
        eventData = { ...eventData, id };
    }

    const date = eventData.date || new Date().toISOString().split('T')[0];
    const newFilePath = `content/events/${date}-${id}.md`;

    // 既存ファイルを探す（更新時）
    let existingFilePath = null;
    let existingCreatedAt = now;
    let existingSha = null;

    if (!isCreate) {
        const files = await listEventFiles(owner, repo, branch, token);
        for (const f of files) {
            if (f.name.includes(id)) {
                existingFilePath = `content/events/${f.name}`;
                existingSha = f.sha;
                // createdAt を取得
                const rawContent = await getFileContent(owner, repo, branch, existingFilePath, token);
                if (rawContent) {
                    existingCreatedAt = extractFrontmatterField(rawContent, 'createdAt') || now;
                }
                break;
            }
        }
    }

    const fileContent = buildMarkdownContent(eventData, existingCreatedAt);
    const encoded = Buffer.from(fileContent).toString('base64');

    // 日付変更でファイル名が変わる場合は古いファイルを削除
    if (existingFilePath && existingFilePath !== newFilePath) {
        await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${existingFilePath}`, {
            method: 'DELETE',
            headers: headers(token),
            body: JSON.stringify({
                message: `chore: rename event file for ${id}`,
                sha: existingSha,
                branch,
            }),
        });
        existingSha = null; // 新しいファイルとして作成
    }

    // 新しいファイルのSHAを取得（ファイル名が変わっていない更新の場合）
    if (!existingSha && existingFilePath === newFilePath) {
        existingSha = await getFileSha(owner, repo, branch, newFilePath, token);
    }
    if (!existingSha && existingFilePath !== newFilePath) {
        existingSha = await getFileSha(owner, repo, branch, newFilePath, token);
    }

    const body = {
        message: isCreate
            ? `feat: add event "${eventData.title}"`
            : `chore: update event "${eventData.title}"`,
        content: encoded,
        branch,
        ...(existingSha ? { sha: existingSha } : {}),
    };

    const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${newFilePath}`, {
        method: 'PUT',
        headers: headers(token),
        body: JSON.stringify(body),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`GitHub API エラー (ファイル保存): ${res.status} - ${err.message || ''}`);
    }

    return {
        id,
        title: eventData.title || '',
        date,
        description: eventData.description || '',
        tags: Array.isArray(eventData.tags) ? eventData.tags : [],
        host: eventData.host || '',
        venue: eventData.venue || '',
        url: eventData.url || '',
        reviewUrl: eventData.reviewUrl || '',
        createdAt: existingCreatedAt,
        updatedAt: now,
    };
}

/**
 * イベントをGitHub経由で削除する
 */
export async function deleteEventFromGitHub(id) {
    const { token, owner, repo, branch } = getConfig();
    const files = await listEventFiles(owner, repo, branch, token);
    for (const f of files) {
        if (f.name.includes(id)) {
            const filePath = `content/events/${f.name}`;
            const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`, {
                method: 'DELETE',
                headers: headers(token),
                body: JSON.stringify({
                    message: `chore: delete event ${id}`,
                    sha: f.sha,
                    branch,
                }),
            });
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(`GitHub API エラー (ファイル削除): ${res.status} - ${err.message || ''}`);
            }
            return true;
        }
    }
    return false;
}
