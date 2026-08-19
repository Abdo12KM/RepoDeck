import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const actions = readFileSync(
  resolve(process.cwd(), "src/app/actions.ts"),
  "utf8",
);
const schema = readFileSync(
  resolve(process.cwd(), "src/lib/db/schema.ts"),
  "utf8",
);

describe("push maintenance policy", () => {
  it("uses the shared PostgreSQL clock for rate-limit windows and cleanup", () => {
    expect(actions).toContain("date_trunc('minute', now())");
    expect(actions).toContain("now() - interval '24 hours'");
  });

  it("prunes clearly stale subscriptions before enforcing the device cap", () => {
    expect(actions).toContain("pruneStalePushSubscriptions(session.userId)");
    expect(actions).toContain("now() - interval '1 year'");
  });

  it("refreshes last-seen time when an owned browser checks its subscription", () => {
    expect(actions).toContain("const ownedByCurrentUser");
    expect(actions).toContain("lastSeenAt: sql<Date>`now()`");
  });

  it("indexes the retention and per-user stale-subscription cleanup paths", () => {
    expect(schema).toContain("push_rate_limits_window_start_idx");
    expect(schema).toContain("push_subscriptions_user_last_seen_idx");
  });
});
