import os from 'os';
import chalk from 'chalk';
import type { SymlinkResult } from './types';

export function expandHome(path: string): string {
  return path.replace(/^~/, os.homedir());
}

export function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = key(item);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

export function displayReport(results: SymlinkResult[]): void {
  const grouped = groupBy(results, (r) => r.agent);

  for (const [agent, agentResults] of Object.entries(grouped)) {
    console.log(chalk.bold(`\n${agent}:`));

    const created = agentResults.filter(r => r.action === 'created');
    const skipped = agentResults.filter(r => r.action === 'skipped');
    const replaced = agentResults.filter(r => r.action === 'replaced');
    const errors = agentResults.filter(r => r.action === 'error');

    if (created.length > 0) {
      console.log(chalk.green(`  ✓ Created ${created.length} symlink${created.length === 1 ? '' : 's'}`));
      for (const r of created) {
        console.log(chalk.gray(`    ${r.source} → ${r.target}`));
      }
    }

    if (replaced.length > 0) {
      console.log(chalk.yellow(`  ↻ Replaced ${replaced.length} symlink${replaced.length === 1 ? '' : 's'}`));
      for (const r of replaced) {
        console.log(chalk.gray(`    ${r.source} → ${r.target}`));
      }
    }

    if (skipped.length > 0) {
      console.log(chalk.dim(`  ○ Skipped ${skipped.length} (already exist)`));
    }

    if (errors.length > 0) {
      console.log(chalk.red(`  ✗ Failed ${errors.length}`));
      for (const r of errors) {
        console.log(chalk.red(`    ${r.target}: ${r.error}`));
      }
    }
  }

  const succeeded = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(chalk.bold(`\nTotal: ${chalk.green(succeeded + ' succeeded')}, ${failed > 0 ? chalk.red(failed + ' failed') : chalk.gray(failed + ' failed')}`));
}
