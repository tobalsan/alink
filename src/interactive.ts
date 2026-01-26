import * as p from '@clack/prompts';
import chalk from 'chalk';
import { detectInstalledAgents, getAllAgents } from './agents';
import { discoverCommands, discoverSkills } from './discovery';
import { createSymlinks } from './symlink';
import { displayReport } from './utils';
import type { Command, Skill, Agent } from './types';

export async function runInteractiveFlow(): Promise<void> {
  p.intro(chalk.bgCyan(' alink '));

  // Step 1: Select resource type
  const resourceType = await p.select({
    message: 'What do you want to symlink?',
    options: [
      { value: 'commands', label: 'Commands' },
      { value: 'skills', label: 'Skills' },
      { value: 'both', label: 'Both commands and skills' }
    ]
  });

  if (p.isCancel(resourceType)) {
    p.cancel('Operation cancelled');
    process.exit(0);
  }

  // Step 2: Discover and select resources
  const spinner = p.spinner();
  spinner.start('Discovering resources...');

  const commands = resourceType === 'commands' || resourceType === 'both'
    ? await discoverCommands()
    : [];
  const skills = resourceType === 'skills' || resourceType === 'both'
    ? await discoverSkills()
    : [];

  spinner.stop('Resources discovered');

  if (commands.length === 0 && skills.length === 0) {
    p.outro(chalk.yellow('No resources found in ~/.agents/'));
    process.exit(0);
  }

  const selectedResources: Array<{ type: 'command' | 'skill'; resource: Command | Skill }> = [];

  // Select commands
  if (commands.length > 0) {
    const commandOptions = [
      { value: '__all__', label: chalk.cyan('All commands'), hint: `${commands.length} total` },
      ...commands.map(cmd => ({ value: cmd.name, label: cmd.displayName }))
    ];

    const selectedCommands = await p.multiselect({
      message: 'Select commands to symlink:',
      options: commandOptions,
      required: false
    });

    if (p.isCancel(selectedCommands)) {
      p.cancel('Operation cancelled');
      process.exit(0);
    }

    if (selectedCommands.includes('__all__')) {
      selectedResources.push(...commands.map(cmd => ({ type: 'command' as const, resource: cmd })));
    } else {
      const selected = commands.filter(cmd => selectedCommands.includes(cmd.name));
      selectedResources.push(...selected.map(cmd => ({ type: 'command' as const, resource: cmd })));
    }
  }

  // Select skills
  if (skills.length > 0) {
    const skillOptions = [
      { value: '__all__', label: chalk.cyan('All skills'), hint: `${skills.length} total` },
      ...skills.map(skill => ({
        value: skill.name,
        label: skill.displayName,
        hint: skill.description
      }))
    ];

    const selectedSkills = await p.multiselect({
      message: 'Select skills to symlink:',
      options: skillOptions,
      required: false
    });

    if (p.isCancel(selectedSkills)) {
      p.cancel('Operation cancelled');
      process.exit(0);
    }

    if (selectedSkills.includes('__all__')) {
      selectedResources.push(...skills.map(skill => ({ type: 'skill' as const, resource: skill })));
    } else {
      const selected = skills.filter(skill => selectedSkills.includes(skill.name));
      selectedResources.push(...selected.map(skill => ({ type: 'skill' as const, resource: skill })));
    }
  }

  if (selectedResources.length === 0) {
    p.outro(chalk.yellow('No resources selected'));
    process.exit(0);
  }

  // Step 3: Detect and select agents
  spinner.start('Detecting installed agents...');
  const installedAgents = detectInstalledAgents();
  spinner.stop(`Found ${installedAgents.length} installed agent${installedAgents.length === 1 ? '' : 's'}`);

  if (installedAgents.length === 0) {
    p.outro(chalk.yellow('No agents detected. Install an agent first.'));
    process.exit(0);
  }

  const agentOptions = installedAgents.map(agent => ({
    value: agent.name,
    label: agent.displayName
  }));

  const selectedAgentNames = await p.multiselect({
    message: 'Select target agents:',
    options: agentOptions
  });

  if (p.isCancel(selectedAgentNames)) {
    p.cancel('Operation cancelled');
    process.exit(0);
  }

  if (selectedAgentNames.length === 0) {
    p.outro(chalk.yellow('No agents selected'));
    process.exit(0);
  }

  const selectedAgents = getAllAgents().filter(agent => selectedAgentNames.includes(agent.name));

  // Step 4: Choose scope
  const scope = await p.select({
    message: 'Select scope:',
    options: [
      { value: 'global', label: 'Global (~/.agent/)', hint: 'Available for all projects' },
      { value: 'project', label: 'Project (.agent/)', hint: 'Only for current project' }
    ]
  });

  if (p.isCancel(scope)) {
    p.cancel('Operation cancelled');
    process.exit(0);
  }

  // Step 5: Show summary
  console.log('');
  p.note(
    `Resources: ${selectedResources.length}\n` +
    `Agents: ${selectedAgents.map(a => a.displayName).join(', ')}\n` +
    `Scope: ${scope}\n` +
    `Total symlinks: ${selectedResources.length * selectedAgents.length}`,
    'Summary'
  );

  // Step 6: Confirm
  const confirm = await p.confirm({
    message: 'Proceed with creating symlinks?'
  });

  if (p.isCancel(confirm) || !confirm) {
    p.cancel('Operation cancelled');
    process.exit(0);
  }

  // Step 7: Create symlinks
  spinner.start('Creating symlinks...');
  const results = await createSymlinks(selectedResources, selectedAgents, scope as 'global' | 'project');
  spinner.stop('Symlinks created');

  // Step 8: Display report
  displayReport(results);

  p.outro(chalk.green('Done!'));
}
