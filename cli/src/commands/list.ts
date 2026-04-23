import { listSkills } from '../registry.js';

export async function runList(): Promise<void> {
  console.log('Fetching skills from registry...\n');

  let skills;
  try {
    skills = await listSkills();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Error: ${message}`);
    process.exit(1);
  }

  if (skills.length === 0) {
    console.log('No skills found in the registry.');
    return;
  }

  for (const skill of skills) {
    console.log(`  ${skill.name}`);
    console.log(`    ${skill.description}`);

    if (skill.extensions.length === 0) {
      console.log('    Extensions: none');
    } else {
      console.log('    Extensions:');
      for (const ext of skill.extensions) {
        console.log(`      - ${ext.description}`);
      }
    }

    console.log('');
  }
}
