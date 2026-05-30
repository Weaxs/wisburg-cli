import assert from "node:assert/strict";
import test from "node:test";
import { buildUrl } from "../dist/client.js";

test("buildUrl filters empty params", () => {
  assert.equal(
    buildUrl("https://api-omen.wisburg.com/", "/api/reports", { first: 10, after: "", query: undefined }),
    "https://api-omen.wisburg.com/api/reports?first=10",
  );
});

test("buildUrl accepts path without leading slash", () => {
  assert.equal(buildUrl("https://example.com", "api/reports"), "https://example.com/api/reports");
});

test("buildUrl preserves base URL path prefixes", () => {
  assert.equal(buildUrl("https://example.com/v1", "/api/reports"), "https://example.com/v1/api/reports");
});
