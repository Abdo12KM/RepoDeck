import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  getValidGitHubAccessToken,
  listUserInstallations,
  saveInstallation,
} from "@/lib/auth/github";
import { getAuthSession } from "@/lib/auth/session";

function statesMatch(expected: string, actual: string): boolean {
  const left = Buffer.from(expected);
  const right = Buffer.from(actual);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

function resultRedirect(request: NextRequest, result: string) {
  return NextResponse.redirect(
    new URL(`/repositories?connect=${encodeURIComponent(result)}`, request.url),
  );
}

export async function GET(request: NextRequest) {
  const session = await getAuthSession();
  if (!session) return resultRedirect(request, "sign-in-required");

  const installationId = Number(
    request.nextUrl.searchParams.get("installation_id"),
  );
  const state = request.nextUrl.searchParams.get("state");
  const expectedState = request.cookies.get("github-install-state")?.value;

  if (
    !Number.isSafeInteger(installationId) ||
    installationId <= 0 ||
    !state ||
    !expectedState ||
    !statesMatch(expectedState, state)
  ) {
    return resultRedirect(request, "invalid-state");
  }

  try {
    const accessToken = await getValidGitHubAccessToken(session.userId);
    const installations = await listUserInstallations(accessToken);
    const installation = installations.find(
      (item) => item.id === installationId,
    );

    if (!installation) {
      return resultRedirect(request, "pending-approval");
    }

    await saveInstallation({
      installationId: installation.id,
      userId: session.userId,
      accountId: installation.account.id,
      accountLogin: installation.account.login,
      accountType: installation.account.type,
      repositorySelection: installation.repository_selection,
      suspended: Boolean(installation.suspended_at),
    });

    const response = resultRedirect(request, "success");
    response.cookies.delete("github-install-state");
    return response;
  } catch (error) {
    console.error("GitHub installation callback failed", error);
    return resultRedirect(request, "failed");
  }
}
