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
    const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/content/templates?ref=${branch}`;
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

export async function listTemplatesFromGitHub() {
    const { token, owner, repo, branch } = getConfig();
    const files = await listFiles(owner, repo, branch, token);
    return files.map((f) => ({ filename: f.name, id: f.name.replace(/\.md$/, '') }));
}

export async function getTemplateFromGitHub(id) {
    const { token, owner, repo, branch } = getConfig();
    const filename = `${id}.md`;
    const info = await getFileInfo(owner, repo, branch, `content/templates/${filename}`, token);
    if (!info) return null;
    return { id, filename, content: info.content };
}

export async function saveTemplateToGitHub(id, content) {
    const { token, owner, repo, branch } = getConfig();
    const filename = `${id}.md`;
    const pathFile = `content/templates/${filename}`;

    // check existing
    let existingSha = null;
    const files = await listFiles(owner, repo, branch, token);
    const match = files.find((f) => f.name === filename);
    if (match) {
        const info = await getFileInfo(owner, repo, branch, `content/templates/${match.name}`, token);
        if (info) existingSha = info.sha;
    }

    await putFile(owner, repo, branch, pathFile, content || '', existingSha || null, token, existingSha ? `chore: update template ${id}` : `feat: add template ${id}`);
    return { id, filename };
}

export async function deleteTemplateFromGitHub(id) {
    const { token, owner, repo, branch } = getConfig();
    const filename = `${id}.md`;
    const files = await listFiles(owner, repo, branch, token);
    const match = files.find((f) => f.name === filename);
    if (!match) return false;
    await deleteFile(owner, repo, branch, `content/templates/${match.name}`, match.sha, token, `chore: delete template ${id}`);
    return true;
}

export default { listTemplatesFromGitHub, getTemplateFromGitHub, saveTemplateToGitHub, deleteTemplateFromGitHub };
