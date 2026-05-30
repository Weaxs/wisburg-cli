import assert from "node:assert/strict";
import { createServer } from "node:http";
import { once } from "node:events";
import { spawn } from "node:child_process";
import test from "node:test";

test("real CLI binary calls a list endpoint with auth and query params", async () => {
  const requests = [];
  const server = createServer((req, res) => {
    requests.push({
      method: req.method,
      url: req.url,
      authorization: req.headers.authorization
    });
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ code: 200, data: { items: [{ id: 1, title: "ok" }] } }));
  });

  await listen(server);
  const baseUrl = serverBaseUrl(server);

  try {
    const result = await runCli(
      ["reports", "list", "--first", "1", "--query", "macro"],
      {
        WISBURG_API_KEY: "test-key",
        WISBURG_BASE_URL: baseUrl
      }
    );

    assert.equal(result.code, 0);
    assert.deepEqual(JSON.parse(result.stdout), { code: 200, data: { items: [{ id: 1, title: "ok" }] } });
    assert.deepEqual(requests, [
      {
        method: "GET",
        url: "/api/reports?first=1&query=macro",
        authorization: "Bearer test-key"
      }
    ]);
  } finally {
    server.close();
  }
});

test("real CLI binary calls a detail endpoint", async () => {
  const requests = [];
  const server = createServer((req, res) => {
    requests.push({ method: req.method, url: req.url });
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ code: 200, data: { id: 123 } }));
  });

  await listen(server);

  try {
    const result = await runCli(["am-reports", "get", "123"], {
      WISBURG_API_KEY: "test-key",
      WISBURG_BASE_URL: serverBaseUrl(server)
    });

    assert.equal(result.code, 0);
    assert.deepEqual(JSON.parse(result.stdout), { code: 200, data: { id: 123 } });
    assert.deepEqual(requests, [{ method: "GET", url: "/api/am-reports/123" }]);
  } finally {
    server.close();
  }
});

test("real CLI binary fails clearly when API key is missing", async () => {
  const result = await runCli(["feed", "list"], {
    WISBURG_API_KEY: "",
    WISBURG_CONFIG_DIR: "/tmp/wisburg-cli-test-missing-config"
  });

  assert.equal(result.code, 1);
  assert.match(result.stderr, /Missing API key/);
});

async function listen(server) {
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
}

function serverBaseUrl(server) {
  const address = server.address();
  assert(address && typeof address === "object");
  return `http://127.0.0.1:${address.port}`;
}

function runCli(args, envOverrides = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, ["dist/cli.js", ...args], {
      cwd: process.cwd(),
      env: {
        ...process.env,
        ...envOverrides
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
