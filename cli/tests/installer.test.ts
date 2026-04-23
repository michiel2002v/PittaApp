import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Mock github-client so no real HTTP calls are made
vi.mock('../src/github-client.js', () => ({
  fetchRepoTree: vi.fn(),
  fetchFileContent: vi.fn(),
}));

import { fetchFileContent } from '../src/github-client.js';
import { installSkill, resolveOutputPath } from '../src/installer.js';
import { readLockFile } from '../src/lock-file.js';
import type { Skill } from '../src/types.js';

const mockFetchFileContent = vi.mocked(fetchFileContent);

const FIXTURE_SKILL: Skill = {
  name: 'prd-to-issues',
  description: 'Break a PRD into issues.',
  basePath: 'skills/prd-to-issues/00-base.md',
  extensions: [
    {
      order: 10,
      description: 'Save as markdown.',
      path: 'skills/prd-to-issues/extensions/10-save-as-markdown.md',
    },
  ],
};

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'vintecc-installer-test-'));
  vi.clearAllMocks();

  mockFetchFileContent.mockImplementation(async (path: string) => {
    if (path.includes('00-base')) return '# Base Skill\nBase content.';
    if (path.includes('10-save-as-markdown')) return '## Extension: Save as Markdown\nExtra step.';
    throw new Error(`Unexpected path: ${path}`);
  });
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('installer: resolveOutputPath', () => {
  it('resolves VS Code project-level path correctly', () => {
    const path = resolveOutputPath('prd-to-issues', 'vscode-visualstudio', 'project');
    expect(path).toContain(join('.agents', 'skills', 'prd-to-issues', 'SKILL.md'));
  });

  it('resolves Claude Code project-level path correctly', () => {
    const path = resolveOutputPath('prd-to-issues', 'claudecode', 'project');
    expect(path).toContain(join('.claude', 'rules', 'prd-to-issues.md'));
  });
});

describe('installer: installSkill', () => {
  it('writes composed skill file to the correct path', async () => {
    // Override cwd to tmpDir so project-scope writes there
    const originalCwd = process.cwd;
    process.cwd = () => tmpDir;

    const outputPath = await installSkill(FIXTURE_SKILL, [], 'vscode-visualstudio', 'project');

    process.cwd = originalCwd;

    expect(existsSync(outputPath)).toBe(true);
    const content = readFileSync(outputPath, 'utf8');
    expect(content).toContain('# Base Skill');
  });

  it('composes base + selected extensions in correct order', async () => {
    const originalCwd = process.cwd;
    process.cwd = () => tmpDir;

    const outputPath = await installSkill(
      FIXTURE_SKILL,
      ['skills/prd-to-issues/extensions/10-save-as-markdown.md'],
      'vscode-visualstudio',
      'project'
    );

    process.cwd = originalCwd;

    const content = readFileSync(outputPath, 'utf8');
    expect(content).toContain('# Base Skill');
    expect(content).toContain('## Extension: Save as Markdown');
    // Base must come before extension
    expect(content.indexOf('# Base Skill')).toBeLessThan(content.indexOf('## Extension:'));
  });

  it('writes lock file entry after install', async () => {
    const originalCwd = process.cwd;
    process.cwd = () => tmpDir;

    await installSkill(FIXTURE_SKILL, [], 'claudecode', 'project');

    process.cwd = originalCwd;

    const lockFile = readLockFile(tmpDir);
    const entry = lockFile.skills['prd-to-issues'];
    expect(entry).toBeDefined();
    expect(entry.platform).toBe('claudecode');
    expect(entry.scope).toBe('project');
  });

  it('creates output directory if it does not exist', async () => {
    const originalCwd = process.cwd;
    process.cwd = () => tmpDir;

    const outputPath = await installSkill(FIXTURE_SKILL, [], 'vscode-visualstudio', 'project');

    process.cwd = originalCwd;

    expect(existsSync(outputPath)).toBe(true);
  });
});
