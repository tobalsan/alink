import { readdirSync, statSync, readFileSync, existsSync } from 'fs';
import { basename, join, relative } from 'path';
import { loadConfig } from './config';
import { expandHome } from './utils';
import type { Command, Skill } from './types';

export async function discoverCommands(): Promise<Command[]> {
  const commandsDir = expandHome('~/.agents/commands');

  if (!existsSync(commandsDir)) {
    return [];
  }

  const files = readdirSync(commandsDir);
  const commands: Command[] = [];

  for (const file of files) {
    if (!file.endsWith('.md')) continue;

    const filePath = join(commandsDir, file);
    const stats = statSync(filePath);

    if (stats.isFile()) {
      const name = file.replace(/\.md$/, '');
      commands.push({
        name,
        fileName: file,
        displayName: name,
        path: filePath
      });
    }
  }

  return commands.sort((a, b) => a.name.localeCompare(b.name));
}

export async function discoverSkills(): Promise<Skill[]> {
  const config = loadConfig();
  const skillsDir = expandHome(config.skillsDir || '~/.agents/.skills');

  if (!existsSync(skillsDir)) {
    return [];
  }

  const dirs = findSkillDirs(skillsDir);
  const skills: Skill[] = [];

  for (const dirPath of dirs) {
    const skillMdPath = join(dirPath, 'SKILL.md');
    const frontmatter = await parseSkillFrontmatter(skillMdPath);
    const relativePath = relative(skillsDir, dirPath);
    const dir = basename(dirPath);

    skills.push({
      name: relativePath,
      dirName: dir,
      displayName: frontmatter.name || dir,
      description: frontmatter.description || '',
      path: dirPath
    });
  }

  return skills.sort((a, b) => a.name.localeCompare(b.name));
}

async function parseSkillFrontmatter(path: string): Promise<{ name: string; description: string }> {
  try {
    const content = readFileSync(path, 'utf-8');
    const match = content.match(/^---\n([\s\S]*?)\n---/);

    if (!match) {
      return { name: '', description: '' };
    }

    const frontmatter = match[1];
    const nameMatch = frontmatter.match(/^name:\s*(.+)$/m);
    const descMatch = frontmatter.match(/^description:\s*(.+)$/m);

    return {
      name: nameMatch ? nameMatch[1].trim() : '',
      description: descMatch ? descMatch[1].trim() : ''
    };
  } catch {
    return { name: '', description: '' };
  }
}

function findSkillDirs(rootDir: string): string[] {
  const found: string[] = [];
  const dirs = readdirSync(rootDir);

  for (const dir of dirs) {
    const dirPath = join(rootDir, dir);
    const stats = statSync(dirPath);

    if (!stats.isDirectory()) continue;

    if (existsSync(join(dirPath, 'SKILL.md'))) {
      found.push(dirPath);
    }

    found.push(...findSkillDirs(dirPath));
  }

  return found;
}
