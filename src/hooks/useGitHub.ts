"use client";

/**
 * GitHub Hooks
 * SWR-based data fetching for GitHub operations
 */

import { useMemo, useCallback } from "react";
import useSWR from "swr";
import useSWRMutation from "swr/mutation";
import {
  postFetcher,
  createZodFetcher,
  type FetchError,
} from "@/lib/swr/fetcher";
import type { Repo, Branch } from "@/types/github";
import { z } from "zod";

// ============================================================================
// Types
// ============================================================================

interface ReposResponse {
  repos: Repo[];
  lastRefreshed: number | null;
  fromCache?: boolean;
}

interface BranchesResponse {
  branches: Branch[];
  defaultBranch: string;
}

const RepoSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    fullName: z.string(),
    owner: z
      .object({
        login: z.string(),
        avatarUrl: z.string().optional(),
      })
      .loose(),
    private: z.boolean(),
    defaultBranch: z.string(),
    language: z.string().nullable(),
    description: z.string().nullable(),
    updatedAt: z.string(),
    stargazersCount: z.number().optional(),
    forksCount: z.number().optional(),
  })
  .loose();

const ReposResponseSchema = z
  .object({
    repos: z.array(RepoSchema),
    lastRefreshed: z.number().nullable(),
    fromCache: z.boolean().optional(),
    refreshed: z.boolean().optional(),
  })
  .loose();

const BranchSchema = z
  .object({
    name: z.string(),
    protected: z.boolean(),
    commit: z
      .object({
        sha: z.string(),
      })
      .loose(),
  })
  .loose();

const BranchesResponseSchema = z
  .object({
    branches: z.array(BranchSchema),
    defaultBranch: z.string(),
  })
  .loose();

interface UseReposReturn {
  repos: Repo[];
  lastRefreshed: number | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | undefined;
  refresh: () => Promise<void>;
  mutate: () => void;
}

interface UseBranchesReturn {
  branches: Branch[];
  defaultBranch: string | null;
  isLoading: boolean;
  error: Error | undefined;
  refetch: () => void;
}

// ============================================================================
// useRepos Hook
// ============================================================================

/**
 * Hook for fetching and caching repositories
 * Uses SWR for automatic caching and deduplication
 */
export function useRepos(search: string = "", enabled = true): UseReposReturn {
  const { data, error, isLoading, mutate } = useSWR<ReposResponse, FetchError>(
    enabled ? "/api/github/repos" : null,
    createZodFetcher(ReposResponseSchema),
    {
      revalidateOnFocus: false,
      revalidateIfStale: false, // Don't auto-revalidate, user controls refresh
      onError: (err, key) => {
        console.error(`[useRepos] Failed to fetch ${key}:`, err.message);
      },
    },
  );

  // Manual refresh mutation
  const { trigger: triggerRefresh, isMutating: isRefreshing } = useSWRMutation(
    "/api/github/repos/refresh",
    postFetcher<ReposResponse>,
    {
      onSuccess: (newData) => {
        // Update the cache with fresh data
        mutate(newData, { revalidate: false });
      },
    },
  );

  // Client-side filtering for instant feedback
  const repos = data?.repos;
  const filteredRepos = useMemo(() => {
    if (!repos) return [];
    if (!search) return repos;

    const searchLower = search.toLowerCase();
    return repos.filter(
      (repo) =>
        repo.name.toLowerCase().includes(searchLower) ||
        repo.fullName.toLowerCase().includes(searchLower) ||
        repo.description?.toLowerCase().includes(searchLower),
    );
  }, [repos, search]);

  const refresh = useCallback(async () => {
    await triggerRefresh();
  }, [triggerRefresh]);

  return {
    repos: filteredRepos,
    lastRefreshed: data?.lastRefreshed ?? null,
    isLoading,
    isRefreshing,
    error,
    refresh,
    mutate: () => mutate(),
  };
}

// ============================================================================
// useBranches Hook
// ============================================================================

/**
 * Hook for fetching branches for a repository
 * SWR key changes when owner/repo changes, auto-triggering refetch
 */
export function useBranches(owner: string, repo: string): UseBranchesReturn {
  // Key is null if owner/repo not provided, disabling the fetch
  const key =
    owner && repo
      ? `/api/github/branches?${new URLSearchParams({ owner, repo }).toString()}`
      : null;

  const { data, error, isLoading, mutate } = useSWR<
    BranchesResponse,
    FetchError
  >(key, createZodFetcher(BranchesResponseSchema), {
    revalidateOnFocus: false,
    onError: (err, key) => {
      console.error(`[useBranches] Failed to fetch ${key}:`, err.message);
    },
  });

  return {
    branches: data?.branches ?? [],
    defaultBranch: data?.defaultBranch ?? null,
    isLoading,
    error,
    refetch: () => mutate(),
  };
}
