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

function buildHeaders(token) {
    return {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
    };
}

/**
 * content/events/ 以下のファイル一覧を取得する（SHA付き）
 */
async function listEventFiles(owner, repo, branch, token) {
    const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/content/events?ref=${branch}`;
    const res = await fetch(url, { headers: buildHeaders(token) });
    if (res.status === 404) return [];
    if (!res.ok) throw new Error(`GitHub API エラー (一覧取得): ${res.status}`);
    const files = await res.json();
    return Array.isArray(files) ? files.filter((f) => f.name.endsWith('.md')) : [];
}

/**
 * ファイルの内容（Base64デコード済み）とSHAを取得する
 */
async function getFileInfo(owner, repo, branch, filePath, token) {
    const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
    const res = await fetch(url, { headers: buildHeaders(token) });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`GitHub API エラー (ファイル取得): ${res.status}`);
    const data = await res.json();
    return {
        sha: data.sha,
        content: data.content ? Buffer.from(data.content, 'base64').toString('utf-8') : '',
    };
}

/**
 * gray-matter なしで Frontmatter の特定フィールドを取得する（サーバーレス環境向け簡易パーサー）
 */
function extractFrontmatterField(content, field) {
    const match = content.match(new RegExp(`^${field}:\\s*"([^"]*)"`, 'm'));
    return match ? match[1] : null;
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
 * GitHub API でファイルを PUT（作成 or 上書き）する
 */
async function putFile(owner, repo, branch, filePath, content, sha, commitMessage, token) {
    const encoded = Buffer.from(content).toString('base64');
    const body = {
        message: commitMessage,
        content: encoded,
        branch,
        ...(sha ? { sha } : {}),
    };
    const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`, {
        method: 'PUT',
        headers: buildHeaders(token),
        body: JSON.stringify(body),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`GitHub API エラー (ファイル保存): ${res.status} - ${err.message || JSON.stringify(err)}`);
    }
    return res;
}

/**
 * GitHub API でファイルを DELETE する
 */
async function deleteFile(owner, repo, branch, filePath, sha, commitMessage, token) {
    const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`, {
        method: 'DELETE',
        headers: buildHeaders(token),
        body: JSON.stringify({ message: commitMessage, sha, branch }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(`GitHub API エラー (ファイル削除): ${res.status} - ${err.message || JSON.stringify(err)}`);
    }
    return res;
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

    const newDate = eventData.date || new Date().toISOString().split('T')[0];
    const newFilePath = `content/events/${newDate}-${id}.md`;

    let existingFilePath = null;
    let existingCreatedAt = now;
    let existingSha = null;

    // 更新の場合: 既存ファイルを ID で探す
    if (!isCreate) {
        const files = await listEventFiles(owner, repo, branch, token);
        const match = files.find((f) => f.name.includes(id));
        if (match) {
            existingFilePath = `content/events/${match.name}`;
            // ファイルの内容と SHA を一度の API コールで取得
            const info = await getFileInfo(owner, repo, branch, existingFilePath, token);
            if (info) {
                existingSha = info.sha;
                existingCreatedAt = extractFrontmatterField(info.content, 'createdAt') || now;
            }
        }
    }

    const fileContent = buildMarkdownContent(eventData, existingCreatedAt);

    // 日付変更でファイル名が変わる場合: 旧ファイルを削除してから新ファイルを作成
    if (existingFilePath && existingFilePath !== newFilePath) {
        await deleteFile(
            owner, repo, branch,
            existingFilePath,
            existingSha,
            `chore: rename event file for ${id}`,
            token
        );
        // 新ファイルは新規作成なので sha 不要
        await putFile(owner, repo, branch, newFilePath, fileContent, null,
            `chore: update event "${eventData.title}"`, token);
    } else {
        // 同じファイル名での上書き（sha が必要）or 新規作成（sha 不要）
        await putFile(owner, repo, branch, newFilePath, fileContent,
            existingSha || null,
            isCreate
                ? `feat: add event "${eventData.title}"`
                : `chore: update event "${eventData.title}"`,
            token
        );
    }

    return {
        id,
        title: eventData.title || '',
        date: newDate,
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
    const match = files.find((f) => f.name.includes(id));
    if (!match) return false;

    const filePath = `content/events/${match.name}`;
    // SHA は listEventFiles の結果に含まれているのでそのまま使う
    await deleteFile(owner, repo, branch, filePath, match.sha,
        `chore: delete event ${id}`, token);
    return true;
}
