/**
 * GitHub Client
 * Octokit wrapper for server-side GitHub API access
 */

import { Octokit } from "@octokit/rest";

let cachedClient: Octokit | null = null;

/**
 * Creates an Octokit instance for either anonymous public access or a
 * request-scoped GitHub App user token.
 */
export function createGitHubClient(accessToken?: string): Octokit {
  if (accessToken) return new Octokit({ auth: accessToken });
  if (cachedClient) return cachedClient;

  cachedClient = new Octokit();
  return cachedClient;
}

/**
 * Get the authenticated user's information
 */
export async function getAuthenticatedUser(octokit: Octokit) {
  const { data } = await octokit.rest.users.getAuthenticated();
  return {
    login: data.login,
    name: data.name,
    avatarUrl: data.avatar_url,
    email: data.email,
  };
}

/**
 * Validate that a request-scoped GitHub token is still valid.
 */
export async function validateToken(octokit: Octokit): Promise<boolean> {
  try {
    await octokit.rest.users.getAuthenticated();
    return true;
  } catch (error) {
    // Token invalid or lacks required scopes
    console.debug("[client] validateToken failed:", error);
    return false;
  }
}
