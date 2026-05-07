import { describe, expect, test } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { join } from "path";
import { discoverSkills } from "./discovery";
import { expandHome } from "./utils";

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
