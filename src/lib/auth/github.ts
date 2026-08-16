import { and, eq } from "drizzle-orm";
import { Octokit } from "@octokit/rest";
import crypto from "node:crypto";
import { env } from "@/env";
import { db } from "@/lib/db";
import {
  githubAccounts,
  githubInstallations,
  users,
  type GitHubAccount,
} from "@/lib/db/schema";
import { decryptSecret, encryptSecret } from "./crypto";

const REFRESH_BUFFER_MS = 5 * 60 * 1000;

export class GitHubReauthorizationRequiredError extends Error {
  constructor() {
    super("GitHub authorization has expired. Please sign in again.");
    this.name = "GitHubReauthorizationRequiredError";
  }
}

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
}

interface GitHubTokenResponse {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  refresh_token_expires_in?: number;
  error?: string;
  error_description?: string;
}

async function githubJson<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });

  const body = (await response.json().catch(() => null)) as T & {
    message?: string;
  };
  if (!response.ok) {
    throw new Error(
      body?.message || `GitHub request failed (${response.status})`,
    );
  }

  return body;
}

export function createOAuthState(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function createCodeVerifier(): string {
  return crypto.randomBytes(48).toString("base64url");
}

export async function createCodeChallenge(verifier: string): Promise<string> {
  return crypto.createHash("sha256").update(verifier).digest("base64url");
}

export async function exchangeGitHubCode(input: {
  code: string;
  verifier: string;
}): Promise<
  Required<Pick<GitHubTokenResponse, "access_token">> & GitHubTokenResponse
> {
  const result = await githubJson<GitHubTokenResponse>(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      body: JSON.stringify({
        client_id: env.GITHUB_APP_CLIENT_ID,
        client_secret: env.GITHUB_APP_CLIENT_SECRET,
        code: input.code,
        redirect_uri: env.GITHUB_APP_CALLBACK_URL,
        code_verifier: input.verifier,
      }),
    },
  );

  if (!result.access_token) {
    throw new Error(
      result.error_description || result.error || "GitHub authorization failed",
    );
  }

  return result as Required<Pick<GitHubTokenResponse, "access_token">> &
    GitHubTokenResponse;
}

export async function refreshGitHubToken(
  refreshToken: string,
): Promise<
  Required<Pick<GitHubTokenResponse, "access_token">> & GitHubTokenResponse
> {
  const result = await githubJson<GitHubTokenResponse>(
    "https://github.com/login/oauth/access_token",
    {
      method: "POST",
      body: JSON.stringify({
        client_id: env.GITHUB_APP_CLIENT_ID,
        client_secret: env.GITHUB_APP_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
    },
  );

  if (!result.access_token) {
    throw new GitHubReauthorizationRequiredError();
  }

  return result as Required<Pick<GitHubTokenResponse, "access_token">> &
    GitHubTokenResponse;
}

export async function getGitHubUser(accessToken: string): Promise<GitHubUser> {
  return githubJson<GitHubUser>("https://api.github.com/user", {
    method: "GET",
    headers: { authorization: `Bearer ${accessToken}` },
  });
}

function expiresAt(seconds: number | undefined): Date | null {
  return seconds ? new Date(Date.now() + seconds * 1000) : null;
}

export async function saveGitHubAuthorization(input: {
  token: GitHubTokenResponse;
  user: GitHubUser;
}): Promise<{ userId: string; githubLogin: string; avatarUrl: string }> {
  const existingUser = await db.query.users.findFirst({
    where: eq(users.githubId, input.user.id),
  });
  const userId = existingUser?.id ?? crypto.randomUUID();

  await db
    .insert(users)
    .values({
      id: userId,
      githubId: input.user.id,
      githubLogin: input.user.login,
      displayName: input.user.name,
      avatarUrl: input.user.avatar_url,
    })
    .onConflictDoUpdate({
      target: users.githubId,
      set: {
        githubLogin: input.user.login,
        displayName: input.user.name,
        avatarUrl: input.user.avatar_url,
        updatedAt: new Date(),
      },
    });

  await db
    .insert(githubAccounts)
    .values({
      userId,
      accessTokenEncrypted: encryptSecret(input.token.access_token!),
      refreshTokenEncrypted: input.token.refresh_token
        ? encryptSecret(input.token.refresh_token)
        : null,
      accessTokenExpiresAt: expiresAt(input.token.expires_in),
      refreshTokenExpiresAt: expiresAt(input.token.refresh_token_expires_in),
    })
    .onConflictDoUpdate({
      target: githubAccounts.userId,
      set: {
        accessTokenEncrypted: encryptSecret(input.token.access_token!),
        refreshTokenEncrypted: input.token.refresh_token
          ? encryptSecret(input.token.refresh_token)
          : undefined,
        accessTokenExpiresAt: expiresAt(input.token.expires_in),
        refreshTokenExpiresAt: expiresAt(input.token.refresh_token_expires_in),
        updatedAt: new Date(),
      },
    });

  return {
    userId,
    githubLogin: input.user.login,
    avatarUrl: input.user.avatar_url,
  };
}

async function persistRefreshedToken(
  account: GitHubAccount,
  token: GitHubTokenResponse,
): Promise<string> {
  const accessToken = token.access_token!;
  await db
    .update(githubAccounts)
    .set({
      accessTokenEncrypted: encryptSecret(accessToken),
      refreshTokenEncrypted: token.refresh_token
        ? encryptSecret(token.refresh_token)
        : account.refreshTokenEncrypted,
      accessTokenExpiresAt: expiresAt(token.expires_in),
      refreshTokenExpiresAt: token.refresh_token_expires_in
        ? expiresAt(token.refresh_token_expires_in)
        : account.refreshTokenExpiresAt,
      updatedAt: new Date(),
    })
    .where(eq(githubAccounts.userId, account.userId));

  return accessToken;
}

export async function getValidGitHubAccessToken(
  userId: string,
): Promise<string> {
  const account = await db.query.githubAccounts.findFirst({
    where: eq(githubAccounts.userId, userId),
  });
  if (!account) throw new GitHubReauthorizationRequiredError();

  const accessToken = decryptSecret(account.accessTokenEncrypted);
  if (
    !account.accessTokenExpiresAt ||
    account.accessTokenExpiresAt.getTime() > Date.now() + REFRESH_BUFFER_MS
  ) {
    return accessToken;
  }

  if (!account.refreshTokenEncrypted) {
    throw new GitHubReauthorizationRequiredError();
  }

  const refreshToken = decryptSecret(account.refreshTokenEncrypted);
  const token = await refreshGitHubToken(refreshToken);
  return persistRefreshedToken(account, token);
}

export async function createUserGitHubClient(userId: string): Promise<Octokit> {
  return new Octokit({ auth: await getValidGitHubAccessToken(userId) });
}

export async function listUserInstallations(accessToken: string) {
  const response = await githubJson<{
    installations: Array<{
      id: number;
      account: { id: number; login: string; type: string };
      repository_selection: string;
      suspended_at: string | null;
    }>;
  }>("https://api.github.com/user/installations?per_page=100", {
    method: "GET",
    headers: { authorization: `Bearer ${accessToken}` },
  });

  return response.installations;
}

export async function saveInstallation(input: {
  installationId: number;
  userId: string;
  accountId: number;
  accountLogin: string;
  accountType: string;
  repositorySelection: string;
  suspended: boolean;
}) {
  await db
    .insert(githubInstallations)
    .values({
      installationId: input.installationId,
      accountId: input.accountId,
      accountLogin: input.accountLogin,
      accountType: input.accountType,
      repositorySelection: input.repositorySelection,
      connectedByUserId: input.userId,
      suspended: input.suspended,
      revokedAt: null,
    })
    .onConflictDoUpdate({
      target: githubInstallations.installationId,
      set: {
        accountId: input.accountId,
        accountLogin: input.accountLogin,
        accountType: input.accountType,
        repositorySelection: input.repositorySelection,
        connectedByUserId: input.userId,
        suspended: input.suspended,
        revokedAt: null,
        updatedAt: new Date(),
      },
    });
}

export async function revokeInstallation(
  installationId: number,
  suspended = false,
) {
  await db
    .update(githubInstallations)
    .set({
      suspended,
      revokedAt: suspended ? null : new Date(),
      updatedAt: new Date(),
    })
    .where(eq(githubInstallations.installationId, installationId));
}

export async function getInstallationForUser(
  installationId: number,
  userId: string,
) {
  return db.query.githubInstallations.findFirst({
    where: and(
      eq(githubInstallations.installationId, installationId),
      eq(githubInstallations.connectedByUserId, userId),
    ),
  });
}
