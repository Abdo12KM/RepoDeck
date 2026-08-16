/**
 * GitHub File API Route
 * GET /api/github/file - Get file content
 */

import { NextRequest, NextResponse } from "next/server";
import { getGitHubRequestContext } from "@/lib/github/request-context";
import { getFileContent } from "@/lib/github/files";
import { getFileSchema } from "@/lib/github/schemas";
import { handleGitHubError } from "@/lib/github/errors";
import { getMimeTypeFromPath, isImageFile } from "@/lib/utils/diff";
import { applyGitHubResponseCache } from "@/lib/github/response-cache";
import {
  cacheDemoFile,
  getCachedDemoFile,
  isRepoDeckDemo,
} from "@/lib/github/demo-cache";

export async function GET(request: NextRequest) {
  try {
    const context = await getGitHubRequestContext();
    if (context.requiresReauthorization) {
      return NextResponse.json(
        {
          code: "REAUTH_REQUIRED",
          error: "Reconnect your GitHub account to continue.",
        },
        { status: 401 },
      );
    }

    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const result = getFileSchema.safeParse(searchParams);

    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request parameters", details: result.error.format() },
        { status: 400 },
      );
    }

    const { owner, repo, path, ref } = result.data;

    const octokit = context.client;
    const demoRepository = isRepoDeckDemo(owner, repo);
    const cachedFile = demoRepository
      ? await getCachedDemoFile({ owner, repo, ref, path })
      : null;

    if (cachedFile && searchParams.raw !== "true") {
      return applyGitHubResponseCache(
        NextResponse.json({
          content: cachedFile.content,
          sha: cachedFile.sha,
          path: cachedFile.path,
          size: cachedFile.size,
          downloadUrl: cachedFile.downloadUrl,
          fromCache: true,
        }),
        true,
      );
    }

    // 3. If raw mode requested, fetch direct from GitHub with proper binary decoding
    // We do this BEFORE the cache check because the cache stores metadata/base64 JSON
    if (searchParams.raw === "true") {
      const mimeType = getMimeTypeFromPath(path);

      if (cachedFile) {
        const bodyBuffer = cachedFile.isBinary
          ? Buffer.from(cachedFile.content, "base64")
          : Buffer.from(cachedFile.content, "utf-8");
        return applyGitHubResponseCache(
          new NextResponse(new Uint8Array(bodyBuffer), {
            headers: {
              "Content-Type": mimeType,
            },
          }),
          true,
        );
      }

      console.debug(
        `[API] Fetching raw file: ${owner}/${repo}/${path} @ ${ref} (Authenticated: ${Boolean(context.session)})`,
      );

      try {
        const { data } = await octokit.rest.repos.getContent({
          owner,
          repo,
          path,
          ref,
        });

        if (Array.isArray(data) || data.type !== "file") {
          return NextResponse.json(
            { error: "Path is not a regular file" },
            { status: 400 },
          );
        }

        let bodyBuffer: Buffer;
        if (
          "content" in data &&
          typeof data.content === "string" &&
          data.encoding === "base64"
        ) {
          bodyBuffer = Buffer.from(data.content.replace(/\s/g, ""), "base64");
        } else if ("download_url" in data && data.download_url) {
          const dlRes = await fetch(data.download_url);
          const arrayBuf = await dlRes.arrayBuffer();
          bodyBuffer = Buffer.from(arrayBuf);
        } else {
          const rawResponse = await octokit.request(
            "GET /repos/{owner}/{repo}/contents/{path}",
            {
              owner,
              repo,
              path,
              ref,
              headers: {
                accept: "application/vnd.github.raw",
              },
            },
          );
          const rawData = rawResponse.data;
          bodyBuffer =
            rawData instanceof Buffer
              ? rawData
              : typeof rawData === "string"
                ? Buffer.from(rawData, "utf-8")
                : Buffer.from(String(rawData));
        }

        if (demoRepository) {
          await cacheDemoFile({
            owner,
            repo,
            ref,
            path,
            sha: data.sha,
            content: isImageFile(path)
              ? bodyBuffer.toString("base64")
              : bodyBuffer.toString("utf-8"),
            size: bodyBuffer.byteLength,
            isBinary: isImageFile(path),
            downloadUrl:
              "download_url" in data && typeof data.download_url === "string"
                ? data.download_url
                : undefined,
          });
        }

        return applyGitHubResponseCache(
          new NextResponse(new Uint8Array(bodyBuffer), {
            headers: {
              "Content-Type": mimeType,
            },
          }),
          !context.session,
        );
      } catch (err: unknown) {
        const status =
          err && typeof err === "object" && "status" in err
            ? (err.status as number)
            : undefined;
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[API] Raw fetch failed for ${path}:`, status, message);
        throw err;
      }
    }

    const file = await getFileContent(octokit, owner, repo, path, ref);

    if (demoRepository) {
      await cacheDemoFile({
        owner,
        repo,
        ref,
        path: file.path,
        sha: file.sha,
        content: file.content,
        size: file.size,
        isBinary: isImageFile(file.path),
        downloadUrl: file.downloadUrl,
      });
    }

    const responseData = {
      content: file.content,
      sha: file.sha,
      path: file.path,
      size: file.size,
      downloadUrl: file.downloadUrl,
    };

    return applyGitHubResponseCache(
      NextResponse.json({
        ...responseData,
        fromCache: false,
      }),
      !context.session,
    );
  } catch (error) {
    console.error("GitHub file error:", error);

    // Special handling for directory error
    if (error instanceof Error && error.message.includes("directory")) {
      return NextResponse.json(
        { error: "Path is a directory, not a file" },
        { status: 400 },
      );
    }

    return handleGitHubError(error);
  }
}
