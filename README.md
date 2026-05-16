# alink - Agent Resource Linker

CLI tool to symlink commands from `~/.agents/commands/` and skills from `~/.agents/.skills/` to agent config directories.

## Overview

`alink` creates symlinks from centralized resources in `~/.agents/commands/` and `~/.agents/.skills/` to agent-specific config directories (`.claude/`, `.cline/`, `.cursor/`, etc.) for both project and global scopes. It can also link skills into the standard convention folders (`~/.agents/skills` globally or `.agents/skills` locally).

## Installation

```bash
bun install
bun link  # Create global link
```

## Usage

Run the interactive CLI:

```bash
# From project directory
bun alink

# Or globally (after bun link)
alink

# Or explicitly
bun run src/index.ts
```

### Interactive Flow

1. **Select resource type:** Commands, Skills, or Both
2. **Select resources:** Choose specific resources or "All"
3. **Select agents:** Choose from detected installed agents
4. **Choose scope:** Global (~/.agent/) or Project (.agent/)
5. **Confirm:** Review summary and proceed
6. **View results:** See created, skipped, or failed symlinks

## Supported Agents

- Claude Code
- Cline
- Cursor
- Codex
- Amp
- Antigravity
- OpenClaw
- Command Code
- Droid
- Gemini CLI
- Goose
- Kilo
- Kiro CLI
- Neovate
- OpenCode
- OpenHands
- Pi
- Qoder
- Roo Code
- Trae
- Windsurf
- Zencoder
- GitHub Copilot

## Custom Agents (`~/.alink/config.json`)

```json
{
  "commandsDir": "~/.agents/commands",
  "skillsDir": "~/.agents/.skills",
  "customAgents": [
    { "name": "Hermes", "path": "~/.hermes", "categories": true }
  ]
}
```

- `commandsDir` — source directory for discovering commands. Defaults to `~/.agents/commands`.
- `skillsDir` — source directory for discovering skills recursively. Defaults to `~/.agents/.skills`.
- `categories: true` — agent organizes skills by category subdirectory (e.g. `~/.hermes/skills/<category>/<skill>`). When selected, alink prompts for a category per run, listing existing categories found on disk plus an option to add a new one. Defaults to `false`.

## Directory Structure

```
~/.agents/
├── commands/
│   ├── commit.md
│   ├── handoff.md
│   └── ...
├── skills/              # optional target for standard-convention agents
└── .skills/             # default skill source
    ├── remotion-best-practices/
    │   ├── SKILL.md
    │   └── ...
    └── ...
```

## Examples

### Symlink all commands to Claude Code globally

1. Run `alink`
2. Select "Commands"
3. Select "All commands"
4. Select "Claude Code"
5. Select "Global"
6. Confirm

Result: All commands from `~/.agents/commands/` are symlinked to `~/.claude/commands/`

### Symlink specific skills to multiple agents in project

1. Run `alink`
2. Select "Skills"
3. Select specific skills
4. Select multiple agents
5. Select "Project"
6. Confirm

Result: Selected skills are symlinked to `.agent/skills/` for each selected agent (or `.agents/skills` when selecting the standard local target)

## Behavior

- **Existing symlinks:** Skipped if pointing to correct source
- **Different symlinks:** Replaced with new source
- **Non-symlink files:** Error (not overwritten)
- **Missing directories:** Created automatically

## Development

```bash
# Install dependencies
bun install

# Run in development
bun alink

# Type check
bun run tsc --noEmit

# Create global link
bun link
```
