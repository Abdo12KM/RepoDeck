import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const worker = readFileSync(resolve(process.cwd(), "public/sw.js"), "utf8");
const offline = readFileSync(
  resolve(process.cwd(), "public/offline.html"),
  "utf8",
);

describe("RepoDeck service-worker policy", () => {
  it("keeps Cache Storage limited to the standalone offline fallback", () => {
    expect(worker).toContain('const OFFLINE_URL = "/offline.html"');
    expect(worker).toContain('request.mode !== "navigate"');
    expect(worker).not.toContain("cache.put(");
    expect(worker).not.toContain("/_next/");
    expect(worker).not.toContain("request.destination");
    expect(worker).toContain("const cache = await caches.open(OFFLINE_CACHE)");
    expect(worker).not.toContain("caches.match(OFFLINE_URL)");
  });

  it("does not force a new worker onto existing tabs", () => {
    expect(worker).not.toContain("skipWaiting");
    expect(worker).not.toContain("clients.claim");
  });

  it("uses a standalone fallback without Next.js runtime dependencies", () => {
    expect(offline).toContain("You’re offline");
    expect(offline).not.toContain("/_next/");
    expect(offline).not.toContain("<script");
    expect(offline).not.toContain("onclick=");
  });
});
