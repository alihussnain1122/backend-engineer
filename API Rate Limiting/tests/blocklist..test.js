import test from "node:test";
import assert from "node:assert/strict";
import RedisMock from "ioredis-mock";
import {
  isBlocked,
  blockClient,
  recordViolation,
} from "../src/services/blocklistService.js";

test("isBlocked returns false for a fresh client", async () => {
  const client = new RedisMock();
  const blocked = await isBlocked(client, "1.1.1.1");
  assert.equal(blocked, false);
});

test("blockClient sets the client as blocked", async () => {
  const client = new RedisMock();
  await blockClient("2.2.2.2", "manual", undefined, client);
  const blocked = await isBlocked(client, "2.2.2.2");
  assert.equal(blocked, true);
});

test("recordViolation increments count and does not block below threshold", async () => {
  const client = new RedisMock();
  const count = await recordViolation(client, "3.3.3.3");

  assert.equal(count, 1);
  const blocked = await isBlocked(client, "3.3.3.3");
  assert.equal(blocked, false);
});

test("recordViolation blocks client after threshold is reached", async () => {
  const client = new RedisMock();
  const clientId = "4.4.4.4";

  // constants.js default VIOLATION_THRESHOLD = 5
  let lastCount;
  for (let i = 0; i < 5; i++) {
    lastCount = await recordViolation(client, clientId);
  }

  assert.equal(lastCount, 5);
  const blocked = await isBlocked(client, clientId);
  assert.equal(blocked, true);
});

test("violations for different clients are independent", async () => {
  const client = new RedisMock();

  await recordViolation(client, "5.5.5.5");
  await recordViolation(client, "5.5.5.5");
  const countB = await recordViolation(client, "6.6.6.6");

  assert.equal(countB, 1); // client B ka apna alag counter
});