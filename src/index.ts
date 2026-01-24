#!/usr/bin/env bun
import { Command } from 'commander';
import { runInteractiveFlow } from './interactive';

const program = new Command();

program
  .name('alink')
  .description('Symlink commands and skills from ~/.agents/ to agent config directories')
  .version('1.0.0')
  .action(async () => {
    await runInteractiveFlow();
  });

program.parse();
