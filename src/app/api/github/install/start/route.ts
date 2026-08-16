import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
import { createOAuthState } from "@/lib/auth/github";
import { getAuthSession } from "@/lib/auth/session";

export async function GET(request: NextRequest) {
  const session = await getAuthSession();
  if (!session) {
    return NextResponse.redirect(
      new URL(
        `/api/auth/github/start?returnTo=${encodeURIComponent("/repositories?connect=1")}`,
        request.url,
      ),
    );
  }

  const state = createOAuthState();
  const installUrl = new URL(
    `https://github.com/apps/${env.GITHUB_APP_SLUG}/installations/new`,
  );
  installUrl.searchParams.set("state", state);

  const response = NextResponse.redirect(installUrl);
  response.cookies.set("github-install-state", state, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/github/install",
    maxAge: 10 * 60,
  });
  return response;
}
