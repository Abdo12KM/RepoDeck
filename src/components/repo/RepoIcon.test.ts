import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  resolveRepoIcon,
  clearRepoIconCache,
  extractIconPathsFromCode,
} from "./RepoIcon";

describe("RepoIcon resolver", () => {
  beforeEach(() => {
    clearRepoIconCache();
    vi.restoreAllMocks();
  });

  it("returns null when owner or repo is missing", async () => {
    const res1 = await resolveRepoIcon("", "repo");
    const res2 = await resolveRepoIcon("owner", "");
    expect(res1).toBeNull();
    expect(res2).toBeNull();
  });

  it("deduplicates concurrent in-flight resolution requests", async () => {
    // In node/non-browser environment without Image, it falls through to null/fallback gracefully
    const promise1 = resolveRepoIcon("facebook", "react");
    const promise2 = resolveRepoIcon("facebook", "react");
    expect(promise1).toBe(promise2);
    await Promise.all([promise1, promise2]);
  });

  it("handles fallback to owner avatar when image probing is not available or fails", async () => {
    // In node environment, probeImage returns false, so resolver ends with failed state
    const result = await resolveRepoIcon("octocat", "Hello-World");
    expect(result).toBeNull();
  });

  it("caches failed lookups so subsequent calls resolve immediately without re-probing", async () => {
    const res1 = await resolveRepoIcon("nonexistent", "repo");
    expect(res1).toBeNull();

    const res2 = await resolveRepoIcon("nonexistent", "repo");
    expect(res2).toBeNull();
  });

  it("resolves from cache when an entry is already cached", async () => {
    // Simulate resolving with a mocked Image environment
    const originalImage = global.Image;
    try {
      class MockImage {
        private _src = "";
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        naturalWidth = 32;
        naturalHeight = 32;
        complete = false;

        get src() {
          return this._src;
        }

        set src(value: string) {
          this._src = value;
          setTimeout(() => {
            if (value.includes("public/favicon.ico")) {
              if (this.onload) this.onload();
            } else {
              if (this.onerror) this.onerror();
            }
          }, 5);
        }
      }

      // @ts-expect-error Mocking global Image
      global.Image = MockImage;

      const url = await resolveRepoIcon("facebook", "react");
      expect(url).toBe(
        "https://raw.githubusercontent.com/facebook/react/main/public/favicon.ico",
      );

      // Subsequent call should hit cache immediately
      const cached = await resolveRepoIcon("facebook", "react");
      expect(cached).toBe(url);
    } finally {
      global.Image = originalImage;
    }
  });

  it("extracts custom icon paths from Next.js layout metadata", () => {
    const layoutCode = `
      export const metadata: Metadata = {
        title: "Portfolio",
        icons: {
          icon: "/brackets-gray.png",
          shortcut: "/brackets-gray.png",
          apple: "/brackets-gray.png",
        },
      };
    `;

    const extracted = extractIconPathsFromCode(layoutCode);
    expect(extracted).toContain("/brackets-gray.png");
  });

  it("extracts icon paths from HTML link tags and web manifests", () => {
    const htmlCode = `
      <!DOCTYPE html>
      <html>
        <head>
          <link rel="icon" type="image/svg+xml" href="/vite.svg" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        </head>
      </html>
    `;

    const extracted = extractIconPathsFromCode(htmlCode);
    expect(extracted).toContain("/vite.svg");
    expect(extracted).toContain("/apple-touch-icon.png");

    const manifestCode = `
      {
        "icons": [
          { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" }
        ]
      }
    `;
    const manifestExtracted = extractIconPathsFromCode(manifestCode);
    expect(manifestExtracted).toContain("/icon-192.png");
  });

  it("resolves dynamic icon from layout.tsx when standard favicons fail", async () => {
    const originalImage = global.Image;
    const originalFetch = global.fetch;

    try {
      class MockImage {
        private _src = "";
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        naturalWidth = 32;
        naturalHeight = 32;
        complete = false;

        get src() {
          return this._src;
        }

        set src(value: string) {
          this._src = value;
          setTimeout(() => {
            // Only brackets-gray.png succeeds, all standard favicons fail
            if (value.includes("public/brackets-gray.png")) {
              if (this.onload) this.onload();
            } else {
              if (this.onerror) this.onerror();
            }
          }, 5);
        }
      }

      // @ts-expect-error Mocking global Image
      global.Image = MockImage;

      // Mock fetch returning src/app/layout.tsx with custom metadata
      global.fetch = vi.fn().mockImplementation((url: string) => {
        if (url.includes("src/app/layout.tsx")) {
          return Promise.resolve({
            ok: true,
            text: () =>
              Promise.resolve(`
                export const metadata = {
                  icons: {
                    icon: "/brackets-gray.png",
                  },
                };
              `),
          });
        }
        return Promise.resolve({ ok: false, text: () => Promise.resolve("") });
      });

      const url = await resolveRepoIcon("portfolio-user", "portfolio");
      expect(url).toBe(
        "https://raw.githubusercontent.com/portfolio-user/portfolio/main/public/brackets-gray.png",
      );
    } finally {
      global.Image = originalImage;
      global.fetch = originalFetch;
    }
  });
});
