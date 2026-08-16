import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Star,
  GitFork,
  Lock,
  Globe,
  GitBranch,
  FolderGit2,
} from "lucide-react";
import { RepoIcon } from "../RepoIcon";
import { cn } from "@/lib/utils";
import type { Repo } from "@/types/github";

// Language colors (subset of GitHub's language colors)
export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  Java: "#b07219",
  Ruby: "#701516",
  PHP: "#4F5D95",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Shell: "#89e051",
  Vue: "#41b883",
  Svelte: "#ff3e00",
};

export function RepoListItem({
  repo,
  onClick,
  isCurrent = false,
  activeBranch,
  hideActiveBadge = false,
  hideBranchBadge = false,
}: {
  repo: Repo;
  onClick: () => void;
  isCurrent?: boolean;
  activeBranch?: string;
  hideActiveBadge?: boolean;
  hideBranchBadge?: boolean;
}) {
  const languageColor = repo.language
    ? LANGUAGE_COLORS[repo.language] || "#6e7681"
    : null;

  const updatedAgo = formatDistanceToNow(new Date(repo.updatedAt), {
    addSuffix: true,
  });

  return (
    <TooltipProvider>
      <div
        onClick={!isCurrent ? onClick : undefined}
        className={cn(
          "group relative flex w-full flex-col gap-2 rounded-xl border p-3.5 text-left transition-all",
          !isCurrent &&
            "bg-card/60 border-border/70 hover:border-primary/40 hover:bg-accent/60 cursor-pointer hover:shadow-xs active:scale-[0.995]",
          isCurrent &&
            "bg-primary/5 border-primary/30 ring-primary/20 cursor-default ring-1",
        )}
      >
        {/* Top Line: Name, Visibility & Stats */}
        <div className="flex w-full min-w-0 items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
            <RepoIcon
              owner={repo.owner.login}
              repo={repo.name}
              branch={repo.defaultBranch}
              ownerAvatarUrl={repo.owner.avatarUrl}
              className="h-4.5 w-4.5 shrink-0 sm:h-5 sm:w-5"
              iconClassName="h-full w-full object-contain"
              fallbackIcon={
                <FolderGit2 className="text-primary h-4 w-4 shrink-0" />
              }
            />

            <span className="text-foreground group-hover:text-primary min-w-0 truncate text-xs font-semibold tracking-tight transition-colors sm:text-sm">
              {repo.name}
            </span>

            <Badge
              variant="outline"
              className={cn(
                "h-4.5 shrink-0 gap-1 px-1.5 text-[9px] font-medium sm:h-5 sm:text-[10px]",
                repo.private
                  ? "border-amber-500/30 bg-amber-500/10 text-amber-500"
                  : "border-border/80 text-muted-foreground",
              )}
            >
              {repo.private ? (
                <Lock className="h-2.5 w-2.5" />
              ) : (
                <Globe className="h-2.5 w-2.5 opacity-70" />
              )}
              <span className="hidden sm:inline">
                {repo.private ? "Private" : "Public"}
              </span>
            </Badge>

            {isCurrent && !hideActiveBadge && (
              <Badge
                variant="secondary"
                className="bg-primary/15 text-primary border-primary/20 h-4.5 shrink-0 border px-1.5 text-[8px] font-bold tracking-wider uppercase sm:h-5 sm:text-[9px]"
              >
                Active
              </Badge>
            )}
          </div>

          {/* Stars & Forks Badges */}
          <div className="text-muted-foreground flex shrink-0 items-center gap-1 text-xs sm:gap-1.5">
            <div className="bg-muted/40 border-border/60 flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px] sm:text-[11px]">
              <Star className="text-muted-foreground h-2.5 w-2.5 sm:h-3 sm:w-3" />
              <span>{repo.stargazersCount?.toLocaleString() || 0}</span>
            </div>
            {repo.forksCount !== undefined && repo.forksCount > 0 && (
              <div className="bg-muted/40 border-border/60 hidden items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px] sm:flex sm:text-[11px]">
                <GitFork className="text-muted-foreground h-2.5 w-2.5 sm:h-3 sm:w-3" />
                <span>{repo.forksCount?.toLocaleString() || 0}</span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        {repo.description && (
          <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed break-words">
            {repo.description}
          </p>
        )}

        {/* Metadata Footer: Language, Updated Time & Branch */}
        <div className="text-muted-foreground border-border/40 flex min-w-0 items-center justify-between gap-2 border-t pt-1 text-[10px] sm:text-[11px]">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            {repo.language && (
              <div className="flex shrink-0 items-center gap-1 font-medium">
                <span
                  className="ring-border/50 h-2 w-2 rounded-full ring-1"
                  style={{ backgroundColor: languageColor || undefined }}
                />
                <span className="text-foreground/90">{repo.language}</span>
              </div>
            )}
            <span className="text-muted-foreground/80 truncate font-mono">
              Updated {updatedAgo}
            </span>
          </div>

          {!hideBranchBadge && (
            <div className="bg-muted/30 border-border/50 flex shrink-0 items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[9px] sm:text-[10px]">
              <GitBranch className="text-primary h-2.5 w-2.5 shrink-0" />
              <span className="max-w-20 truncate sm:max-w-28">
                {activeBranch || repo.defaultBranch}
              </span>
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

export function RepoItemSkeleton() {
  return (
    <div className="border-border/60 bg-card/40 flex flex-col gap-2 rounded-xl border p-3.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-7 w-7 rounded-lg" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-14" />
        </div>
        <Skeleton className="h-4 w-16" />
      </div>
      <Skeleton className="h-3 w-3/4" />
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}
