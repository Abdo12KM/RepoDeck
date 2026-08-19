"use client";

/**
 * Code File Viewer Component
 * Studio-grade, responsive code & media viewer with Shiki syntax highlighting,
 * line numbers gutter, line wrapping, markdown preview, zoom controls, and breadcrumbs.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { codeToHtml } from "shiki";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useFileContent } from "@/hooks/useFileContent";
import { useAppearanceSettings } from "@/hooks/useAppearanceSettings";
import {
  X,
  Copy,
  Check,
  ZoomIn,
  ZoomOut,
  WrapText,
  Binary,
  ExternalLink,
  Download,
  BookOpen,
  Code2,
  ListOrdered,
  ArrowLeft,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getLanguageFromPath,
  isImageFile,
  getMimeTypeFromPath,
} from "@/lib/utils/diff";
import { ImageViewer, ImageSkeleton } from "./ImageViewer";
import { MarkdownPreview } from "./MarkdownPreview";
import { CodeLoadingSkeleton } from "./CodeLoadingSkeleton";
import { MobileCodeToolsDrawer } from "../../viewer/MobileCodeToolsDrawer";
import { toast } from "sonner";

interface CodeFileViewerProps {
  owner: string;
  repo: string;
  branch: string;
  filePath: string | null;
  onClose?: () => void;
  toolsOpen?: boolean;
  onToolsOpenChange?: (open: boolean) => void;
  onOpenAppearance?: () => void;
  // Legacy / modal support
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

const FONT_SIZES = [
  { label: "80%", class: "text-[11px] leading-4" },
  { label: "90%", class: "text-[12px] leading-4.5" },
  { label: "100%", class: "text-[13px] leading-5" },
  { label: "115%", class: "text-[14px] leading-5.5" },
  { label: "130%", class: "text-[16px] leading-6" },
  { label: "150%", class: "text-[18px] leading-7" },
];

export function CodeFileViewer({
  owner,
  repo,
  branch,
  filePath,
  onClose,
  toolsOpen,
  onToolsOpenChange,
  onOpenAppearance,
  className,
}: CodeFileViewerProps) {
  const { resolvedTheme } = useTheme();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [highlightedHtml, setHighlightedHtml] = useState<string>("");
  const [isHighlighting, setIsHighlighting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedPath, setCopiedPath] = useState(false);
  const [fontSizeIndex, setFontSizeIndex] = useState(2); // 100% default
  const [wrapLines, setWrapLines] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [previewMode, setPreviewMode] = useState<"preview" | "code">("preview");
  const [internalToolsOpen, setInternalToolsOpen] = useState(false);

  // Poweruser shortcut event listeners
  useEffect(() => {
    const handleToggleWrap = () => setWrapLines((prev) => !prev);
    const handleToggleLineNumbers = () => setShowLineNumbers((prev) => !prev);

    window.addEventListener("repodeck:toggle-wrap", handleToggleWrap);
    window.addEventListener(
      "repodeck:toggle-line-numbers",
      handleToggleLineNumbers,
    );

    return () => {
      window.removeEventListener("repodeck:toggle-wrap", handleToggleWrap);
      window.removeEventListener(
        "repodeck:toggle-line-numbers",
        handleToggleLineNumbers,
      );
    };
  }, []);

  const isToolsOpen = toolsOpen !== undefined ? toolsOpen : internalToolsOpen;
  const setToolsOpen = onToolsOpenChange ?? setInternalToolsOpen;

  const isMarkdown = useMemo(() => {
    if (!filePath) return false;
    const lower = filePath.toLowerCase();
    return (
      lower.endsWith(".md") ||
      lower.endsWith(".mdx") ||
      lower.endsWith(".markdown")
    );
  }, [filePath]);

  const isImage = useMemo(() => isImageFile(filePath), [filePath]);
  const language = useMemo(
    () => (filePath ? getLanguageFromPath(filePath) : "plaintext"),
    [filePath],
  );

  // Reset controls on file change
  useEffect(() => {
    if (filePath) {
      setPreviewMode("preview");
      setHighlightedHtml("");
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [filePath]);

  const { content, isLoading, error, data } = useFileContent(
    filePath ? owner : null,
    filePath ? repo : null,
    filePath ? branch : null,
    filePath,
  );

  const finalDownloadUrl = data?.downloadUrl ?? null;

  const { settings, getCodeTheme } = useAppearanceSettings();
  const activeCodeTheme = getCodeTheme(settings.codeTheme || "github");
  const resolvedShikiTheme =
    resolvedTheme === "dark"
      ? activeCodeTheme.darkTheme
      : activeCodeTheme.lightTheme;

  // Calculate lines count and size
  const linesCount = useMemo(() => {
    if (!content) return 0;
    return content.split("\n").length;
  }, [content]);

  // Shiki syntax highlighting
  useEffect(() => {
    if (!content || !filePath || isImage) {
      setHighlightedHtml("");
      return;
    }

    let isMounted = true;
    const highlight = async () => {
      setIsHighlighting(true);
      try {
        const rawHtml = await codeToHtml(content, {
          lang: language,
          theme: resolvedShikiTheme,
        });

        // Enrich lines with dynamic indent for alignment on wrapped lines
        const lines = content.split("\n");
        let lineIdx = 0;
        const enrichedHtml = rawHtml.replace(
          /<span class="line(?: [^"]*)?">/g,
          (match) => {
            const lineText = lines[lineIdx++] ?? "";
            const leadingMatch = lineText.match(/^(\s*)/);
            const leadingSpaces = leadingMatch ? leadingMatch[1] : "";
            const indentCount = leadingSpaces.replace(/\t/g, "  ").length;
            if (match.includes('style="')) {
              return match.replace(
                'style="',
                `style="--indent: ${indentCount}ch; `,
              );
            }
            return match.replace(
              '">',
              `" style="--indent: ${indentCount}ch;">`,
            );
          },
        );

        if (isMounted) setHighlightedHtml(enrichedHtml);
      } catch (err) {
        console.error("Shiki highlighting fallback:", err);
        if (isMounted) {
          const lines = content.split("\n");
          const fallbackHtml = lines
            .map((line) => {
              const leadingMatch = line.match(/^(\s*)/);
              const leadingSpaces = leadingMatch ? leadingMatch[1] : "";
              const indentCount = leadingSpaces.replace(/\t/g, "  ").length;
              return `<span class="line" style="--indent: ${indentCount}ch;">${line.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>`;
            })
            .join("\n");
          setHighlightedHtml(
            `<pre class="shiki"><code>${fallbackHtml}</code></pre>`,
          );
        }
      } finally {
        if (isMounted) setIsHighlighting(false);
      }
    };

    highlight();
    return () => {
      isMounted = false;
    };
  }, [content, filePath, language, resolvedShikiTheme, isImage]);

  const handleCopyCode = async () => {
    if (!content) return;

    if (isImage && filePath) {
      try {
        const mimeType = getMimeTypeFromPath(filePath);
        const cleanContent = content.replace(/\s/g, "");
        const dataUri = `data:${mimeType};base64,${cleanContent}`;
        const img = new Image();
        img.crossOrigin = "anonymous";

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = dataUri;
        });

        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || 512;
        canvas.height = img.naturalHeight || 512;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Canvas context failed");
        ctx.drawImage(img, 0, 0);

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, "image/png"),
        );
        if (!blob) throw new Error("Blob conversion failed");

        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
      } catch {
        toast.error("Failed to copy image");
        return;
      }
    } else {
      await navigator.clipboard.writeText(content);
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPath = async () => {
    if (!filePath) return;
    await navigator.clipboard.writeText(filePath);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  const handleDownload = () => {
    if (!content || !filePath) return;
    const fileName = filePath.split("/").pop() || "file";
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${fileName}`);
  };

  if (!filePath) {
    return null;
  }

  const fileName = filePath.split("/").pop() || "File";
  const pathParts = filePath.split("/");

  return (
    <div
      className={cn(
        "bg-background relative flex h-full min-h-0 flex-1 flex-col overflow-hidden",
        className,
      )}
    >
      {/* Top Header & Breadcrumbs Toolbar (h-9 matches sidebar filter row) */}
      <div className="bg-muted/20 flex h-9 shrink-0 items-center justify-between gap-2 border-b px-3 sm:px-4">
        {/* Breadcrumb Path */}
        <div className="no-scrollbar flex min-w-0 items-center gap-1.5 overflow-x-auto">
          {onClose && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground mr-0.5 -ml-1 h-7 w-7 shrink-0 lg:hidden"
              title="Back to files"
              aria-label="Back to files"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center gap-1 font-mono text-xs">
            {pathParts.map((part, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="text-muted-foreground/50">/</span>}
                <span
                  className={cn(
                    i === pathParts.length - 1
                      ? "text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground transition-colors",
                  )}
                >
                  {part}
                </span>
              </span>
            ))}
          </div>

          <Button
            variant="ghost"
            size="icon-xs"
            onClick={handleCopyPath}
            className="text-muted-foreground hover:text-foreground h-6 w-6 shrink-0"
            title="Copy file path"
          >
            {copiedPath ? (
              <Check className="h-3 w-3 text-emerald-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>

        {/* Action Controls Toolbar */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Group 1: Metadata Badges or Markdown Toggle */}
          {isMarkdown ? (
            <div className="bg-muted/60 flex items-center rounded-md border p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setPreviewMode("preview")}
                className={cn(
                  "flex cursor-pointer items-center gap-1 rounded-sm px-2 py-0.5 text-[11px] font-medium transition-colors",
                  previewMode === "preview"
                    ? "bg-background text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <BookOpen className="h-3 w-3" />
                <span className="hidden sm:inline">Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode("code")}
                className={cn(
                  "flex cursor-pointer items-center gap-1 rounded-sm px-2 py-0.5 text-[11px] font-medium transition-colors",
                  previewMode === "code"
                    ? "bg-background text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Code2 className="h-3 w-3" />
                <span className="hidden sm:inline">Raw Code</span>
              </button>
            </div>
          ) : (
            <div className="text-muted-foreground hidden items-center gap-1.5 font-mono text-[11px] sm:flex">
              {!isImage && content && (
                <Badge
                  variant="outline"
                  className="h-5.5 px-1.5 font-mono text-[10px] font-medium"
                >
                  {linesCount} {linesCount === 1 ? "line" : "lines"}
                </Badge>
              )}
            </div>
          )}

          {/* Group 2: Editor View Options (Wrap, Line Numbers, Zoom) */}
          {!isImage && (!isMarkdown || previewMode === "code") && (
            <>
              <div className="bg-border/60 hidden h-4 w-px sm:block" />

              <div className="flex items-center gap-0.5">
                {/* Line Wrap Toggle */}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setWrapLines(!wrapLines)}
                  className={cn(
                    "text-muted-foreground hover:text-foreground hidden h-7 w-7 cursor-pointer sm:inline-flex",
                    wrapLines && "bg-accent text-primary font-bold",
                  )}
                  title={
                    wrapLines
                      ? "Disable line wrap (Alt+Z)"
                      : "Enable line wrap (Alt+Z)"
                  }
                >
                  <WrapText className="h-3.5 w-3.5" />
                </Button>

                {/* Line Numbers Toggle */}
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setShowLineNumbers(!showLineNumbers)}
                  className={cn(
                    "text-muted-foreground hover:text-foreground hidden h-7 w-7 cursor-pointer sm:inline-flex",
                    showLineNumbers && "bg-accent text-primary font-bold",
                  )}
                  title={
                    showLineNumbers
                      ? "Hide line numbers (Alt+L)"
                      : "Show line numbers (Alt+L)"
                  }
                >
                  <ListOrdered className="h-3.5 w-3.5" />
                </Button>

                {/* Font Size Zoom Controls - Click percentage to reset to 100% with zero layout shift */}
                <div className="hidden items-center sm:flex">
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() =>
                      setFontSizeIndex((prev) => Math.max(prev - 1, 0))
                    }
                    disabled={fontSizeIndex <= 0}
                    className="h-7 w-7 cursor-pointer"
                    title="Decrease font size"
                  >
                    <ZoomOut className="h-3.5 w-3.5" />
                  </Button>
                  <button
                    type="button"
                    onClick={() => setFontSizeIndex(2)}
                    disabled={fontSizeIndex === 2}
                    className={cn(
                      "min-w-9 text-center font-mono text-[10px] transition-colors",
                      fontSizeIndex !== 2
                        ? "text-primary cursor-pointer font-bold hover:underline"
                        : "text-muted-foreground cursor-default",
                    )}
                    title={
                      fontSizeIndex !== 2
                        ? "Reset to 100%"
                        : "Current zoom level"
                    }
                  >
                    {FONT_SIZES[fontSizeIndex].label}
                  </button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() =>
                      setFontSizeIndex((prev) =>
                        Math.min(prev + 1, FONT_SIZES.length - 1),
                      )
                    }
                    disabled={fontSizeIndex >= FONT_SIZES.length - 1}
                    className="h-7 w-7 cursor-pointer"
                    title="Increase font size"
                  >
                    <ZoomIn className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </>
          )}

          {/* Group 3: File Actions (Copy, Download, GitHub, Close) */}
          <div className="bg-border/60 hidden h-4 w-px sm:block" />

          <div className="flex items-center gap-0.5">
            {/* Copy Button */}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleCopyCode}
              disabled={!content}
              className="text-muted-foreground hover:text-foreground hidden h-7 w-7 cursor-pointer sm:inline-flex"
              title="Copy file content"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>

            {/* Download Raw File */}
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleDownload}
              disabled={!content}
              className="text-muted-foreground hover:text-foreground hidden h-7 w-7 cursor-pointer sm:inline-flex"
              title="Download file"
            >
              <Download className="h-3.5 w-3.5" />
            </Button>

            {/* Open on GitHub */}
            <Button
              variant="ghost"
              size="icon-xs"
              asChild
              className="text-muted-foreground hover:text-foreground hidden h-7 w-7 cursor-pointer sm:inline-flex"
              title="Open on GitHub"
            >
              <a
                href={`https://github.com/${owner}/${repo}/blob/${branch}/${filePath}`}
                target="_blank"
                rel="noreferrer noopener"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </Button>

            {/* Close File Button */}
            {onClose && (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground ml-0.5 h-7 w-7 cursor-pointer"
                title="Close file"
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <ScrollArea
        viewportRef={scrollContainerRef}
        className="relative flex min-h-0 flex-1 flex-col"
        viewportClassName="flex flex-col min-h-full"
        style={{
          backgroundColor:
            isMarkdown && previewMode === "preview"
              ? undefined
              : "var(--code-bg, transparent)",
        }}
      >
        {isImage ? (
          isLoading ? (
            <ImageSkeleton />
          ) : error ? (
            <div className="text-destructive flex h-full items-center justify-center p-8 text-center text-sm">
              Failed to load image: {error.message}
            </div>
          ) : (
            <ImageViewer
              content={content ?? ""}
              fileName={fileName}
              filePath={filePath}
              downloadUrl={finalDownloadUrl ?? undefined}
              src={
                filePath && owner && repo && branch
                  ? `/api/github/file?${new URLSearchParams({
                      owner,
                      repo,
                      ref: branch,
                      path: filePath,
                      raw: "true",
                    }).toString()}`
                  : undefined
              }
            />
          )
        ) : isMarkdown && previewMode === "preview" ? (
          isLoading ? (
            <div className="mx-auto max-w-3xl space-y-4 p-8">
              <Skeleton className="bg-muted/60 h-8 w-2/3" />
              <Skeleton className="bg-muted/60 h-4 w-full" />
              <Skeleton className="bg-muted/60 h-4 w-5/6" />
              <Skeleton className="bg-muted/60 h-4 w-4/5" />
              <Skeleton className="bg-muted/60 h-32 w-full rounded-lg" />
            </div>
          ) : error ? (
            <div className="text-destructive flex h-full items-center justify-center p-8 text-center text-sm">
              Failed to load documentation: {error.message}
            </div>
          ) : (
            <MarkdownPreview content={content ?? ""} />
          )
        ) : (
          <div
            className="flex min-h-full min-w-full flex-1 flex-col p-0"
            style={{
              backgroundColor: "var(--code-bg, transparent)",
            }}
          >
            {isLoading ? (
              <CodeLoadingSkeleton
                filePath={filePath}
                showLineNumbers={showLineNumbers}
                fontSizeClass={FONT_SIZES[fontSizeIndex].class}
                wrapLines={wrapLines}
              />
            ) : error ? (
              <div className="text-destructive flex h-full items-center justify-center p-8 text-center text-sm">
                Failed to load file: {error.message}
              </div>
            ) : content ? (
              <div
                className={cn(
                  "code-viewer-container min-h-full flex-1 font-mono transition-opacity duration-150 ease-out",
                  FONT_SIZES[fontSizeIndex].class,
                  showLineNumbers && "has-line-numbers",
                  wrapLines ? "code-wrap" : "code-nowrap",
                  settings.transparentCodeBg && "is-transparent",
                  isHighlighting && !highlightedHtml
                    ? "opacity-60"
                    : "opacity-100",
                )}
                dangerouslySetInnerHTML={{
                  __html:
                    highlightedHtml ||
                    `<pre class="shiki"><code>${content
                      .split("\n")
                      .map(
                        (l) =>
                          `<span class="line">${l.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</span>`,
                      )
                      .join("\n")}</code></pre>`,
                }}
              />
            ) : (
              <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 p-8 text-center text-sm">
                <Binary className="h-8 w-8 opacity-40" />
                <span>Empty file or binary data cannot be displayed.</span>
              </div>
            )}
          </div>
        )}
      </ScrollArea>

      {/* Floating Code Tools FAB Button on Mobile (Bottom-Right under thumb) */}
      <div className="absolute right-4 bottom-4 z-20 sm:hidden">
        <button
          type="button"
          onClick={() => setToolsOpen(true)}
          className="border-border/80 bg-background/90 text-foreground hover:bg-background flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border shadow-xl backdrop-blur-md transition-all hover:scale-105 active:scale-95"
          aria-label="Open code controls"
          title="Open code controls"
        >
          <SlidersHorizontal className="text-primary h-4.5 w-4.5" />
        </button>
      </div>

      {/* Mobile Tools Bottom Sheet Drawer */}
      <MobileCodeToolsDrawer
        open={isToolsOpen}
        onOpenChange={setToolsOpen}
        filePath={filePath}
        owner={owner}
        repo={repo}
        branch={branch}
        wrapLines={wrapLines}
        onToggleWrapLines={() => setWrapLines((w) => !w)}
        showLineNumbers={showLineNumbers}
        onToggleLineNumbers={() => setShowLineNumbers((n) => !n)}
        fontSizeLabel={FONT_SIZES[fontSizeIndex].label}
        canZoomIn={fontSizeIndex < FONT_SIZES.length - 1}
        canZoomOut={fontSizeIndex > 0}
        isDefaultZoom={fontSizeIndex === 2}
        onZoomIn={() =>
          setFontSizeIndex((prev) => Math.min(prev + 1, FONT_SIZES.length - 1))
        }
        onZoomOut={() => setFontSizeIndex((prev) => Math.max(prev - 1, 0))}
        onResetZoom={() => setFontSizeIndex(2)}
        isMarkdown={isMarkdown}
        previewMode={previewMode}
        onTogglePreviewMode={() =>
          setPreviewMode((m) => (m === "preview" ? "code" : "preview"))
        }
        onCopy={handleCopyCode}
        copied={copied}
        onDownload={handleDownload}
        onOpenAppearance={onOpenAppearance}
      />
    </div>
  );
}
