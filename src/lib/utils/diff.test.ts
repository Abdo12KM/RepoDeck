import { describe, expect, it } from "vitest";
import { getLanguageFromPath, getMimeTypeFromPath, isImageFile } from "./diff";

describe("file display utilities", () => {
  it("maps common source files to Shiki languages", () => {
    expect(getLanguageFromPath("src/components/Button.tsx")).toBe("tsx");
    expect(getLanguageFromPath("scripts/release.sh")).toBe("bash");
    expect(getLanguageFromPath("README.md")).toBe("markdown");
  });

  it("recognizes image files and returns their MIME types", () => {
    expect(isImageFile("public/logo.svg")).toBe(true);
    expect(isImageFile("src/app/page.tsx")).toBe(false);
    expect(getMimeTypeFromPath("public/logo.svg")).toBe("image/svg+xml");
  });
});
