"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, GitBranch, Search, X, ChevronLeft } from "lucide-react";
import { RepoListItem } from "./RepoListItem";
import type { Branch, Repo } from "@/types/github";

interface BranchSelectionStepProps {
  selectedRepo: Repo;
  branches: Branch[];
  branchesLoading: boolean;
  onSelectBranch: (branch: string) => void;
  onBack?: () => void;
  onClose?: () => void;
}

export function BranchSelectionStep({
  selectedRepo,
  branches,
  branchesLoading,
  onSelectBranch,
  onBack,
  onClose,
}: BranchSelectionStepProps) {
  const [branchQuery, setBranchQuery] = useState("");

  const filteredBranches = useMemo(() => {
    if (!branchQuery.trim()) return branches;
    const q = branchQuery.toLowerCase();
    return branches.filter((b) => b.name.toLowerCase().includes(q));
  }, [branches, branchQuery]);

  return (
    <div className="bg-background flex min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden overflow-x-hidden">
      {/* Selected Repository Summary Header */}
      <div className="bg-muted/20 w-full max-w-full space-y-2.5 overflow-x-hidden border-b p-3 sm:p-3.5">
        {(onBack || onClose) && (
          <div className="flex items-center justify-between gap-2">
            {onBack ? (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground -ml-1.5 h-7 cursor-pointer gap-1 px-2 text-xs font-medium"
                onClick={onBack}
                title="Back to repositories"
                aria-label="Back to repositories"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Repositories</span>
              </Button>
            ) : (
              <div />
            )}
            {onClose && (
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground hover:text-foreground -mr-1 h-7 w-7 cursor-pointer rounded-md"
                onClick={onClose}
                title="Close (Esc)"
                aria-label="Close branch selector"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
        <RepoListItem repo={selectedRepo} onClick={() => {}} isCurrent />

        {/* Branch Filter Input (if branches exceed 10) */}
        {branches.length > 10 && (
          <div className="relative w-full">
            <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
            <Input
              value={branchQuery}
              onChange={(e) => setBranchQuery(e.target.value)}
              placeholder="Search branches..."
              className="bg-background h-8 w-full pr-7 pl-8 text-xs"
            />
            {branchQuery && (
              <button
                onClick={() => setBranchQuery("")}
                className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2 -translate-y-1/2 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Branches List */}
      <ScrollArea className="min-h-0 w-full max-w-full flex-1" hideHorizontal>
        <div className="w-full max-w-full space-y-1.5 overflow-x-hidden p-3 sm:p-4">
          <div className="text-muted-foreground mb-1 flex items-center justify-between px-1 text-[11px] font-bold tracking-wider uppercase">
            <span>Available Branches</span>
            <span className="font-mono text-[10px]">
              {filteredBranches.length}
            </span>
          </div>

          {branchesLoading ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-2 py-12 text-xs">
              <Loader2 className="text-primary h-5 w-5 animate-spin" />
              <span>Fetching repository branches...</span>
            </div>
          ) : filteredBranches.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center text-xs">
              No branches matching &quot;{branchQuery}&quot;
            </div>
          ) : (
            filteredBranches.map((b) => {
              const isDefault = b.name === selectedRepo?.defaultBranch;
              return (
                <button
                  key={b.name}
                  type="button"
                  onClick={() => onSelectBranch(b.name)}
                  className="group border-border/60 bg-card/50 hover:bg-accent/70 hover:border-primary/40 flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left shadow-2xs transition-all hover:shadow-xs"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <div className="bg-muted/60 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-colors">
                      <GitBranch className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-foreground group-hover:text-primary truncate font-mono text-xs font-medium transition-colors">
                      {b.name}
                    </span>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {isDefault && (
                      <Badge
                        variant="secondary"
                        className="h-5 px-1.5 py-0 text-[10px] font-bold tracking-wider uppercase"
                      >
                        Default
                      </Badge>
                    )}
                    {b.protected && (
                      <Badge
                        variant="outline"
                        className="h-5 border-amber-500/30 bg-amber-500/10 px-1.5 py-0 font-mono text-[10px] text-amber-500"
                      >
                        Protected
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
