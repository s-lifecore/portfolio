import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

const recruitmentsDir = path.join(process.cwd(), 'content', 'recruitments');

export function loadRecruitments() {
  if (!fs.existsSync(recruitmentsDir)) return [];

  const files = fs.readdirSync(recruitmentsDir).filter((f) => f.endsWith('.md'));

  const items = files
    .map((file) => {
      const full = path.join(recruitmentsDir, file);
      const raw = fs.readFileSync(full, 'utf8');
      const { data, content } = matter(raw);

      return {
        id: path.basename(file, '.md'),
        title: data.title || '',
        summary: data.summary || '',
        category: data.category || '',
        location: data.location || '',
        description: content || data.description || '',
        requirements: data.requirements || [],
        welcomeSkills: data.welcomeSkills || [],
        createdAt: data.createdAt || '',
      };
    })
    .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  return items;
}

export const recruitments = loadRecruitments();

export default recruitments;
