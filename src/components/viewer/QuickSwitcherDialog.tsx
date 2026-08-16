"use client";

import { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
  FileCode2,
  GitBranch,
  Command,
  Sun,
  Moon,
  Paintbrush,
  PanelLeft,
  Copy,
  ExternalLink,
  LockKeyhole,
  X,
} from "lucide-react";
import { RepoDeckIcon } from "@/components/ui/RepoDeckLogo";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Kbd } from "@/components/ui/kbd";
import { FileIcon } from "@/components/repo/tree/FileIcon";
import { useViewer } from "@/hooks/useViewer";
import { useRepoTree } from "@/hooks/useRepoTree";
import { useRecentFiles } from "@/hooks/useRecentFiles";
import { useBranches, useRepos } from "@/hooks/useGitHub";
import { useAppearanceSettings } from "@/hooks/useAppearanceSettings";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/useAuth";
import { useModifierKey } from "@/hooks/useModifierKey";
import { useIsTouchDevice } from "@/hooks/useTouchDevice";
import { useLiveNow } from "@/hooks/useLiveNow";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, formatElapsedTime } from "@/lib/utils";

type CommandCategory = "all" | "files" | "branches" | "repos" | "commands";

interface PaletteSection {
  id: string;
  title: string;
  items: PaletteItem[];
}

interface PaletteItem {
  id: string;
  type: "recent" | "file" | "branch" | "repo" | "command";
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  shortcut?: string;
  badge?: string;
  meta?: string;
  isActive?: boolean;
  onSelect: () => void;
}

interface QuickSwitcherDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onToggleSidebar?: () => void;
  onOpenRepoPicker?: () => void;
  onOpenAppearance?: () => void;
  onOpenShortcutsHelp?: () => void;
}

export function QuickSwitcherDialog({
  open,
  onOpenChange,
  onToggleSidebar,
  onOpenRepoPicker,
  onOpenAppearance,
  onOpenShortcutsHelp,
}: QuickSwitcherDialogProps) {
  const {
    owner,
    repo,
    branch,
    openFile,
    selectedPath,
    setBranch,
    selectRepository,
    hasRepo,
  } = useViewer();

  const { tree } = useRepoTree(owner, repo, branch);
  const { recentFiles, removeRecentFile } = useRecentFiles(owner, repo);
  const { branches } = useBranches(owner || "", repo || "");
  const { repos } = useRepos("", Boolean(open));
  const { resolvedTheme, setTheme } = useTheme();
  const { settings } = useAppearanceSettings();
  const { connectPrivate } = useAuth();
  const modifier = useModifierKey();
  const isTouchDevice = useIsTouchDevice();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CommandCategory>("all");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Prefix handling (e.g., ">" for commands, "@" for branches, "#" for repos)
  const { effectiveQuery, activeCategory, hasExplicitPrefix } = useMemo(() => {
    const trimmed = query.trim();
    if (trimmed.startsWith(">") || trimmed.startsWith("cmd:")) {
      return {
        effectiveQuery: trimmed.replace(/^(>|cmd:)\s*/, ""),
        activeCategory: "commands" as CommandCategory,
        hasExplicitPrefix: true,
      };
    }
    if (
      trimmed.startsWith("@") ||
      trimmed.startsWith("b:") ||
      trimmed.startsWith("branch:")
    ) {
      return {
        effectiveQuery: trimmed.replace(/^(@|b:|branch:)\s*/, ""),
        activeCategory: "branches" as CommandCategory,
        hasExplicitPrefix: true,
      };
    }
    if (
      trimmed.startsWith("#") ||
      trimmed.startsWith("r:") ||
      trimmed.startsWith("repo:")
    ) {
      return {
        effectiveQuery: trimmed.replace(/^(#|r:|repo:)\s*/, ""),
        activeCategory: "repos" as CommandCategory,
        hasExplicitPrefix: true,
      };
    }
    return {
      effectiveQuery: trimmed,
      activeCategory: category,
      hasExplicitPrefix: false,
    };
  }, [query, category]);

  const liveNow = useLiveNow(
    open &&
      recentFiles.length > 0 &&
      (activeCategory === "all" || activeCategory === "files"),
  );

  // Copy helper
  const handleCopy = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  }, []);

  // Built-in actions and commands
  const commandItems = useMemo<PaletteItem[]>(() => {
    const actions: PaletteItem[] = [
      {
        id: "cmd-appearance",
        type: "command",
        title: "Open Theme & Appearance Studio",
        subtitle: "Customize color palettes, fonts, Shiki syntax, and geometry",
        icon: <Paintbrush className="text-primary h-4 w-4" />,
        shortcut: `${modifier}+,`,
        onSelect: () => {
          if (onOpenAppearance) onOpenAppearance();
          else
            window.dispatchEvent(new CustomEvent("repodeck:toggle-appearance"));
          onOpenChange(false);
        },
      },
      {
        id: "cmd-theme-toggle",
        type: "command",
        title: `Toggle Theme (Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} Mode)`,
        subtitle: "Instantly switch application color mode",
        icon:
          resolvedTheme === "dark" ? (
            <Sun className="h-4 w-4 text-amber-500" />
          ) : (
            <Moon className="h-4 w-4 text-indigo-400" />
          ),
        onSelect: () => {
          setTheme(resolvedTheme === "dark" ? "light" : "dark");
          onOpenChange(false);
        },
      },
    ];

    if (hasRepo) {
      if (onToggleSidebar) {
        actions.push({
          id: "cmd-toggle-sidebar",
          type: "command",
          title: "Toggle File Tree Sidebar",
          subtitle: "Expand or collapse the explorer tree panel",
          icon: <PanelLeft className="text-muted-foreground h-4 w-4" />,
          shortcut: `${modifier}+B`,
          onSelect: () => {
            onToggleSidebar();
            onOpenChange(false);
          },
        });
      }

      if (onOpenRepoPicker) {
        actions.push({
          id: "cmd-switch-repo",
          type: "command",
          title: "Switch Repository...",
          subtitle: "Browse and open public or private repositories",
          icon: (
            <RepoDeckIcon size={18} variant="flat" className="h-4.5 w-4.5" />
          ),
          shortcut: `${modifier}+O`,
          onSelect: () => {
            onOpenRepoPicker();
            onOpenChange(false);
          },
        });
      }

      if (onOpenShortcutsHelp) {
        actions.push({
          id: "cmd-shortcuts-help",
          type: "command",
          title: "Keyboard Shortcuts",
          subtitle: "View all keyboard shortcuts and navigation hotkeys",
          icon: <Command className="text-primary h-4 w-4" />,
          shortcut: "?",
          onSelect: () => {
            onOpenShortcutsHelp();
            onOpenChange(false);
          },
        });
      }

      actions.push(
        {
          id: "cmd-copy-repo-url",
          type: "command",
          title: "Copy Repository GitHub URL",
          subtitle: `https://github.com/${owner}/${repo}`,
          icon: <Copy className="text-muted-foreground h-4 w-4" />,
          badge: copiedId === "cmd-copy-repo-url" ? "Copied!" : undefined,
          onSelect: () => {
            handleCopy(
              `https://github.com/${owner}/${repo}`,
              "cmd-copy-repo-url",
            );
          },
        },
        {
          id: "cmd-open-github",
          type: "command",
          title: "Open Repository on GitHub",
          subtitle: `View ${owner}/${repo} on github.com`,
          icon: <ExternalLink className="text-muted-foreground h-4 w-4" />,
          shortcut: "↗",
          onSelect: () => {
            window.open(
              `https://github.com/${owner}/${repo}`,
              "_blank",
              "noopener,noreferrer",
            );
            onOpenChange(false);
          },
        },
      );

      if (selectedPath) {
        actions.push(
          {
            id: "cmd-copy-file-path",
            type: "command",
            title: "Copy Current File Path",
            subtitle: selectedPath,
            icon: <Copy className="text-muted-foreground h-4 w-4" />,
            badge: copiedId === "cmd-copy-file-path" ? "Copied!" : undefined,
            onSelect: () => {
              handleCopy(selectedPath, "cmd-copy-file-path");
            },
          },
          {
            id: "cmd-copy-file-github-url",
            type: "command",
            title: "Copy File Link on GitHub",
            subtitle: `https://github.com/${owner}/${repo}/blob/${branch}/${selectedPath}`,
            icon: <Copy className="text-muted-foreground h-4 w-4" />,
            badge:
              copiedId === "cmd-copy-file-github-url" ? "Copied!" : undefined,
            onSelect: () => {
              handleCopy(
                `https://github.com/${owner}/${repo}/blob/${branch}/${selectedPath}`,
                "cmd-copy-file-github-url",
              );
            },
          },
        );
      }
    }

    actions.push({
      id: "cmd-connect-private",
      type: "command",
      title: "Connect Private Repositories",
      subtitle:
        "Configure GitHub App installation with read-only repository access",
      icon: <LockKeyhole className="h-4 w-4 text-amber-500" />,
      badge: "GitHub App",
      onSelect: () => {
        connectPrivate();
        onOpenChange(false);
      },
    });

    if (!effectiveQuery) return actions;
    const q = effectiveQuery.toLowerCase();
    return actions.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        (a.subtitle && a.subtitle.toLowerCase().includes(q)),
    );
  }, [
    effectiveQuery,
    hasRepo,
    modifier,
    onOpenAppearance,
    onOpenChange,
    onOpenRepoPicker,
    onOpenShortcutsHelp,
    onToggleSidebar,
    resolvedTheme,
    setTheme,
    owner,
    repo,
    branch,
    selectedPath,
    connectPrivate,
    handleCopy,
    copiedId,
  ]);

  // Matching branches
  const branchItems = useMemo<PaletteItem[]>(() => {
    if (!branches) return [];
    const q = effectiveQuery.toLowerCase();
    const filtered = q
      ? branches.filter((b) => b.name.toLowerCase().includes(q))
      : branches;

    return filtered.map((b) => ({
      id: `branch-${b.name}`,
      type: "branch",
      title: b.name,
      subtitle: b.protected ? "Protected branch" : "Branch",
      icon: <GitBranch className="text-primary h-4 w-4" />,
      isActive: b.name === branch,
      badge: b.name === branch ? "Active" : undefined,
      onSelect: () => {
        setBranch(b.name);
        onOpenChange(false);
      },
    }));
  }, [branches, effectiveQuery, branch, setBranch, onOpenChange]);

  // Matching user repositories
  const repoItems = useMemo<PaletteItem[]>(() => {
    if (!repos) return [];
    const q = effectiveQuery.toLowerCase();
    const filtered = q
      ? repos.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.fullName.toLowerCase().includes(q) ||
            (r.description && r.description.toLowerCase().includes(q)),
        )
      : repos;

    return filtered.slice(0, 30).map((r) => ({
      id: `repo-${r.fullName}`,
      type: "repo",
      title: r.fullName,
      subtitle:
        r.description ||
        (r.private ? "Private repository" : "Public repository"),
      icon: r.private ? (
        <LockKeyhole className="h-4 w-4 text-amber-500" />
      ) : (
        <RepoDeckIcon size={18} variant="flat" className="h-4.5 w-4.5" />
      ),
      isActive: owner === r.owner.login && repo === r.name,
      badge: r.language || undefined,
      onSelect: () => {
        selectRepository(r.owner.login, r.name, r.defaultBranch);
        onOpenChange(false);
      },
    }));
  }, [repos, effectiveQuery, owner, repo, selectRepository, onOpenChange]);

  // Matching recent files
  const recentItems = useMemo<PaletteItem[]>(() => {
    if (!recentFiles) return [];
    const q = effectiveQuery.toLowerCase();
    const filtered = q
      ? recentFiles.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            r.path.toLowerCase().includes(q),
        )
      : recentFiles;

    return filtered.map((r) => {
      const dir = r.path.split("/").slice(0, -1).join("/");
      return {
        id: `recent-${r.path}`,
        type: "recent",
        title: r.name,
        subtitle: dir || undefined,
        icon: <FileIcon name={r.name} className="h-4 w-4" />,
        isActive: selectedPath === r.path,
        badge: selectedPath === r.path ? "Current" : undefined,
        meta: formatElapsedTime(r.timestamp, liveNow),
        onSelect: () => {
          openFile(r.path);
          onOpenChange(false);
        },
      };
    });
  }, [
    recentFiles,
    effectiveQuery,
    selectedPath,
    openFile,
    onOpenChange,
    liveNow,
  ]);

  // Matching repository files
  const fileItems = useMemo<PaletteItem[]>(() => {
    const blobs = tree.filter((n) => n.type === "blob");
    const q = effectiveQuery.toLowerCase();
    const filtered = q
      ? blobs.filter(
          (b) =>
            b.name.toLowerCase().includes(q) ||
            b.path.toLowerCase().includes(q),
        )
      : blobs;

    // Filter out items already in recents when showing "all"
    return filtered
      .filter((f) => !recentFiles.some((r) => r.path === f.path))
      .slice(0, 40)
      .map((f) => {
        const dir = f.path.split("/").slice(0, -1).join("/");
        return {
          id: `file-${f.path}`,
          type: "file",
          title: f.name,
          subtitle: dir || undefined,
          icon: <FileIcon name={f.name} className="h-4 w-4" />,
          isActive: selectedPath === f.path,
          badge: selectedPath === f.path ? "Current" : undefined,
          onSelect: () => {
            openFile(f.path);
            onOpenChange(false);
          },
        };
      });
  }, [tree, effectiveQuery, recentFiles, selectedPath, openFile, onOpenChange]);

  // Grouped sections based on active category
  const sections = useMemo<PaletteSection[]>(() => {
    if (activeCategory === "files") {
      const list: PaletteSection[] = [];
      if (recentItems.length > 0)
        list.push({ id: "recents", title: "Recent Files", items: recentItems });
      if (fileItems.length > 0)
        list.push({ id: "files", title: "Files", items: fileItems });
      return list;
    }
    if (activeCategory === "branches") {
      return branchItems.length > 0
        ? [{ id: "branches", title: "Branches", items: branchItems }]
        : [];
    }
    if (activeCategory === "repos") {
      return repoItems.length > 0
        ? [{ id: "repos", title: "Repositories", items: repoItems }]
        : [];
    }
    if (activeCategory === "commands") {
      return commandItems.length > 0
        ? [{ id: "commands", title: "Commands & Actions", items: commandItems }]
        : [];
    }

    // "all" category aggregates in logical priority with clean section separation
    const list: PaletteSection[] = [];
    if (recentItems.length > 0) {
      list.push({ id: "recents", title: "Recent Files", items: recentItems });
    }
    if (fileItems.length > 0) {
      list.push({ id: "files", title: "Files", items: fileItems });
    }
    if (branchItems.length > 0) {
      list.push({
        id: "branches",
        title: "Branches",
        items: branchItems.slice(0, 5),
      });
    }
    if (repoItems.length > 0) {
      list.push({
        id: "repos",
        title: "Repositories",
        items: repoItems.slice(0, 5),
      });
    }
    if (commandItems.length > 0) {
      list.push({
        id: "commands",
        title: "Commands & Actions",
        items: commandItems,
      });
    }
    return list;
  }, [
    activeCategory,
    recentItems,
    fileItems,
    branchItems,
    repoItems,
    commandItems,
  ]);

  // Flat list of all visible items across sections
  const allItems = useMemo<PaletteItem[]>(() => {
    return sections.flatMap((s) => s.items);
  }, [sections]);

  // Reset state on open
  useEffect(() => {
    if (open) {
      setQuery("");
      setCategory("all");
      setSelectedIndex(0);
    }
  }, [open]);

  // Keep selected index in bounds
  useEffect(() => {
    setSelectedIndex((prev) =>
      Math.max(0, Math.min(prev, Math.max(0, allItems.length - 1))),
    );
  }, [allItems.length]);

  // Auto-scroll selected item into view on keyboard navigation with 4px buffer and smooth behavior
  useEffect(() => {
    const container = listContainerRef.current;
    if (!container) return;
    const selectedElement = container.querySelector<HTMLElement>(
      `[data-selected="true"]`,
    );
    if (selectedElement) {
      const containerRect = container.getBoundingClientRect();
      const elementRect = selectedElement.getBoundingClientRect();
      const offset = 4;

      if (elementRect.top < containerRect.top + offset) {
        container.scrollTo({
          top:
            container.scrollTop -
            (containerRect.top + offset - elementRect.top),
          behavior: "smooth",
        });
      } else if (elementRect.bottom > containerRect.bottom - offset) {
        container.scrollTo({
          top:
            container.scrollTop +
            (elementRect.bottom - (containerRect.bottom - offset)),
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  // Keyboard navigation & Shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, allItems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(
        (prev) => (prev - 1 + allItems.length) % Math.max(1, allItems.length),
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (allItems[selectedIndex]) {
        allItems[selectedIndex].onSelect();
      }
    } else if (e.key === "Tab") {
      e.preventDefault();
      const categories: CommandCategory[] = [
        "all",
        "files",
        "branches",
        "repos",
        "commands",
      ];
      const currentIdx = categories.indexOf(category);
      const nextIdx = e.shiftKey
        ? (currentIdx - 1 + categories.length) % categories.length
        : (currentIdx + 1) % categories.length;
      setCategory(categories[nextIdx]);
      setSelectedIndex(0);
    }
  };

  const totalCount =
    recentItems.length +
    fileItems.length +
    branchItems.length +
    repoItems.length +
    commandItems.length;

  const categoriesConfig = useMemo(
    () => [
      { id: "all" as CommandCategory, label: "All", count: totalCount },
      {
        id: "files" as CommandCategory,
        label: "Files",
        count: recentItems.length + fileItems.length,
      },
      {
        id: "branches" as CommandCategory,
        label: "Branches",
        count: branchItems.length,
      },
      {
        id: "repos" as CommandCategory,
        label: "Repos",
        count: repoItems.length,
      },
      {
        id: "commands" as CommandCategory,
        label: "Commands",
        count: commandItems.length,
      },
    ],
    [
      totalCount,
      recentItems.length,
      fileItems.length,
      branchItems.length,
      repoItems.length,
      commandItems.length,
    ],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent
        showCloseButton={false}
        className="border-border/80 bg-background fixed top-0 left-0 bottom-18 z-50 flex h-auto max-h-[calc(100dvh-4.5rem)] w-dvw max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 p-0 shadow-2xl ring-0 sm:top-1/2 sm:left-1/2 sm:bottom-auto sm:h-auto sm:max-h-[85vh] sm:w-full sm:max-w-2xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:ring-1"
      >
        <VisuallyHidden>
          <DialogTitle>Command Palette & Global Search</DialogTitle>
          <DialogDescription>
            Search files, switch branches, browse repositories, and execute
            workspace commands.
          </DialogDescription>
        </VisuallyHidden>

        {/* Search Header Bar */}
        <div className="bg-muted/20 flex items-center gap-2.5 border-b px-4 py-3">
          <Command className="text-primary h-4 w-4 shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeCategory === "commands"
                ? "Type a command or action name..."
                : activeCategory === "branches"
                  ? "Type branch name to switch..."
                  : activeCategory === "repos"
                    ? "Search repositories by name..."
                    : "Search files, branches, repos, commands... (Type > for actions, @ for branches)"
            }
            className="placeholder:text-muted-foreground/60 text-foreground flex-1 bg-transparent text-sm outline-hidden"
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground cursor-pointer rounded-sm p-0.5 transition-colors"
              title="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <Button
            variant="ghost"
            size="icon-xs"
            className="text-muted-foreground hover:text-foreground -mr-1.5 h-7 w-7 cursor-pointer rounded-md"
            onClick={() => onOpenChange(false)}
            title="Close (Esc)"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Scope Filter Tabs */}
        <Tabs
          value={activeCategory}
          onValueChange={(v) => {
            setCategory(v as CommandCategory);
            setSelectedIndex(0);
          }}
        >
          <TabsList
            variant="line"
            className="bg-muted/10 border-b border-border/60 h-auto w-full gap-0 p-0"
          >
            {categoriesConfig.map((cat) => {
              const isDisabled = hasExplicitPrefix && activeCategory !== cat.id;
              return (
                <TabsTrigger
                  key={cat.id}
                  value={cat.id}
                  disabled={isDisabled}
                  className="text-muted-foreground data-[state=active]:text-foreground gap-1.5 px-3 py-2 text-xs font-medium sm:py-2.5"
                >
                  {cat.label}
                  <span
                    className={cn(
                      "shrink-0 rounded-xs px-1.5 py-0.5 font-mono text-[10px] transition-colors",
                      activeCategory === cat.id
                        ? "bg-primary/15 text-primary font-semibold"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {cat.count}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Results List - Stable Fixed Height Prevents Layout Shift */}
        <ScrollArea
          viewportRef={listContainerRef}
          className="h-full min-h-0 flex-1 p-2 sm:h-[390px] sm:flex-none"
          hideHorizontal
        >
          {allItems.length === 0 ? (
            <div className="text-muted-foreground flex flex-col items-center justify-center gap-2.5 p-10 text-center text-xs">
              <FileCode2 className="text-muted-foreground h-8 w-8 opacity-30" />
              <div>
                <p className="text-foreground font-semibold">
                  No matches found
                </p>
                <p className="text-muted-foreground mt-0.5 text-[11px]">
                  No {activeCategory === "all" ? "items" : activeCategory} match
                  &quot;{effectiveQuery}&quot;.
                </p>
              </div>
            </div>
          ) : (
            <div className="w-full min-w-0 space-y-3">
              {(() => {
                let runningIndex = 0;
                return sections.map((section) => {
                  return (
                    <div key={section.id} className="space-y-1">
                      {/* Section Heading with subtle typography and item count directly beside title */}
                      {(activeCategory === "all" || sections.length > 1) && (
                        <div className="text-muted-foreground/70 flex items-center gap-1.5 px-2.5 pt-1.5 pb-0.5 font-mono text-[10px] font-semibold tracking-wider uppercase select-none">
                          <span>{section.title}</span>
                          <span className="text-[9px] font-normal opacity-50">
                            ({section.items.length})
                          </span>
                        </div>
                      )}

                      <div className="space-y-0.5">
                        {section.items.map((item) => {
                          const currentIdx = runningIndex++;
                          const isSelected = selectedIndex === currentIdx;

                          return (
                            <div
                              key={item.id}
                              data-selected={isSelected ? "true" : undefined}
                              onClick={() => item.onSelect()}
                              onMouseEnter={() => setSelectedIndex(currentIdx)}
                              className={cn(
                                "group flex w-full min-w-0 cursor-pointer scroll-my-1 items-center justify-between gap-3 rounded-lg px-3 py-2 text-xs transition-colors",
                                isSelected
                                  ? "bg-primary/10 text-primary shadow-2xs"
                                  : "hover:bg-muted/60 text-foreground",
                              )}
                              style={{ borderRadius: `${settings.radius}rem` }}
                            >
                              <div className="flex min-w-0 flex-1 items-center gap-2.5">
                                <span className="shrink-0">{item.icon}</span>
                                <div className="min-w-0 flex-1">
                                  <div className="flex min-w-0 items-center gap-1.5">
                                    <span className="text-foreground group-hover:text-primary truncate transition-colors">
                                      {item.title}
                                    </span>
                                    {item.badge && (
                                      <Badge
                                        variant="outline"
                                        className={cn(
                                          "shrink-0 px-1.5 py-0 font-mono text-[9px]",
                                          item.isActive
                                            ? "border-primary/40 text-primary bg-primary/10 font-semibold"
                                            : "text-muted-foreground",
                                        )}
                                      >
                                        {item.badge}
                                      </Badge>
                                    )}
                                  </div>
                                  {item.subtitle && (
                                    <p className="text-muted-foreground mt-0.2 truncate text-[11px] opacity-80">
                                      {item.subtitle}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center gap-2">
                                {item.shortcut && (
                                  <Kbd className="bg-muted/70 border-border/70 text-muted-foreground font-mono text-[10px] whitespace-nowrap">
                                    {item.shortcut}
                                  </Kbd>
                                )}
                                {item.meta && (
                                  <span className="text-muted-foreground/60 font-mono text-[10px] whitespace-nowrap">
                                    {item.meta}
                                  </span>
                                )}
                                {item.type === "recent" && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeRecentFile(
                                        item.id.replace("recent-", ""),
                                      );
                                    }}
                                    className={cn(
                                      "text-muted-foreground/50 hover:text-destructive cursor-pointer p-0.5 transition-opacity",
                                      isTouchDevice
                                        ? "opacity-100"
                                        : "opacity-0 group-hover:opacity-100",
                                    )}
                                    title="Remove from recents"
                                    aria-label="Remove from recents"
                                  >
                                    <X className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </ScrollArea>

        {/* Footer Navigation Hints */}
        <div className="bg-muted/20 text-muted-foreground flex shrink-0 flex-wrap items-center justify-between gap-2 border-t px-4 py-2.5 text-[11px]">
          <div className="touch-hidden hidden items-center gap-3 sm:flex">
            <div className="flex items-center gap-1">
              <Kbd className="bg-background rounded-xs border px-1 font-mono text-[9px]">
                ↑
              </Kbd>
              <Kbd className="bg-background rounded-xs border px-1 font-mono text-[9px]">
                ↓
              </Kbd>
              <span className="text-[10px]">Navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <Kbd className="bg-background rounded-xs border px-1.5 font-mono text-[9px]">
                ↵
              </Kbd>
              <span className="text-[10px]">Execute</span>
            </div>
            <div className="flex items-center gap-1">
              <Kbd className="bg-background rounded-xs border px-1 font-mono text-[9px]">
                Tab
              </Kbd>
              <span className="text-[10px]">Category</span>
            </div>
          </div>
          <div className="text-muted-foreground/80 flex items-center gap-2 font-mono text-[10px]">
            {hasRepo ? (
              <span>
                {owner}/{repo}@{branch}
              </span>
            ) : (
              <span>RepoDeck Command Center</span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
