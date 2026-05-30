import assert from "node:assert/strict";
import { mkdtemp, rm, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { saveConfig } from "../dist/config.js";

test("saveConfig writes config with owner-only permissions", async () => {
  const originalConfigDir = process.env.WISBURG_CONFIG_DIR;
  const dir = await mkdtemp(join(tmpdir(), "wisburg-cli-config-"));
  process.env.WISBURG_CONFIG_DIR = dir;

  try {
    await saveConfig({ apiKey: "test-key" });
    const fileMode = (await stat(join(dir, "config.json"))).mode & 0o777;
    assert.equal(fileMode, 0o600);
  } finally {
    if (originalConfigDir === undefined) {
      delete process.env.WISBURG_CONFIG_DIR;
    } else {
      process.env.WISBURG_CONFIG_DIR = originalConfigDir;
    }
    await rm(dir, { recursive: true, force: true });
  }
});
