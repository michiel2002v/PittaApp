import { fetchRepoTree, fetchFileContent } from './github-client.js';
import type { Skill, SkillExtension } from './types.js';

const SKILLS_ROOT = 'skills';

// Parses YAML frontmatter from a markdown string (name and description only)
function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const result: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    const key = line.slice(0, colonIndex).trim();
    const value = line.slice(colonIndex + 1).trim();
    result[key] = value;
  }
  return result;
}

export async function listSkills(): Promise<Skill[]> {
  const tree = await fetchRepoTree();

  // Find all base skill files: skills/<name>/00-base.md
  const baseFiles = tree.filter((p) => {
    const parts = p.split('/');
    return (
      parts.length === 3 &&
      parts[0] === SKILLS_ROOT &&
      parts[2].match(/^\d{2}-/) &&
      p.endsWith('.md')
    );
  });

  // Group extension files by skill name
  const extensionFiles = tree.filter((p) => {
    const parts = p.split('/');
    return (
      parts.length === 4 &&
      parts[0] === SKILLS_ROOT &&
      parts[2] === 'extensions' &&
      p.endsWith('.md')
    );
  });

  const skills: Skill[] = [];

  for (const basePath of baseFiles) {
    const parts = basePath.split('/');
    const skillName = parts[1];

    const baseContent = await fetchFileContent(basePath);
    const frontmatter = parseFrontmatter(baseContent);

    const skillExtensions: SkillExtension[] = [];
    for (const extPath of extensionFiles.filter((p) => p.startsWith(`${SKILLS_ROOT}/${skillName}/`))) {
      const extParts = extPath.split('/');
      const fileName = extParts[3];
      const orderMatch = fileName.match(/^(\d+)-/);
      const order = orderMatch ? parseInt(orderMatch[1], 10) : 99;

      const extContent = await fetchFileContent(extPath);
      const extFrontmatter = parseFrontmatter(extContent);

      skillExtensions.push({
        order,
        description: extFrontmatter.description ?? fileName.replace(/^\d+-/, '').replace(/\.md$/, ''),
        path: extPath,
      });
    }

    skillExtensions.sort((a, b) => a.order - b.order);

    skills.push({
      name: frontmatter.name ?? skillName,
      description: frontmatter.description ?? '',
      basePath,
      extensions: skillExtensions,
    });
  }

  return skills;
}

export async function getSkill(name: string): Promise<Skill | undefined> {
  const skills = await listSkills();
  return skills.find((s) => s.name === name);
}
