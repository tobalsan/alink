import { existsSync, mkdirSync, symlinkSync, unlinkSync, lstatSync, readlinkSync, rmSync, cpSync } from 'fs';
import { dirname, join } from 'path';
import { expandHome } from './utils';
import type { Command, Skill, SymlinkResult, Agent } from './types';

export async function createSymlinks(
  resources: Array<{ type: 'command' | 'skill'; resource: Command | Skill }>,
  agents: Agent[],
  scope: 'global' | 'project',
  categoryByAgent: Map<string, string> = new Map(),
  mode: 'symlink' | 'copy' = 'symlink'
): Promise<SymlinkResult[]> {
  const results: SymlinkResult[] = [];

  for (const agent of agents) {
    for (const { type, resource } of resources) {
      if (type === 'command' && agent.supportsCommands === false) continue;
      if (type === 'skill' && agent.supportsSkills === false) continue;

      const category = type === 'skill' && agent.categories
        ? categoryByAgent.get(agent.name)
        : undefined;
      const result = await createSymlink(agent, type, resource, scope, category, mode);
      results.push(result);
    }
  }

  return results;
}

async function createSymlink(
  agent: Agent,
  type: 'command' | 'skill',
  resource: Command | Skill,
  scope: 'global' | 'project',
  category?: string,
  mode: 'symlink' | 'copy' = 'symlink'
): Promise<SymlinkResult> {
  const source = resource.path;
  const targetDir = getTargetDir(agent, type, scope);
  const leaf = type === 'command'
    ? (resource as Command).fileName
    : (resource as Skill).dirName;
  const targetPath = category
    ? join(expandHome(targetDir), category, leaf)
    : join(expandHome(targetDir), leaf);

  try {
    // Create target directory if it doesn't exist
    const targetDirPath = dirname(targetPath);
    if (!existsSync(targetDirPath)) {
      mkdirSync(targetDirPath, { recursive: true });
    }

    // Check if target already exists
    if (existsSync(targetPath)) {
      const stats = lstatSync(targetPath);

      if (mode === 'symlink' && stats.isSymbolicLink()) {
        const currentTarget = readlinkSync(targetPath);

        // Already points to correct source
        if (currentTarget === source) {
          return {
            success: true,
            source,
            target: targetPath,
            agent: agent.displayName,
            action: 'skipped'
          };
        }

        // Points to different source - replace it
        unlinkSync(targetPath);
        place(source, targetPath, type, mode);

        return {
          success: true,
          source,
          target: targetPath,
          agent: agent.displayName,
          action: 'replaced'
        };
      }

      // Copy mode replaces any existing target; symlink mode refuses non-symlinks
      if (mode === 'copy') {
        rmSync(targetPath, { recursive: true, force: true });
        place(source, targetPath, type, mode);

        return {
          success: true,
          source,
          target: targetPath,
          agent: agent.displayName,
          action: 'replaced'
        };
      }

      // Existing non-symlink file - don't overwrite
      return {
        success: false,
        source,
        target: targetPath,
        agent: agent.displayName,
        action: 'error',
        error: 'Target exists and is not a symlink'
      };
    }

    // Create new symlink/copy
    place(source, targetPath, type, mode);

    return {
      success: true,
      source,
      target: targetPath,
      agent: agent.displayName,
      action: 'created'
    };
  } catch (error) {
    return {
      success: false,
      source,
      target: targetPath,
      agent: agent.displayName,
      action: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

function place(source: string, targetPath: string, type: 'command' | 'skill', mode: 'symlink' | 'copy'): void {
  if (mode === 'copy') {
    cpSync(source, targetPath, { recursive: type === 'skill' });
  } else {
    symlinkSync(source, targetPath, type === 'command' ? 'file' : 'dir');
  }
}

function getTargetDir(agent: Agent, type: 'command' | 'skill', scope: 'global' | 'project'): string {
  if (type === 'command') {
    return scope === 'global' ? agent.globalCommandsDir : agent.projectCommandsDir;
  } else {
    return scope === 'global' ? agent.globalSkillsDir : agent.projectSkillsDir;
  }
}
