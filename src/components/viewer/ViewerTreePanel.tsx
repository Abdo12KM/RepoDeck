"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
  ChevronDown,
  ChevronRight,
  ChevronsDownUp,
  ChevronsUpDown,
  FileCode2,
  Loader2,
  Search,
  X,
  FolderTree,
  GitBranch,
  Clock,
  ListX,
} from "lucide-react";
import type { TreeNode } from "@/types/github";
import { useRepoTree } from "@/hooks/useRepoTree";
import { useViewer } from "@/hooks/useViewer";
import { useRecentFiles } from "@/hooks/useRecentFiles";
import { useIsTouchDevice } from "@/hooks/useTouchDevice";
import { useLiveNow } from "@/hooks/useLiveNow";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { FileIcon } from "@/components/repo/tree/FileIcon";
import { cn, formatElapsedTime } from "@/lib/utils";

interface ViewerTreePanelProps {
  className?: string;
  onSelectFile?: (path: string) => void;
}

interface ViewerTreeDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FlatNode extends TreeNode {
  depth: number;
  isExpanded: boolean;
  hasChildren: boolean;
}

function formatBytes(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ViewerTreePanel({
  className,
  onSelectFile,
}: ViewerTreePanelProps) {
  const { owner, repo, branch, selectedPath, openFile } = useViewer();
  const treeState = useRepoTree(owner, repo, branch);
  const { expandParents } = treeState;
  const { recentFiles, removeRecentFile, clearRecentFiles } = useRecentFiles(
    owner,
    repo,
  );
  const isTouchDevice = useIsTouchDevice();
  const [panelTab, setPanelTab] = useState<"files" | "recents">("files");
  const [query, setQuery] = useState("");

  // Ensure parent directories of active file are expanded in the tree
  useEffect(() => {
    if (selectedPath) {
      expandParents(selectedPath);
    }
  }, [selectedPath, expandParents]);

  const flatNodes = useMemo(() => {
    if (!query.trim()) {
      const result: FlatNode[] = [];
      const flatten = (nodes: TreeNode[], depth: number) => {
        for (const node of nodes) {
          const isDirectory = node.type === "tree";
          const children = isDirectory ? treeState.getChildren(node.path) : [];
          const expanded = isDirectory && treeState.isExpanded(node.path);
          result.push({
            ...node,
            depth,
            isExpanded: expanded,
            hasChildren: children.length > 0,
          });
          if (expanded && children.length > 0) flatten(children, depth + 1);
        }
      };
      flatten(treeState.getRootNodes(), 0);
      return result;
    }

    const normalized = query.trim().toLowerCase();
    return treeState.tree
      .filter(
        (node) =>
          node.type === "blob" && node.path.toLowerCase().includes(normalized),
      )
      .map((node) => ({
        ...node,
        depth: 0,
        isExpanded: false,
        hasChildren: false,
      }));
  }, [query, treeState]);

  // Filtered recent files
  const filteredRecents = useMemo(() => {
    if (!query.trim()) return recentFiles;
    const q = query.trim().toLowerCase();
    return recentFiles.filter(
      (r) =>
        r.path.toLowerCase().includes(q) || r.name.toLowerCase().includes(q),
    );
  }, [recentFiles, query]);

  const liveNow = useLiveNow(
    panelTab === "recents" && filteredRecents.length > 0,
  );

  const fileCount = useMemo(() => {
    return treeState.tree.filter((node) => node.type === "blob").length;
  }, [treeState.tree]);

  const handleSelect = (path: string) => {
    openFile(path);
    onSelectFile?.(path);
  };

  return (
    <Tabs
      value={panelTab}
      onValueChange={(val) => setPanelTab(val as "files" | "recents")}
      className={cn(
        "bg-background flex h-full min-h-0 flex-1 flex-col gap-0 select-none",
        className,
      )}
    >
      {/* Row 1: Top Underlined Tab Switcher: Files vs Recents (h-9 matches ViewerTabs) */}
      <div className="bg-muted/40 flex h-9 shrink-0 items-center border-b px-2">
        <TabsList
          variant="line"
          className="flex h-9! w-full items-center gap-1"
        >
          <TabsTrigger
            value="files"
            className="after:bg-primary data-[state=active]:text-foreground text-muted-foreground flex-1 shrink-0 gap-1.5 text-xs transition-colors data-[state=active]:font-semibold"
          >
            <FolderTree className="h-3.5 w-3.5" />
            <span>Files</span>
            {fileCount > 0 && (
              <span
                className={cn(
                  "py-0.2 rounded-xs px-1.5 font-mono text-[10px]",
                  panelTab === "files"
                    ? "bg-muted text-foreground font-semibold"
                    : "bg-muted/60 text-muted-foreground",
                )}
              >
                {fileCount}
              </span>
            )}
          </TabsTrigger>

          <TabsTrigger
            value="recents"
            className="after:bg-primary data-[state=active]:text-foreground text-muted-foreground flex-1 shrink-0 gap-1.5 text-xs transition-colors data-[state=active]:font-semibold"
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Recents</span>
            {recentFiles.length > 0 && (
              <span
                className={cn(
                  "py-0.2 rounded-xs px-1.5 font-mono text-[10px]",
                  panelTab === "recents"
                    ? "bg-muted text-foreground font-semibold"
                    : "bg-muted/60 text-muted-foreground",
                )}
              >
                {recentFiles.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Row 2: Search & Filter Toolbar (h-9 matches CodeFileViewer breadcrumb toolbar) */}
      <div
        className={cn(
          "bg-muted/20 flex h-9 shrink-0 items-center justify-between border-b pl-2.5 shadow-2xs",
          (panelTab === "files" && !query) ||
            (panelTab === "recents" && recentFiles.length > 0)
            ? "gap-1.5 pr-2"
            : "pr-2.5",
        )}
      >
        <div className="relative min-w-0 flex-1">
          <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 h-3 w-3 -translate-y-1/2" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={
              panelTab === "files"
                ? "Filter file tree..."
                : "Filter recent files..."
            }
            className="bg-background/80 border-border/70 text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-primary/20 h-6.5 w-full rounded-md border pr-5 pl-6.5 text-xs outline-hidden focus:ring-1"
            aria-label="Search repository files"
          />
          {query && (
            <button
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-1.5 -translate-y-1/2 cursor-pointer p-0.5"
              onClick={() => setQuery("")}
              aria-label="Clear search"
            >
              <X className="h-2.5 w-2.5" />
            </button>
          )}
        </div>

        {((panelTab === "files" && !query) ||
          (panelTab === "recents" && recentFiles.length > 0)) && (
          <div className="flex shrink-0 items-center">
            {panelTab === "files" ? (
              <Button
                variant="ghost"
                size="icon-xs"
                className="text-muted-foreground hover:text-foreground h-6.5 w-6.5 shrink-0 cursor-pointer"
                onClick={
                  treeState.isAnyExpanded
                    ? treeState.collapseAll
                    : treeState.expandAll
                }
                disabled={treeState.isExpanding}
                title={
                  treeState.isAnyExpanded
                    ? "Collapse all folders"
                    : "Expand all folders"
                }
                aria-label={
                  treeState.isAnyExpanded
                    ? "Collapse all folders"
                    : "Expand all folders"
                }
              >
                {treeState.isExpanding ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : treeState.isAnyExpanded ? (
                  <ChevronsDownUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronsUpDown className="h-3.5 w-3.5" />
                )}
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={clearRecentFiles}
                className="text-muted-foreground hover:text-destructive h-6.5 w-6.5 shrink-0 cursor-pointer"
                title="Clear recent files history"
                aria-label="Clear recent files history"
              >
                <ListX className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Main Content Area - Parent pr-1.5 physically insets the scrollbar away from the resize handle */}
      <div className="min-h-0 flex-1 overflow-hidden pr-1.5">
        <TabsContent
          value="files"
          className="mt-0 h-full min-h-0 flex-1 overflow-hidden outline-none data-[state=inactive]:hidden"
        >
          {treeState.isLoading ? (
            <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 p-6 text-xs">
              <Loader2 className="text-primary h-5 w-5 animate-spin" />
              <span>Loading tree structure...</span>
            </div>
          ) : treeState.error ? (
            <div className="text-destructive space-y-2 p-6 text-center text-xs">
              <p className="font-semibold">Could not load repository tree.</p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => treeState.refetch()}
                className="text-xs"
              >
                Retry
              </Button>
            </div>
          ) : flatNodes.length === 0 ? (
            <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-xs">
              <FileCode2 className="h-7 w-7 opacity-40" />
              <span>
                {query ? `No files matching "${query}"` : "No files found"}
              </span>
            </div>
          ) : (
            <VirtualTreeList
              nodes={flatNodes}
              selectedPath={selectedPath}
              query={query}
              onSelect={handleSelect}
              onToggle={treeState.toggleExpanded}
            />
          )}
        </TabsContent>

        <TabsContent
          value="recents"
          className="mt-0 h-full min-h-0 flex-1 overflow-hidden outline-none data-[state=inactive]:hidden"
        >
          <ScrollArea
            className="h-full py-1"
            viewportClassName="[&>div]:!block"
            hideHorizontal
          >
            {filteredRecents.length === 0 ? (
              <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 p-8 text-center text-xs">
                <Clock className="text-primary h-8 w-8 opacity-30" />
                <p className="text-foreground font-semibold">
                  No recent files yet
                </p>
                <p className="text-muted-foreground max-w-xs text-[11px]">
                  Files you open will appear here for fast 1-tap switching
                  without expanding folders.
                </p>
              </div>
            ) : (
              <div className="w-full space-y-0.5">
                {filteredRecents.map((item) => {
                  const isSelected = selectedPath === item.path;
                  const dirPath = item.path.split("/").slice(0, -1).join("/");

                  return (
                    <button
                      key={item.path}
                      type="button"
                      onClick={() => handleSelect(item.path)}
                      title={item.path}
                      className={cn(
                        "group hover:bg-accent/70 active:bg-accent relative flex w-full min-w-0 cursor-pointer items-center justify-between gap-1.5 rounded-r-md px-2 py-1.5 text-left text-xs transition-colors",
                        isSelected &&
                          "bg-primary/10 text-primary before:bg-primary font-medium before:absolute before:top-1 before:bottom-1 before:left-0 before:w-1 before:rounded-r",
                      )}
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-2 pl-2">
                        <FileIcon
                          name={item.name}
                          isFolder={false}
                          className="h-4 w-4 shrink-0"
                        />
                        <div className="flex min-w-0 flex-1 flex-col justify-center">
                          <span className="text-foreground group-hover:text-primary min-w-0 truncate text-[12px] font-medium transition-colors">
                            {query
                              ? highlightMatch(item.name, query)
                              : item.name}
                          </span>
                          {dirPath && (
                            <span className="text-muted-foreground/60 min-w-0 truncate font-mono text-[10px] leading-tight">
                              {query ? highlightMatch(dirPath, query) : dirPath}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1 pl-1">
                        <span
                          className="text-muted-foreground/60 font-mono text-[10px] whitespace-nowrap"
                          title={formatElapsedTime(item.timestamp, liveNow)}
                        >
                          {formatElapsedTime(item.timestamp, liveNow)}
                        </span>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            removeRecentFile(item.path);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.stopPropagation();
                              removeRecentFile(item.path);
                            }
                          }}
                          className={cn(
                            "text-muted-foreground hover:text-destructive hover:bg-muted/80 flex h-4 w-4 shrink-0 cursor-pointer items-center justify-center rounded-xs transition-opacity",
                            isTouchDevice
                              ? "opacity-100"
                              : "opacity-0 group-hover:opacity-100",
                          )}
                          title="Remove from recents"
                          aria-label="Remove from recents"
                        >
                          <X className="h-3 w-3" />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </div>
    </Tabs>
  );
}

export function ViewerTreeDrawer({
  open,
  onOpenChange,
}: ViewerTreeDrawerProps) {
  const { owner, repo, branch } = useViewer();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="flex w-[min(90vw,360px)] flex-col gap-0 p-0 lg:hidden"
      >
        <SheetHeader className="bg-muted/30 shrink-0 border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderTree className="text-primary h-4 w-4" />
              <SheetTitle className="max-w-44 truncate text-sm font-semibold">
                {owner}/{repo}
              </SheetTitle>
            </div>
            {branch && (
              <Badge
                variant="outline"
                className="flex items-center gap-1 font-mono text-[10px]"
              >
                <GitBranch className="h-2.5 w-2.5" />
                {branch}
              </Badge>
            )}
          </div>
        </SheetHeader>
        <ViewerTreePanel onSelectFile={() => onOpenChange(false)} />
      </SheetContent>
    </Sheet>
  );
}

function VirtualTreeList({
  nodes,
  selectedPath,
  query,
  onSelect,
  onToggle,
}: {
  nodes: FlatNode[];
  selectedPath: string | null;
  query: string;
  onSelect: (path: string) => void;
  onToggle: (path: string) => void;
}) {
  const isSearching = Boolean(query.trim());
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: nodes.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => (isSearching ? 44 : 36),
    overscan: 16,
    getItemKey: (index) => nodes[index]?.path ?? index,
  });

  return (
    <ScrollArea
      viewportRef={scrollRef}
      className="h-full touch-manipulation py-1"
      hideHorizontal
    >
      <div
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map((item) => {
          const node = nodes[item.index];
          const isDirectory = node.type === "tree";
          const isSelected = selectedPath === node.path;
          const dirPath = node.path.split("/").slice(0, -1).join("/");

          if (isSearching) {
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelect(node.path)}
                title={node.path}
                className={cn(
                  "group hover:bg-accent/70 active:bg-accent absolute right-0 left-0 flex h-11 cursor-pointer items-center justify-between gap-1.5 rounded-r-md px-2 text-left text-xs transition-colors",
                  isSelected &&
                    "bg-primary/10 text-primary before:bg-primary font-medium before:absolute before:top-1 before:bottom-1 before:left-0 before:w-1 before:rounded-r",
                )}
                style={{
                  top: 0,
                  transform: `translateY(${item.start}px)`,
                  paddingLeft: "8px",
                }}
              >
                <div className="flex min-w-0 flex-1 items-center gap-2 pl-2">
                  <FileIcon
                    name={node.name}
                    isFolder={false}
                    className="h-4 w-4 shrink-0"
                  />
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <span className="text-foreground group-hover:text-primary min-w-0 truncate text-[12px] font-medium transition-colors">
                      {highlightMatch(node.name, query)}
                    </span>
                    {dirPath && (
                      <span className="text-muted-foreground/60 min-w-0 truncate font-mono text-[10px] leading-tight">
                        {highlightMatch(dirPath, query)}
                      </span>
                    )}
                  </div>
                </div>

                {!isDirectory && node.size ? (
                  <span className="text-muted-foreground/60 shrink-0 pl-1 font-mono text-[10px] whitespace-nowrap">
                    {formatBytes(node.size)}
                  </span>
                ) : null}
              </button>
            );
          }

          return (
            <button
              key={item.key}
              type="button"
              onClick={() =>
                isDirectory ? onToggle(node.path) : onSelect(node.path)
              }
              title={node.path}
              className={cn(
                "group hover:bg-accent/70 active:bg-accent absolute right-0 left-0 flex h-9 cursor-pointer items-center gap-1.5 rounded-r-md px-2 text-left text-xs transition-colors sm:h-[34px]",
                isSelected &&
                  "bg-primary/10 text-primary before:bg-primary font-medium before:absolute before:top-1 before:bottom-1 before:left-0 before:w-1 before:rounded-r",
              )}
              style={{
                top: 0,
                transform: `translateY(${item.start}px)`,
                paddingLeft: `${node.depth * 14 + 8}px`,
              }}
              aria-expanded={isDirectory ? node.isExpanded : undefined}
            >
              {/* Chevron icon for folders */}
              <span className="text-muted-foreground group-hover:text-foreground flex h-4 w-4 shrink-0 items-center justify-center">
                {isDirectory &&
                  (node.isExpanded ? (
                    <ChevronDown className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5" />
                  ))}
              </span>

              {/* File / Folder icon */}
              <FileIcon
                name={node.name}
                isFolder={isDirectory}
                isOpen={node.isExpanded}
                className="h-4 w-4 shrink-0"
              />

              {/* Node label */}
              <span className="min-w-0 flex-1 truncate text-[12px]">
                {node.name}
              </span>

              {/* File size badge */}
              {!isDirectory && node.size ? (
                <span className="text-muted-foreground/60 shrink-0 font-mono text-[10px]">
                  {formatBytes(node.size)}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}

function highlightMatch(text: string, query: string) {
  if (!query.trim()) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;

  const before = text.slice(0, idx);
  const match = text.slice(idx, idx + query.length);
  const after = text.slice(idx + query.length);

  return (
    <>
      {before}
      <mark className="bg-primary/20 text-primary rounded-xs px-0.5 font-semibold">
        {match}
      </mark>
      {after}
    </>
  );
}
