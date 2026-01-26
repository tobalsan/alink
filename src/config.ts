import { existsSync, readFileSync } from 'fs';
import { expandHome } from './utils';
import type { AlinkConfig } from './types';

const CONFIG_PATH = '~/.alink/config.json';

export function loadConfig(): AlinkConfig {
  const configPath = expandHome(CONFIG_PATH);

  if (!existsSync(configPath)) {
    return {};
  }

  try {
    const content = readFileSync(configPath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return {};
  }
}
