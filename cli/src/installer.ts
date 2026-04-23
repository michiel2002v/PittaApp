import { mkdirSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { homedir } from 'os';
import { fetchFileContent } from './github-client.js';
import { compose } from './composer.js';
import { upsertLockEntry, getLockEntry, getLockDir } from './lock-file.js';
import type { Skill, Platform, Scope } from './types.js';

const SOURCE_REF = 'main';

export function resolveOutputPath(skillName: string, platform: Platform, scope: Scope): string {
  const home = homedir();

  if (platform === 'vscode-visualstudio') {
    const base = scope === 'user' ? join(home, '.agents', 'skills') : join(process.cwd(), '.agents', 'skills');
    return join(base, skillName, 'SKILL.md');
  }

  // claudecode
  const base = scope === 'user' ? join(home, '.claude', 'rules') : join(process.cwd(), '.claude', 'rules');
  return join(base, `${skillName}.md`);
}

export async function installSkill(
  skill: Skill,
  selectedExtensionPaths: string[],
  platform: Platform,
  scope: Scope
): Promise<string> {
  // Fetch and compose content
  const sections = await Promise.all([
    fetchFileContent(skill.basePath),
    ...selectedExtensionPaths.map((p) => fetchFileContent(p)),
  ]);

  const composed = compose(sections);
  const outputPath = resolveOutputPath(skill.name, platform, scope);

  // Write file
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, composed, 'utf8');

  // Update lock file
  const lockDir = getLockDir(scope);
  upsertLockEntry(lockDir, skill.name, {
    platform,
    scope,
    selectedExtensions: selectedExtensionPaths,
    sourceRef: SOURCE_REF,
  });

  return outputPath;
}

export function isInstalled(skillName: string, scope: Scope): boolean {
  const lockDir = getLockDir(scope);
  return getLockEntry(lockDir, skillName) !== undefined;
}
