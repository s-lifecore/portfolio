import fs from 'fs';
import path from 'path';

const TPL_DIR = path.join(process.cwd(), 'content', 'templates');

function ensureDir() {
    if (!fs.existsSync(TPL_DIR)) fs.mkdirSync(TPL_DIR, { recursive: true });
}

export function listTemplates() {
    ensureDir();
    const files = fs.readdirSync(TPL_DIR).filter((f) => f.endsWith('.md'));
    return files.map((f) => ({ filename: f, id: f.replace(/\.md$/, '') }));
}

export function getTemplateById(id) {
    ensureDir();
    const filename = `${id}.md`;
    const filepath = path.join(TPL_DIR, filename);
    if (!fs.existsSync(filepath)) return null;
    const content = fs.readFileSync(filepath, 'utf-8');
    return { id, filename, content };
}

export function saveTemplateToFile(id, content) {
    ensureDir();
    const safeId = id || `template-${Date.now()}`;
    const filename = `${safeId}.md`;
    fs.writeFileSync(path.join(TPL_DIR, filename), content || '', 'utf-8');
    return { id: safeId, filename };
}

export function deleteTemplateFile(id) {
    ensureDir();
    const filename = `${id}.md`;
    const filepath = path.join(TPL_DIR, filename);
    if (!fs.existsSync(filepath)) return false;
    fs.unlinkSync(filepath);
    return true;
}

export default { listTemplates, getTemplateById, saveTemplateToFile, deleteTemplateFile };
