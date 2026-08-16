/**
 * GitHub Tree API Route
 * GET /api/github/tree - Get file tree for a repository
 */

import { NextRequest, NextResponse } from "next/server";
import { getGitHubRequestContext } from "@/lib/github/request-context";
import { getFileTree } from "@/lib/github/files";
import { getTreeSchema } from "@/lib/github/schemas";
import { handleGitHubError } from "@/lib/github/errors";
import { applyGitHubResponseCache } from "@/lib/github/response-cache";
import {
  cacheDemoTree,
  getCachedDemoTree,
  isRepoDeckDemo,
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
    const result = getTreeSchema.safeParse(searchParams);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request parameters", details: result.error.format() },
        { status: 400 },
      );
    }

    const { owner, repo, branch } = result.data;

    const demoRepository = isRepoDeckDemo(owner, repo);
    const cachedTree = demoRepository
      ? await getCachedDemoTree(owner, repo, branch)
      : null;
    const tree =
      cachedTree ?? (await getFileTree(context.client, owner, repo, branch));

    if (demoRepository && !cachedTree) {
      await cacheDemoTree({ owner, repo, ref: branch, tree });
    }

    return applyGitHubResponseCache(
      NextResponse.json({ tree }),
      !context.session,
    );
  } catch (error) {
    console.error("GitHub tree error:", error);
    return handleGitHubError(error);
  }
}
