// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generateTintedFavicon,
  updateFavicon,
  applyThemeFavicon,
} from "./favicon";
import { DEFAULT_THEME_SETTINGS } from "./config";

describe("Dynamic Favicon Tinting", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    vi.restoreAllMocks();
  });

  it("updateFavicon updates existing link tag or creates a new one", () => {
    updateFavicon("data:image/png;base64,mock1");
    let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    expect(link).not.toBeNull();
    expect(link?.href).toContain("data:image/png;base64,mock1");

    updateFavicon("data:image/png;base64,mock2");
    link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    expect(link?.href).toContain("data:image/png;base64,mock2");
  });

  it("generateTintedFavicon draws image, applies color blend, and returns data url", async () => {
    const originalImage = global.Image;
    // @ts-expect-error Mocking Image constructor
    global.Image = class {
      onload: (() => void) | null = null;
      onerror: ((err: unknown) => void) | null = null;
      complete = true;
      naturalWidth = 64;
      naturalHeight = 64;
      src = "";
      crossOrigin = "";
      constructor() {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 5);
      }
    };

    const mockCtx = {
      drawImage: vi.fn(),
      save: vi.fn(),
      restore: vi.fn(),
      fillRect: vi.fn(),
      globalAlpha: 1.0,
      globalCompositeOperation: "source-over",
      fillStyle: "#000",
    };

    const origCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation(
      (tagName: string) => {
        if (tagName === "canvas") {
          return {
            width: 64,
            height: 64,
            getContext: () => mockCtx,
            toDataURL: () => "data:image/png;base64,tinted_fav_test",
          } as unknown as HTMLCanvasElement;
        }
        return origCreateElement(tagName);
      },
    );

    const url = await generateTintedFavicon(
      "oklch(0.68 0.15 237)",
      "#3b82f6",
      "/test-favicon.png",
    );

    expect(url).toBe("data:image/png;base64,tinted_fav_test");
    expect(mockCtx.drawImage).toHaveBeenCalled();
    expect(mockCtx.fillRect).toHaveBeenCalled();

    global.Image = originalImage;
  });

  it("applyThemeFavicon resolves and applies favicon for theme settings", async () => {
    await applyThemeFavicon(
      {
        ...DEFAULT_THEME_SETTINGS,
        accentColor: "emerald",
      },
      "dark",
    );

    const link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
    expect(link).not.toBeNull();
    expect(link?.href).toBeDefined();
  });
});
