import { listSkills } from '../registry.js';

const REPO_URL = 'https://github.com/michiel2002v/Vintecc.Skills';

async function openInBrowser(url: string): Promise<void> {
  const { execSync } = await import('child_process');
  const platform = process.platform;
  try {
    if (platform === 'win32') {
      execSync(`start "" "${url}"`, { stdio: 'ignore' });
    } else if (platform === 'darwin') {
      execSync(`open "${url}"`, { stdio: 'ignore' });
    } else {
      execSync(`xdg-open "${url}"`, { stdio: 'ignore' });
    }
  } catch {
    // Non-fatal: user still gets the printed URL
  }
}

export async function runContribute(skillName: string): Promise<void> {
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
      `Skill '${skillName}' not found in the registry. Run 'npx @vintecc/skills list' to see available skills.`
    );
    process.exit(1);
  }

  const skillFolder = `skills/${skillName}`;
  const folderUrl = `${REPO_URL}/tree/main/${skillFolder}`;
  const baseFileUrl = `${REPO_URL}/blob/main/${skill.basePath}`;
  const extensionsFolderUrl = `${REPO_URL}/tree/main/${skillFolder}/extensions`;
  const cloneUrl = `${REPO_URL}.git`;

  console.log(`\nSkill: ${skill.name}`);
  console.log(`\nSource files:`);
  console.log(`  Base skill:  ${baseFileUrl}`);
  console.log(`  Extensions:  ${extensionsFolderUrl}`);
  console.log(`\nClone the repo to contribute:`);
  console.log(`  git clone ${cloneUrl}`);
  console.log(`\nContributing guide: ${REPO_URL}/blob/main/skills/CONTRIBUTING.md`);
  console.log(`\nOpening skill folder in browser...`);

  await openInBrowser(folderUrl);
}
