export interface Agent {
  name: string;
  displayName: string;
  projectCommandsDir: string;
  projectSkillsDir: string;
  globalCommandsDir: string;
  globalSkillsDir: string;
  detectInstalled: () => boolean;
}

export interface Command {
  name: string;
  fileName: string;
  displayName: string;
  path: string;
}

export interface Skill {
  name: string;
  dirName: string;
  displayName: string;
  description: string;
  path: string;
}

export interface SymlinkResult {
  success: boolean;
  source: string;
  target: string;
  agent: string;
  action: 'created' | 'skipped' | 'replaced' | 'error';
  error?: string;
}
