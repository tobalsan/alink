import { existsSync, mkdirSync, symlinkSync, unlinkSync, lstatSync, readlinkSync } from 'fs';
import { dirname, join } from 'path';
import { expandHome } from './utils';
import type { Command, Skill, SymlinkResult, Agent } from './types';

export async function createSymlinks(
  resources: Array<{ type: 'command' | 'skill'; resource: Command | Skill }>,
  agents: Agent[],
  scope: 'global' | 'project'
): Promise<SymlinkResult[]> {
  const results: SymlinkResult[] = [];

  for (const agent of agents) {
    for (const { type, resource } of resources) {
      const result = await createSymlink(agent, type, resource, scope);
      results.push(result);
    }
  }

  return results;
}

async function createSymlink(
  agent: Agent,
  type: 'command' | 'skill',
  resource: Command | Skill,
  scope: 'global' | 'project'
): Promise<SymlinkResult> {
  const source = resource.path;
  const targetDir = getTargetDir(agent, type, scope);
  const targetPath = join(
    expandHome(targetDir),
    type === 'command' ? (resource as Command).fileName : (resource as Skill).dirName
  );

  try {
    // Create target directory if it doesn't exist
    const targetDirPath = dirname(targetPath);
    if (!existsSync(targetDirPath)) {
      mkdirSync(targetDirPath, { recursive: true });
    }

    // Check if target already exists
    if (existsSync(targetPath)) {
      const stats = lstatSync(targetPath);

      if (stats.isSymbolicLink()) {
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
        symlinkSync(source, targetPath, type === 'command' ? 'file' : 'dir');

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

    // Create new symlink
    symlinkSync(source, targetPath, type === 'command' ? 'file' : 'dir');

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

function getTargetDir(agent: Agent, type: 'command' | 'skill', scope: 'global' | 'project'): string {
  if (type === 'command') {
    return scope === 'global' ? agent.globalCommandsDir : agent.projectCommandsDir;
  } else {
    return scope === 'global' ? agent.globalSkillsDir : agent.projectSkillsDir;
  }
}
