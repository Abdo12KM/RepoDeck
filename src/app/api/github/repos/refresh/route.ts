/**
 * GitHub Repos Refresh API Route
 * POST /api/github/repos/refresh - Force refresh cached repositories
 */

import { NextResponse } from "next/server";
import { getGitHubRequestContext } from "@/lib/github/request-context";
import { listAllUserRepos } from "@/lib/github/repos";
import { handleGitHubError } from "@/lib/github/errors";

export async function POST() {
  try {
    const context = await getGitHubRequestContext();
    if (!context.session || context.requiresReauthorization) {
      return NextResponse.json(
        {
          code: "AUTH_REQUIRED",
          error: "Reconnect your GitHub account to continue.",
        },
        { status: 401 },
      );
    }

    const repos = await listAllUserRepos(context.client);

    return NextResponse.json({
      repos,
      lastRefreshed: Date.now(),
      refreshed: true,
    });
  } catch (error) {
    console.error("GitHub repos refresh error:", error);
    return handleGitHubError(error);
  }
}
