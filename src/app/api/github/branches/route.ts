/**
 * GitHub Branches API Route
 * GET /api/github/branches - List branches for a repository
 */

import { NextRequest, NextResponse } from "next/server";
import { getGitHubRequestContext } from "@/lib/github/request-context";
import { listAllBranches } from "@/lib/github/repos";
import { getBranchesSchema } from "@/lib/github/schemas";
import { handleGitHubError } from "@/lib/github/errors";
import { applyGitHubResponseCache } from "@/lib/github/response-cache";
import {
  getCachedDemoTree,
  isRepoDeckDemo,
  REPODECK_DEMO_REPOSITORY,
} from "@/lib/github/demo-cache";

export async function GET(request: NextRequest) {
  try {
    const context = await getGitHubRequestContext();
    if (context.requiresReauthorization) {
      return NextResponse.json(
        {
          code: "REAUTH_REQUIRED",
          error: "Reconnect your GitHub account to continue.",
        },
        { status: 401 },
      );
    }

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const result = getBranchesSchema.safeParse(searchParams);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request parameters", details: result.error.format() },
        { status: 400 },
      );
    }

    const { owner, repo } = result.data;

    if (isRepoDeckDemo(owner, repo)) {
      const cachedTree = await getCachedDemoTree(
        owner,
        repo,
        REPODECK_DEMO_REPOSITORY.ref,
      );

      if (cachedTree) {
        return applyGitHubResponseCache(
          NextResponse.json({
            branches: [
              {
                name: REPODECK_DEMO_REPOSITORY.ref,
                protected: false,
                commit: { sha: cachedTree[0]?.sha ?? "" },
              },
            ],
            defaultBranch: REPODECK_DEMO_REPOSITORY.ref,
          }),
          true,
        );
      }
    }

    const { data: repoInfo } = await context.client.rest.repos.get({
      owner,
      repo,
    });
    const defaultBranch = repoInfo.default_branch;
    const branches = await listAllBranches(context.client, owner, repo);

    return applyGitHubResponseCache(
      NextResponse.json({ branches, defaultBranch }),
      !context.session,
    );
  } catch (error) {
    console.error("GitHub branches error:", error);
    return handleGitHubError(error);
  }
}
