"use client";

import { useState, useEffect, useCallback } from "react";

export interface RecentFileItem {
  path: string;
  name: string;
  timestamp: number;
  size?: number;
}

const STORAGE_PREFIX = "repodeck:recent-files:";
const MAX_RECENT_FILES = 20;

function getStorageKey(
  owner: string | null,
  repo: string | null,
): string | null {
  if (!owner || !repo) return null;
  return `${STORAGE_PREFIX}${owner}/${repo}`;
}

export function getStoredRecentFiles(
  owner: string | null,
  repo: string | null,
): RecentFileItem[] {
  if (typeof window === "undefined") return [];
  const key = getStorageKey(owner, repo);
  if (!key) return [];

  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useRecentFiles(owner: string | null, repo: string | null) {
  const key = getStorageKey(owner, repo);
  const [recentFiles, setRecentFiles] = useState<RecentFileItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Sync state when repository key changes or on initial client mount
  useEffect(() => {
    setRecentFiles(getStoredRecentFiles(owner, repo));
    setIsMounted(true);
  }, [owner, repo]);

  // Listen for storage events across components and tabs
  useEffect(() => {
    if (!key) return;

    const handleStorage = (e: StorageEvent | CustomEvent) => {
      if ("key" in e && e.key !== key && e.key !== null) return;
      setRecentFiles(getStoredRecentFiles(owner, repo));
    };

    window.addEventListener("storage", handleStorage as EventListener);
    window.addEventListener(
      "repodeck:recent-files-changed",
      handleStorage as EventListener,
    );

    return () => {
      window.removeEventListener("storage", handleStorage as EventListener);
      window.removeEventListener(
        "repodeck:recent-files-changed",
        handleStorage as EventListener,
      );
    };
  }, [key, owner, repo]);

  const notifyChange = useCallback(() => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("repodeck:recent-files-changed"));
    }
  }, []);

  const addRecentFile = useCallback(
    (filePath: string, size?: number) => {
      if (!key || !filePath) return;
      const fileName = filePath.split("/").pop() || filePath;

      try {
        const current = getStoredRecentFiles(owner, repo);
        const filtered = current.filter((item) => item.path !== filePath);
        const next: RecentFileItem[] = [
          {
            path: filePath,
            name: fileName,
            timestamp: Date.now(),
            size,
          },
          ...filtered,
        ].slice(0, MAX_RECENT_FILES);

        localStorage.setItem(key, JSON.stringify(next));
        setRecentFiles(next);
        notifyChange();
      } catch {
        // Ignore localStorage quota errors
      }
    },
    [key, owner, repo, notifyChange],
  );

  const removeRecentFile = useCallback(
    (filePath: string) => {
      if (!key) return;

      try {
        const current = getStoredRecentFiles(owner, repo);
        const next = current.filter((item) => item.path !== filePath);
        localStorage.setItem(key, JSON.stringify(next));
        setRecentFiles(next);
        notifyChange();
      } catch {
        // Ignore errors
      }
    },
    [key, owner, repo, notifyChange],
  );

  const clearRecentFiles = useCallback(() => {
    if (!key) return;

    try {
      localStorage.removeItem(key);
      setRecentFiles([]);
      notifyChange();
    } catch {
      // Ignore errors
    }
  }, [key, notifyChange]);

  return {
    recentFiles,
    isMounted,
    addRecentFile,
    removeRecentFile,
    clearRecentFiles,
  };
}
