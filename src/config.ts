import { chmod, mkdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { DEFAULT_BASE_URL } from "./api.js";

export type WisburgConfig = {
  apiKey?: string;
  baseUrl?: string;
};

export function getConfigDir(): string {
  return process.env.WISBURG_CONFIG_DIR ?? join(homedir(), ".config", "wisburg");
}

export function getConfigPath(): string {
  return join(getConfigDir(), "config.json");
}

export async function loadConfig(): Promise<WisburgConfig> {
  try {
    const raw = await readFile(getConfigPath(), "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error("config root must be an object");
    }
    return parsed as WisburgConfig;
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return {};
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid config file: ${getConfigPath()}`);
    }
    throw error;
  }
}

export async function saveConfig(config: WisburgConfig): Promise<void> {
  await mkdir(getConfigDir(), { recursive: true });
  await writeFile(getConfigPath(), `${JSON.stringify(config, null, 2)}\n`, "utf8");
  await chmod(getConfigPath(), 0o600);
}

export async function resolveApiKey(cliApiKey?: string): Promise<string | undefined> {
  if (cliApiKey) {
    return cliApiKey;
  }
  if (process.env.WISBURG_API_KEY) {
    return process.env.WISBURG_API_KEY;
  }
  return (await loadConfig()).apiKey;
}

export async function resolveBaseUrl(cliBaseUrl?: string): Promise<string> {
  if (cliBaseUrl) {
    return cliBaseUrl;
  }
  if (process.env.WISBURG_BASE_URL) {
    return process.env.WISBURG_BASE_URL;
  }
  return (await loadConfig()).baseUrl ?? DEFAULT_BASE_URL;
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
