/**
 * recruitment markdown manager (content/recruitments/*.md)
 */
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const RECRUIT_DIR = path.join(process.cwd(), 'content', 'recruitments');

function slugFromTitle(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\-\s]/g, '')
        .trim()
        .replace(/\s+/g, '-');
}

function parseFile(filepath) {
    const raw = fs.readFileSync(filepath, 'utf-8');
    const { data, content } = matter(raw);
    const filename = path.basename(filepath);
    return {
        id: data.id || filename.replace(/\.md$/, ''),
        title: data.title || '',
        summary: data.summary || '',
        category: data.category || '',
        location: data.location || '',
        description: content.trim(),
        requirements: Array.isArray(data.requirements) ? data.requirements : [],
        welcomeSkills: Array.isArray(data.welcomeSkills) ? data.welcomeSkills : [],
        createdAt: data.createdAt || '',
        _filename: filename,
    };
}

export function listRecruitments() {
    if (!fs.existsSync(RECRUIT_DIR)) return [];
    const files = fs.readdirSync(RECRUIT_DIR).filter((f) => f.endsWith('.md'));
    const items = files.map((f) => parseFile(path.join(RECRUIT_DIR, f)));
    return items;
}

export function getRecruitmentById(id) {
    if (!fs.existsSync(RECRUIT_DIR)) return null;
    const files = fs.readdirSync(RECRUIT_DIR).filter((f) => f.endsWith('.md'));
    for (const f of files) {
        const item = parseFile(path.join(RECRUIT_DIR, f));
        if (item.id === id) return { ...item, _filename: f };
    }
    return null;
}

export function saveRecruitmentToFile(data) {
    if (!fs.existsSync(RECRUIT_DIR)) fs.mkdirSync(RECRUIT_DIR, { recursive: true });

    const now = new Date().toISOString();
    let id = data.id || slugFromTitle(data.title || `r${Date.now()}`);

    // find existing file by id
    let existing = getRecruitmentById(id);
    let createdAt = now;
    if (existing) createdAt = existing.createdAt || now;

    const front = {
        id,
        title: data.title || '',
        summary: data.summary || '',
        category: data.category || '',
        location: data.location || '',
        requirements: Array.isArray(data.requirements) ? data.requirements : [],
        welcomeSkills: Array.isArray(data.welcomeSkills) ? data.welcomeSkills : [],
        createdAt,
        updatedAt: now,
    };

    const yamlLines = Object.entries(front).map(([k, v]) => {
        if (Array.isArray(v)) {
            if (v.length === 0) return `${k}: []`;
            return `${k}:\n${v.map((it) => `  - "${String(it).replace(/"/g, '\\"')}"`).join('\n')}`;
        }
        return `${k}: "${String(v).replace(/"/g, '\\"')}"`;
    });

    const content = data.description || '';
    const fileContent = `---\n${yamlLines.join('\n')}\n---\n\n${content}\n`;

    const filename = `${id}.md`;
    // If existing filename different (shouldn't happen), delete old
    if (existing && existing._filename && existing._filename !== filename) {
        fs.unlinkSync(path.join(RECRUIT_DIR, existing._filename));
    }

    fs.writeFileSync(path.join(RECRUIT_DIR, filename), fileContent, 'utf-8');

    return { id, ...front, description: content };
}

export function deleteRecruitmentFile(id) {
    if (!fs.existsSync(RECRUIT_DIR)) return false;
    const files = fs.readdirSync(RECRUIT_DIR).filter((f) => f.endsWith('.md'));
    for (const f of files) {
        const item = parseFile(path.join(RECRUIT_DIR, f));
        if (item.id === id) {
            fs.unlinkSync(path.join(RECRUIT_DIR, f));
            return true;
        }
    }
    return false;
}
