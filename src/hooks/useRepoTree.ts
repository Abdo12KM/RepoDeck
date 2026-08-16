"use client";

/**
 * Repository Tree Hook
 * SWR-based lazy-loading file tree for repository navigation
 */

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import useSWR from "swr";
import type { TreeNode } from "@/types/github";
import { createZodFetcher, type FetchError } from "@/lib/swr/fetcher";
import { z } from "zod";

// ============================================================================
// Types
// ============================================================================

interface TreeResponse {
  tree: TreeNode[];
}

const TreeNodeSchema = z
  .object({
    path: z.string(),
    type: z.enum(["blob", "tree"]),
    sha: z.string(),
    size: z.number().optional(),
    name: z.string(),
  })
  .loose();

const TreeResponseSchema = z
  .object({
    tree: z.array(TreeNodeSchema),
  })
  .loose();

interface UseRepoTreeReturn {
  tree: TreeNode[];
  isLoading: boolean;
  error: Error | undefined;
  refetch: () => void;
  expandedPaths: Set<string>;
  toggleExpanded: (path: string) => void;
  getRootNodes: () => TreeNode[];
  getChildren: (path: string) => TreeNode[];
  getAllDescendants: (path: string) => TreeNode[];
  isExpanded: (path: string) => boolean;
  expandAll: () => void;
  collapseAll: () => void;
  expandParents: (filePath: string) => void;
  isAnyExpanded: boolean;
  isExpanding: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Builds a nested tree structure from flat tree data
 */
function buildNestedTree(
  flatTree: TreeNode[],
): Map<string, { node: TreeNode; children: TreeNode[] }> {
  const nodeMap = new Map<string, { node: TreeNode; children: TreeNode[] }>();

  // Initialize all nodes
  for (const node of flatTree) {
    nodeMap.set(node.path, { node, children: [] });
  }

  // Build parent-child relationships
  for (const node of flatTree) {
    const parentPath = node.path.split("/").slice(0, -1).join("/");
    if (parentPath && nodeMap.has(parentPath)) {
      nodeMap.get(parentPath)!.children.push(node);
    }
  }

  return nodeMap;
}

// Persistent cache for expanded folder paths across components and view switches
const repoExpandedCache = new Map<string, Set<string>>();

/**
 * Hook for managing repository file tree state with SWR
 */
export function useRepoTree(
  owner: string | null,
  repo: string | null,
  branch: string | null,
): UseRepoTreeReturn {
  const repoKey = owner && repo && branch ? `${owner}/${repo}/${branch}` : null;
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => {
    if (repoKey && repoExpandedCache.has(repoKey)) {
      return new Set(repoExpandedCache.get(repoKey)!);
    }
    return new Set();
  });
  const [isExpanding, setIsExpanding] = useState(false);

  // Sync state when repoKey changes
  const prevRepoKeyRef = useRef<string | null>(repoKey);
  useEffect(() => {
    if (repoKey !== prevRepoKeyRef.current) {
      prevRepoKeyRef.current = repoKey;
      if (repoKey && repoExpandedCache.has(repoKey)) {
        setExpandedPaths(new Set(repoExpandedCache.get(repoKey)!));
      } else {
        setExpandedPaths(new Set());
      }
    }
  }, [repoKey]);

  // SWR key is null if params not provided, disabling the fetch
  const key =
    owner && repo && branch
      ? `/api/github/tree?${new URLSearchParams({
          owner,
          repo,
          branch,
        }).toString()}`
      : null;

  const { data, error, isLoading, mutate } = useSWR<TreeResponse, FetchError>(
    key,
    createZodFetcher(TreeResponseSchema),
    {
      revalidateOnFocus: false,
      keepPreviousData: true,
      onError: (err, key) => {
        console.error(`[useRepoTree] Failed to fetch ${key}:`, err.message);
      },
    },
  );

  // Sort and process the tree data
  const tree = data?.tree;
  const sortedTree = useMemo(() => {
    if (!tree) return [];

    // Sort by type (directories first) then by name
    return [...tree].sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "tree" ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }, [tree]);

  // Build nested tree structure
  const nestedTree = useMemo(() => buildNestedTree(sortedTree), [sortedTree]);

  // Pre-calculate all directories set for fast expansion
  const allDirsSet = useMemo(() => {
    if (!sortedTree) return new Set<string>();
    const dirs = sortedTree.filter((n) => n.type === "tree").map((n) => n.path);
    return new Set(dirs);
  }, [sortedTree]);

  /**
   * Toggle a directory's expanded state
   */
  const toggleExpanded = useCallback(
    (path: string) => {
      setExpandedPaths((prev) => {
        const next = new Set(prev);
        if (next.has(path)) {
          next.delete(path);
        } else {
          next.add(path);
        }
        if (repoKey) {
          repoExpandedCache.set(repoKey, new Set(next));
        }
        return next;
      });
    },
    [repoKey],
  );

  /**
   * Expand all directories
   */
  const expandAll = useCallback(() => {
    if (!allDirsSet.size) return;
    setIsExpanding(true);
    // Use setTimeout to allow the UI to render the loading state
    setTimeout(() => {
      const next = new Set(allDirsSet);
      setExpandedPaths(next);
      if (repoKey) {
        repoExpandedCache.set(repoKey, new Set(next));
      }
      setIsExpanding(false);
    }, 0);
  }, [allDirsSet, repoKey]);

  /**
   * Collapse all directories
   */
  const collapseAll = useCallback(() => {
    const next = new Set<string>();
    setExpandedPaths(next);
    if (repoKey) {
      repoExpandedCache.set(repoKey, next);
    }
  }, [repoKey]);

  /**
   * Expand parent directories of a specific file path so it is revealed in tree
   */
  const expandParents = useCallback(
    (filePath: string) => {
      const parts = filePath.split("/");
      if (parts.length <= 1) return;
      const parents: string[] = [];
      let current = "";
      for (let i = 0; i < parts.length - 1; i++) {
        current = current ? `${current}/${parts[i]}` : parts[i];
        parents.push(current);
      }
      setExpandedPaths((prev) => {
        let changed = false;
        const next = new Set(prev);
        for (const p of parents) {
          if (!next.has(p)) {
            next.add(p);
            changed = true;
          }
        }
        if (changed && repoKey) {
          repoExpandedCache.set(repoKey, new Set(next));
        }
        return changed ? next : prev;
      });
    },
    [repoKey],
  );

  /**
   * Check if any directory is expanded
   */
  const isAnyExpanded = expandedPaths.size > 0;

  /**
   * Get root-level nodes (no parent directory)
   */
  const getRootNodes = useCallback((): TreeNode[] => {
    return sortedTree.filter((node) => !node.path.includes("/"));
  }, [sortedTree]);

  /**
   * Get children of a directory
   */
  const getChildren = useCallback(
    (path: string): TreeNode[] => {
      return nestedTree.get(path)?.children || [];
    },
    [nestedTree],
  );

  /**
   * Get all descendants of a directory (recursive)
   */
  const getAllDescendants = useCallback(
    (path: string): TreeNode[] => {
      const prefix = `${path}/`;
      return sortedTree.filter((node) => node.path.startsWith(prefix));
    },
    [sortedTree],
  );

  /**
   * Check if a path is expanded
   */
  const isExpanded = useCallback(
    (path: string): boolean => {
      return expandedPaths.has(path);
    },
    [expandedPaths],
  );

  return {
    tree: sortedTree,
    isLoading,
    error,
    refetch: () => mutate(),
    expandedPaths,
    toggleExpanded,
    getRootNodes,
    getChildren,
    getAllDescendants,
    isExpanded,
    expandAll,
    collapseAll,
    expandParents,
    isAnyExpanded,
    isExpanding,
  };
}
