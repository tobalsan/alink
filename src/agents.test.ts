import { expect, test, describe } from "bun:test";
import { AGENTS, detectInstalledAgents } from "./agents";
import { existsSync, mkdirSync, rmSync } from "fs";
import { expandHome } from "./utils";

describe("AGENTS", () => {
  test("should not contain clawdbot", () => {
    const clawdbot = AGENTS.find(a => a.name === "clawdbot");
    expect(clawdbot).toBeUndefined();
  });

  test("should contain openclaw", () => {
    const openclaw = AGENTS.find(a => a.name === "openclaw");
    expect(openclaw).toBeDefined();
    expect(openclaw?.displayName).toBe("OpenClaw");
    expect(openclaw?.projectCommandsDir).toBe(".openclaw/commands");
  });

  test("should not contain moltbot", () => {
    const moltbot = AGENTS.find(a => a.name === "moltbot");
    expect(moltbot).toBeUndefined();
  });
});

describe("detectInstalledAgents", () => {
  const openclawPath = expandHome("~/.openclaw");
  
  test("should detect openclaw when ~/.openclaw exists", () => {
    const existsBefore = existsSync(openclawPath);
    if (!existsBefore) {
      mkdirSync(openclawPath, { recursive: true });
    }

    try {
      const installed = detectInstalledAgents();
      expect(installed.some(a => a.name === "openclaw")).toBe(true);
    } finally {
      if (!existsBefore) {
        rmSync(openclawPath, { recursive: true, force: true });
      }
    }
  });
});
