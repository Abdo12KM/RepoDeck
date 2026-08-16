"use client";

import { useState } from "react";
import { ArrowRight, Link2, Loader2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requestJson } from "@/lib/swr/fetcher";

interface PublicRepositoryFormProps {
  onOpen: (owner: string, repo: string, branch: string, path?: string) => void;
  onClose?: () => void;
}

const PRESET_REPOS = [
  { name: "shadcn-ui/ui", label: "shadcn/ui" },
  { name: "vercel/next.js", label: "Next.js" },
  { name: "facebook/react", label: "React" },
  { name: "tailwindlabs/tailwindcss", label: "Tailwind" },
];

function parseGitHubReference(value: string) {
  const trimmed = value.trim().replace(/\/$/, "");
  const normalized = trimmed.replace(/^https?:\/\/github\.com\//i, "");
  const parts = normalized.split("/").filter(Boolean);
  if (parts.length < 2) return null;

  const owner = parts[0];
  const repo = parts[1].replace(/\.git$/, "");
  if (!owner || !repo) return null;

  if ((parts[2] === "blob" || parts[2] === "tree") && parts[3]) {
    return {
      owner,
      repo,
      branch: parts[3],
      path: parts.slice(4).join("/") || undefined,
    };
  }

  return { owner, repo, branch: "main" };
}

export function PublicRepositoryForm({ onOpen, onClose }: PublicRepositoryFormProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenRepo = async (
    owner: string,
    repo: string,
    branch?: string,
    path?: string,
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      let resolvedBranch = branch;
      if (!resolvedBranch || resolvedBranch === "main") {
        try {
          const result = await requestJson<{ defaultBranch: string }>(
            `/api/github/branches?${new URLSearchParams({ owner, repo })}`,
          );
          resolvedBranch = result.defaultBranch || "main";
        } catch {
          resolvedBranch = "main";
        }
      }
      onOpen(owner, repo, resolvedBranch, path);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Repository could not be opened.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const parsed = parseGitHubReference(value);
    if (!parsed) {
      setError(
        "Paste a GitHub repository URL (e.g. github.com/owner/repo) or owner/repo.",
      );
      return;
    }

    await handleOpenRepo(parsed.owner, parsed.repo, parsed.branch, parsed.path);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-muted/20 border-b p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Link2 className="text-primary h-4 w-4" />
          Open any public repository
        </div>
        {onClose && (
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground hover:text-foreground -mr-1 h-7 w-7 cursor-pointer rounded-md"
            onClick={onClose}
            title="Close (Esc)"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
        Paste any GitHub URL (supports tree and file URLs) to browse code
        immediately.
      </p>

      <div className="mt-3 flex gap-2">
        <Input
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (error) setError(null);
          }}
          placeholder="e.g. vercel/next.js or github.com/facebook/react"
          aria-label="Public GitHub repository URL"
          className="bg-background h-9 text-xs"
        />
        <Button
          type="submit"
          size="sm"
          disabled={isLoading || !value.trim()}
          className="h-9 shrink-0 gap-1.5 px-3"
          aria-label="Open repository"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span>Open</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </Button>
      </div>

      {error && (
        <p className="text-destructive mt-2 text-xs font-medium">{error}</p>
      )}

      {/* Quick Pick Popular Repositories */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-muted-foreground mr-1 flex items-center gap-1 text-[11px] font-medium">
          <Sparkles className="text-primary h-3 w-3" /> Popular:
        </span>
        {PRESET_REPOS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => {
              setValue(preset.name);
              const [owner, repo] = preset.name.split("/");
              handleOpenRepo(owner, repo);
            }}
            disabled={isLoading}
            className="border-border/80 bg-background/80 hover:bg-muted text-muted-foreground hover:text-foreground inline-flex cursor-pointer items-center rounded-md border px-2 py-0.5 font-mono text-[11px] transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </form>
  );
}
