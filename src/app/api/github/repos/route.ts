/**
 * GitHub Repos API Route
 * GET /api/github/repos - List all repositories (from cache or GitHub)
 */

import { NextResponse } from "next/server";
import { getGitHubRequestContext } from "@/lib/github/request-context";
import { listAllUserRepos } from "@/lib/github/repos";
import { handleGitHubError } from "@/lib/github/errors";

export async function GET() {
  try {
    const context = await getGitHubRequestContext();
    if (!context.session) {
      return NextResponse.json(
        {
          code: "AUTH_REQUIRED",
          error: "Sign in with GitHub to browse your repositories.",
        },
        { status: 401 },
      );
    }
    if (context.requiresReauthorization) {
      return NextResponse.json(
        {
          code: "REAUTH_REQUIRED",
          error: "Reconnect your GitHub account to continue.",
        },
        { status: 401 },
      );
    }

    const repos = await listAllUserRepos(context.client);

    return NextResponse.json({
      repos,
      lastRefreshed: Date.now(),
      fromCache: false,
    });
  } catch (error) {
    console.error("GitHub repos error:", error);
    return handleGitHubError(error);
  }
}
