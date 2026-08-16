import { NextRequest, NextResponse } from "next/server";
import { env } from "@/env";
import {
  createCodeChallenge,
  createCodeVerifier,
  createOAuthState,
} from "@/lib/auth/github";

function safeReturnTo(value: string | null): string {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/repositories";
}

export async function GET(request: NextRequest) {
  const state = createOAuthState();
  const verifier = createCodeVerifier();
  const challenge = await createCodeChallenge(verifier);
  const returnTo = safeReturnTo(request.nextUrl.searchParams.get("returnTo"));

  const authorizationUrl = new URL("https://github.com/login/oauth/authorize");
  authorizationUrl.searchParams.set("client_id", env.GITHUB_APP_CLIENT_ID);
  authorizationUrl.searchParams.set(
    "redirect_uri",
    env.GITHUB_APP_CALLBACK_URL,
  );
  authorizationUrl.searchParams.set("state", state);
  authorizationUrl.searchParams.set("code_challenge", challenge);
  authorizationUrl.searchParams.set("code_challenge_method", "S256");

  const response = NextResponse.redirect(authorizationUrl);
  const cookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/api/auth/github",
    maxAge: 10 * 60,
  };
  response.cookies.set("github-oauth-state", state, cookieOptions);
  response.cookies.set("github-oauth-verifier", verifier, cookieOptions);
  response.cookies.set("github-oauth-return-to", returnTo, cookieOptions);

  return response;
}
