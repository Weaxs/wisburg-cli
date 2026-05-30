#!/usr/bin/env node
import { Command } from "commander";
import { resources, type Resource } from "./api.js";
import { WisburgClient, WisburgError, type RequestParams } from "./client.js";
import { loadConfig, resolveApiKey, resolveBaseUrl, saveConfig } from "./config.js";

export type ClientFactory = (options: {
  apiKey: string;
  baseUrl: string;
  timeoutMs: number;
}) => Pick<WisburgClient, "get" | "request">;

export function createProgram(clientFactory: ClientFactory = options => new WisburgClient(options)): Command {
  const program = new Command();

  program
    .name("wisburg")
    .description("Command line client for Wisburg Open API.")
    .option("--api-key <key>", "Wisburg API key. Defaults to WISBURG_API_KEY or local config.")
    .option("--base-url <url>", "Wisburg API base URL. Defaults to WISBURG_BASE_URL or https://api-omen.wisburg.com.")
    .option("--timeout <seconds>", "HTTP timeout in seconds.", parseFloat, 30)
    .option("--raw", "Print raw response text instead of formatted JSON.");

  addConfigCommands(program);
  addRawRequestCommand(program, clientFactory);

  for (const resource of resources) {
    addResourceCommand(program, resource, clientFactory);
  }

  return program;
}

function addConfigCommands(program: Command): void {
  const config = program.command("config").description("Manage local configuration.");

  config
    .command("set-api-key")
    .description("Store an API key in local config.")
    .argument("<apiKey>", "API key to store.")
    .action(async apiKey => {
      const current = await loadConfig();
      await saveConfig({ ...current, apiKey });
      console.log("Saved API key.");
    });

  config
    .command("set-base-url")
    .description("Store a custom base URL in local config.")
    .argument("<baseUrl>", "Base URL to store.")
    .action(async baseUrl => {
      const current = await loadConfig();
      await saveConfig({ ...current, baseUrl });
      console.log("Saved base URL.");
    });

  config
    .command("show")
    .description("Show local config with the API key redacted.")
    .action(async () => {
      const current = await loadConfig();
      console.log(JSON.stringify({ ...current, apiKey: current.apiKey ? redact(current.apiKey) : undefined }, null, 2));
    });
}

function addRawRequestCommand(program: Command, clientFactory: ClientFactory): void {
  program
    .command("request")
    .description("Send a raw request to a Wisburg API path.")
    .argument("<method>", "HTTP method, for example GET.")
    .argument("<path>", "API path, for example /api/reports.")
    .option("--query <pair>", "Query parameter as KEY=VALUE. Repeatable.", collect, [])
    .option("--json <body>", "JSON request body.")
    .action(async (method, path, options) => {
      const client = await makeClient(program, clientFactory);
      const body = options.json === undefined ? undefined : JSON.parse(options.json);
      const result = await client.request(method, path, { params: parseQueryPairs(options.query), body });
      printResponse(result, Boolean(program.opts().raw));
    });
}

function addResourceCommand(program: Command, resource: Resource, clientFactory: ClientFactory): void {
  const command = program.command(resource.name).description(resource.description);

  command
    .command("list")
    .description(`List ${resource.description}.`)
    .option("--first <number>", "Page size, maximum 100 according to the API docs.", parseInteger)
    .option("--after <cursor>", "Pagination cursor.")
    .option("--query <keyword>", "Search keyword.")
    .option("--start-time <time>", "Start time, timestamp or ISO format.")
    .option("--end-time <time>", "End time, timestamp or ISO format.")
    .action(async options => {
      const client = await makeClient(program, clientFactory);
      const params = toListParams(options);
      const result = await client.get(resource.path, params);
      printResponse(result, Boolean(program.opts().raw));
    });

  if (resource.hasDetail) {
    command
      .command("get")
      .description(`Get one ${resource.description} item by ID.`)
      .argument("<id>", "Resource ID.")
      .action(async id => {
        const client = await makeClient(program, clientFactory);
        const result = await client.get(`${resource.path}/${id}`);
        printResponse(result, Boolean(program.opts().raw));
      });
  }
}

async function makeClient(program: Command, clientFactory: ClientFactory): Promise<Pick<WisburgClient, "get" | "request">> {
  const globalOptions = program.opts();
  const apiKey = await resolveApiKey(globalOptions.apiKey);

  if (!apiKey) {
    throw new Error("Missing API key. Set WISBURG_API_KEY or run `wisburg config set-api-key <key>`.");
  }

  return clientFactory({
    apiKey,
    baseUrl: await resolveBaseUrl(globalOptions.baseUrl),
    timeoutMs: Number(globalOptions.timeout) * 1000
  });
}

function toListParams(options: Record<string, unknown>): RequestParams {
  return {
    first: options.first as number | undefined,
    after: options.after as string | undefined,
    query: options.query as string | undefined,
    startTime: options.startTime as string | undefined,
    endTime: options.endTime as string | undefined
  };
}

function parseQueryPairs(pairs: string[]): RequestParams {
  const params: RequestParams = {};
  for (const pair of pairs) {
    const separatorIndex = pair.indexOf("=");
    if (separatorIndex <= 0) {
      throw new Error(`Invalid query parameter ${pair}; expected KEY=VALUE.`);
    }
    params[pair.slice(0, separatorIndex)] = pair.slice(separatorIndex + 1);
  }
  return params;
}

function printResponse(result: { payload: unknown; raw: string }, raw: boolean): void {
  if (raw) {
    console.log(result.raw);
    return;
  }
  if (typeof result.payload === "string") {
    console.log(result.payload);
    return;
  }
  console.log(JSON.stringify(result.payload, null, 2));
}

function collect(value: string, previous: string[]): string[] {
  previous.push(value);
  return previous;
}

function parseInteger(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid number: ${value}`);
  }
  return parsed;
}

function redact(value: string): string {
  if (value.length <= 8) {
    return "*".repeat(value.length);
  }
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

export async function run(argv = process.argv): Promise<void> {
  try {
    await createProgram().parseAsync(argv);
  } catch (error) {
    if (error instanceof WisburgError || error instanceof Error) {
      console.error(`error: ${error.message}`);
      process.exitCode = 1;
      return;
    }
    console.error(`error: ${String(error)}`);
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  await run();
}
