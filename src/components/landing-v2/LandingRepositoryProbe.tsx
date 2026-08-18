"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, FolderSearch, LoaderCircle } from "lucide-react";
import { requestJson } from "@/lib/swr/fetcher";
import styles from "./LandingV2Page.module.css";

const EXAMPLES = [
  { label: "Next.js", value: "vercel/next.js" },
  { label: "React", value: "facebook/react" },
  { label: "shadcn/ui", value: "shadcn-ui/ui" },
];

function parseGitHubReference(value: string) {
  const trimmed = value.trim().replace(/\/$/, "");
  const normalized = trimmed.replace(/^https?:\/\/github\.com\//i, "");
  const parts = normalized.split("/").filter(Boolean);
  if (parts.length < 2) return null;

  const owner = parts[0];
  const repo = parts[1]?.replace(/\.git$/, "");
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

export function LandingRepositoryProbe() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const openRepository = async (
    owner: string,
    repo: string,
    branch?: string | null,
    path?: string,
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      let resolvedBranch = branch;
      if (!resolvedBranch) {
        try {
          const result = await requestJson<{ defaultBranch: string }>(
            `/api/github/branches?${new URLSearchParams({ owner, repo })}`,
          );
          resolvedBranch = result.defaultBranch || "main";
        } catch {
          resolvedBranch = "main";
        }
      }

      const params = new URLSearchParams({
        owner,
        repo,
        ref: resolvedBranch,
      });
      if (path) params.set("path", path);
      router.push(`/repositories?${params.toString()}`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "The repository could not be opened. Try the URL again.",
      );
      setIsLoading(false);
    }
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed = parseGitHubReference(value);
    if (!parsed) {
      setError("Use owner/repository or paste a GitHub repository URL.");
      return;
    }

    await openRepository(parsed.owner, parsed.repo, parsed.branch, parsed.path);
  };

  return (
    <div className={styles.probeWrap}>
      <form className={styles.probe} onSubmit={submit} aria-busy={isLoading}>
        <div className={styles.probeInputWrap}>
          <FolderSearch aria-hidden="true" size={18} />
          <label className={styles.srOnly} htmlFor="landing-repository">
            GitHub repository URL
          </label>
          <input
            id="landing-repository"
            name="repository"
            type="text"
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              if (error) setError(null);
            }}
            placeholder="vercel/next.js or github.com/owner/repo…"
            autoComplete="off"
            spellCheck={false}
            className={styles.probeInput}
          />
        </div>
        <button
          type="submit"
          className={styles.probeButton}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoaderCircle
                aria-hidden="true"
                size={17}
                className={styles.spin}
              />
              Opening…
            </>
          ) : (
            <>
              Open repository
              <ArrowRight aria-hidden="true" size={17} />
            </>
          )}
        </button>
      </form>

      {error ? (
        <p className={styles.probeError} role="alert" aria-live="polite">
          {error}
        </p>
      ) : null}

      <div className={styles.exampleRow}>
        <span className={styles.exampleLabel}>Try a public repository</span>
        {EXAMPLES.map((example) => {
          const [owner, repo] = example.value.split("/");
          return (
            <button
              key={example.value}
              type="button"
              className={styles.exampleButton}
              disabled={isLoading}
              onClick={() => {
                setValue(example.value);
                void openRepository(owner, repo);
              }}
            >
              <span aria-hidden="true">{owner}/</span>
              {repo}
            </button>
          );
        })}
      </div>
    </div>
  );
}
