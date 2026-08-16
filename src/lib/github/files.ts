/**
 * Read-only GitHub file operations used by the repository viewer.
 */

import type { Octokit } from "@octokit/rest";
import type { TreeNode, FileContent } from "@/types/github";
import { isImageFile } from "../utils/diff";

export async function getFileTree(
  octokit: Octokit,
  owner: string,
  repo: string,
  branch: string,
): Promise<TreeNode[]> {
  const { data } = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: branch,
    recursive: "true",
  });

  if (data.truncated) {
    throw new Error(
      "Repository tree listing was truncated by GitHub. Try a smaller repository or a directory-scoped tree.",
    );
  }

  return data.tree
    .filter((item) => item.path && item.type && item.sha)
    .map((item) => ({
      path: item.path!,
      type: item.type as "blob" | "tree",
      sha: item.sha!,
      size: item.size,
      name: item.path!.split("/").pop() || item.path!,
    }));
}

export async function getFileContent(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  ref: string,
): Promise<FileContent> {
  const { data } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path,
    ref,
  });

  if (Array.isArray(data)) {
    throw new Error(`Path "${path}" is a directory, not a file`);
  }

  if (data.type !== "file" || !("content" in data)) {
    throw new Error(`Path "${path}" is not a regular file`);
  }

  const fileData = data as {
    content?: string;
    download_url?: string;
    encoding?: string;
    path: string;
    sha: string;
    size: number;
  };
  const isImage = isImageFile(path);
  let content: string;

  if (typeof fileData.content === "string" && fileData.content.length > 0) {
    content = isImage
      ? fileData.content.replace(/\s/g, "")
      : Buffer.from(fileData.content, "base64").toString("utf-8");
  } else {
    const rawData = await fetchRawFileContent(octokit, {
      owner,
      repo,
      path,
      ref,
    });
    if (isImage) {
      const buffer =
        typeof rawData === "string" ? Buffer.from(rawData, "binary") : rawData;
      content = buffer.toString("base64");
    } else {
      content =
        typeof rawData === "string" ? rawData : rawData.toString("utf-8");
    }
  }

  return {
    content,
    sha: fileData.sha,
    encoding: fileData.encoding ?? "utf-8",
    path: fileData.path,
    size: fileData.size,
    downloadUrl: fileData.download_url,
  };
}

export async function listDirectory(
  octokit: Octokit,
  owner: string,
  repo: string,
  path: string,
  ref: string,
): Promise<TreeNode[]> {
  const { data } = await octokit.rest.repos.getContent({
    owner,
    repo,
    path: path || "",
    ref,
  });

  if (!Array.isArray(data)) {
    throw new Error(`Path "${path}" is not a directory`);
  }

  return data.map((item) => ({
    path: item.path,
    type: item.type === "dir" ? "tree" : "blob",
    sha: item.sha,
    size: item.size,
    name: item.name,
  }));
}

async function fetchRawFileContent(
  octokit: Octokit,
  params: { owner: string; repo: string; path: string; ref: string },
): Promise<Buffer | string> {
  const response = await octokit.request(
    "GET /repos/{owner}/{repo}/contents/{path}",
    {
      owner: params.owner,
      repo: params.repo,
      path: params.path,
      ref: params.ref,
      headers: { accept: "application/vnd.github.raw" },
    },
  );

  const data: unknown = response.data;
  if (isImageFile(params.path)) {
    if (data instanceof Buffer) return data;
    if (typeof data === "string") return Buffer.from(data, "binary");
    if (data instanceof Uint8Array) return Buffer.from(data);
    if (data && typeof data === "object" && "byteLength" in data) {
      return Buffer.from(data as ArrayBuffer);
    }
  }

  if (typeof data === "string") return data;
  if (data && typeof data === "object" && "byteLength" in data) {
    return Buffer.from(data as ArrayBuffer).toString("utf-8");
  }
  return String(data ?? "");
}
