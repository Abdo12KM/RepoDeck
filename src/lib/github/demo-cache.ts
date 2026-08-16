import { and, eq } from "drizzle-orm";
import type { Octokit } from "@octokit/rest";
import type { FileContent, TreeNode } from "@/types/github";
import { db } from "@/lib/db";
import { githubRepositoryCaches, githubRepositoryFiles } from "@/lib/db/schema";
import { isImageFile } from "@/lib/utils/diff";
import { getFileTree } from "./files";

export const REPODECK_DEMO_REPOSITORY = {
  owner: "Abdo12KM",
  repo: "repodeck",
  ref: "main",
} as const;

const MAX_CACHED_FILE_BYTES = 8 * 1024 * 1024;
const CACHE_BATCH_SIZE = 8;

const BINARY_EXTENSIONS = new Set([
  "7z",
  "avi",
  "bmp",
  "class",
  "dll",
  "dmg",
  "doc",
  "docx",
  "eot",
  "gif",
  "gz",
  "ico",
  "jar",
  "jpeg",
  "jpg",
  "mov",
  "mp3",
  "mp4",
  "otf",
  "pdf",
  "png",
  "psd",
  "tar",
  "ttf",
  "wav",
  "webm",
  "webp",
  "woff",
  "woff2",
  "zip",
]);

export interface CachedDemoFile extends FileContent {
  isBinary: boolean;
}

export function isRepoDeckDemo(owner: string, repo: string): boolean {
  return (
    owner.toLowerCase() === REPODECK_DEMO_REPOSITORY.owner.toLowerCase() &&
    repo.toLowerCase() === REPODECK_DEMO_REPOSITORY.repo.toLowerCase()
  );
}

function isBinaryPath(path: string): boolean {
  const extension = path.split(".").pop()?.toLowerCase() ?? "";
  return isImageFile(path) || BINARY_EXTENSIONS.has(extension);
}

export async function getCachedDemoTree(
  owner: string,
  repo: string,
  ref: string,
): Promise<TreeNode[] | null> {
  const cached = await db.query.githubRepositoryCaches.findFirst({
    where: and(
      eq(githubRepositoryCaches.owner, owner),
      eq(githubRepositoryCaches.repo, repo),
      eq(githubRepositoryCaches.ref, ref),
    ),
  });

  return cached?.tree ?? null;
}

export async function cacheDemoTree(input: {
  owner: string;
  repo: string;
  ref: string;
  tree: TreeNode[];
}) {
  const now = new Date();
  await db
    .insert(githubRepositoryCaches)
    .values({
      owner: input.owner,
      repo: input.repo,
      ref: input.ref,
      tree: input.tree,
      cachedAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [
        githubRepositoryCaches.owner,
        githubRepositoryCaches.repo,
        githubRepositoryCaches.ref,
      ],
      set: {
        tree: input.tree,
        cachedAt: now,
        updatedAt: now,
      },
    });
}

export async function getCachedDemoFile(input: {
  owner: string;
  repo: string;
  ref: string;
  path: string;
}): Promise<CachedDemoFile | null> {
  const cached = await db.query.githubRepositoryFiles.findFirst({
    where: and(
      eq(githubRepositoryFiles.owner, input.owner),
      eq(githubRepositoryFiles.repo, input.repo),
      eq(githubRepositoryFiles.ref, input.ref),
      eq(githubRepositoryFiles.path, input.path),
    ),
  });

  if (!cached) return null;

  return {
    content: cached.content,
    sha: cached.sha,
    encoding: cached.isBinary ? "base64" : "utf-8",
    path: cached.path,
    size: cached.size,
    downloadUrl: cached.downloadUrl ?? undefined,
    isBinary: cached.isBinary,
  };
}

export async function cacheDemoFile(input: {
  owner: string;
  repo: string;
  ref: string;
  path: string;
  sha: string;
  content: string;
  size: number;
  isBinary: boolean;
  downloadUrl?: string;
}) {
  const now = new Date();
  await db
    .insert(githubRepositoryFiles)
    .values({
      owner: input.owner,
      repo: input.repo,
      ref: input.ref,
      path: input.path,
      sha: input.sha,
      content: input.content,
      size: input.size,
      isBinary: input.isBinary,
      downloadUrl: input.downloadUrl ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [
        githubRepositoryFiles.owner,
        githubRepositoryFiles.repo,
        githubRepositoryFiles.ref,
        githubRepositoryFiles.path,
      ],
      set: {
        sha: input.sha,
        content: input.content,
        size: input.size,
        isBinary: input.isBinary,
        downloadUrl: input.downloadUrl ?? null,
        updatedAt: now,
      },
    });
}

export async function cacheRepoDeckSnapshot(
  octokit: Octokit,
  ref: string = REPODECK_DEMO_REPOSITORY.ref,
) {
  const { owner, repo } = REPODECK_DEMO_REPOSITORY;
  const tree = await getFileTree(octokit, owner, repo, ref);
  await cacheDemoTree({ owner, repo, ref, tree });

  const files = tree.filter(
    (item) =>
      item.type === "blob" &&
      item.size !== undefined &&
      item.size <= MAX_CACHED_FILE_BYTES,
  );

  let cachedFiles = 0;
  for (let index = 0; index < files.length; index += CACHE_BATCH_SIZE) {
    const batch = files.slice(index, index + CACHE_BATCH_SIZE);
    await Promise.all(
      batch.map(async (item) => {
        const { data } = await octokit.rest.git.getBlob({
          owner,
          repo,
          file_sha: item.sha,
        });
        const base64Content = data.content.replace(/\s/g, "");
        const isBinary = isBinaryPath(item.path);
        const content = isBinary
          ? base64Content
          : Buffer.from(base64Content, "base64").toString("utf-8");

        await cacheDemoFile({
          owner,
          repo,
          ref,
          path: item.path,
          sha: item.sha,
          content,
          size: item.size ?? Buffer.byteLength(content),
          isBinary,
          downloadUrl: `https://github.com/${owner}/${repo}/raw/${ref}/${item.path}`,
        });
        cachedFiles += 1;
      }),
    );
  }

  return {
    owner,
    repo,
    ref,
    treeEntries: tree.length,
    cachedFiles,
    skippedFiles: tree.filter(
      (item) =>
        item.type === "blob" && (item.size ?? 0) > MAX_CACHED_FILE_BYTES,
    ).length,
  };
}
