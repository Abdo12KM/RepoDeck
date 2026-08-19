import { describe, expect, it } from "vitest";
import { resolveAuthStatus, type AuthResponse } from "./useAuth";

const authenticated: AuthResponse = {
  authenticated: true,
  user: { userId: "alice", githubLogin: "alice", avatarUrl: null },
};
const anonymous: AuthResponse = { authenticated: false, user: null };

describe("resolveAuthStatus", () => {
  it("treats missing session data plus a fetch error as unknown/error, not anonymous", () => {
    expect(resolveAuthStatus(undefined, new Error("network down"))).toBe(
      "error",
    );
  });

  it("only reports anonymous after a successful anonymous response", () => {
    expect(resolveAuthStatus(anonymous, undefined)).toBe("anonymous");
  });

  it("preserves a confirmed authenticated state during a background revalidation error", () => {
    expect(resolveAuthStatus(authenticated, new Error("temporary"))).toBe(
      "authenticated",
    );
  });

  it("does not trust stale anonymous data while the current revalidation is failing", () => {
    expect(resolveAuthStatus(anonymous, new Error("temporary"))).toBe("error");
  });
});
