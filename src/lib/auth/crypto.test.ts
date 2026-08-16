import { describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret } from "./crypto";

describe("token encryption", () => {
  it("round-trips an OAuth secret", () => {
    const encrypted = encryptSecret("github-refresh-token");

    expect(encrypted).not.toContain("github-refresh-token");
    expect(decryptSecret(encrypted)).toBe("github-refresh-token");
  });

  it("rejects malformed ciphertext", () => {
    expect(() => decryptSecret("not-a-secret")).toThrow(
      "Invalid encrypted secret",
    );
  });
});
