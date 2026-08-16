"use client";

import { useEffect, useMemo, useState } from "react";
import { Clock, Loader2, Sparkles, GitBranch, Check } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import type { Repo } from "@/types/github";
import { useRepos, useBranches } from "@/hooks/useGitHub";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { RepoSelectionStep } from "@/components/repo/selection/RepoSelectionStep";
import { BranchSelectionStep } from "@/components/repo/selection/BranchSelectionStep";
import { BranchSwitcherPills } from "@/components/repo/selection/BranchSwitcherPills";
import { RepoListItem } from "@/components/repo/selection/RepoListItem";
import { RepoIcon } from "@/components/repo/RepoIcon";
import { RepoDeckIcon } from "@/components/ui/RepoDeckLogo";
import { PublicRepositoryForm } from "./PublicRepositoryForm";
import { cn } from "@/lib/utils";

interface RecentRepoItem {
  owner: string;
  repo: string;
  branch: string;
  timestamp: number;
}

const RECENT_REPOS_KEY = "repodeck:recent-repos";

export function saveRecentRepo(owner: string, repo: string, branch: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(RECENT_REPOS_KEY);
    const list: RecentRepoItem[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter(
      (r) => !(r.owner === owner && r.repo === repo),
    );
    filtered.unshift({ owner, repo, branch, timestamp: Date.now() });
    localStorage.setItem(
      RECENT_REPOS_KEY,
      JSON.stringify(filtered.slice(0, 8)),
    );
  } catch {
    // Ignore storage errors
  }
}

export function getRecentRepos(): RecentRepoItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(RECENT_REPOS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

interface RepositoryPickerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentOwner: string | null;
  currentRepo: string | null;
  currentBranch: string | null;
  onSelectRepository: (owner: string, repo: string, branch: string) => void;
  onOpenPublicRepository: (
    owner: string,
    repo: string,
    branch: string,
    path?: string,
  ) => void;
  onConnectPrivate: () => void;
}

export function RepositoryPickerDialog({
  open,
  onOpenChange,
  currentOwner,
  currentRepo,
  currentBranch,
  onSelectRepository,
  onOpenPublicRepository,
  onConnectPrivate,
}: RepositoryPickerDialogProps) {
  const [search, setSearch] = useState("");
  const [step, setStep] = useState<"repo" | "branch">("repo");
  const [selectedRepo, setSelectedRepo] = useState<Repo | null>(null);
  const [recentRepos, setRecentRepos] = useState<RecentRepoItem[]>([]);
  const { authenticated, isLoading: authLoading, signIn } = useAuth();
  const {
    repos,
    isLoading,
    isRefreshing,
    lastRefreshed,
    error,
    refresh,
    mutate,
  } = useRepos(search, authenticated);

  const branchTarget = step === "branch" ? selectedRepo : null;
  const { branches, isLoading: branchesLoading } = useBranches(
    branchTarget?.owner.login ?? currentOwner ?? "",
    branchTarget?.name ?? currentRepo ?? "",
  );

  useEffect(() => {
    if (!open) return;
    setStep("repo");
    setSelectedRepo(null);
    setSearch("");
    setRecentRepos(getRecentRepos());
  }, [open]);

  const currentRepoData = useMemo<Repo | null>(() => {
    if (!currentOwner || !currentRepo) return null;
    const match = repos.find(
      (item) =>
        item.owner.login.toLowerCase() === currentOwner.toLowerCase() &&
        item.name.toLowerCase() === currentRepo.toLowerCase(),
    );
    if (match) return match;
    return {
      id: `${currentOwner}/${currentRepo}`,
      nodeId: `${currentOwner}/${currentRepo}`,
      name: currentRepo,
      fullName: `${currentOwner}/${currentRepo}`,
      owner: {
        id: 0,
        login: currentOwner,
        avatarUrl: `https://github.com/${currentOwner}.png`,
        htmlUrl: `https://github.com/${currentOwner}`,
        type: "User",
      },
      private: false,
      htmlUrl: `https://github.com/${currentOwner}/${currentRepo}`,
      description: null,
      fork: false,
      url: `https://api.github.com/repos/${currentOwner}/${currentRepo}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      pushedAt: new Date().toISOString(),
      size: 0,
      stargazersCount: 0,
      watchersCount: 0,
      language: null,
      forksCount: 0,
      openIssuesCount: 0,
      defaultBranch: currentBranch || "main",
      visibility: "public",
      permissions: {
        admin: false,
        push: false,
        pull: true,
      },
    } as unknown as Repo;
  }, [currentOwner, currentRepo, currentBranch, repos]);

  const handleSelectBranch = (branch: string) => {
    if (!selectedRepo && !currentRepoData) return;
    const target = selectedRepo ?? currentRepoData!;
    saveRecentRepo(target.owner.login, target.name, branch);
    onSelectRepository(target.owner.login, target.name, branch);
    onOpenChange(false);
  };

  const handleOpenRecent = (item: RecentRepoItem) => {
    saveRecentRepo(item.owner, item.repo, item.branch);
    onSelectRepository(item.owner, item.repo, item.branch);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent
        showCloseButton={false}
        onOpenAutoFocus={(event) => {
          if (event.currentTarget instanceof HTMLElement)
            event.currentTarget.focus();
        }}
        className="border-border/80 bg-background fixed top-0 left-0 bottom-18 z-50 flex h-auto max-h-[calc(100dvh-4.5rem)] w-dvw max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 p-0 shadow-2xl ring-0 sm:top-1/2 sm:left-1/2 sm:bottom-auto sm:h-[85vh] sm:max-h-[680px] sm:w-full sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:ring-1"
      >
        <VisuallyHidden>
          <DialogTitle>Repository Picker</DialogTitle>
          <DialogDescription>
            Select a GitHub repository and branch to browse.
          </DialogDescription>
        </VisuallyHidden>

        {/* Main Content Area */}
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {authLoading ? (
            <div className="text-muted-foreground flex flex-1 items-center justify-center gap-2 text-sm">
              <Loader2 className="text-primary h-5 w-5 animate-spin" /> Checking
              GitHub session...
            </div>
          ) : !authenticated ? (
            <ScrollArea className="min-h-0 flex-1" hideHorizontal>
              <PublicRepositoryForm
                onClose={() => onOpenChange(false)}
                onOpen={(owner, repo, branch, path) => {
                  saveRecentRepo(owner, repo, branch);
                  onOpenPublicRepository(owner, repo, branch, path);
                  onOpenChange(false);
                }}
              />

              {/* Current Active Workspace Card (even when unauthenticated) */}
              {currentOwner && currentRepo && currentRepoData && (
                <div className="border-b p-4 bg-muted/5">
                  <div className="border-primary/30 bg-primary/5 w-full max-w-full space-y-3 overflow-x-hidden rounded-2xl border p-3.5 shadow-xs sm:p-4">
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
                      activeBranch={currentBranch ?? undefined}
                    />

                    {/* Branch Switcher Pill Bar */}
                    <BranchSwitcherPills
                      branches={branches}
                      branchesLoading={branchesLoading}
                      currentBranch={currentBranch ?? undefined}
                      onSelectBranch={handleSelectBranch}
                    />
                  </div>
                </div>
              )}

              {/* Recent repositories if any */}
              {recentRepos.length > 0 && (
                <div className="bg-muted/10 border-b p-4">
                  <p className="text-muted-foreground mb-2 flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
                    <Clock className="h-3.5 w-3.5" /> Recent repositories
                  </p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {recentRepos.map((r) => (
                      <button
                        key={`${r.owner}/${r.repo}`}
                        type="button"
                        onClick={() => handleOpenRecent(r)}
                        className="border-border/80 bg-background hover:bg-muted/60 flex cursor-pointer items-center gap-2.5 rounded-lg border p-2.5 text-left transition-colors"
                      >
                        <RepoIcon
                          owner={r.owner}
                          repo={r.repo}
                          branch={r.branch}
                          className="h-5 w-5 shrink-0"
                          iconClassName="h-full w-full object-contain"
                          fallbackIcon={
                            <RepoDeckIcon
                              size={18}
                              variant="flat"
                              className="h-4.5 w-4.5 shrink-0"
                            />
                          }
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-semibold">
                            {r.owner}/{r.repo}
                          </p>
                          <p className="text-muted-foreground truncate font-mono text-[10px]">
                            {r.branch}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="ml-1 shrink-0 font-mono text-[9px]"
                        >
                          Recent
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sign in Callout */}
              <div className="bg-card flex min-h-0 flex-1 flex-col items-center justify-center p-8 text-center">
                <div className="bg-primary/10 text-primary mb-3 flex h-11 w-11 items-center justify-center rounded-2xl">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="text-sm font-semibold">
                  Sign in for your GitHub repositories
                </p>
                <p className="text-muted-foreground mt-1.5 max-w-xs text-xs leading-relaxed">
                  Browse your own public repositories or connect selected
                  private repositories securely with granular read-only
                  permissions.
                </p>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <Button
                    size="sm"
                    onClick={() => signIn("/repositories")}
                    className="text-xs font-medium"
                  >
                    Sign in with GitHub
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onConnectPrivate}
                    className="text-xs"
                  >
                    Connect private repos
                  </Button>
                </div>
              </div>
            </ScrollArea>
          ) : step === "repo" ? (
            <RepoSelectionStep
              search={search}
              onSearchChange={setSearch}
              repos={repos}
              reposLoading={isLoading}
              isRefreshing={isRefreshing}
              repoError={error}
              refresh={refresh}
              mutate={mutate}
              onClose={() => onOpenChange(false)}
              onSelectRepo={(repo) => {
                setSelectedRepo(repo);
                setStep("branch");
              }}
              hasRepo={Boolean(currentOwner && currentRepo)}
              currentRepoData={currentRepoData}
              currentBranch={currentBranch ?? undefined}
              branchesLoading={branchesLoading}
              branches={branches}
              onSelectBranch={handleSelectBranch}
            />
          ) : (
            <BranchSelectionStep
              selectedRepo={selectedRepo!}
              branches={branches}
              branchesLoading={branchesLoading}
              onSelectBranch={handleSelectBranch}
              onBack={() => setStep("repo")}
              onClose={() => onOpenChange(false)}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
