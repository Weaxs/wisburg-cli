import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import test from "node:test";
import { resources } from "../../dist/api.js";

const apiKey = process.env.WISBURG_API_KEY;
const liveTest = apiKey ? test : test.skip;

liveTest("real Wisburg API endpoints work through the CLI", async t => {
  for (const resource of resources) {
    await t.test(`${resource.name} list`, async () => {
      const result = await runCli([resource.name, "list", "--first", "1"]);
      assert.equal(result.code, 0, result.stderr);

      const payload = parseJsonOutput(result.stdout);
      assertResponseEnvelope(payload);
      assert(payload.data && typeof payload.data === "object", "response data should be an object");
      assert(Array.isArray(payload.data.items), "response data.items should be an array");
    });

    if (resource.hasDetail) {
      await t.test(`${resource.name} get`, async t => {
        const listResult = await runCli([resource.name, "list", "--first", "1"]);
        assert.equal(listResult.code, 0, listResult.stderr);

        const listPayload = parseJsonOutput(listResult.stdout);
        const firstItem = listPayload.data?.items?.[0];
        const id = firstItem?.id;

        if (id === undefined || id === null) {
          t.diagnostic(`No item id returned by ${resource.name} list; skipping detail smoke check.`);
          return;
        }

        const detailResult = await runCli([resource.name, "get", String(id)]);
        assert.equal(detailResult.code, 0, detailResult.stderr);

        const detailPayload = parseJsonOutput(detailResult.stdout);
        assertResponseEnvelope(detailPayload);
        assert(detailPayload.data && typeof detailPayload.data === "object", "detail response data should be an object");
      });
    }
  }
});

function assertResponseEnvelope(payload) {
  assert.equal(typeof payload, "object", "response should be JSON object");
  assert.equal(payload.code, 200, `expected business code 200, got ${payload.code}`);
  assert.equal(payload.status, 0, `expected status 0, got ${payload.status}`);
}

function parseJsonOutput(stdout) {
  try {
    return JSON.parse(stdout);
  } catch (error) {
    throw new Error(`CLI did not print valid JSON: ${stdout}\n${error}`);
  }
}

function runCli(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["dist/cli.js", ...args], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        WISBURG_API_KEY: apiKey,
        WISBURG_CONFIG_DIR: "/tmp/wisburg-cli-integration-config"
      },
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", chunk => {
      stdout += chunk;
    });
    child.stderr.on("data", chunk => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", code => {
      resolve({ code, stdout, stderr });
    });
  });
}
