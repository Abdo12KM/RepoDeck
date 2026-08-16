"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Empty,
  EmptyDescription,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  RefreshCw,
  AlertCircle,
  FolderGit2,
  Lock,
  Globe,
  X,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RepoListItem, RepoItemSkeleton } from "./RepoListItem";
import { BranchSwitcherPills } from "./BranchSwitcherPills";
import type { Branch, Repo } from "@/types/github";

interface RepoSelectionStepProps {
  search: string;
  onSearchChange: (value: string) => void;
  repos: Repo[];
  reposLoading: boolean;
  isRefreshing: boolean;
  repoError: Error | undefined;
  refresh: () => void;
  mutate: () => void;
  onSelectRepo: (repo: Repo) => void;
  hasRepo: boolean;
  currentRepoData: Repo | null;
  currentBranch?: string;
  branchesLoading?: boolean;
  branches?: Branch[];
  onSelectBranch?: (branch: string) => void;
  onClose?: () => void;
}

export function RepoSelectionStep({
  search,
  onSearchChange,
  repos,
  reposLoading,
  isRefreshing,
  repoError,
  refresh,
  mutate,
  onSelectRepo,
  hasRepo,
  currentRepoData,
  currentBranch,
  branchesLoading,
  branches,
  onSelectBranch,
  onClose,
}: RepoSelectionStepProps) {
  const [localSearch, setLocalSearch] = useState(search);
  const [filterType, setFilterType] = useState<"all" | "public" | "private">(
    "all",
  );

  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 250);
    return () => clearTimeout(timer);
  }, [localSearch, onSearchChange]);

  const filteredRepos = useMemo(() => {
    return repos.filter((r) => {
      if (filterType === "public") return !r.private;
      if (filterType === "private") return r.private;
      return true;
    });
  }, [repos, filterType]);

  const publicCount = useMemo(
    () => repos.filter((r) => !r.private).length,
    [repos],
  );
  const privateCount = useMemo(
    () => repos.filter((r) => r.private).length,
    [repos],
  );

  const tabsConfig = useMemo(() => {
    const tabs: Array<{
      id: "all" | "public" | "private";
      label: string;
      count: number;
      icon?: React.ReactNode;
    }> = [
      { id: "all", label: "All", count: repos.length },
      {
        id: "public",
        label: "Public",
        count: publicCount,
        icon: <Globe className="h-3.5 w-3.5 shrink-0" />,
      },
    ];

    if (privateCount > 0) {
      tabs.push({
        id: "private",
        label: "Private",
        count: privateCount,
        icon: <Lock className="h-3.5 w-3.5 shrink-0 text-amber-500" />,
      });
    }

    return tabs;
  }, [repos.length, publicCount, privateCount]);

  return (
    <div className="bg-background flex min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden overflow-x-hidden">
      {/* Search Header Bar */}
      <div className="bg-muted/20 flex items-center gap-2.5 border-b px-4 py-3">
        <Search className="text-primary h-4 w-4 shrink-0" />
        <input
          id="repo-search"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search repositories..."
          className="placeholder:text-muted-foreground/60 text-foreground flex-1 bg-transparent text-sm outline-hidden"
          autoFocus
        />
        {localSearch && (
          <button
            type="button"
            onClick={() => {
              setLocalSearch("");
              onSearchChange("");
            }}
            className="text-muted-foreground hover:text-foreground cursor-pointer rounded-sm p-0.5 transition-colors"
            title="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        <Button
          variant="ghost"
          size="icon-xs"
          className="text-muted-foreground hover:text-foreground h-7 w-7 cursor-pointer rounded-md"
          onClick={refresh}
          disabled={isRefreshing}
          title="Refresh repository list from GitHub"
        >
          <RefreshCw
            className={cn(
              "h-3.5 w-3.5",
              isRefreshing && "text-primary animate-spin",
            )}
          />
        </Button>
        {onClose && (
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground hover:text-foreground -mr-1.5 h-7 w-7 cursor-pointer rounded-md"
            onClick={onClose}
            title="Close (Esc)"
            aria-label="Close repository picker"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Scope Filter Tabs */}
      <Tabs
        value={filterType}
        onValueChange={(v) =>
          setFilterType(v as "all" | "public" | "private")
        }
      >
        <TabsList
          variant="line"
          className="bg-muted/10 border-b border-border/60 h-auto w-full gap-0 p-0"
        >
          {tabsConfig.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="text-muted-foreground data-[state=active]:text-foreground gap-1.5 px-3 py-2 text-xs font-medium sm:py-2.5"
            >
              {tab.icon}
              {tab.label}
              <span
                className={cn(
                  "shrink-0 rounded-xs px-1.5 py-0.5 font-mono text-[10px] transition-colors",
                  filterType === tab.id
                    ? "bg-primary/15 text-primary font-semibold"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {tab.count}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Error State */}
      {repoError && (
        <div className="p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{repoError.message || "Failed to load repositories"}</span>
              <Button size="sm" variant="outline" onClick={() => mutate()}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <ScrollArea className="min-h-0 w-full max-w-full flex-1" hideHorizontal>
        <div className="w-full max-w-full space-y-3 overflow-x-hidden p-3 sm:p-4">
          {/* Active / Current Workspace Card */}
          {!search && hasRepo && currentRepoData && (
            <div className="border-primary/30 bg-primary/5 w-full max-w-full space-y-3 overflow-x-hidden rounded-2xl border p-3 shadow-xs sm:p-4">
              <div className="flex items-center justify-between">
                <p className="text-primary text-[11px] font-bold tracking-wider uppercase">
                  Current Active Workspace
                </p>
              </div>

              <RepoListItem
                repo={currentRepoData}
                onClick={() => {}}
                isCurrent
                hideActiveBadge
                hideBranchBadge={Boolean(
                  branchesLoading || (branches && branches.length > 1),
                )}
                activeBranch={currentBranch}
              />

              {/* Branch Switcher Pill Bar - with mini search when branches > 10 */}
              <BranchSwitcherPills
                branches={branches}
                branchesLoading={branchesLoading}
                currentBranch={currentBranch}
                onSelectBranch={onSelectBranch}
              />
            </div>
          )}

          {/* Repositories List or Loading / Empty states */}
          {reposLoading && repos.length === 0 ? (
            <div className="space-y-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <RepoItemSkeleton key={i} />
              ))}
            </div>
          ) : filteredRepos.length === 0 ? (
            <div className="py-12">
              <Empty>
                <EmptyMedia>
                  <FolderGit2 className="text-muted-foreground h-10 w-10 opacity-40" />
                </EmptyMedia>
                <EmptyTitle className="text-sm font-semibold">
                  {search
                    ? `No repositories matching "${search}"`
                    : "No repositories found"}
                </EmptyTitle>
                <EmptyDescription className="mx-auto max-w-xs text-xs">
                  {search
                    ? "Try checking for typos or clear the search filter."
                    : "Connect private repositories or sign in with your GitHub account to access your repositories."}
                </EmptyDescription>
                {search ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSearchChange("")}
                    className="mt-3 text-xs"
                  >
                    Clear search
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refresh()}
                    className="mt-3 text-xs"
                  >
                    <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                    Refresh
                  </Button>
                )}
              </Empty>
            </div>
          ) : (
            <div className="space-y-2">
              {!search && hasRepo && (
                <div className="text-muted-foreground flex items-center justify-between px-1 text-[11px] font-bold tracking-wider uppercase">
                  <span>
                    {filteredRepos.some((r) => r.id === currentRepoData?.id)
                      ? "Other Repositories"
                      : "Your Repositories"}
                  </span>
                  <span className="font-mono text-[10px]">
                    {
                      filteredRepos.filter((r) => r.id !== currentRepoData?.id)
                        .length
                    }
                  </span>
                </div>
              )}

              {filteredRepos
                .filter((r) =>
                  !hasRepo || search ? true : r.id !== currentRepoData?.id,
                )
                .map((repo) => (
                  <RepoListItem
                    key={repo.id}
                    repo={repo}
                    onClick={() => onSelectRepo(repo)}
                    isCurrent={repo.id === currentRepoData?.id}
                    activeBranch={
                      repo.id === currentRepoData?.id
                        ? currentBranch
                        : undefined
                    }
                  />
                ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
