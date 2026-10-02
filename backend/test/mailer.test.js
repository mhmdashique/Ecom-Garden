import test from "node:test";
import assert from "node:assert/strict";
import {
  isConfiguredMailFrom,
  shouldUsePreviewTransport,
} from "../src/utils/mailer.js";

test("uses preview mode for the default Resend test sender", async () => {
  assert.equal(typeof shouldUsePreviewTransport, "function");
  assert.equal(shouldUsePreviewTransport("onboarding@resend.dev", true), true);
  assert.equal(isConfiguredMailFrom("onboarding@resend.dev"), false);
  assert.equal(isConfiguredMailFrom("hello@greennest.com"), true);
});
