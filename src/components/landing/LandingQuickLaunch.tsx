"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Github, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RepoIcon } from "@/components/repo/RepoIcon";
import { requestJson } from "@/lib/swr/fetcher";

const POPULAR_REPOS = [
  { name: "vercel/next.js", label: "Next.js", stars: "128k" },
  { name: "facebook/react", label: "React", stars: "230k" },
  { name: "shadcn-ui/ui", label: "shadcn/ui", stars: "75k" },
  { name: "tailwindlabs/tailwindcss", label: "Tailwind CSS", stars: "85k" },
  { name: "lucide-icons/lucide", label: "Lucide", stars: "15k" },
  { name: "shikijs/shiki", label: "Shiki", stars: "9k" },
];

function parseGitHubUrl(value: string) {
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

  return { owner, repo, branch: null, path: undefined };
}

export function LandingQuickLaunch() {
  const router = useRouter();
  const [inputVal, setInputVal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLaunchRepo = async (
    owner: string,
    repo: string,
    branch?: string | null,
    path?: string,
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      let activeBranch = branch;
      if (!activeBranch) {
        try {
          const res = await requestJson<{ defaultBranch: string }>(
            `/api/github/branches?${new URLSearchParams({ owner, repo })}`,
          );
          activeBranch = res.defaultBranch || "main";
        } catch {
          activeBranch = "main";
        }
      }

      const params = new URLSearchParams({
        owner,
        repo,
        ref: activeBranch,
      });
      if (path) {
        params.set("path", path);
      }

      router.push(`/repositories?${params.toString()}`);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to open repository.",
      );
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const parsed = parseGitHubUrl(inputVal);
    if (!parsed) {
      setError(
        "Please enter a valid GitHub URL or owner/repository (e.g. vercel/next.js)",
      );
      return;
    }

    await handleLaunchRepo(
      parsed.owner,
      parsed.repo,
      parsed.branch,
      parsed.path,
    );
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      {/* Quick search input */}
      <form
        onSubmit={handleSubmit}
        className="bg-card border-border/80 shadow-primary/5 focus-within:border-primary/50 focus-within:ring-primary/10 relative flex flex-col items-stretch gap-2 rounded-2xl border p-1.5 shadow-2xl transition-all focus-within:ring-4 sm:flex-row sm:items-center"
      >
        <div className="relative flex flex-1 items-center pl-3">
          <Github className="text-muted-foreground h-5 w-5 shrink-0" />
          <Input
            value={inputVal}
            onChange={(e) => {
              setInputVal(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Paste any GitHub URL (e.g. vercel/next.js or github.com/facebook/react)"
            className="text-foreground placeholder:text-muted-foreground/70 h-11 border-0 bg-transparent px-3 text-sm shadow-none focus-visible:ring-0"
            aria-label="GitHub repository URL"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading || !inputVal.trim()}
          className="h-11 shrink-0 gap-2 rounded-xl px-6 text-sm font-medium shadow-md"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Opening...</span>
            </>
          ) : (
            <>
              <span>Explore Code</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      {/* Error feedback */}
      {error && (
        <div className="bg-destructive/10 border-destructive/20 text-destructive animate-in fade-in-50 mt-2.5 flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs">
          <span>{error}</span>
        </div>
      )}

      {/* Popular preset repositories pills */}
      <div className="text-muted-foreground mt-4 flex flex-wrap items-center justify-center gap-1.5 text-xs">
        <span className="text-foreground/80 mr-1 flex items-center gap-1 font-medium">
          <Sparkles className="text-primary h-3.5 w-3.5" /> Try popular:
        </span>
        {POPULAR_REPOS.map((item) => {
          const [owner, repo] = item.name.split("/");
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => {
                setInputVal(item.name);
                handleLaunchRepo(owner, repo);
              }}
              disabled={isLoading}
              className="group border-border/60 bg-muted/40 hover:bg-muted text-foreground/90 hover:border-primary/40 hover:text-primary inline-flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] font-medium shadow-2xs transition-all active:scale-95"
            >
              <RepoIcon
                owner={owner}
                repo={repo}
                className="h-3.5 w-3.5 shrink-0"
                iconClassName="h-full w-full object-contain"
              />
              <span>{item.label}</span>
              <Badge
                variant="secondary"
                className="text-muted-foreground group-hover:text-primary px-1 py-0 font-mono text-[9px]"
              >
                ★ {item.stars}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}
