"use client";

import { FolderTree, FileCode2, GitBranch, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  hasRepo: boolean;
  selectedPath: string | null;
  branch: string | null;
  isSearchActive?: boolean;
  isRepoPickerActive?: boolean;
  onOpenTree: () => void;
  onOpenViewer: () => void;
  onOpenSearch?: () => void;
  onOpenRepoPicker: () => void;
}

export function MobileBottomNav({
  hasRepo,
  selectedPath,
  branch,
  isSearchActive = false,
  isRepoPickerActive = false,
  onOpenTree,
  onOpenViewer,
  onOpenSearch,
  onOpenRepoPicker,
}: MobileBottomNavProps) {
  if (!hasRepo) return null;

  const isTreeActive = !selectedPath && !isSearchActive && !isRepoPickerActive;
  const isViewerActive =
    Boolean(selectedPath) && !isSearchActive && !isRepoPickerActive;

  return (
    <nav
      className="bg-background/95 supports-backdrop-filter:bg-background/85 border-border/80 fixed inset-x-0 bottom-0 z-[60] flex h-18 touch-manipulation items-center justify-around border-t px-1.5 shadow-2xl backdrop-blur-xl select-none lg:hidden"
      aria-label="Mobile navigation bar"
    >
      {/* 1. Files / Tree Explorer Tab */}
      <button
        type="button"
        onClick={onOpenTree}
        aria-label="File Explorer"
        aria-current={isTreeActive ? "page" : undefined}
        className={cn(
          "group flex h-full flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-hidden",
          isTreeActive
            ? "text-primary font-semibold"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <div
          className={cn(
            "flex h-7 w-12 items-center justify-center rounded-lg transition-all duration-150 group-active:scale-90",
            isTreeActive
              ? "bg-primary/15 text-primary"
              : "group-hover:bg-muted/60 text-muted-foreground group-hover:text-foreground",
          )}
        >
          <FolderTree className="h-4 w-4" />
        </div>
        <span>Files</span>
      </button>

      {/* 2. Universal Search / Quick Switcher Tab */}
      {onOpenSearch && (
        <button
          type="button"
          onClick={onOpenSearch}
          aria-label="Search files and commands"
          aria-current={isSearchActive ? "page" : undefined}
          className={cn(
            "group flex h-full flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-hidden",
            isSearchActive
              ? "text-primary font-semibold"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <div
            className={cn(
              "flex h-7 w-12 items-center justify-center rounded-lg transition-all duration-150 group-active:scale-90",
              isSearchActive
                ? "bg-primary/15 text-primary"
                : "group-hover:bg-muted/60 text-muted-foreground group-hover:text-foreground",
            )}
          >
            <Search className="h-4 w-4" />
          </div>
          <span>Search</span>
        </button>
      )}

      {/* 3. Code Viewer Tab (always interactive — jumps to last/recent/README if in tree) */}
      <button
        type="button"
        onClick={onOpenViewer}
        aria-label={
          selectedPath
            ? `View ${selectedPath.split("/").pop()}`
            : "Open code viewer"
        }
        aria-current={isViewerActive ? "page" : undefined}
        className={cn(
          "group flex h-full flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-hidden",
          isViewerActive
            ? "text-primary font-semibold"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <div
          className={cn(
            "flex h-7 w-12 items-center justify-center rounded-lg transition-all duration-150 group-active:scale-90",
            isViewerActive
              ? "bg-primary/15 text-primary"
              : "group-hover:bg-muted/60 text-muted-foreground group-hover:text-foreground",
          )}
        >
          <FileCode2 className="h-4 w-4" />
        </div>
        <span>Code</span>
      </button>

      {/* 4. Repo / Branch Switcher (always present) */}
      <button
        type="button"
        onClick={onOpenRepoPicker}
        aria-label="Switch branch or repository"
        aria-current={isRepoPickerActive ? "page" : undefined}
        className={cn(
          "group flex h-full flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-hidden",
          isRepoPickerActive
            ? "text-primary font-semibold"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <div
          className={cn(
            "flex h-7 w-12 items-center justify-center rounded-lg transition-all duration-150 group-active:scale-90",
            isRepoPickerActive
              ? "bg-primary/15 text-primary"
              : "group-hover:bg-muted/60 text-muted-foreground group-hover:text-foreground",
          )}
        >
          <GitBranch className="h-4 w-4" />
        </div>
        <span className="max-w-20 truncate">{branch || "Switch"}</span>
      </button>
    </nav>
  );
}
