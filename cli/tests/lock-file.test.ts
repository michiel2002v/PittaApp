import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { mkdtempSync, rmSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import {
  readLockFile,
  writeLockFile,
  upsertLockEntry,
  getLockEntry,
} from '../src/lock-file.js';
import type { LockFile } from '../src/types.js';

let tmpDir: string;

beforeEach(() => {
  tmpDir = mkdtempSync(join(tmpdir(), 'vintecc-skills-test-'));
});

afterEach(() => {
  rmSync(tmpDir, { recursive: true, force: true });
});

describe('lock-file', () => {
  it('returns empty state when file does not exist', () => {
    const result = readLockFile(tmpDir);
    expect(result.version).toBe(1);
    expect(result.skills).toEqual({});
  });

  it('round-trips read/write without data loss', () => {
    const lockFile: LockFile = {
      version: 1,
      skills: {
        'prd-to-issues': {
          platform: 'vscode-visualstudio',
          scope: 'project',
          selectedExtensions: ['skills/prd-to-issues/extensions/team-example/10-save-as-markdown.md'],
          installedAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          sourceRef: 'main',
        },
      },
    };
    writeLockFile(tmpDir, lockFile);
    const result = readLockFile(tmpDir);
    expect(result).toEqual(lockFile);
  });

  it('upserts a new skill entry', () => {
    upsertLockEntry(tmpDir, 'grill-me', {
      platform: 'claudecode',
      scope: 'user',
      selectedExtensions: [],
      sourceRef: 'main',
    });
    const entry = getLockEntry(tmpDir, 'grill-me');
    expect(entry).toBeDefined();
    expect(entry?.platform).toBe('claudecode');
    expect(entry?.scope).toBe('user');
    expect(entry?.installedAt).toBeDefined();
    expect(entry?.updatedAt).toBeDefined();
  });

  it('updating an entry preserves installedAt', () => {
    upsertLockEntry(tmpDir, 'prd-to-issues', {
      platform: 'vscode-visualstudio',
      scope: 'project',
      selectedExtensions: [],
      sourceRef: 'main',
    });
    const first = getLockEntry(tmpDir, 'prd-to-issues');

    upsertLockEntry(tmpDir, 'prd-to-issues', {
      platform: 'vscode-visualstudio',
      scope: 'project',
      selectedExtensions: ['skills/prd-to-issues/extensions/team-example/10-save-as-markdown.md'],
      sourceRef: 'main',
    });
    const second = getLockEntry(tmpDir, 'prd-to-issues');

    expect(second?.installedAt).toBe(first?.installedAt);
    expect(second?.selectedExtensions).toHaveLength(1);
  });

  it('updating one skill does not affect other skills', () => {
    upsertLockEntry(tmpDir, 'grill-me', {
      platform: 'claudecode',
      scope: 'user',
      selectedExtensions: [],
      sourceRef: 'main',
    });
    upsertLockEntry(tmpDir, 'prd-to-issues', {
      platform: 'vscode-visualstudio',
      scope: 'project',
      selectedExtensions: [],
      sourceRef: 'main',
    });
    upsertLockEntry(tmpDir, 'grill-me', {
      platform: 'vscode-visualstudio',
      scope: 'project',
      selectedExtensions: [],
      sourceRef: 'main',
    });

    const prdEntry = getLockEntry(tmpDir, 'prd-to-issues');
    expect(prdEntry?.platform).toBe('vscode-visualstudio');
    expect(prdEntry?.scope).toBe('project');
  });

  it('returns undefined for unknown skill', () => {
    const entry = getLockEntry(tmpDir, 'nonexistent');
    expect(entry).toBeUndefined();
  });
});
