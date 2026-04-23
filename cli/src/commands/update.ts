import { listSkills } from '../registry.js';
import { promptInstallConfig } from '../prompts.js';
import { installSkill } from '../installer.js';
import { getLockEntry, getLockDir } from '../lock-file.js';

export async function runUpdate(skillName: string): Promise<void> {
  // Check if installed
  // We check both scopes — project first, then user
  let lockEntry = getLockEntry(getLockDir('project'), skillName);
  let lockScope: 'project' | 'user' = 'project';

  if (!lockEntry) {
    lockEntry = getLockEntry(getLockDir('user'), skillName);
    lockScope = 'user';
  }

  if (!lockEntry) {
    console.error(
      `Skill '${skillName}' is not installed. Run 'npx @vintecc/skills add ${skillName}' first.`
    );
    process.exit(1);
  }

  console.log(`Fetching registry...\n`);

  let skills;
  try {
    skills = await listSkills();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error: ${message}`);
    process.exit(1);
  }

  const skill = skills.find((s) => s.name === skillName);
  if (!skill) {
    console.error(`Skill '${skillName}' no longer exists in the registry.`);
    process.exit(1);
  }

  // Re-prompt extensions only (platform and scope preserved from lock file)
  const { selectedExtensions } = await promptInstallConfig(skill.extensions, {
    platform: lockEntry.platform,
    scope: lockScope,
    selectedExtensions: lockEntry.selectedExtensions,
  });

  console.log('\nUpdating...');
  try {
    const outputPath = await installSkill(skill, selectedExtensions, lockEntry.platform, lockScope);
    console.log(`\nUpdated: ${outputPath}`);
    if (selectedExtensions.length > 0) {
      console.log(`Extensions: ${selectedExtensions.length} included`);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\nUpdate failed: ${message}`);
    process.exit(1);
  }
}
