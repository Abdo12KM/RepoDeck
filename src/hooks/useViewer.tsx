"use client";

import { createContext, useCallback, useContext, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface ViewerContextValue {
  owner: string | null;
  repo: string | null;
  branch: string | null;
  selectedPath: string | null;
  hasRepo: boolean;
  selectRepository: (owner: string, repo: string, branch: string) => void;
  setBranch: (branch: string) => void;
  openFile: (path: string) => void;
  closeFile: () => void;
}

const ViewerContext = createContext<ViewerContextValue | null>(null);

export function ViewerProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const owner = searchParams.get("owner");
  const repo = searchParams.get("repo");
  const branch = searchParams.get("ref");
  const selectedPath = searchParams.get("path");

  const updateSelection = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }

      const query = params.toString();
      router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const selectRepository = useCallback(
    (nextOwner: string, nextRepo: string, nextBranch: string) => {
      updateSelection({
        owner: nextOwner,
        repo: nextRepo,
        ref: nextBranch,
        path: null,
      });
    },
    [updateSelection],
  );

  const setBranch = useCallback(
    (nextBranch: string) => {
      updateSelection({ ref: nextBranch, path: null });
    },
    [updateSelection],
  );

  const openFile = useCallback(
    (path: string) => updateSelection({ path }),
    [updateSelection],
  );

  const closeFile = useCallback(
    () => updateSelection({ path: null }),
    [updateSelection],
  );

  const value = useMemo(
    () => ({
      owner,
      repo,
      branch,
      selectedPath,
      hasRepo: Boolean(owner && repo && branch),
      selectRepository,
      setBranch,
      openFile,
      closeFile,
    }),
    [
      branch,
      closeFile,
      openFile,
      owner,
      repo,
      selectedPath,
      selectRepository,
      setBranch,
    ],
  );

  return (
    <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>
  );
}

export function useViewer(): ViewerContextValue {
  const context = useContext(ViewerContext);
  if (!context) {
    throw new Error("useViewer must be used within a ViewerProvider");
  }
  return context;
}
