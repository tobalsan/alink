import { existsSync } from 'fs';
import { expandHome } from './utils';
import { loadConfig } from './config';
import type { Agent } from './types';

export const AGENTS: Agent[] = [
  {
    name: 'claude-code',
    displayName: 'Claude Code',
    projectCommandsDir: '.claude/commands',
    projectSkillsDir: '.claude/skills',
    globalCommandsDir: '~/.claude/commands',
    globalSkillsDir: '~/.claude/skills',
    detectInstalled: () => existsSync(expandHome('~/.claude'))
  },
  {
    name: 'cline',
    displayName: 'Cline',
    projectCommandsDir: '.cline/commands',
    projectSkillsDir: '.cline/skills',
    globalCommandsDir: '~/.cline/commands',
    globalSkillsDir: '~/.cline/skills',
    detectInstalled: () => existsSync(expandHome('~/.cline'))
  },
  {
    name: 'cursor',
    displayName: 'Cursor',
    projectCommandsDir: '.cursor/commands',
    projectSkillsDir: '.cursor/skills',
    globalCommandsDir: '~/.cursor/commands',
    globalSkillsDir: '~/.cursor/skills',
    detectInstalled: () => existsSync(expandHome('~/.cursor'))
  },
  {
    name: 'codex',
    displayName: 'Codex',
    projectCommandsDir: '.codex/prompts',
    projectSkillsDir: '.codex/skills',
    globalCommandsDir: '~/.codex/prompts',
    globalSkillsDir: '~/.codex/skills',
    detectInstalled: () => existsSync(expandHome('~/.codex'))
  },
  {
    name: 'amp',
    displayName: 'Amp',
    projectCommandsDir: '.amp/commands',
    projectSkillsDir: '.amp/skills',
    globalCommandsDir: '~/.amp/commands',
    globalSkillsDir: '~/.amp/skills',
    detectInstalled: () => existsSync(expandHome('~/.amp'))
  },
  {
    name: 'antigravity',
    displayName: 'Antigravity',
    projectCommandsDir: '.antigravity/commands',
    projectSkillsDir: '.antigravity/skills',
    globalCommandsDir: '~/.antigravity/commands',
    globalSkillsDir: '~/.antigravity/skills',
    detectInstalled: () => existsSync(expandHome('~/.antigravity'))
  },
  {
    name: 'moltbot',
    displayName: 'Moltbot',
    projectCommandsDir: '.moltbot/commands',
    projectSkillsDir: '.moltbot/skills',
    globalCommandsDir: '~/.moltbot/commands',
    globalSkillsDir: '~/.moltbot/skills',
    detectInstalled: () => existsSync(expandHome('~/.moltbot'))
  },
  {
    name: 'clawdbot',
    displayName: 'Clawdbot (legacy)',
    projectCommandsDir: '.clawdbot/commands',
    projectSkillsDir: '.clawdbot/skills',
    globalCommandsDir: '~/.clawdbot/commands',
    globalSkillsDir: '~/.clawdbot/skills',
    // Only show Clawdbot when Moltbot isn't installed (legacy fallback)
    detectInstalled: () => !existsSync(expandHome('~/.moltbot')) && existsSync(expandHome('~/.clawdbot'))
  },
  {
    name: 'command-code',
    displayName: 'Command Code',
    projectCommandsDir: '.command-code/commands',
    projectSkillsDir: '.command-code/skills',
    globalCommandsDir: '~/.command-code/commands',
    globalSkillsDir: '~/.command-code/skills',
    detectInstalled: () => existsSync(expandHome('~/.command-code'))
  },
  {
    name: 'droid',
    displayName: 'Droid',
    projectCommandsDir: '.factory/commands',
    projectSkillsDir: '.factory/skills',
    globalCommandsDir: '~/.factory/commands',
    globalSkillsDir: '~/.factory/skills',
    detectInstalled: () => existsSync(expandHome('~/.factory'))
  },
  {
    name: 'gemini-cli',
    displayName: 'Gemini CLI',
    projectCommandsDir: '.gemini/commands',
    projectSkillsDir: '.gemini/skills',
    globalCommandsDir: '~/.gemini/commands',
    globalSkillsDir: '~/.gemini/skills',
    detectInstalled: () => existsSync(expandHome('~/.gemini'))
  },
  {
    name: 'goose',
    displayName: 'Goose',
    projectCommandsDir: '.goose/commands',
    projectSkillsDir: '.goose/skills',
    globalCommandsDir: '~/.goose/commands',
    globalSkillsDir: '~/.goose/skills',
    detectInstalled: () => existsSync(expandHome('~/.goose'))
  },
  {
    name: 'kilo',
    displayName: 'Kilo',
    projectCommandsDir: '.kilo/commands',
    projectSkillsDir: '.kilo/skills',
    globalCommandsDir: '~/.kilo/commands',
    globalSkillsDir: '~/.kilo/skills',
    detectInstalled: () => existsSync(expandHome('~/.kilo'))
  },
  {
    name: 'kiro-cli',
    displayName: 'Kiro CLI',
    projectCommandsDir: '.kiro/commands',
    projectSkillsDir: '.kiro/skills',
    globalCommandsDir: '~/.kiro/commands',
    globalSkillsDir: '~/.kiro/skills',
    detectInstalled: () => existsSync(expandHome('~/.kiro'))
  },
  {
    name: 'neovate',
    displayName: 'Neovate',
    projectCommandsDir: '.neovate/commands',
    projectSkillsDir: '.neovate/skills',
    globalCommandsDir: '~/.neovate/commands',
    globalSkillsDir: '~/.neovate/skills',
    detectInstalled: () => existsSync(expandHome('~/.neovate'))
  },
  {
    name: 'opencode',
    displayName: 'OpenCode',
    projectCommandsDir: '.opencode/commands',
    projectSkillsDir: '.opencode/skills',
    globalCommandsDir: '~/.config/opencode/commands',
    globalSkillsDir: '~/.config/opencode/skills',
    detectInstalled: () => existsSync(expandHome('~/.config/opencode'))
  },
  {
    name: 'openhands',
    displayName: 'OpenHands',
    projectCommandsDir: '.openhands/commands',
    projectSkillsDir: '.openhands/skills',
    globalCommandsDir: '~/.openhands/commands',
    globalSkillsDir: '~/.openhands/skills',
    detectInstalled: () => existsSync(expandHome('~/.openhands'))
  },
  {
    name: 'pi',
    displayName: 'Pi',
    projectCommandsDir: '.pi/prompts',
    projectSkillsDir: '.pi/skills',
    globalCommandsDir: '~/.pi/agent/prompts',
    globalSkillsDir: '~/.pi/agent/skills',
    detectInstalled: () => existsSync(expandHome('~/.pi'))
  },
  {
    name: 'qoder',
    displayName: 'Qoder',
    projectCommandsDir: '.qoder/commands',
    projectSkillsDir: '.qoder/skills',
    globalCommandsDir: '~/.qoder/commands',
    globalSkillsDir: '~/.qoder/skills',
    detectInstalled: () => existsSync(expandHome('~/.qoder'))
  },
  {
    name: 'roo-code',
    displayName: 'Roo Code',
    projectCommandsDir: '.roo-code/commands',
    projectSkillsDir: '.roo-code/skills',
    globalCommandsDir: '~/.roo-code/commands',
    globalSkillsDir: '~/.roo-code/skills',
    detectInstalled: () => existsSync(expandHome('~/.roo-code'))
  },
  {
    name: 'trae',
    displayName: 'Trae',
    projectCommandsDir: '.trae/commands',
    projectSkillsDir: '.trae/skills',
    globalCommandsDir: '~/.trae/commands',
    globalSkillsDir: '~/.trae/skills',
    detectInstalled: () => existsSync(expandHome('~/.trae'))
  },
  {
    name: 'windsurf',
    displayName: 'Windsurf',
    projectCommandsDir: '.windsurf/commands',
    projectSkillsDir: '.windsurf/skills',
    globalCommandsDir: '~/.windsurf/commands',
    globalSkillsDir: '~/.windsurf/skills',
    detectInstalled: () => existsSync(expandHome('~/.windsurf'))
  },
  {
    name: 'zencoder',
    displayName: 'Zencoder',
    projectCommandsDir: '.zencoder/commands',
    projectSkillsDir: '.zencoder/skills',
    globalCommandsDir: '~/.zencoder/commands',
    globalSkillsDir: '~/.zencoder/skills',
    detectInstalled: () => existsSync(expandHome('~/.zencoder'))
  },
  {
    name: 'github-copilot',
    displayName: 'GitHub Copilot',
    projectCommandsDir: '.github-copilot/commands',
    projectSkillsDir: '.github-copilot/skills',
    globalCommandsDir: '~/.github-copilot/commands',
    globalSkillsDir: '~/.github-copilot/skills',
    detectInstalled: () => existsSync(expandHome('~/.github-copilot'))
  }
];

function createCustomAgents(): Agent[] {
  const config = loadConfig();
  if (!config.customAgents) {
    return [];
  }

  return config.customAgents.map(customAgent => {
    const normalizedName = customAgent.name.toLowerCase().replace(/\s+/g, '-');
    const basePath = customAgent.path;

    return {
      name: normalizedName,
      displayName: customAgent.name,
      projectCommandsDir: `.${normalizedName}/commands`,
      projectSkillsDir: `.${normalizedName}/skills`,
      globalCommandsDir: `${basePath}/commands`,
      globalSkillsDir: `${basePath}/skills`,
      detectInstalled: () => existsSync(expandHome(basePath))
    };
  });
}

export function getAllAgents(): Agent[] {
  return [...AGENTS, ...createCustomAgents()];
}

export function detectInstalledAgents(): Agent[] {
  const builtInAgents = AGENTS.filter(agent => agent.detectInstalled());
  const customAgents = createCustomAgents().filter(agent => agent.detectInstalled());

  return [...builtInAgents, ...customAgents];
}
