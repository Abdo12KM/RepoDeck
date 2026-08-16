"use client";

/**
 * useFileContent Hook
 * SWR-based hook for fetching file content from GitHub
 */

import useSWR from "swr";
import { createZodFetcher, type FetchError } from "@/lib/swr/fetcher";
import { z } from "zod";

interface FileContentResponse {
  content: string;
  sha: string;
  path: string;
  size: number;
  fromCache?: boolean;
  downloadUrl?: string;
}

const FileContentResponseSchema = z
  .object({
    content: z.string(),
    sha: z.string(),
    path: z.string(),
    size: z.number(),
    fromCache: z.boolean().optional(),
    downloadUrl: z.string().optional(),
  })
  .loose();

interface UseFileContentReturn {
  content: string | null;
  isLoading: boolean;
  error: Error | undefined;
  data: FileContentResponse | undefined;
  refetch: () => void;
}

/**
 * Hook for fetching file content
 * Only fetches when all params are provided
 */
export function useFileContent(
  owner: string | null,
  repo: string | null,
  ref: string | null,
  path: string | null,
): UseFileContentReturn {
  // Key is null if any param is missing, disabling fetch
  const key =
    owner && repo && ref && path
      ? `/api/github/file?${new URLSearchParams({
          owner,
          repo,
          ref,
          path,
        }).toString()}`
      : null;

  const { data, error, isLoading, mutate } = useSWR<
    FileContentResponse,
    FetchError
  >(key, createZodFetcher(FileContentResponseSchema), {
    revalidateOnFocus: false,
    revalidateIfStale: false, // Don't auto-revalidate, rely on cache
    onError: (err, key) => {
      console.error(`[useFileContent] Failed to fetch ${key}:`, err.message);
    },
  });

  return {
    content: data?.content ?? null,
    isLoading,
    error,
    data,
    refetch: () => mutate(),
  };
}
