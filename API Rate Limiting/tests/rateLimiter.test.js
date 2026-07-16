import test from "node:test";
import assert from "node:assert/strict";
import { identifyClient } from "../src/middleware/identifyClient.js";

test("identifyClient prefers x-api-key", () => {
	const req = {
		headers: {
			"x-api-key": "abc123",
			"x-forwarded-for": "10.0.0.1",
		},
		ip: "127.0.0.1",
	};

	assert.equal(identifyClient(req), "api-key:abc123");
});

test("identifyClient falls back to forwarded ip", () => {
	const req = {
		headers: {
			"x-forwarded-for": "10.0.0.1, 10.0.0.2",
		},
		ip: "127.0.0.1",
	};

	assert.equal(identifyClient(req), "ip:10.0.0.1");
});
