/**
 * GitHub Error Handling Utilities
 * Consistent error responses for GitHub API errors
 */

import { NextResponse } from "next/server";

interface GitHubErrorResponse {
  status?: number;
  message?: string;
  response?: {
    headers?: Record<string, string | number | undefined>;
  };
}

function rateLimitDetails(error: GitHubErrorResponse) {
  const headers = error.response?.headers ?? {};
  const remaining = Number(headers["x-ratelimit-remaining"]);
  const reset = Number(headers["x-ratelimit-reset"]);
  const retryAfter = Number(headers["retry-after"]);
  const message = error.message?.toLowerCase() ?? "";
  const rateLimited =
    error.status === 429 ||
    (error.status === 403 &&
      (message.includes("rate limit") || remaining === 0 || retryAfter > 0));

  if (!rateLimited) return null;

  return {
    remaining: Number.isFinite(remaining) ? remaining : null,
    resetAt: Number.isFinite(reset) && reset > 0 ? reset : null,
    retryAfter:
      Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter : null,
  };
}

/**
 * Handle GitHub API errors with consistent responses
 */
export function handleGitHubError(error: unknown): NextResponse {
  const githubError = error as GitHubErrorResponse;
  const status = githubError?.status;
  const message = githubError?.message || "Unknown error";

  // Rate limit exceeded
  const rateLimit = rateLimitDetails(githubError);
  if (rateLimit) {
    const response = NextResponse.json(
      {
        code: "RATE_LIMITED",
        error:
          "GitHub is temporarily rate limiting requests. Please try again later.",
        ...rateLimit,
      },
      { status: 429 },
    );
    if (rateLimit.resetAt) {
      response.headers.set("X-RateLimit-Reset", String(rateLimit.resetAt));
    }
    if (rateLimit.retryAfter) {
      response.headers.set("Retry-After", String(rateLimit.retryAfter));
    }
    return response;
  }

  // Not found
  if (status === 404) {
    return NextResponse.json(
      { error: "Resource not found on GitHub" },
      { status: 404 },
    );
  }

  // Unauthorized (bad token)
  if (status === 401) {
    return NextResponse.json(
      { error: "GitHub token is invalid or expired" },
      { status: 401 },
    );
  }

  // Forbidden (missing scopes)
  if (status === 403) {
    return NextResponse.json(
      { error: "GitHub token lacks required permissions" },
      { status: 403 },
    );
  }

  // Generic server error - include the actual message
  return NextResponse.json(
    { error: `GitHub API error: ${message}` },
    { status: 502 },
  );
}

/**
 * Parse error message from caught error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
