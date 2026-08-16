import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  exchangeGitHubCode,
  getGitHubUser,
  saveGitHubAuthorization,
} from "@/lib/auth/github";
import { setAuthSession } from "@/lib/auth/session";

function safeReturnTo(value: string | undefined): string {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/repositories";
}

function redirectWithResult(
  request: NextRequest,
  returnTo: string,
  value: string,
) {
  const target = new URL(returnTo, request.url);
  target.searchParams.set("auth", value);
  return NextResponse.redirect(target);
}

function statesMatch(expected: string, actual: string): boolean {
  const left = Buffer.from(expected);
  const right = Buffer.from(actual);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export async function GET(request: NextRequest) {
  const error = request.nextUrl.searchParams.get("error");
  const returnTo = safeReturnTo(
    request.cookies.get("github-oauth-return-to")?.value,
  );

  if (error) {
    return redirectWithResult(request, returnTo, "cancelled");
  }

  const state = request.nextUrl.searchParams.get("state");
  const code = request.nextUrl.searchParams.get("code");
  const expectedState = request.cookies.get("github-oauth-state")?.value;
  const verifier = request.cookies.get("github-oauth-verifier")?.value;

  if (
    !state ||
    !code ||
    !expectedState ||
    !verifier ||
    !statesMatch(expectedState, state)
  ) {
    return redirectWithResult(request, returnTo, "invalid_state");
  }

  try {
    const token = await exchangeGitHubCode({ code, verifier });
    const user = await getGitHubUser(token.access_token);
    const saved = await saveGitHubAuthorization({ token, user });

    await setAuthSession({
      userId: saved.userId,
      githubLogin: saved.githubLogin,
      avatarUrl: saved.avatarUrl,
    });

    const response = NextResponse.redirect(new URL(returnTo, request.url));
    response.cookies.delete("github-oauth-state");
    response.cookies.delete("github-oauth-verifier");
    response.cookies.delete("github-oauth-return-to");
    return response;
  } catch (callbackError) {
    console.error("GitHub authorization callback failed", callbackError);
    return redirectWithResult(request, returnTo, "failed");
  }
}
