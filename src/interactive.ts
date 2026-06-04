import * as p from '@clack/prompts';
import chalk from 'chalk';
import { existsSync, readdirSync } from 'fs';
import { STANDARD_SKILLS_AGENT, detectInstalledAgents, getAllAgents } from './agents';
import { discoverCommands, discoverSkills } from './discovery';
import { createSymlinks } from './symlink';
import { displayReport, expandHome } from './utils';
import type { Command, Skill, Agent } from './types';

function readCategories(agent: Agent, scope: 'global' | 'project'): string[] {
  const dir = expandHome(scope === 'global' ? agent.globalSkillsDir : agent.projectSkillsDir);
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name)
    .sort();
}

export async function runInteractiveFlow(): Promise<void> {
  p.intro(chalk.bgCyan(' alink '));

  // Step 1: Select resource type
  const resourceType = await p.select({
    message: 'What do you want to symlink?',
    options: [
      { value: 'skills', label: 'Skills' },
      { value: 'commands', label: 'Commands' },
      { value: 'both', label: 'Both skills and commands' }
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
    const skillFilter = await p.text({
      message: 'Filter skills (optional):',
      placeholder: 'Type to filter by name or description'
    });

    if (p.isCancel(skillFilter)) {
      p.cancel('Operation cancelled');
      process.exit(0);
    }

    const query = typeof skillFilter === 'string' ? skillFilter.trim().toLowerCase() : '';

    let filteredSkills = query === ''
      ? skills
      : skills.filter(skill =>
          skill.displayName.toLowerCase().includes(query) ||
          skill.name.toLowerCase().includes(query) ||
          skill.description.toLowerCase().includes(query)
        );

    if (filteredSkills.length === 0) {
      p.log.warn('No skills matched filter. Showing all skills.');
      filteredSkills = skills;
    }

    const skillEntries = filteredSkills.map((skill, idx) => ({ value: `skill:${idx}`, skill }));
    const skillValueMap = new Map(skillEntries.map(({ value, skill }) => [value, skill] as const));

    const skillOptions = [
      {
        value: '__all__',
        label: chalk.cyan(
          `All skills (${filteredSkills.length} shown${filteredSkills.length !== skills.length ? `, ${skills.length} total` : ''})`
        )
      },
      ...skillEntries.map(({ value, skill }) => ({
        value,
        label: skill.displayName
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
      selectedResources.push(...filteredSkills.map(skill => ({ type: 'skill' as const, resource: skill })));
    } else {
      const selected = selectedSkills
        .map(value => skillValueMap.get(value))
        .filter((skill): skill is Skill => skill !== undefined);
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

  const hasSkills = selectedResources.some(r => r.type === 'skill');
  const targetAgents = hasSkills
    ? [STANDARD_SKILLS_AGENT, ...installedAgents]
    : installedAgents;

  if (targetAgents.length === 0) {
    p.outro(chalk.yellow('No agents detected. Install an agent first.'));
    process.exit(0);
  }

  const agentOptions = targetAgents.map(agent => ({
    value: agent.name,
    label: agent.displayName,
    hint: agent.name === STANDARD_SKILLS_AGENT.name
      ? 'Standard convention (~/.agents/skills or .agents/skills)'
      : undefined
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

  const allAgents = hasSkills
    ? [STANDARD_SKILLS_AGENT, ...getAllAgents()]
    : getAllAgents();
  const selectedAgents = allAgents.filter(agent => selectedAgentNames.includes(agent.name));

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

  // Step 5: Pick category for category-enabled agents (skills only)
  const categoryByAgent = new Map<string, string>();
  if (hasSkills) {
    for (const agent of selectedAgents) {
      if (!agent.categories) continue;

      const existing = readCategories(agent, scope as 'global' | 'project');
      const NEW = '__new__';
      const options = [
        ...existing.map(c => ({ value: c, label: c })),
        { value: NEW, label: chalk.cyan('+ New category...') }
      ];

      let category: string | symbol;
      if (existing.length === 0) {
        category = NEW;
      } else {
        category = await p.select({
          message: `Select category for ${agent.displayName} skills:`,
          options
        });
        if (p.isCancel(category)) {
          p.cancel('Operation cancelled');
          process.exit(0);
        }
      }

      if (category === NEW) {
        const name = await p.text({
          message: `New category name for ${agent.displayName}:`,
          validate: v => (v && v.trim() ? undefined : 'Category name required')
        });
        if (p.isCancel(name)) {
          p.cancel('Operation cancelled');
          process.exit(0);
        }
        category = (name as string).trim();
      }

      categoryByAgent.set(agent.name, category as string);
    }
  }

  // Step 6: Choose link mode
  const mode = await p.select({
    message: 'Symlink or copy?',
    options: [
      { value: 'symlink', label: 'Symlink', hint: 'Default — stays in sync with source' },
      { value: 'copy', label: 'Copy', hint: 'Independent copy' }
    ]
  });

  if (p.isCancel(mode)) {
    p.cancel('Operation cancelled');
    process.exit(0);
  }

  // Step 7: Show summary
  console.log('');
  const categoryLines = selectedAgents
    .filter(a => categoryByAgent.has(a.name))
    .map(a => `  ${a.displayName} → ${categoryByAgent.get(a.name)}`);
  p.note(
    `Resources: ${selectedResources.length}\n` +
    `Agents: ${selectedAgents.map(a => a.displayName).join(', ')}\n` +
    `Scope: ${scope}\n` +
    (categoryLines.length ? `Categories:\n${categoryLines.join('\n')}\n` : '') +
    `Total symlinks: ${selectedAgents.reduce((total, agent) => total + selectedResources.filter(({ type }) => type === 'skill' ? agent.supportsSkills !== false : agent.supportsCommands !== false).length, 0)}`,
    'Summary'
  );

  // Step 8: Confirm
  const confirm = await p.confirm({
    message: `Proceed with creating ${mode === 'copy' ? 'copies' : 'symlinks'}?`
  });

  if (p.isCancel(confirm) || !confirm) {
    p.cancel('Operation cancelled');
    process.exit(0);
  }

  // Step 9: Create symlinks/copies
  spinner.start(mode === 'copy' ? 'Copying...' : 'Creating symlinks...');
  const results = await createSymlinks(selectedResources, selectedAgents, scope as 'global' | 'project', categoryByAgent, mode as 'symlink' | 'copy');
  spinner.stop(mode === 'copy' ? 'Copies created' : 'Symlinks created');

  // Step 10: Display report
  displayReport(results);

  p.outro(chalk.green('Done!'));
}
