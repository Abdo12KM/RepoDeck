"use client";

import React, { useState, useEffect } from "react";
import { FolderGit2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Global in-memory cache of resolved working favicon URLs and failed repos
const resolvedFaviconCache = new Map<string, string>();
const failedFaviconCache = new Set<string>();
const inFlightResolutions = new Map<string, Promise<string | null>>();

const STORAGE_KEY = "repodeck:favicon-cache:v1";

function loadPersistentCache(): void {
  if (typeof window === "undefined" || typeof localStorage === "undefined")
    return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<
      string,
      { url: string; timestamp: number }
    >;
    const now = Date.now();
    const TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
    for (const [key, entry] of Object.entries(parsed)) {
      if (entry && entry.url && now - entry.timestamp < TTL) {
        resolvedFaviconCache.set(key, entry.url);
      }
    }
  } catch {
    // Ignore storage parse errors
  }
}

function savePersistentCache(): void {
  if (typeof window === "undefined" || typeof localStorage === "undefined")
    return;
  try {
    const now = Date.now();
    const data: Record<string, { url: string; timestamp: number }> = {};
    let count = 0;
    for (const [key, url] of resolvedFaviconCache.entries()) {
      if (count++ >= 200) break;
      data[key] = { url, timestamp: now };
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Ignore storage quota errors
  }
}

// Preload persistent cache on client
if (typeof window !== "undefined") {
  loadPersistentCache();
}

/**
 * Probes an image URL off-screen using the browser Image constructor.
 * Returns true if the image successfully loads, false on error or timeout.
 */
function probeImage(url: string, timeoutMs = 4000): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof Image === "undefined") {
      resolve(false);
      return;
    }

    const img = new Image();
    let settled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const cleanup = () => {
      if (timer) clearTimeout(timer);
      img.onload = null;
      img.onerror = null;
    };

    img.onload = () => {
      if (!settled) {
        settled = true;
        cleanup();
        resolve(true);
      }
    };

    img.onerror = () => {
      if (!settled) {
        settled = true;
        cleanup();
        resolve(false);
      }
    };

    timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        cleanup();
        resolve(false);
      }
    }, timeoutMs);

    img.src = url;

    // If already complete and loaded in cache
    if (img.complete && img.naturalWidth > 0) {
      settled = true;
      cleanup();
      resolve(true);
    }
  });
}

/**
 * Probes a tier of URLs in parallel and returns the first matching URL in priority order.
 */
async function probeUrlTier(urls: string[]): Promise<string | null> {
  const results = await Promise.all(
    urls.map(async (url) => {
      const ok = await probeImage(url);
      return { url, ok };
    }),
  );
  const match = results.find((r) => r.ok);
  return match ? match.url : null;
}

/**
 * Extracts potential icon paths from source code such as Next.js metadata,
 * HTML link tags, or Web App Manifests.
 */
export function extractIconPathsFromCode(text: string): string[] {
  if (!text) return [];
  const paths = new Set<string>();

  // 1. Next.js metadata icons block (icons: { ... } or icons: [ ... ])
  const iconsBlockMatches = text.matchAll(/icons\s*:\s*([{\[][\s\S]*?[}\]])/gi);
  for (const blockMatch of iconsBlockMatches) {
    const blockContent = blockMatch[1];
    const stringMatches = blockContent.matchAll(
      /["'`]([^"'`\s]+?\.(?:png|ico|svg|webp|jpg|jpeg|gif|avif)(?:\?.*)?)["'`]/gi,
    );
    for (const strMatch of stringMatches) {
      if (strMatch[1]) paths.add(strMatch[1].trim());
    }
  }

  // 2. Direct key matches: icon, url, shortcut, apple, icons, href
  const keyMatches = text.matchAll(
    /(?:icon|url|shortcut|apple|icons|href)\s*:\s*["'`]([^"'`\s]+?)["'`]/gi,
  );
  for (const match of keyMatches) {
    const candidate = match[1]?.trim();
    if (!candidate || candidate === "/" || candidate === "./") continue;
    if (
      /\.(?:png|ico|svg|webp|jpg|jpeg|gif|avif)(?:\?.*)?$/i.test(candidate) ||
      candidate.startsWith("/") ||
      candidate.startsWith("./") ||
      candidate.startsWith("http://") ||
      candidate.startsWith("https://")
    ) {
      paths.add(candidate);
    }
  }

  // 3. Match keys wrapped in helper functions, e.g. icon: absoluteUrl("/brackets-gray.png")
  const funcWrappedMatches = text.matchAll(
    /(?:icon|url|shortcut|apple)\s*:\s*[a-zA-Z0-9_$]+\(\s*["'`]([^"'`\s]+?)["'`]\s*\)/gi,
  );
  for (const match of funcWrappedMatches) {
    const candidate = match[1]?.trim();
    if (candidate && candidate !== "/" && candidate !== "./") {
      paths.add(candidate);
    }
  }

  // 4. Match HTML <link ...> tags with icon relations
  const linkMatches = text.matchAll(
    /<link[^>]+?href=["'`]([^"'`\s]+?)["'`][^>]*?>/gi,
  );
  for (const match of linkMatches) {
    const fullTag = match[0].toLowerCase();
    if (
      fullTag.includes("icon") ||
      fullTag.includes("shortcut") ||
      fullTag.includes("apple-touch") ||
      fullTag.includes("mask-icon")
    ) {
      if (match[1]) paths.add(match[1].trim());
    }
  }

  // 5. Match reverse order <link ... rel="icon">
  const relMatches = text.matchAll(
    /<link[^>]+?(?:rel=["'`](?:shortcut )?icon["'`]|rel=["'`]apple-touch-icon["'`])[^>]+?href=["'`]([^"'`\s]+?)["'`]/gi,
  );
  for (const match of relMatches) {
    if (match[1]) paths.add(match[1].trim());
  }

  // 6. Web App Manifest "src": "..."
  const manifestMatches = text.matchAll(/"src"\s*:\s*["'`]([^"'`\s]+?)["'`]/gi);
  for (const match of manifestMatches) {
    const candidate = match[1]?.trim();
    if (
      candidate &&
      candidate !== "/" &&
      candidate !== "./" &&
      (/\.(?:png|ico|svg|webp|jpg|jpeg|gif|avif)(?:\?.*)?$/i.test(candidate) ||
        candidate.startsWith("/") ||
        candidate.startsWith("./"))
    ) {
      paths.add(candidate);
    }
  }

  return Array.from(paths);
}

/**
 * Attempts to fetch layout, index, or manifest files from raw GitHub content (or local API for private repos)
 * and extract custom configured icon paths (e.g. Next.js `icons: { icon: "/brackets-gray.png" }`).
 */
async function fetchAndExtractDynamicIcons(
  owner: string,
  repo: string,
  branch = "main",
): Promise<{ candidateUrls: string[]; extractedNames: string[] }> {
  if (typeof fetch === "undefined")
    return { candidateUrls: [], extractedNames: [] };

  const branches = Array.from(
    new Set(
      [branch, branch === "main" ? "master" : "main", "HEAD"].filter(Boolean),
    ),
  );

  const layoutRelativePaths = [
    "src/app/layout.tsx",
    "app/layout.tsx",
    "src/app/layout.jsx",
    "app/layout.jsx",
    "src/app/layout.js",
    "app/layout.js",
    "src/app/(site)/layout.tsx",
    "src/app/(main)/layout.tsx",
    "src/app/(portfolio)/layout.tsx",
    "app/(site)/layout.tsx",
    "app/(main)/layout.tsx",
    "app/(portfolio)/layout.tsx",
    "src/app/[locale]/layout.tsx",
    "app/[locale]/layout.tsx",
    "src/routes/__root.tsx",
    "app/root.tsx",
    "pages/_app.tsx",
    "pages/_document.tsx",
    "src/pages/_app.tsx",
    "src/pages/_document.tsx",
    "index.html",
    "public/index.html",
    "public/manifest.json",
    "src/app/manifest.json",
    "app/manifest.json",
  ];

  // Try raw GitHub CDN first
  const fetchTasks: { url: string; isApi: boolean }[] = [];

  for (const b of branches) {
    const baseRaw = `https://raw.githubusercontent.com/${owner}/${repo}/${b}`;
    for (const relPath of layoutRelativePaths.slice(0, 10)) {
      fetchTasks.push({ url: `${baseRaw}/${relPath}`, isApi: false });
    }
  }

  // Also include internal authenticated API route (enables private repos to resolve icons)
  if (typeof window !== "undefined") {
    fetchTasks.push(
      {
        url: `/api/github/file?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&path=src/app/layout.tsx&ref=${encodeURIComponent(branch)}&raw=true`,
        isApi: true,
      },
      {
        url: `/api/github/file?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&path=app/layout.tsx&ref=${encodeURIComponent(branch)}&raw=true`,
        isApi: true,
      },
      {
        url: `/api/github/file?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&path=index.html&ref=${encodeURIComponent(branch)}&raw=true`,
        isApi: true,
      },
    );
  }

  try {
    const results = await Promise.all(
      fetchTasks.map(async (task) => {
        try {
          const controller =
            typeof AbortController !== "undefined"
              ? new AbortController()
              : null;
          const timeoutId = controller
            ? setTimeout(() => controller.abort(), 2000)
            : null;

          const res = await fetch(task.url, {
            signal: controller?.signal,
            headers: task.isApi ? undefined : { Accept: "text/plain" },
          });

          if (timeoutId) clearTimeout(timeoutId);
          if (!res.ok) return null;
          return await res.text();
        } catch {
          return null;
        }
      }),
    );

    const extractedCandidates: string[] = [];
    const extractedNames: string[] = [];

    for (const text of results) {
      if (!text) continue;
      const paths = extractIconPathsFromCode(text);
      for (const rawPath of paths) {
        if (
          rawPath.startsWith("http://") ||
          rawPath.startsWith("https://") ||
          rawPath.startsWith("data:")
        ) {
          extractedCandidates.push(rawPath);
          continue;
        }

        const clean = rawPath.replace(/^\.?\//, "");
        if (!clean) continue;
        const basename = clean.split("/").pop() || clean;
        extractedNames.push(clean, basename);

        const assetSubpaths = [
          `public/${clean}`,
          clean,
          `src/app/${clean}`,
          `app/${clean}`,
          `public/${basename}`,
          basename,
          `public/icons/${basename}`,
          `public/images/${basename}`,
          `public/assets/${basename}`,
          `src/app/${basename}`,
          `app/${basename}`,
          `static/${basename}`,
          `src/${basename}`,
          `assets/${basename}`,
          `images/${basename}`,
        ];

        for (const b of branches) {
          const baseRaw = `https://raw.githubusercontent.com/${owner}/${repo}/${b}`;
          for (const sub of assetSubpaths) {
            extractedCandidates.push(`${baseRaw}/${sub}`);
          }
        }

        // For private repositories, also generate /api/github/file URLs
        if (typeof window !== "undefined") {
          for (const sub of assetSubpaths) {
            extractedCandidates.push(
              `/api/github/file?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&path=${encodeURIComponent(sub)}&ref=${encodeURIComponent(branch)}&raw=true`,
            );
          }
        }
      }
    }

    return {
      candidateUrls: Array.from(new Set(extractedCandidates)),
      extractedNames: Array.from(new Set(extractedNames)),
    };
  } catch {
    return { candidateUrls: [], extractedNames: [] };
  }
}

/**
 * Searches the repository file tree for target icon filenames or any favicon/logo in the project.
 */
async function findIconFromRepoTree(
  owner: string,
  repo: string,
  branch = "main",
  targetFilenames: string[] = [],
): Promise<string[]> {
  if (typeof fetch === "undefined" || typeof window === "undefined") return [];

  try {
    const controller =
      typeof AbortController !== "undefined" ? new AbortController() : null;
    const timeoutId = controller
      ? setTimeout(() => controller.abort(), 3000)
      : null;

    const res = await fetch(
      `/api/github/tree?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&branch=${encodeURIComponent(branch)}`,
      { signal: controller?.signal },
    );

    if (timeoutId) clearTimeout(timeoutId);
    if (!res.ok) return [];

    const data = (await res.json()) as {
      tree?: { path: string; type: string }[];
    };
    if (!data?.tree || !Array.isArray(data.tree)) return [];

    const blobs = data.tree.filter((item) => item.type === "blob");
    const candidates: string[] = [];

    const cleanTargets = targetFilenames
      .map((t) =>
        t
          .replace(/^\.?\//, "")
          .split("/")
          .pop()
          ?.toLowerCase(),
      )
      .filter(Boolean) as string[];

    // 1. Check for matches against target filenames extracted from layout (e.g. brackets-gray.png)
    for (const target of cleanTargets) {
      for (const item of blobs) {
        const filename = item.path.split("/").pop()?.toLowerCase();
        if (filename === target) {
          candidates.push(
            `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`,
            `/api/github/file?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&path=${encodeURIComponent(item.path)}&ref=${encodeURIComponent(branch)}&raw=true`,
          );
        }
      }
    }

    // 2. Check for any favicon, icon, or logo anywhere in the tree
    for (const item of blobs) {
      const lower = item.path.toLowerCase();
      const filename = item.path.split("/").pop()?.toLowerCase() || "";

      if (
        filename.startsWith("favicon.") ||
        filename.startsWith("apple-icon.") ||
        filename.startsWith("apple-touch-icon.") ||
        filename.startsWith("icon.") ||
        filename.startsWith("logo.") ||
        lower.includes("favicon") ||
        lower.includes("app-icon")
      ) {
        if (/\.(png|ico|svg|webp|jpg|jpeg|gif|avif)$/i.test(filename)) {
          candidates.push(
            `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${item.path}`,
            `/api/github/file?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}&path=${encodeURIComponent(item.path)}&ref=${encodeURIComponent(branch)}&raw=true`,
          );
        }
      }
    }

    return Array.from(new Set(candidates));
  } catch {
    return [];
  }
}

/**
 * Resolves the best available repository icon URL through prioritized tiers.
 * Deduplicates in-flight requests and caches resolved or failed URLs globally.
 */
export function resolveRepoIcon(
  owner: string,
  repo: string,
  branch = "main",
  ownerAvatarUrl?: string,
): Promise<string | null> {
  if (!owner || !repo) return Promise.resolve(null);

  const cacheKey = `${owner}/${repo}`;

  if (resolvedFaviconCache.has(cacheKey)) {
    return Promise.resolve(resolvedFaviconCache.get(cacheKey)!);
  }
  if (failedFaviconCache.has(cacheKey)) {
    return Promise.resolve(null);
  }
  if (inFlightResolutions.has(cacheKey)) {
    return inFlightResolutions.get(cacheKey)!;
  }

  const baseRaw = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}`;

  // Tier 1: Standard static roots & favicons (highest probability for web apps)
  const tier1 = [
    `${baseRaw}/public/favicon.ico`,
    `${baseRaw}/public/favicon.svg`,
    `${baseRaw}/public/favicon.png`,
    `${baseRaw}/favicon.ico`,
    `${baseRaw}/favicon.png`,
  ];

  // Tier 2: Next.js App Router / Vite / Remix paths
  const tier2 = [
    `${baseRaw}/src/app/favicon.ico`,
    `${baseRaw}/src/app/icon.png`,
    `${baseRaw}/src/app/icon.svg`,
    `${baseRaw}/app/favicon.ico`,
    `${baseRaw}/app/icon.png`,
    `${baseRaw}/app/icon.svg`,
    `${baseRaw}/public/icon.svg`,
    `${baseRaw}/public/icon.png`,
    `${baseRaw}/src/favicon.ico`,
    `${baseRaw}/static/favicon.ico`,
  ];

  // Tier 3: Logos and brand assets
  const tier3 = [
    `${baseRaw}/public/logo.svg`,
    `${baseRaw}/public/logo.png`,
    `${baseRaw}/logo.svg`,
    `${baseRaw}/logo.png`,
    `${baseRaw}/assets/logo.svg`,
    `${baseRaw}/assets/logo.png`,
  ];

  // Fallback Tier: GitHub Owner Avatar fallback
  const ownerAvatarTier = [
    ownerAvatarUrl || `https://github.com/${owner}.png?size=64`,
  ];

  const promise = (async () => {
    try {
      // Check tier 1 in parallel
      const t1Match = await probeUrlTier(tier1);
      if (t1Match) {
        resolvedFaviconCache.set(cacheKey, t1Match);
        savePersistentCache();
        return t1Match;
      }

      // Check tier 2 in parallel
      const t2Match = await probeUrlTier(tier2);
      if (t2Match) {
        resolvedFaviconCache.set(cacheKey, t2Match);
        savePersistentCache();
        return t2Match;
      }

      // Check tier 3 in parallel
      const t3Match = await probeUrlTier(tier3);
      if (t3Match) {
        resolvedFaviconCache.set(cacheKey, t3Match);
        savePersistentCache();
        return t3Match;
      }

      // Check tier 4: Dynamic parsing of layout.tsx, index.html, manifest.json
      const dynamicResult = await fetchAndExtractDynamicIcons(
        owner,
        repo,
        branch,
      );
      if (dynamicResult.candidateUrls.length > 0) {
        const dynamicMatch = await probeUrlTier(dynamicResult.candidateUrls);
        if (dynamicMatch) {
          resolvedFaviconCache.set(cacheKey, dynamicMatch);
          savePersistentCache();
          return dynamicMatch;
        }
      }

      // Check tier 5: Deep tree search if custom icon is in a nested subdirectory
      const treeCandidates = await findIconFromRepoTree(
        owner,
        repo,
        branch,
        dynamicResult.extractedNames,
      );
      if (treeCandidates.length > 0) {
        const treeMatch = await probeUrlTier(treeCandidates);
        if (treeMatch) {
          resolvedFaviconCache.set(cacheKey, treeMatch);
          savePersistentCache();
          return treeMatch;
        }
      }

      // Fallback to GitHub Owner Avatar
      const avatarMatch = await probeUrlTier(ownerAvatarTier);
      if (avatarMatch) {
        resolvedFaviconCache.set(cacheKey, avatarMatch);
        savePersistentCache();
        return avatarMatch;
      }

      // If all fail
      failedFaviconCache.add(cacheKey);
      return null;
    } catch {
      failedFaviconCache.add(cacheKey);
      return null;
    } finally {
      inFlightResolutions.delete(cacheKey);
    }
  })();

  inFlightResolutions.set(cacheKey, promise);
  return promise;
}

export function clearRepoIconCache() {
  resolvedFaviconCache.clear();
  failedFaviconCache.clear();
  inFlightResolutions.clear();
  if (typeof localStorage !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }
}

interface RepoIconProps {
  owner: string;
  repo: string;
  branch?: string;
  ownerAvatarUrl?: string;
  className?: string;
  iconClassName?: string;
  fallbackIcon?: React.ReactNode;
}

export function RepoIcon({
  owner,
  repo,
  branch = "main",
  ownerAvatarUrl,
  className,
  iconClassName = "h-3.5 w-3.5",
  fallbackIcon,
}: RepoIconProps) {
  const cacheKey = `${owner}/${repo}`;

  // Keep initial state identical between SSR and initial client hydration to prevent mismatch
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);
  const [isFailed, setIsFailed] = useState<boolean>(false);
  const [isImgLoaded, setIsImgLoaded] = useState<boolean>(false);

  useEffect(() => {
    let isCurrent = true;

    if (!owner || !repo) {
      setResolvedUrl(null);
      setIsFailed(true);
      setIsImgLoaded(false);
      return;
    }

    const cached = resolvedFaviconCache.get(cacheKey);
    if (cached) {
      setResolvedUrl(cached);
      setIsFailed(false);
      setIsImgLoaded(true);
      return;
    }

    if (failedFaviconCache.has(cacheKey)) {
      setResolvedUrl(null);
      setIsFailed(true);
      setIsImgLoaded(false);
      return;
    }

    setResolvedUrl(null);
    setIsFailed(false);
    setIsImgLoaded(false);

    resolveRepoIcon(owner, repo, branch, ownerAvatarUrl).then((url) => {
      if (!isCurrent) return;
      if (url) {
        setResolvedUrl(url);
        setIsFailed(false);
      } else {
        setResolvedUrl(null);
        setIsFailed(true);
      }
    });

    return () => {
      isCurrent = false;
    };
  }, [cacheKey, owner, repo, branch, ownerAvatarUrl]);

  // If permanently failed or no resolved URL yet, show fallback icon without rendering unverified <img>
  if (isFailed || !resolvedUrl) {
    return (
      <div
        className={cn("flex shrink-0 items-center justify-center", className)}
      >
        {fallbackIcon || (
          <FolderGit2
            className={cn("text-primary shrink-0", iconClassName || "h-4 w-4")}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden",
        className,
      )}
    >
      {/* Fallback displayed underneath while image is decoding or fading in */}
      {!isImgLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          {fallbackIcon || (
            <FolderGit2
              className={cn(
                "text-primary shrink-0 opacity-50",
                iconClassName || "h-4 w-4",
              )}
            />
          )}
        </div>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolvedUrl}
        alt={`${repo} icon`}
        loading="lazy"
        onLoad={() => setIsImgLoaded(true)}
        onError={() => {
          // If the image fails to render in DOM despite probe, fallback safely
          failedFaviconCache.add(cacheKey);
          resolvedFaviconCache.delete(cacheKey);
          setResolvedUrl(null);
          setIsFailed(true);
        }}
        className={cn(
          "object-contain transition-opacity duration-200",
          isImgLoaded ? "opacity-100" : "opacity-0",
          iconClassName,
        )}
      />
    </div>
  );
}
