import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { LockFile, LockEntry, Platform, Scope } from './types.js';

const LOCK_FILE_NAME = '.vintecc-skills.json';
const LOCK_VERSION = 1;

export function readLockFile(dir: string): LockFile {
  const filePath = join(dir, LOCK_FILE_NAME);
  if (!existsSync(filePath)) {
    return { version: LOCK_VERSION, skills: {} };
  }
  try {
    const raw = readFileSync(filePath, 'utf8');
    return JSON.parse(raw) as LockFile;
  } catch {
    return { version: LOCK_VERSION, skills: {} };
  }
}

export function writeLockFile(dir: string, lockFile: LockFile): void {
  const filePath = join(dir, LOCK_FILE_NAME);
  writeFileSync(filePath, JSON.stringify(lockFile, null, 2) + '\n', 'utf8');
}

export function upsertLockEntry(
  dir: string,
  skillName: string,
  entry: Omit<LockEntry, 'installedAt' | 'updatedAt'>
): void {
  const lockFile = readLockFile(dir);
  const now = new Date().toISOString();
  const existing = lockFile.skills[skillName];
  lockFile.skills[skillName] = {
    ...entry,
    installedAt: existing?.installedAt ?? now,
    updatedAt: now,
  };
  writeLockFile(dir, lockFile);
}

export function getLockEntry(dir: string, skillName: string): LockEntry | undefined {
  const lockFile = readLockFile(dir);
  return lockFile.skills[skillName];
}

export function getLockDir(scope: Scope): string {
  if (scope === 'user') {
    return process.env.HOME ?? process.env.USERPROFILE ?? '.';
  }
  return process.cwd();
}
