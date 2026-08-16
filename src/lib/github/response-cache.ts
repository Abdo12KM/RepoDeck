import type { NextResponse } from "next/server";

export function applyGitHubResponseCache<T extends NextResponse>(
  response: T,
  isPublic: boolean,
): T {
  response.headers.set(
    "Cache-Control",
    isPublic
      ? "public, max-age=0, s-maxage=60, stale-while-revalidate=300"
      : "private, no-store",
  );
  return response;
}
