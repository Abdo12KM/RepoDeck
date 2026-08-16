import { describe, expect, it } from "vitest";
import { handleGitHubError } from "./errors";

describe("GitHub error responses", () => {
  it("translates primary rate limits into a retryable response", async () => {
    const response = handleGitHubError({
      status: 403,
      message: "API rate limit exceeded",
      response: {
        headers: {
          "x-ratelimit-remaining": "0",
          "x-ratelimit-reset": "1900000000",
        },
      },
    });

    expect(response.status).toBe(429);
    expect(response.headers.get("X-RateLimit-Reset")).toBe("1900000000");
    await expect(response.json()).resolves.toMatchObject({
      code: "RATE_LIMITED",
      remaining: 0,
      resetAt: 1900000000,
    });
  });
});
