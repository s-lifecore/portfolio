/**
 * GitHub operations for recruitments (content/recruitments/*.md)
 */
const GITHUB_API = 'https://api.github.com';

function getConfig() {
    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const branch = process.env.GITHUB_BRANCH || 'main';
    if (!token || !owner || !repo) throw new Error('GitHub env vars missing');
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

async function listFiles(owner, repo, branch, token) {
    const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/content/recruitments?ref=${branch}`;
    const res = await fetch(url, { headers: buildHeaders(token) });
    if (res.status === 404) return [];
    if (!res.ok) throw new Error('GitHub list error');
    const files = await res.json();
    return Array.isArray(files) ? files.filter((f) => f.name.endsWith('.md')) : [];
}

async function getFileInfo(owner, repo, branch, filePath, token) {
    const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`;
    const res = await fetch(url, { headers: buildHeaders(token) });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('GitHub file error');
    const data = await res.json();
    return { sha: data.sha, content: data.content ? Buffer.from(data.content, 'base64').toString('utf-8') : '' };
}

function buildMarkdown(data, createdAt) {
    const now = new Date().toISOString();
    const id = data.id;
    const front = {
        id,
        title: data.title || '',
        summary: data.summary || '',
        category: data.category || '',
        location: data.location || '',
        requirements: Array.isArray(data.requirements) ? data.requirements : [],
        welcomeSkills: Array.isArray(data.welcomeSkills) ? data.welcomeSkills : [],
        createdAt: createdAt || now,
        updatedAt: now,
    };

    const yamlLines = Object.entries(front).map(([k, v]) => {
        if (Array.isArray(v)) {
            if (v.length === 0) return `${k}: []`;
            return `${k}:\n${v.map((it) => `  - "${String(it).replace(/"/g, '\\"')}"`).join('\n')}`;
        }
        return `${k}: "${String(v).replace(/"/g, '\\"')}"`;
    });

    return `---\n${yamlLines.join('\n')}\n---\n\n${data.description || ''}\n`;
}

async function putFile(owner, repo, branch, pathFile, content, sha, token, message) {
    const encoded = Buffer.from(content).toString('base64');
    const body = { message, content: encoded, branch, ...(sha ? { sha } : {}) };
    const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${pathFile}`, {
        method: 'PUT', headers: buildHeaders(token), body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error('GitHub put error');
    return res;
}

async function deleteFile(owner, repo, branch, pathFile, sha, token, message) {
    const res = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${pathFile}`, {
        method: 'DELETE', headers: buildHeaders(token), body: JSON.stringify({ message, sha, branch })
    });
    if (!res.ok) throw new Error('GitHub delete error');
    return res;
}

export async function saveRecruitmentToGitHub(data) {
    const { token, owner, repo, branch } = getConfig();
    const now = new Date().toISOString();
    let id = data.id || data.title && data.title.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-') || `r${Date.now()}`;
    const filename = `${id}.md`;
    const filePath = `content/recruitments/${filename}`;

    // check existing
    let existingSha = null;
    let existingCreatedAt = now;
    const files = await listFiles(owner, repo, branch, token);
    const match = files.find((f) => f.name === filename || f.name.includes(id));
    if (match) {
        const info = await getFileInfo(owner, repo, branch, `content/recruitments/${match.name}`, token);
        if (info) {
            existingSha = info.sha;
            const created = info.content.match(/^createdAt:\s*"([^"]+)"/m);
            if (created) existingCreatedAt = created[1];
        }
    }

    const content = buildMarkdown(data, existingCreatedAt);
    await putFile(owner, repo, branch, filePath, content, existingSha || null, token, (existingSha ? `chore: update recruitment ${id}` : `feat: add recruitment ${id}`));

    return { id, ...data, createdAt: existingCreatedAt, updatedAt: now };
}

export async function deleteRecruitmentFromGitHub(id) {
    const { token, owner, repo, branch } = getConfig();
    const files = await listFiles(owner, repo, branch, token);
    const match = files.find((f) => f.name.includes(id));
    if (!match) return false;
    await deleteFile(owner, repo, branch, `content/recruitments/${match.name}`, match.sha, token, `chore: delete recruitment ${id}`);
    return true;
}
