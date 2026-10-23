const test = require("node:test");
const assert = require("node:assert/strict");
const { getMessage } = require("../app");

test("returns the expected application message", () => {
  assert.equal(
    getMessage(),
    "WONBILLS CI pipeline is working"
  );
});