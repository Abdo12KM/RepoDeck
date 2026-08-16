"use client";

import { useState, useEffect, useMemo } from "react";
import { codeToHtml } from "shiki";
import {
  Search,
  Copy,
  Check,
  Smartphone,
  Laptop,
  ChevronDown,
  ChevronRight,
  WrapText,
  BookOpen,
  Code2,
  Palette,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ViewerTabs } from "@/components/viewer/ViewerTabs";
import { FileIcon } from "@/components/repo/tree/FileIcon";
import { RepoIcon } from "@/components/repo/RepoIcon";
import { MarkdownPreview } from "@/components/repo/viewer/MarkdownPreview";
import { CODE_THEMES } from "@/lib/theme/config";
import { cn } from "@/lib/utils";

interface DemoFile {
  path: string;
  name: string;
  language: string;
  content: string;
}

const DEMO_FILES: Record<string, DemoFile> = {
  "src/app/page.tsx": {
    path: "src/app/page.tsx",
    name: "page.tsx",
    language: "typescript",
    content: `import { Suspense } from "react";
import { RepositoryViewer } from "@/components/viewer";
import { ViewerProvider } from "@/hooks/useViewer";

export const metadata = {
  title: "RepoDeck · Modern GitHub Code Reader",
  description: "Browse any repository at cloud speed.",
};

export default function Page() {
  return (
    <main className="flex h-dvh w-full flex-col bg-background">
      <ViewerProvider>
        <Suspense fallback={<ViewerSkeleton />}>
          <RepositoryViewer />
        </Suspense>
      </ViewerProvider>
    </main>
  );
}`,
  },
  "src/components/viewer/RepositoryViewer.tsx": {
    path: "src/components/viewer/RepositoryViewer.tsx",
    name: "RepositoryViewer.tsx",
    language: "typescript",
    content: `"use client";

import { useViewer } from "@/hooks/useViewer";
import { ViewerTreePanel } from "./ViewerTreePanel";
import { CodeFileViewer } from "@/components/repo/viewer";

export function RepositoryViewer() {
  const { owner, repo, branch, selectedPath } = useViewer();

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* 60fps Virtualized File Tree */}
      <ViewerTreePanel className="w-80 border-r" />

      {/* Studio-Grade Shiki Highlighting */}
      <CodeFileViewer
        owner={owner}
        repo={repo}
        branch={branch}
        filePath={selectedPath}
      />
    </div>
  );
}`,
  },
  "README.md": {
    path: "README.md",
    name: "README.md",
    language: "markdown",
    content: `# RepoDeck ⚡

A focused, responsive GitHub repository viewer for reading code comfortably across desktop, tablet, and mobile.

## Highlights

- **Zero Local Clones**: Open any public repository instantly without disk consumption.
- **18 Shiki 3 Themes**: Studio-grade TextMate grammar highlighting with instant on-the-fly switching.
- **60fps Virtualized Tree**: Powered by \`@tanstack/react-virtual\` for effortless navigation across 100,000+ files.
- **⌘K Quick Switcher**: Keyboard-first fuzzy search across repository files, branches, and commands.
- **Granular GitHub App**: Secure, fine-grained read-only access.`,
  },
  "package.json": {
    path: "package.json",
    name: "package.json",
    language: "json",
    content: `{
  "name": "repodeck",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "next": "16.1.6",
    "react": "19.2.4",
    "@tanstack/react-virtual": "^3.13.25",
    "shiki": "^3.23.0",
    "tailwindcss": "^4.2.0",
    "@octokit/rest": "^22.0.1"
  }
}`,
  },
};

export function LandingInteractiveMockup() {
  const [activePath, setActivePath] = useState<string>("src/app/page.tsx");
  const [openFiles, setOpenFiles] = useState<string[]>([
    "src/app/page.tsx",
    "src/components/viewer/RepositoryViewer.tsx",
    "README.md",
    "package.json",
  ]);
  const [selectedCodeTheme, setSelectedCodeTheme] =
    useState<string>("synthwave-84");
  const [wrapLines, setWrapLines] = useState<boolean>(false);
  const [markdownMode, setMarkdownMode] = useState<"code" | "preview">(
    "preview",
  );
  const [viewportMode, setViewportMode] = useState<"desktop" | "mobile">(
    "desktop",
  );
  const [treeSearch, setTreeSearch] = useState<string>("");
  const [copied, setCopied] = useState<boolean>(false);
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");
  const [expandedFolders, setExpandedFolders] = useState<
    Record<string, boolean>
  >({
    src: true,
    "src/app": true,
    "src/components": true,
  });

  const activeFile = DEMO_FILES[activePath] || DEMO_FILES["src/app/page.tsx"];

  const currentThemeObj = useMemo(() => {
    return (
      CODE_THEMES.find((t) => t.id === selectedCodeTheme) || CODE_THEMES[0]
    );
  }, [selectedCodeTheme]);

  // Generate real Shiki syntax highlighting on the fly
  useEffect(() => {
    let isCancelled = false;

    async function highlight() {
      try {
        const shikiThemeName = currentThemeObj.darkTheme || "github-dark";
        const html = await codeToHtml(activeFile.content, {
          lang: activeFile.language,
          theme: shikiThemeName,
        });
        if (!isCancelled) {
          setHighlightedHtml(html);
        }
      } catch {
        if (!isCancelled) {
          setHighlightedHtml("");
        }
      }
    }

    highlight();
    return () => {
      isCancelled = true;
    };
  }, [activeFile, currentThemeObj]);

  const handleOpenFile = (path: string) => {
    if (!openFiles.includes(path)) {
      setOpenFiles((prev) => [...prev, path]);
    }
    setActivePath(path);
  };

  const handleCloseTab = (path: string) => {
    const next = openFiles.filter((p) => p !== path);
    setOpenFiles(next);
    if (activePath === path) {
      setActivePath(next[next.length - 1] || "");
    }
  };

  const handleCopy = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFolder = (folderPath: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderPath]: !prev[folderPath],
    }));
  };

  const lineCount = activeFile.content.split("\n").length;
  const isMarkdown = activeFile.name.endsWith(".md");

  return (
    <div id="demo" className="w-full">
      {/* Top Device & Viewport Switcher Controls */}
      <div className="mb-4 flex flex-col items-center justify-between gap-3 select-none sm:flex-row">
        <div className="bg-muted/60 border-border/80 flex items-center gap-1.5 rounded-xl border p-1 text-xs">
          <button
            type="button"
            onClick={() => setViewportMode("desktop")}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all",
              viewportMode === "desktop"
                ? "bg-card text-foreground border-border/60 border shadow-2xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Laptop className="h-3.5 w-3.5" />
            <span>Desktop Workspace</span>
          </button>
          <button
            type="button"
            onClick={() => setViewportMode("mobile")}
            className={cn(
              "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 font-medium transition-all",
              viewportMode === "mobile"
                ? "bg-card text-foreground border-border/60 border shadow-2xs"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span>Mobile View</span>
          </button>
        </div>

        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Interactive Component Demo · Real Shiki 3 Highlighting</span>
        </div>
      </div>

      {/* Main Workspace Frame */}
      <div
        className={cn(
          "border-border/80 bg-card mx-auto overflow-hidden rounded-2xl border shadow-md transition-all",
          viewportMode === "mobile" ? "max-w-md" : "w-full",
        )}
      >
        {/* Workspace Top Window Bar */}
        <div className="border-border/80 bg-muted/30 flex items-center justify-between border-b px-3.5 py-2.5 select-none">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
            </div>

            <div className="ml-1.5 flex items-center gap-2">
              <RepoIcon
                owner="Abdo12KM"
                repo="repodeck"
                className="h-4 w-4 shrink-0"
                iconClassName="h-full w-full object-contain"
              />
              <span className="text-foreground text-xs font-semibold">
                repodeck
              </span>
              <span className="text-muted-foreground font-mono text-xs">
                / main
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-muted-foreground font-mono text-[10px]"
            >
              Read-Only
            </Badge>
          </div>
        </div>

        {/* Workspace Body */}
        <div
          className={cn(
            "divide-border/80 grid min-h-[460px] divide-x",
            viewportMode === "desktop" ? "grid-cols-12" : "grid-cols-1",
          )}
        >
          {/* File Explorer Tree (Left Panel) */}
          {viewportMode === "desktop" && (
            <div className="bg-muted/10 border-border/60 col-span-4 flex flex-col gap-2 border-r p-2.5 select-none lg:col-span-3">
              {/* Tree Header & Filter */}
              <div className="flex items-center justify-between px-1">
                <span className="text-muted-foreground text-[10px] font-bold tracking-wider uppercase">
                  Files
                </span>
                <span className="text-muted-foreground font-mono text-[10px]">
                  {Object.keys(DEMO_FILES).length} files
                </span>
              </div>

              <div className="relative">
                <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 h-3 w-3 -translate-y-1/2" />
                <Input
                  value={treeSearch}
                  onChange={(e) => setTreeSearch(e.target.value)}
                  placeholder="Filter files..."
                  className="bg-background/60 border-border/60 h-7 pl-6 text-xs"
                />
              </div>

              {/* Tree Nodes List */}
              <div className="mt-1 space-y-0.5 overflow-y-auto font-mono text-xs">
                {/* Folder: src */}
                <div>
                  <button
                    type="button"
                    onClick={() => toggleFolder("src")}
                    className="hover:bg-muted text-foreground/90 flex w-full cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-left"
                  >
                    {expandedFolders.src ? (
                      <ChevronDown className="text-muted-foreground h-3 w-3" />
                    ) : (
                      <ChevronRight className="text-muted-foreground h-3 w-3" />
                    )}
                    <FileIcon
                      name="src"
                      isFolder
                      isOpen={expandedFolders.src}
                      className="h-3.5 w-3.5"
                    />
                    <span className="text-xs">src</span>
                  </button>

                  {expandedFolders.src && (
                    <div className="mt-0.5 space-y-0.5 pl-4">
                      {/* Subfolder: src/app */}
                      <button
                        type="button"
                        onClick={() => toggleFolder("src/app")}
                        className="hover:bg-muted text-foreground/90 flex w-full cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-left"
                      >
                        {expandedFolders["src/app"] ? (
                          <ChevronDown className="text-muted-foreground h-3 w-3" />
                        ) : (
                          <ChevronRight className="text-muted-foreground h-3 w-3" />
                        )}
                        <FileIcon
                          name="app"
                          isFolder
                          isOpen={expandedFolders["src/app"]}
                          className="h-3.5 w-3.5"
                        />
                        <span className="text-xs">app</span>
                      </button>

                      {expandedFolders["src/app"] && (
                        <div className="mt-0.5 space-y-0.5 pl-4">
                          <button
                            type="button"
                            onClick={() => handleOpenFile("src/app/page.tsx")}
                            className={cn(
                              "flex w-full cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-left transition-colors",
                              activePath === "src/app/page.tsx"
                                ? "bg-primary/10 text-primary font-semibold"
                                : "hover:bg-muted text-muted-foreground hover:text-foreground",
                            )}
                          >
                            <FileIcon name="page.tsx" className="h-3.5 w-3.5" />
                            <span className="truncate">page.tsx</span>
                          </button>
                        </div>
                      )}

                      {/* Subfolder: src/components */}
                      <button
                        type="button"
                        onClick={() => toggleFolder("src/components")}
                        className="hover:bg-muted text-foreground/90 flex w-full cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-left"
                      >
                        {expandedFolders["src/components"] ? (
                          <ChevronDown className="text-muted-foreground h-3 w-3" />
                        ) : (
                          <ChevronRight className="text-muted-foreground h-3 w-3" />
                        )}
                        <FileIcon
                          name="components"
                          isFolder
                          isOpen={expandedFolders["src/components"]}
                          className="h-3.5 w-3.5"
                        />
                        <span className="text-xs">components</span>
                      </button>

                      {expandedFolders["src/components"] && (
                        <div className="mt-0.5 space-y-0.5 pl-4">
                          <button
                            type="button"
                            onClick={() =>
                              handleOpenFile(
                                "src/components/viewer/RepositoryViewer.tsx",
                              )
                            }
                            className={cn(
                              "flex w-full cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-left transition-colors",
                              activePath ===
                                "src/components/viewer/RepositoryViewer.tsx"
                                ? "bg-primary/10 text-primary font-semibold"
                                : "hover:bg-muted text-muted-foreground hover:text-foreground",
                            )}
                          >
                            <FileIcon
                              name="RepositoryViewer.tsx"
                              className="h-3.5 w-3.5"
                            />
                            <span className="truncate">
                              RepositoryViewer.tsx
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Root Files */}
                <button
                  type="button"
                  onClick={() => handleOpenFile("README.md")}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-left transition-colors",
                    activePath === "README.md"
                      ? "bg-primary/10 text-primary font-semibold"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  <FileIcon name="README.md" className="h-3.5 w-3.5" />
                  <span className="truncate">README.md</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenFile("package.json")}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-left transition-colors",
                    activePath === "package.json"
                      ? "bg-primary/10 text-primary font-semibold"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground",
                  )}
                >
                  <FileIcon name="package.json" className="h-3.5 w-3.5" />
                  <span className="truncate">package.json</span>
                </button>
              </div>
            </div>
          )}

          {/* Code Viewer Workspace (Right Panel) */}
          <div
            className={cn(
              "bg-background flex min-w-0 flex-col overflow-hidden",
              viewportMode === "desktop"
                ? "col-span-8 lg:col-span-9"
                : "col-span-1",
            )}
          >
            {/* Real ViewerTabs Component */}
            {openFiles.length > 0 && (
              <ViewerTabs
                openFiles={openFiles}
                activePath={activePath}
                onSelect={(path) => setActivePath(path)}
                onClose={handleCloseTab}
              />
            )}

            {/* Code Toolbar */}
            <div className="border-border/70 bg-muted/20 no-scrollbar flex items-center justify-between gap-2 overflow-x-auto border-b px-3 py-1.5 text-xs select-none">
              <div className="flex min-w-0 items-center gap-2">
                <span className="text-foreground truncate font-semibold">
                  {activeFile.name}
                </span>
                <span className="text-muted-foreground hidden shrink-0 font-mono text-[11px] sm:inline">
                  {lineCount} lines
                </span>
              </div>

              {/* Toolbar Actions */}
              <div className="flex shrink-0 items-center gap-1">
                {/* Markdown Code vs Preview Toggle */}
                {isMarkdown && (
                  <div className="border-border/70 bg-background mr-1 flex items-center rounded-lg border p-0.5">
                    <Button
                      variant={
                        markdownMode === "preview" ? "secondary" : "ghost"
                      }
                      size="sm"
                      onClick={() => setMarkdownMode("preview")}
                      className="h-6 gap-1 px-2 text-[11px]"
                    >
                      <BookOpen className="h-3 w-3" />
                      <span>Preview</span>
                    </Button>
                    <Button
                      variant={markdownMode === "code" ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setMarkdownMode("code")}
                      className="h-6 gap-1 px-2 text-[11px]"
                    >
                      <Code2 className="h-3 w-3" />
                      <span>Raw</span>
                    </Button>
                  </div>
                )}

                {/* Shiki Theme Selector Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-border/80 hover:bg-muted/80 h-7 gap-1.5 px-2 text-xs font-medium shadow-2xs"
                    >
                      <Palette className="text-primary h-3.5 w-3.5" />
                      <span className="max-w-24 truncate">
                        {currentThemeObj.name}
                      </span>
                      <ChevronDown className="ml-0.5 h-3 w-3 opacity-60" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="max-h-64 w-52 overflow-y-auto"
                  >
                    <DropdownMenuLabel className="text-xs">
                      Syntax Highlighting Theme
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuRadioGroup
                      value={selectedCodeTheme}
                      onValueChange={setSelectedCodeTheme}
                    >
                      {CODE_THEMES.map((t) => (
                        <DropdownMenuRadioItem
                          key={t.id}
                          value={t.id}
                          className="text-xs"
                        >
                          {t.name}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Wrap lines toggle */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setWrapLines((w) => !w)}
                  className={cn(
                    "h-7 w-7",
                    wrapLines && "bg-muted text-primary",
                  )}
                  title={wrapLines ? "Disable wrap" : "Wrap lines"}
                >
                  <WrapText className="h-3.5 w-3.5" />
                </Button>

                {/* Copy button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className="h-7 w-7"
                  title="Copy file contents"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="text-muted-foreground h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Code / Markdown Content Container */}
            <div className="scrollbar-styled bg-card max-h-[380px] flex-1 overflow-auto">
              {isMarkdown && markdownMode === "preview" ? (
                <MarkdownPreview content={activeFile.content} />
              ) : (
                <div
                  className={cn(
                    "p-4 font-mono text-xs leading-relaxed transition-colors",
                    wrapLines
                      ? "break-words whitespace-pre-wrap"
                      : "whitespace-pre",
                  )}
                  style={{
                    backgroundColor: currentThemeObj.previewColors.bg,
                  }}
                >
                  {highlightedHtml ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                      className="[&_code]:!bg-transparent [&_pre]:!bg-transparent"
                    />
                  ) : (
                    <pre className="text-foreground/90">
                      {activeFile.content}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
