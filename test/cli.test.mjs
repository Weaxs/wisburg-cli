import assert from "node:assert/strict";
import test from "node:test";
import { resources } from "../dist/api.js";
import { createProgram } from "../dist/cli.js";

const expectedResources = [
  { name: "reports", path: "/api/reports", hasDetail: true },
  { name: "archives", path: "/api/archives", hasDetail: true },
  { name: "company-reports", path: "/api/company-reports", hasDetail: true },
  { name: "earningscalls", path: "/api/earningscalls", hasDetail: true },
  { name: "articles", path: "/api/articles", hasDetail: true },
  { name: "market-daily", path: "/api/market-daily", hasDetail: false },
  { name: "feed", path: "/api/feed", hasDetail: false },
  { name: "images", path: "/api/images", hasDetail: false },
  { name: "am-reports", path: "/api/am-reports", hasDetail: true },
];

test("resource registry matches all documented Wisburg APIs", () => {
  assert.deepEqual(
    resources.map(({ name, path, hasDetail }) => ({ name, path, hasDetail })),
    expectedResources,
  );
});

test("all documented list commands call their API paths", async () => {
  for (const resource of expectedResources) {
    const calls = [];
    const restoreLog = silenceConsoleLog();
    const program = createProgram(() => ({
      get: async (path, params) => {
        calls.push(["GET", path, params]);
        return { payload: { ok: true }, raw: '{"ok":true}' };
      },
      request: async () => {
        throw new Error("unexpected raw request");
      },
    }));

    process.env.WISBURG_API_KEY = "test-key";
    try {
      await program.parseAsync(["node", "wisburg", resource.name, "list", "--first", "10", "--query", "macro"]);
    } finally {
      restoreLog();
    }

    assert.deepEqual(calls, [
      ["GET", resource.path, { first: 10, after: undefined, query: "macro", startTime: undefined, endTime: undefined }],
    ]);
  }
});

test("all documented detail commands call their API paths", async () => {
  for (const resource of expectedResources.filter((item) => item.hasDetail)) {
    const calls = [];
    const restoreLog = silenceConsoleLog();
    const program = createProgram(() => ({
      get: async (path, params) => {
        calls.push(["GET", path, params]);
        return { payload: { ok: true }, raw: '{"ok":true}' };
      },
      request: async () => {
        throw new Error("unexpected raw request");
      },
    }));

    process.env.WISBURG_API_KEY = "test-key";
    try {
      await program.parseAsync(["node", "wisburg", resource.name, "get", "123"]);
    } finally {
      restoreLog();
    }

    assert.deepEqual(calls, [["GET", `${resource.path}/123`, undefined]]);
  }
});

test("reports list builds expected request", async () => {
  const calls = [];
  const restoreLog = silenceConsoleLog();
  const program = createProgram(() => ({
    get: async (path, params) => {
      calls.push(["GET", path, params]);
      return { payload: { ok: true }, raw: '{"ok":true}' };
    },
    request: async () => {
      throw new Error("unexpected raw request");
    },
  }));

  process.env.WISBURG_API_KEY = "test-key";
  try {
    await program.parseAsync(["node", "wisburg", "reports", "list", "--first", "10", "--query", "macro"]);
  } finally {
    restoreLog();
  }

  assert.deepEqual(calls, [
    ["GET", "/api/reports", { first: 10, after: undefined, query: "macro", startTime: undefined, endTime: undefined }],
  ]);
});

test("articles get builds expected request", async () => {
  const calls = [];
  const restoreLog = silenceConsoleLog();
  const program = createProgram(() => ({
    get: async (path, params) => {
      calls.push(["GET", path, params]);
      return { payload: { ok: true }, raw: '{"ok":true}' };
    },
    request: async () => {
      throw new Error("unexpected raw request");
    },
  }));

  process.env.WISBURG_API_KEY = "test-key";
  try {
    await program.parseAsync(["node", "wisburg", "articles", "get", "789"]);
  } finally {
    restoreLog();
  }

  assert.deepEqual(calls, [["GET", "/api/articles/789", undefined]]);
});

test("raw request parses query and json body", async () => {
  const calls = [];
  const restoreLog = silenceConsoleLog();
  const program = createProgram(() => ({
    get: async () => {
      throw new Error("unexpected get");
    },
    request: async (method, path, options) => {
      calls.push([method, path, options]);
      return { payload: { ok: true }, raw: '{"ok":true}' };
    },
  }));

  process.env.WISBURG_API_KEY = "test-key";
  try {
    await program.parseAsync([
      "node",
      "wisburg",
      "request",
      "POST",
      "/api/example",
      "--query",
      "a=1",
      "--json",
      '{"b":2}',
    ]);
  } finally {
    restoreLog();
  }

  assert.deepEqual(calls, [["POST", "/api/example", { params: { a: "1" }, body: { b: 2 } }]]);
});

function silenceConsoleLog() {
  const original = console.log;
  console.log = () => {};
  return () => {
    console.log = original;
  };
}
