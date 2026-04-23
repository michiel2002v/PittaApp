import { select, checkbox, confirm } from '@inquirer/prompts';
import type { Platform, Scope, SkillExtension } from './types.js';

export interface InstallConfig {
  platform: Platform;
  scope: Scope;
  selectedExtensions: string[];
}

export async function promptInstallConfig(
  extensions: SkillExtension[],
  defaults?: Partial<InstallConfig>
): Promise<InstallConfig> {
  const platform = await select<Platform>({
    message: 'Which agent platform are you installing for?',
    choices: [
      {
        name: 'VS Code / Visual Studio (GitHub Copilot)',
        value: 'vscode-visualstudio',
      },
      {
        name: 'Claude Code',
        value: 'claudecode',
      },
    ],
    default: defaults?.platform,
  });

  const scope = await select<Scope>({
    message: 'Install scope?',
    choices: [
      {
        name: 'User-level  (applies to all your projects)',
        value: 'user',
      },
      {
        name: 'Project-level  (committed in this repo, shared with the team)',
        value: 'project',
      },
    ],
    default: defaults?.scope,
  });

  let selectedExtensions: string[] = [];

  if (extensions.length > 0) {
    selectedExtensions = await checkbox<string>({
      message: 'Which extensions do you want to include?',
      choices: extensions.map((ext) => ({
        name: ext.description,
        value: ext.path,
        checked: defaults?.selectedExtensions?.includes(ext.path) ?? false,
      })),
    });
  }

  return { platform, scope, selectedExtensions };
}

export async function confirmOverwrite(skillName: string): Promise<boolean> {
  return confirm({
    message: `Skill '${skillName}' is already installed. Overwrite?`,
    default: false,
  });
}
