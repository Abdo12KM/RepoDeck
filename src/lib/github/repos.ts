/**
 * GitHub Repository Operations
 * Functions for listing and querying repositories
 */

import type { Octokit } from "@octokit/rest";
import type { Repo, Branch, PaginatedResponse } from "@/types/github";

const PER_PAGE = 30;

/**
 * List repositories accessible to the authenticated user
 * Supports pagination and optional search filtering
 */
export async function listUserRepos(
  octokit: Octokit,
  options: { search?: string; page?: number } = {},
): Promise<PaginatedResponse<Repo>> {
  const { search, page = 1 } = options;

  const { data } = await octokit.rest.repos.listForAuthenticatedUser({
    sort: "updated",
    direction: "desc",
    per_page: PER_PAGE,
    page,
  });

  let repos: Repo[] = data.map((repo) => ({
    id: repo.id,
    name: repo.name,
    fullName: repo.full_name,
    owner: {
      login: repo.owner.login,
      avatarUrl: repo.owner.avatar_url,
    },
    private: repo.private,
    defaultBranch: repo.default_branch,
    language: repo.language,
    description: repo.description,
    updatedAt: repo.updated_at ?? new Date().toISOString(),
    stargazersCount: repo.stargazers_count,
    forksCount: repo.forks_count,
  }));

  // Client-side filtering if search is provided
  if (search) {
    const searchLower = search.toLowerCase();
    repos = repos.filter(
      (repo) =>
        repo.name.toLowerCase().includes(searchLower) ||
        repo.fullName.toLowerCase().includes(searchLower) ||
        repo.description?.toLowerCase().includes(searchLower),
    );
  }

  return {
    data: repos,
    hasMore: data.length === PER_PAGE,
    page,
  };
}

/**
 * Get detailed information about a specific repository
 */
export async function getRepoDetails(
  octokit: Octokit,
  owner: string,
  repo: string,
): Promise<Repo> {
  const { data } = await octokit.rest.repos.get({ owner, repo });

  return {
    id: data.id,
    name: data.name,
    fullName: data.full_name,
    owner: {
      login: data.owner.login,
      avatarUrl: data.owner.avatar_url,
    },
    private: data.private,
    defaultBranch: data.default_branch,
    language: data.language,
    description: data.description,
    updatedAt: data.updated_at ?? new Date().toISOString(),
    stargazersCount: data.stargazers_count,
    forksCount: data.forks_count,
  };
}

/**
 * List all branches for a repository
 */
export async function listBranches(
  octokit: Octokit,
  owner: string,
  repo: string,
): Promise<Branch[]> {
  const { data } = await octokit.rest.repos.listBranches({
    owner,
    repo,
    per_page: 100,
  });

  return data.map((branch) => ({
    name: branch.name,
    protected: branch.protected,
    commit: {
      sha: branch.commit.sha,
    },
  }));
}

/**
 * Fetch ALL repositories for the authenticated user (handles pagination)
 * GitHub limits to 100 per page, so we paginate until exhausted
 */
export async function listAllUserRepos(octokit: Octokit): Promise<Repo[]> {
  const allRepos: Repo[] = [];
  let page = 1;
  const perPage = 100; // Max allowed by GitHub

  while (true) {
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
      sort: "updated",
      direction: "desc",
      per_page: perPage,
      page,
    });

    const repos: Repo[] = data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      owner: {
        login: repo.owner.login,
        avatarUrl: repo.owner.avatar_url,
      },
      private: repo.private,
      defaultBranch: repo.default_branch,
      language: repo.language,
      description: repo.description,
      updatedAt: repo.updated_at ?? new Date().toISOString(),
      stargazersCount: repo.stargazers_count,
      forksCount: repo.forks_count,
    }));

    allRepos.push(...repos);

    // If we got fewer than perPage, we've reached the end
    if (data.length < perPage) break;
    page++;
  }

  return allRepos;
}

/**
 * Fetch ALL branches for a repository (handles pagination for 100+ branches)
 */
export async function listAllBranches(
  octokit: Octokit,
  owner: string,
  repo: string,
): Promise<Branch[]> {
  const allBranches: Branch[] = [];
  let page = 1;
  const perPage = 100;

  while (true) {
    const { data } = await octokit.rest.repos.listBranches({
      owner,
      repo,
      per_page: perPage,
      page,
    });

    const branches: Branch[] = data.map((branch) => ({
      name: branch.name,
      protected: branch.protected,
      commit: {
        sha: branch.commit.sha,
      },
    }));

    allBranches.push(...branches);

    if (data.length < perPage) break;
    page++;
  }

  return allBranches;
}
