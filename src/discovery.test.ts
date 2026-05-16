import { describe, expect, test } from "bun:test";
import { existsSync, mkdirSync, readFileSync, rmSync, unlinkSync, writeFileSync } from "fs";
import { join } from "path";
import { discoverCommands, discoverSkills } from "./discovery";
import { expandHome } from "./utils";

function withConfig(config: object, test: () => Promise<void>): Promise<void> {
  const configDir = expandHome("~/.alink");
  const configPath = join(configDir, "config.json");
  const hadConfig = existsSync(configPath);
  const oldConfig = hadConfig ? readFileSync(configPath, "utf-8") : "";

  mkdirSync(configDir, { recursive: true });
  writeFileSync(configPath, JSON.stringify(config));

  return test().finally(() => {
    if (hadConfig) {
      writeFileSync(configPath, oldConfig);
    } else {
      unlinkSync(configPath);
    }
  });
}

describe("discoverCommands", () => {
  test("uses custom commandsDir from config", async () => {
    const commandsRoot = expandHome(`~/.alink-test-commands-${Date.now()}`);
    mkdirSync(commandsRoot, { recursive: true });
    writeFileSync(join(commandsRoot, "hello.md"), "# Hello\n");
    writeFileSync(join(commandsRoot, "ignore.txt"), "ignore\n");

    try {
      await withConfig({ commandsDir: commandsRoot }, async () => {
        const commands = await discoverCommands();
        expect(commands.map((c) => c.name)).toEqual(["hello"]);
        expect(commands[0].path).toBe(join(commandsRoot, "hello.md"));
      });
    } finally {
      rmSync(commandsRoot, { recursive: true, force: true });
    }
  });
});

describe("discoverSkills", () => {
  test("finds nested skills and flattens their target dir names", async () => {
    const skillsRoot = expandHome("~/.agents/.skills");
    const testRoot = join(skillsRoot, `alink-test-${Date.now()}`);
    const topLevelSkillDir = join(testRoot, "top-level");
    const nestedSkillDir = join(testRoot, "group", "nested");

    mkdirSync(topLevelSkillDir, { recursive: true });
    mkdirSync(nestedSkillDir, { recursive: true });

    writeFileSync(join(topLevelSkillDir, "SKILL.md"), "---\nname: Top\n---\n");
    writeFileSync(join(nestedSkillDir, "SKILL.md"), "---\nname: Nested\n---\n");

    try {
      const skills = await discoverSkills();
      const topLevel = skills.find((s) => s.path === topLevelSkillDir);
      const nested = skills.find((s) => s.path === nestedSkillDir);

      expect(topLevel).toBeDefined();
      expect(topLevel?.dirName).toBe("top-level");
      expect(nested).toBeDefined();
      expect(nested?.dirName).toBe("nested");
      expect(nested?.name.endsWith("/group/nested") || nested?.name.endsWith("\\group\\nested")).toBe(true);
    } finally {
      rmSync(testRoot, { recursive: true, force: true });
    }
  });
});
