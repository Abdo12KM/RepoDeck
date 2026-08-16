import { NextRequest, NextResponse } from "next/server";
import { getGitHubRequestContext } from "@/lib/github/request-context";
import {
  cacheRepoDeckSnapshot,
  getCachedDemoFile,
  getCachedDemoTree,
  REPODECK_DEMO_REPOSITORY,
} from "@/lib/github/demo-cache";

/**
 * Seed the fixed public RepoDeck demo into Postgres.
 * This endpoint intentionally requires a signed-in session because the seed
 * operation reads the entire repository rather than one visitor's file.
 */
export async function GET(request: NextRequest) {
  const context = await getGitHubRequestContext();

  if (context.requiresReauthorization) {
    return NextResponse.json(
      {
        code: "REAUTH_REQUIRED",
        error: "Reconnect your GitHub account to seed the demo cache.",
      },
      { status: 401 },
    );
  }

  if (!context.session) {
    return NextResponse.json(
      {
        code: "AUTH_REQUIRED",
        error: "Sign in before seeding the RepoDeck demo cache.",
      },
      { status: 401 },
    );
  }

  const ref = request.nextUrl.searchParams.get("ref") || "main";
  const forceRefresh = request.nextUrl.searchParams.get("force") === "1";

  if (!forceRefresh) {
    const [tree, readme] = await Promise.all([
      getCachedDemoTree(
        REPODECK_DEMO_REPOSITORY.owner,
        REPODECK_DEMO_REPOSITORY.repo,
        ref,
      ),
      getCachedDemoFile({
        owner: REPODECK_DEMO_REPOSITORY.owner,
        repo: REPODECK_DEMO_REPOSITORY.repo,
        ref,
        path: "README.md",
      }),
    ]);

    if (tree && readme) {
      return NextResponse.json({
        owner: REPODECK_DEMO_REPOSITORY.owner,
        repo: REPODECK_DEMO_REPOSITORY.repo,
        ref,
        treeEntries: tree.length,
        cachedFiles: "already-seeded",
        skippedFiles: 0,
        fromCache: true,
      });
    }
  }

  const snapshot = await cacheRepoDeckSnapshot(context.client, ref);

  return NextResponse.json({
    ...snapshot,
    cachedAt: new Date().toISOString(),
  });
}
