import type { Octokit } from "@octokit/rest";
import {
  createUserGitHubClient,
  GitHubReauthorizationRequiredError,
} from "@/lib/auth/github";
import { getAuthSession, type AuthSession } from "@/lib/auth/session";
import { createGitHubClient } from "./client";

export interface GitHubRequestContext {
  client: Octokit;
  session: AuthSession | null;
  requiresReauthorization: boolean;
}

export async function getGitHubRequestContext(): Promise<GitHubRequestContext> {
  const session = await getAuthSession();
  if (!session) {
    return {
      client: createGitHubClient(),
      session: null,
      requiresReauthorization: false,
    };
  }

  try {
    return {
      client: await createUserGitHubClient(session.userId),
      session,
      requiresReauthorization: false,
    };
  } catch (error) {
    if (!(error instanceof GitHubReauthorizationRequiredError)) throw error;

    return {
      client: createGitHubClient(),
      session,
      requiresReauthorization: true,
    };
  }
}
