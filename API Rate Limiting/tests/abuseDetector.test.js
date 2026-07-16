import test from "node:test";
import assert from "node:assert/strict";
import RedisMock from "ioredis-mock";
import { createAbuseDetector } from "../src/middleware/abuseDetector.js";
import { blockClient } from "../src/services/blocklistService.js";

function makeMockRes() {
  const res = {};
  res.statusCode = null;
  res.body = null;
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (data) => { res.body = data; return res; };
  return res;
}

test("allows request when client is not blocked", async () => {
  const client = new RedisMock();
  const detector = createAbuseDetector(client);

  const req = { ip: "1.1.1.1", headers: {} };
  const res = makeMockRes();
  let nextCalled = false;

  await detector(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
  assert.equal(res.statusCode, null);
});

test("rejects request with 403 when client is blocked", async () => {
  const client = new RedisMock();
  await blockClient(client, "ip:2.2.2.2");

  const detector = createAbuseDetector(client);
  const req = { ip: "2.2.2.2", headers: {} };
  const res = makeMockRes();
  let nextCalled = false;

  await detector(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
  assert.match(res.body.error, /blocked/i);
});

test("fails open when redis throws an error", async () => {
  const brokenClient = { exists: async () => { throw new Error("connection lost"); } };
  const detector = createAbuseDetector(brokenClient);

  const req = { ip: "3.3.3.3", headers: {} };
  const res = makeMockRes();
  let nextCalled = false;

  await detector(req, res, () => { nextCalled = true; });

  assert.equal(nextCalled, true);
});