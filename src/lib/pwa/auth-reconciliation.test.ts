import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const manager = readFileSync(
  resolve(process.cwd(), "src/components/pwa/PwaManager.tsx"),
  "utf8",
);

describe("PWA auth reconciliation policy", () => {
  it("only destroys a browser subscription for a confirmed anonymous session", () => {
    const start = manager.indexOf("const reconcileSubscription");
    const end = manager.indexOf("useEffect(() =>", start);
    const reconcile = manager.slice(start, end);

    expect(reconcile).toContain('authStatus === "error"');
    expect(reconcile).toContain('authStatus === "anonymous"');
    expect(reconcile).toContain("browserSubscription.unsubscribe()");
    expect(reconcile).not.toContain("if (!authenticated)");
  });
});
