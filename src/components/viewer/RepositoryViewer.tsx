"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  GitBranch,
  Sparkles,
  Clock,
  Search,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Kbd } from "@/components/ui/kbd";
import { RepoIcon } from "@/components/repo/RepoIcon";
import { RepoDeckIcon } from "@/components/ui/RepoDeckLogo";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import type { ImperativePanelHandle } from "react-resizable-panels";
import { CodeFileViewer } from "@/components/repo/viewer/CodeFileViewer";
import { useViewer } from "@/hooks/useViewer";
import { useAuth } from "@/hooks/useAuth";
import { useRepoTree } from "@/hooks/useRepoTree";
import { useRecentFiles, type RecentFileItem } from "@/hooks/useRecentFiles";
import { useModifierKey } from "@/hooks/useModifierKey";
import { useGlobalShortcuts } from "@/hooks/useGlobalShortcuts";
import { ViewerHeader } from "./ViewerHeader";
import { ViewerTreePanel } from "./ViewerTreePanel";
import { ViewerTabs } from "./ViewerTabs";
import { MobileBottomNav } from "./MobileBottomNav";
import {
  RepositoryPickerDialog,
  getRecentRepos,
} from "./RepositoryPickerDialog";
import { AppearanceSettingsDialog } from "@/components/theme/AppearanceSettingsDialog";
import { QuickSwitcherDialog } from "./QuickSwitcherDialog";
import { ShortcutsHelpDialog } from "./ShortcutsHelpDialog";
import { FileIcon } from "@/components/repo/tree/FileIcon";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export function RepositoryViewer() {
  const {
    owner,
    repo,
    branch,
    hasRepo,
    selectedPath,
    openFile,
    closeFile,
    selectRepository,
  } = useViewer();

  const searchParams = useSearchParams();
  const { authenticated, connectPrivate } = useAuth();
  const { recentFiles, addRecentFile } = useRecentFiles(owner, repo);

  const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
  const [quickSwitcherOpen, setQuickSwitcherOpen] = useState(false);
  const [shortcutsHelpOpen, setShortcutsHelpOpen] = useState(false);
  const [repoPickerOpen, setRepoPickerOpen] = useState(false);
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarHovered] = useState(false);
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const treePanelRef = useRef<ImperativePanelHandle>(null);

  // Exclusively toggle/open dialogs so only one dialog is active at any time
  const openQuickSwitcher = useCallback(() => {
    setRepoPickerOpen(false);
    setShortcutsHelpOpen(false);
    setAppearanceOpen(false);
    setQuickSwitcherOpen(true);
  }, []);

  const toggleQuickSwitcher = useCallback(() => {
    setQuickSwitcherOpen((prev) => {
      if (!prev) {
        setRepoPickerOpen(false);
        setShortcutsHelpOpen(false);
        setAppearanceOpen(false);
        return true;
      }
      return false;
    });
  }, []);

  const openRepoPicker = useCallback(() => {
    setQuickSwitcherOpen(false);
    setShortcutsHelpOpen(false);
    setAppearanceOpen(false);
    setRepoPickerOpen(true);
  }, []);

  const toggleRepoPicker = useCallback(() => {
    setRepoPickerOpen((prev) => {
      if (!prev) {
        setQuickSwitcherOpen(false);
        setShortcutsHelpOpen(false);
        setAppearanceOpen(false);
        return true;
      }
      return false;
    });
  }, []);

  const openShortcutsHelp = useCallback(() => {
    setQuickSwitcherOpen(false);
    setRepoPickerOpen(false);
    setAppearanceOpen(false);
    setShortcutsHelpOpen(true);
  }, []);

  const toggleShortcutsHelp = useCallback(() => {
    setShortcutsHelpOpen((prev) => {
      if (!prev) {
        setQuickSwitcherOpen(false);
        setRepoPickerOpen(false);
        setAppearanceOpen(false);
        return true;
      }
      return false;
    });
  }, []);

  const openAppearance = useCallback(() => {
    setQuickSwitcherOpen(false);
    setRepoPickerOpen(false);
    setShortcutsHelpOpen(false);
    setAppearanceOpen(true);
  }, []);

  const toggleAppearance = useCallback(() => {
    setAppearanceOpen((prev) => {
      if (!prev) {
        setQuickSwitcherOpen(false);
        setRepoPickerOpen(false);
        setShortcutsHelpOpen(false);
        return true;
      }
      return false;
    });
  }, []);

  // Listen to appearance trigger events from command palette or shortcuts
  useEffect(() => {
    const handleToggleAppearanceEvent = () => toggleAppearance();
    const handleOpenAppearanceEvent = () => openAppearance();
    window.addEventListener(
      "repodeck:toggle-appearance",
      handleToggleAppearanceEvent,
    );
    window.addEventListener(
      "repodeck:open-appearance",
      handleOpenAppearanceEvent,
    );
    return () => {
      window.removeEventListener(
        "repodeck:toggle-appearance",
        handleToggleAppearanceEvent,
      );
      window.removeEventListener(
        "repodeck:open-appearance",
        handleOpenAppearanceEvent,
      );
    };
  }, [toggleAppearance, openAppearance]);

  // Fetch tree data to check for README or top files in welcome screen
  const { tree } = useRepoTree(
    hasRepo ? owner : null,
    hasRepo ? repo : null,
    hasRepo ? branch : null,
  );

  // Track recently opened files in session and persistent storage
  useEffect(() => {
    if (selectedPath) {
      addRecentFile(selectedPath);
      setOpenFiles((prev) => {
        if (!prev.includes(selectedPath)) {
          return [...prev, selectedPath];
        }
        return prev;
      });
    }
  }, [selectedPath, addRecentFile]);

  // Connect private repos redirect handler
  useEffect(() => {
    if (authenticated && searchParams.get("connect") === "1") {
      connectPrivate();
    }
  }, [authenticated, connectPrivate, searchParams]);

  // Close tab handler
  const handleCloseTab = useCallback(
    (path: string) => {
      const next = openFiles.filter((p) => p !== path);
      setOpenFiles(next);
      if (selectedPath === path) {
        const nextSelected = next[next.length - 1] || null;
        if (nextSelected) {
          openFile(nextSelected);
        } else {
          closeFile();
        }
      }
    },
    [closeFile, openFile, openFiles, selectedPath],
  );

  // Toggle sidebar panel
  const handleToggleSidebar = useCallback(() => {
    const panel = treePanelRef.current;
    if (!panel) {
      setSidebarCollapsed((prev) => !prev);
      return;
    }
    if (panel.isCollapsed()) {
      panel.expand();
      setSidebarCollapsed(false);
    } else {
      panel.collapse();
      setSidebarCollapsed(true);
    }
  }, []);

  // Poweruser tab navigation handlers
  const handleNextTab = useCallback(() => {
    if (openFiles.length <= 1) return;
    const currentIndex = selectedPath ? openFiles.indexOf(selectedPath) : -1;
    const nextIndex = (currentIndex + 1) % openFiles.length;
    openFile(openFiles[nextIndex]);
  }, [openFiles, openFile, selectedPath]);

  const handlePrevTab = useCallback(() => {
    if (openFiles.length <= 1) return;
    const currentIndex = selectedPath ? openFiles.indexOf(selectedPath) : 0;
    const prevIndex = (currentIndex - 1 + openFiles.length) % openFiles.length;
    openFile(openFiles[prevIndex]);
  }, [openFiles, openFile, selectedPath]);

  const handleSelectTabIndex = useCallback(
    (index: number) => {
      if (openFiles[index]) {
        openFile(openFiles[index]);
      }
    },
    [openFiles, openFile],
  );

  const handleCloseActiveTab = useCallback(() => {
    if (selectedPath) {
      handleCloseTab(selectedPath);
    }
  }, [selectedPath, handleCloseTab]);

  // Global power-user shortcuts
  useGlobalShortcuts({
    onToggleQuickSwitcher: toggleQuickSwitcher,
    onToggleAppearance: toggleAppearance,
    onToggleSidebar: handleToggleSidebar,
    onOpenRepoPicker: toggleRepoPicker,
    onOpenShortcutsHelp: toggleShortcutsHelp,
    onCloseActiveTab: handleCloseActiveTab,
    onNextTab: handleNextTab,
    onPrevTab: handlePrevTab,
    onSelectTabIndex: handleSelectTabIndex,
  });

  return (
    <div className="bg-background flex h-dvh flex-col overflow-hidden">
      {/* Top Header */}
      <ViewerHeader
        onOpenRepository={openRepoPicker}
        onConnectPrivate={connectPrivate}
        onToggleSidebar={handleToggleSidebar}
        onOpenQuickSwitcher={openQuickSwitcher}
        onOpenShortcutsHelp={openShortcutsHelp}
        onOpenAppearance={openAppearance}
        sidebarCollapsed={sidebarCollapsed}
        sidebarHovered={sidebarHovered}
      />

      {/* Main Workspace Area */}
      {!hasRepo ? (
        <EmptyRepositoryState
          authenticated={authenticated}
          onChoose={openRepoPicker}
          onOpenQuickSwitcher={openQuickSwitcher}
          onOpenShortcutsHelp={openShortcutsHelp}
          onSelectRecent={(owner, repo, branch) =>
            selectRepository(owner, repo, branch)
          }
        />
      ) : (
        <main className="flex min-h-0 flex-1 overflow-hidden">
          {/* Desktop IDE Split Workspace (lg:flex) */}
          <div className="hidden h-full w-full lg:flex">
            <ResizablePanelGroup
              direction="horizontal"
              autoSaveId="repodeck:workspace-panel-layout"
              className="h-full w-full"
            >
              {/* Left Panel: File Tree Explorer */}
              <ResizablePanel
                id="tree-explorer-panel"
                order={1}
                ref={treePanelRef}
                defaultSize={23}
                minSize={16}
                maxSize={38}
                collapsible={true}
                onCollapse={() => {
                  setSidebarCollapsed(true);
                }}
                onExpand={() => {
                  setSidebarCollapsed(false);
                }}
                className={cn(
                  "bg-background flex flex-col border-r transition-all duration-150",
                  sidebarCollapsed &&
                    "!w-0 min-w-0 !flex-none overflow-hidden border-r-0",
                )}
              >
                <ViewerTreePanel />
              </ResizablePanel>

              {/* Vertical Resize Handle */}
              {!sidebarCollapsed && (
                <ResizableHandle
                  withHandle
                  className="bg-border/60 hover:bg-primary/50 data-[resize-handle-state=drag]:bg-primary w-1.5 transition-colors"
                />
              )}

              {/* Right Panel: Active File Viewer or Welcome Screen */}
              <ResizablePanel id="main-editor-panel" order={2} defaultSize={77}>
                <div className="flex h-full flex-col overflow-hidden">
                  {/* File Tabs Bar */}
                  {openFiles.length > 0 && (
                    <ViewerTabs
                      openFiles={openFiles}
                      activePath={selectedPath}
                      onSelect={openFile}
                      onClose={handleCloseTab}
                    />
                  )}

                  {/* Code Editor or Welcome */}
                  <div className="min-h-0 flex-1 overflow-hidden">
                    {selectedPath ? (
                      <CodeFileViewer
                        owner={owner ?? ""}
                        repo={repo ?? ""}
                        branch={branch ?? ""}
                        filePath={selectedPath}
                        onClose={closeFile}
                        toolsOpen={mobileToolsOpen}
                        onToolsOpenChange={setMobileToolsOpen}
                      />
                    ) : (
                      <RepositoryWorkspaceWelcome
                        owner={owner ?? ""}
                        repo={repo ?? ""}
                        branch={branch ?? ""}
                        tree={tree}
                        recentFiles={recentFiles}
                        onOpenFile={openFile}
                        onOpenQuickSwitcher={openQuickSwitcher}
                        onOpenRepoPicker={openRepoPicker}
                        onOpenShortcutsHelp={openShortcutsHelp}
                      />
                    )}
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>

          {/* Mobile Single-Screen View (< lg) */}
          <div className="relative flex h-full w-full flex-col overflow-hidden pb-18 lg:hidden">
            {selectedPath ? (
              <div className="flex h-full flex-col overflow-hidden">
                <CodeFileViewer
                  owner={owner ?? ""}
                  repo={repo ?? ""}
                  branch={branch ?? ""}
                  filePath={selectedPath}
                  onClose={closeFile}
                  toolsOpen={mobileToolsOpen}
                  onToolsOpenChange={setMobileToolsOpen}
                />
              </div>
            ) : (
              <div className="flex h-full flex-col overflow-hidden">
                <ViewerTreePanel />
              </div>
            )}
          </div>
        </main>
      )}

      {/* Mobile Bottom Navigation Bar (< lg) */}
      <MobileBottomNav
        hasRepo={hasRepo}
        selectedPath={selectedPath}
        branch={branch}
        isSearchActive={quickSwitcherOpen}
        isRepoPickerActive={repoPickerOpen}
        onOpenTree={() => {
          setQuickSwitcherOpen(false);
          setRepoPickerOpen(false);
          setShortcutsHelpOpen(false);
          setAppearanceOpen(false);
          if (selectedPath) {
            closeFile();
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
        onOpenViewer={() => {
          setQuickSwitcherOpen(false);
          setRepoPickerOpen(false);
          setShortcutsHelpOpen(false);
          setAppearanceOpen(false);
          if (!selectedPath) {
            if (openFiles.length > 0) {
              openFile(openFiles[openFiles.length - 1]);
            } else if (recentFiles.length > 0) {
              openFile(recentFiles[0].path);
            } else {
              const readme = tree.find(
                (n) =>
                  n.type === "blob" && n.name.toLowerCase() === "readme.md",
              );
              const firstBlob = tree.find((n) => n.type === "blob");
              if (readme) openFile(readme.path);
              else if (firstBlob) openFile(firstBlob.path);
            }
          }
        }}
        onOpenSearch={toggleQuickSwitcher}
        onOpenRepoPicker={toggleRepoPicker}
      />

      {/* Quick Switcher / Universal Command Palette Dialog (Cmd+K / Ctrl+K) */}
      <QuickSwitcherDialog
        open={quickSwitcherOpen}
        onOpenChange={setQuickSwitcherOpen}
        onToggleSidebar={() => {
          const panel = treePanelRef.current;
          if (panel) {
            if (panel.isCollapsed()) panel.expand();
            else panel.collapse();
          }
        }}
        onOpenRepoPicker={openRepoPicker}
        onOpenShortcutsHelp={openShortcutsHelp}
      />

      {/* Keyboard Shortcuts Reference Dialog */}
      <ShortcutsHelpDialog
        open={shortcutsHelpOpen}
        onOpenChange={setShortcutsHelpOpen}
      />

      {/* Repository Picker Dialog */}
      <RepositoryPickerDialog
        open={repoPickerOpen}
        onOpenChange={setRepoPickerOpen}
        currentOwner={owner}
        currentRepo={repo}
        currentBranch={branch}
        onSelectRepository={selectRepository}
        onConnectPrivate={connectPrivate}
      />

      {/* Theme & Appearance Studio Sheet */}
      <AppearanceSettingsDialog
        open={appearanceOpen}
        onOpenChange={setAppearanceOpen}
      />
    </div>
  );
}

interface RepositoryWorkspaceWelcomeProps {
  owner: string;
  repo: string;
  branch: string;
  tree: { path: string; name: string; type: "blob" | "tree"; size?: number }[];
  recentFiles?: RecentFileItem[];
  onOpenFile: (path: string) => void;
  onOpenQuickSwitcher?: () => void;
  onOpenRepoPicker?: () => void;
  onOpenShortcutsHelp?: () => void;
}

function RepositoryWorkspaceWelcome({
  owner,
  repo,
  branch,
  tree,
  recentFiles,
  onOpenFile,
  onOpenQuickSwitcher,
  onOpenRepoPicker,
  onOpenShortcutsHelp,
}: RepositoryWorkspaceWelcomeProps) {
  const modifier = useModifierKey();

  // Key project entrypoints
  const readme = tree.find(
    (n) => n.type === "blob" && n.name.toLowerCase() === "readme.md",
  );
  const manifest = tree.find(
    (n) =>
      n.type === "blob" &&
      (n.name === "package.json" ||
        n.name === "Cargo.toml" ||
        n.name === "pyproject.toml" ||
        n.name === "go.mod" ||
        n.name === "pom.xml"),
  );
  const license = tree.find(
    (n) => n.type === "blob" && n.name.toLowerCase().startsWith("license"),
  );
  const config = tree.find(
    (n) =>
      n.type === "blob" &&
      (n.name === "tsconfig.json" ||
        n.name === "Dockerfile" ||
        n.name === ".gitignore"),
  );
  const blobs = tree.filter((n) => n.type === "blob");

  const keyFiles: { path: string; name: string; description: string }[] = [];
  if (readme) {
    keyFiles.push({
      path: readme.path,
      name: readme.name,
      description: "Project documentation",
    });
  }
  if (manifest) {
    keyFiles.push({
      path: manifest.path,
      name: manifest.name,
      description: "Manifest & dependencies",
    });
  }
  if (license) {
    keyFiles.push({
      path: license.path,
      name: license.name,
      description: "License terms",
    });
  }
  if (config) {
    keyFiles.push({
      path: config.path,
      name: config.name,
      description: "Configuration",
    });
  }

  return (
    <div className="bg-background flex min-h-0 flex-1 flex-col items-center justify-center overflow-auto p-6 text-center select-none">
      <div className="w-full max-w-xl space-y-5">
        {/* Repo Identity Hero */}
        <div className="space-y-3">
          <RepoIcon
            owner={owner}
            repo={repo}
            branch={branch}
            className="mx-auto h-16 w-16"
            iconClassName="h-full w-full rounded-2xl"
          />

          <div>
            <h2 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
              <span className="text-muted-foreground font-normal">
                {owner} /{" "}
              </span>
              {repo}
            </h2>
            <div className="mt-2 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={onOpenRepoPicker}
                className="hover:bg-muted/60 border-border/70 group flex cursor-pointer items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-xs transition-colors"
                title={`Change branch or repository (${modifier}+O)`}
              >
                <GitBranch className="text-primary h-3 w-3" />
                <span className="text-foreground font-medium">{branch}</span>
              </button>
              <Badge variant="secondary" className="font-mono text-xs">
                {blobs.length} {blobs.length === 1 ? "file" : "files"}
              </Badge>
              <a
                href={`https://github.com/${owner}/${repo}/tree/${branch}`}
                target="_blank"
                rel="noreferrer noopener"
                className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs transition-colors"
                title="View on GitHub"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Recently Opened Files (Clean List Format with No Truncation) */}
        {recentFiles && recentFiles.length > 0 && (
          <div className="border-border/80 bg-card rounded-xl border p-3 text-left shadow-xs">
            <div className="mb-1.5 flex items-center justify-between px-1">
              <p className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase">
                <Clock className="text-primary h-3.5 w-3.5" /> Jump back in
              </p>
              <span className="text-muted-foreground font-mono text-[10px]">
                {recentFiles.length} recent{" "}
                {recentFiles.length === 1 ? "file" : "files"}
              </span>
            </div>

            <div className="divide-border/40 divide-y">
              {recentFiles.slice(0, 4).map((file) => {
                const dirPath = file.path.split("/").slice(0, -1).join("/");
                return (
                  <button
                    key={file.path}
                    type="button"
                    onClick={() => onOpenFile(file.path)}
                    className="hover:bg-muted/60 group flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-left transition-colors"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <FileIcon name={file.name} className="h-4 w-4 shrink-0" />
                      <span className="text-foreground group-hover:text-primary truncate text-xs font-medium transition-colors">
                        {file.name}
                      </span>
                      {dirPath && (
                        <span className="text-muted-foreground/60 hidden truncate font-mono text-[11px] sm:inline">
                          {dirPath}
                        </span>
                      )}
                    </div>
                    <span className="text-muted-foreground shrink-0 font-mono text-[10px]">
                      {formatDistanceToNow(new Date(file.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Key Project Files (Clean List Format matching Jump Back In) */}
        {keyFiles.length > 0 && (
          <div className="border-border/80 bg-card rounded-xl border p-3 text-left shadow-xs">
            <p className="text-muted-foreground mb-1.5 flex items-center gap-1.5 px-1 text-[11px] font-semibold tracking-wider uppercase">
              <Sparkles className="text-primary h-3.5 w-3.5" /> Key Project
              Files
            </p>

            <div className="divide-border/40 divide-y">
              {keyFiles.map((file) => (
                <button
                  key={file.path}
                  type="button"
                  onClick={() => onOpenFile(file.path)}
                  className="hover:bg-muted/60 group flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-1.5 text-left transition-colors"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <FileIcon name={file.name} className="h-4 w-4 shrink-0" />
                    <span className="text-foreground group-hover:text-primary truncate text-xs font-medium transition-colors">
                      {file.name}
                    </span>
                  </div>
                  <span className="text-muted-foreground/70 shrink-0 font-mono text-[10px]">
                    {file.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Shortcuts Quick Reference */}
        <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 pt-1 text-[11px]">
          {onOpenQuickSwitcher && (
            <button
              type="button"
              onClick={onOpenQuickSwitcher}
              className="hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 transition-colors"
            >
              <Kbd>{modifier}++K</Kbd> Quick Switcher
            </button>
          )}
          {onOpenRepoPicker && (
            <button
              type="button"
              onClick={onOpenRepoPicker}
              className="hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 transition-colors"
            >
              <Kbd>{modifier}+O</Kbd> Switch Repo
            </button>
          )}
          {onOpenShortcutsHelp && (
            <button
              type="button"
              onClick={onOpenShortcutsHelp}
              className="hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 transition-colors"
            >
              <Kbd>?</Kbd> Shortcuts
            </button>
          )}
          <span className="flex items-center gap-1.5">
            <Kbd>Esc</Kbd> Close Overlays
          </span>
        </div>
      </div>
    </div>
  );
}

interface EmptyRepositoryStateProps {
  authenticated: boolean;
  onChoose: () => void;
  onOpenQuickSwitcher?: () => void;
  onOpenShortcutsHelp?: () => void;
  onSelectRecent?: (owner: string, repo: string, branch: string) => void;
}

function EmptyRepositoryState({
  authenticated,
  onChoose,
  onOpenQuickSwitcher,
  onOpenShortcutsHelp,
  onSelectRecent,
}: EmptyRepositoryStateProps) {
  const modifier = useModifierKey();
  const [recentRepos, setRecentRepos] = useState<
    Array<{ owner: string; repo: string; branch: string; timestamp: number }>
  >([]);

  useEffect(() => {
    setRecentRepos(authenticated ? getRecentRepos() : []);
  }, [authenticated]);

  return (
    <main className="bg-background flex min-h-0 flex-1 flex-col items-center justify-center overflow-auto p-6 text-center select-none">
      <div className="w-full max-w-xl space-y-5">
        {/* Workspace Identity Hero */}
        <div className="space-y-3">
          <RepoDeckIcon
            size={64}
            className="mx-auto h-16 w-16 object-contain"
          />

          <div>
            <h2 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
              RepoDeck Workspace
            </h2>
            <p className="text-muted-foreground mx-auto mt-1.5 max-w-sm text-xs leading-relaxed">
              Open the cached RepoDeck demo, or sign in to browse your GitHub
              repositories with studio-grade highlighting.
            </p>
          </div>
        </div>

        {/* Quick Action Triggers */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button
            asChild
            size="sm"
            variant="outline"
            className="h-9 cursor-pointer gap-2.5 px-4 text-xs font-semibold"
          >
            <a href="/repositories?owner=Abdo12KM&repo=repodeck&ref=main">
              <RepoDeckIcon size={18} variant="flat" className="h-4.5 w-4.5" />
              <span>Open RepoDeck demo</span>
            </a>
          </Button>

          <Button
            onClick={onChoose}
            size="sm"
            className="h-9 cursor-pointer gap-2.5 px-4 text-xs font-semibold shadow-xs"
          >
            <RepoDeckIcon size={18} variant="flat" className="h-4.5 w-4.5" />
            <span>
              {authenticated ? "Choose a repository" : "Sign in to browse"}
            </span>
            <Kbd className="bg-primary-foreground/20 text-primary-foreground text-[10px]">
              {modifier}+O
            </Kbd>
          </Button>

          {onOpenQuickSwitcher && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenQuickSwitcher}
              className="h-9 cursor-pointer gap-2 text-xs font-medium"
            >
              <Search className="h-3.5 w-3.5" />
              <span>Quick Switcher</span>
              <Kbd className="text-[10px]">{modifier}++K</Kbd>
            </Button>
          )}
        </div>

        {/* Recent Repositories List */}
        {recentRepos.length > 0 && (
          <div className="border-border/80 bg-card rounded-xl border p-3 text-left shadow-xs">
            <div className="mb-1.5 flex items-center justify-between px-1">
              <p className="text-muted-foreground flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase">
                <Clock className="text-primary h-3.5 w-3.5" /> Jump back in
              </p>
              <span className="text-muted-foreground font-mono text-[10px]">
                {recentRepos.length} recent{" "}
                {recentRepos.length === 1 ? "repository" : "repositories"}
              </span>
            </div>

            <div className="divide-border/40 divide-y">
              {recentRepos.slice(0, 5).map((r) => (
                <button
                  key={`${r.owner}/${r.repo}`}
                  type="button"
                  onClick={() => {
                    if (onSelectRecent) {
                      onSelectRecent(r.owner, r.repo, r.branch);
                    } else {
                      window.location.href = `/repositories?owner=${r.owner}&repo=${r.repo}&ref=${r.branch}`;
                    }
                  }}
                  className="hover:bg-muted/60 group flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-2.5 py-2 text-left transition-colors"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-2.5">
                    <RepoIcon
                      owner={r.owner}
                      repo={r.repo}
                      branch={r.branch}
                      iconClassName="h-4 w-4 shrink-0 rounded-xs"
                    />
                    <div className="min-w-0 flex-1 truncate text-xs">
                      <span className="text-muted-foreground font-normal">
                        {r.owner}/
                      </span>
                      <span className="text-foreground group-hover:text-primary font-semibold transition-colors">
                        {r.repo}
                      </span>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Badge
                      variant="secondary"
                      className="h-4.5 px-1.5 font-mono text-[10px]"
                    >
                      <GitBranch className="mr-0.5 h-2.5 w-2.5" />
                      {r.branch}
                    </Badge>
                    <span className="text-muted-foreground/60 hidden font-mono text-[10px] sm:inline">
                      {formatDistanceToNow(new Date(r.timestamp), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Shortcuts Quick Reference */}
        <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 pt-1 text-[11px]">
          <button
            type="button"
            onClick={onChoose}
            className="hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 transition-colors"
          >
            <Kbd>{modifier}+O</Kbd> Browse repositories
          </button>
          {onOpenQuickSwitcher && (
            <button
              type="button"
              onClick={onOpenQuickSwitcher}
              className="hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 transition-colors"
            >
              <Kbd>{modifier}++K</Kbd> Quick Switcher
            </button>
          )}
          {onOpenShortcutsHelp && (
            <button
              type="button"
              onClick={onOpenShortcutsHelp}
              className="hover:text-foreground inline-flex cursor-pointer items-center gap-1.5 transition-colors"
            >
              <Kbd>?</Kbd> Shortcuts
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
