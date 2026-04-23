export type Platform = 'vscode-visualstudio' | 'claudecode';
export type Scope = 'user' | 'project';

export interface SkillExtension {
  order: number;
  description: string;
  path: string;
}

export interface Skill {
  name: string;
  description: string;
  basePath: string;
  extensions: SkillExtension[];
}

export interface LockEntry {
  platform: Platform;
  scope: Scope;
  selectedExtensions: string[];
  installedAt: string;
  updatedAt: string;
  sourceRef: string;
}

export interface LockFile {
  version: number;
  skills: Record<string, LockEntry>;
}
