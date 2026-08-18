"use client";

import { useMemo, useState } from "react";
import { GitBranch, Check, Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { Branch } from "@/types/github";

interface BranchSwitcherPillsProps {
  branches?: Branch[];
  branchesLoading?: boolean;
  currentBranch?: string;
  onSelectBranch?: (branch: string) => void;
  className?: string;
}

export function BranchSwitcherPills({
  branches,
  branchesLoading = false,
  currentBranch,
  onSelectBranch,
  className,
}: BranchSwitcherPillsProps) {
  const [query, setQuery] = useState("");

  const filteredBranches = useMemo(() => {
    if (!branches) return [];
    if (!query.trim()) return branches;
    const q = query.toLowerCase();
    return branches.filter((b) => b.name.toLowerCase().includes(q));
  }, [branches, query]);

  if (!branchesLoading && (!branches || branches.length <= 1)) {
    return null;
  }

  const showSearch = Boolean(branches && branches.length > 10);

  return (
    <div
      className={cn(
        "border-border/80 bg-background/80 w-full max-w-full space-y-2 overflow-x-hidden rounded-xl border p-2.5",
        className,
      )}
    >
      <div className="text-muted-foreground flex items-center justify-between text-[11px]">
        <span className="text-foreground flex items-center gap-1 font-semibold">
          <GitBranch className="text-primary h-3 w-3" /> Switch Branch
        </span>
        <span className="text-[10px]">
          {branches ? (
            <>
              <span className="font-mono">
                {query.trim()
                  ? `${filteredBranches.length} / ${branches.length}`
                  : branches.length}
              </span>{" "}
              {branches.length === 1 ? "branch" : "branches"}
            </>
          ) : (
            ""
          )}
        </span>
      </div>

      {showSearch && (
        <div className="relative w-full">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 h-3 w-3 -translate-y-1/2" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search branches..."
            className="bg-muted/40 h-7 w-full pr-7 pl-7 text-[11px]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-1.5 -translate-y-1/2 cursor-pointer rounded-xs p-0.5"
              title="Clear search"
              aria-label="Clear branch search"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}

      <ScrollArea
        className="max-h-28 w-full"
        viewportClassName="max-h-28"
        hideHorizontal
        scrollShadow="vertical"
        shadowSize={16}
      >
        <div className="flex flex-wrap gap-1.5 pr-1">
          {branchesLoading ? (
            <div className="text-muted-foreground flex w-full items-center justify-center gap-1.5 py-2 text-xs">
              <Loader2 className="text-primary h-3.5 w-3.5 animate-spin" />
              <span>Loading branches...</span>
            </div>
          ) : filteredBranches.length === 0 ? (
            <div className="text-muted-foreground w-full py-2 text-center text-xs">
              No branches matching &quot;{query}&quot;
            </div>
          ) : (
            filteredBranches.map((b) => {
              const isSelected = b.name === currentBranch;
              return (
                <button
                  key={b.name}
                  type="button"
                  onClick={() => onSelectBranch?.(b.name)}
                  title={b.name}
                  className={cn(
                    "flex max-w-full min-w-0 cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-xs transition-all",
                    isSelected
                      ? "bg-primary text-primary-foreground border-primary font-semibold shadow-xs"
                      : "bg-background hover:bg-muted/80 text-muted-foreground hover:text-foreground border-border/80",
                  )}
                >
                  <GitBranch className="h-3 w-3 shrink-0" />
                  <span className="min-w-0 truncate">{b.name}</span>
                  {isSelected && (
                    <Check className="ml-0.5 h-3 w-3 shrink-0 stroke-[2.5]" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
