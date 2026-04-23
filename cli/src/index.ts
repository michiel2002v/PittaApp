#!/usr/bin/env node

import { Command } from 'commander';
import { runList } from './commands/list.js';
import { runAdd } from './commands/add.js';
import { runUpdate } from './commands/update.js';
import { runContribute } from './commands/contribute.js';

const program = new Command();

program
  .name('vintecc-skills')
  .description('Vintecc company-wide agent skills registry')
  .version('0.1.0');

program
  .command('list')
  .description('List all available skills and their extensions')
  .action(runList);

program
  .command('add <skill>')
  .description('Install a skill interactively (platform, scope, extensions)')
  .action(runAdd);

program
  .command('update <skill>')
  .description('Update an installed skill and re-select extensions')
  .action(runUpdate);

program
  .command('contribute <skill>')
  .description('Open the skill source in GitHub to submit a PR')
  .action(runContribute);

program.parse();
