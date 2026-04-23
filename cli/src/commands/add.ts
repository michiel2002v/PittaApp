import { listSkills } from '../registry.js';
import { promptInstallConfig, confirmOverwrite } from '../prompts.js';
import { installSkill, isInstalled } from '../installer.js';

export async function runAdd(skillName: string): Promise<void> {
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
    console.error(
      `Skill '${skillName}' not found. Run 'npx @vintecc/skills list' to see available skills.`
    );
    process.exit(1);
  }

  const { platform, scope, selectedExtensions } = await promptInstallConfig(skill.extensions);

  if (isInstalled(skillName, scope)) {
    const ok = await confirmOverwrite(skillName);
    if (!ok) {
      console.log('Cancelled.');
      return;
    }
  }

  console.log('\nInstalling...');
  try {
    const outputPath = await installSkill(skill, selectedExtensions, platform, scope);
    console.log(`\nInstalled: ${outputPath}`);
    if (selectedExtensions.length > 0) {
      console.log(`Extensions: ${selectedExtensions.length} included`);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\nInstall failed: ${message}`);
    process.exit(1);
  }
}
