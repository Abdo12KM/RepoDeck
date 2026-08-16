"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Code2,
  Command,
  Copy,
  Download,
  ExternalLink,
  FileCode2,
  Folder,
  FolderTree,
  GitBranch,
  Globe,
  ListOrdered,
  Lock,
  RefreshCw,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Star,
  WrapText,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Kbd } from "@/components/ui/kbd";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { RepoDeckIcon } from "@/components/ui/RepoDeckLogo";
import { RepoIcon } from "@/components/repo/RepoIcon";
import { FileIcon } from "@/components/repo/tree/FileIcon";
import { cn } from "@/lib/utils";

interface CodeToken {
  text: string;
  type?:
    | "keyword"
    | "function"
    | "string"
    | "comment"
    | "type"
    | "tag"
    | "attr";
}

interface MobileDemoFile {
  name: string;
  path: string;
  kind: "tsx" | "ts" | "md";
  size: string;
  tokens: CodeToken[][];
}

const DEMO_FILE: MobileDemoFile = {
  name: "README.md",
  path: "README.md",
  kind: "md",
  size: "<1 KB",
  tokens: [
    [{ text: "# Hello World", type: "keyword" }],
    [],
    [{ text: "My first repository on GitHub!" }],
  ],
};

const TREE_ITEMS = ["README.md"];

const SEARCH_REPOS = [
  { name: "octocat/Hello-World", isPrivate: false, desc: "Tiny public demo" },
  {
    name: "lukeed/clsx",
    isPrivate: false,
    lang: "JavaScript",
    desc: "Small utility repository",
  },
  {
    name: "sindresorhus/memoize",
    isPrivate: false,
    lang: "JavaScript",
    desc: "Small public module",
  },
  {
    name: "your-account/private-project",
    isPrivate: true,
    lang: "TypeScript",
    desc: "Selected private repository",
  },
];

export function LandingV3InteractivePhone() {
  const [activeTab, setActiveTab] = useState<
    "files" | "search" | "code" | "branch"
  >("code");
  const [repoPickerOpen, setRepoPickerOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);

  // Settings
  const [wrapLines, setWrapLines] = useState(true);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [fontSizeIndex, setFontSizeIndex] = useState(2); // 100%
  const [copied, setCopied] = useState(false);

  // Tree sub-tabs
  const [treeTab, setTreeTab] = useState<"files" | "recents">("files");

  // Search filter tabs
  const [searchTab, setSearchTab] = useState<
    "all" | "files" | "branches" | "repos"
  >("repos");

  // Repo picker tabs
  const [repoFilterTab, setRepoFilterTab] = useState<
    "all" | "public" | "private"
  >("all");

  const handleCopy = () => {
    const code = DEMO_FILE.tokens
      .map((l) => l.map((t) => t.text).join(""))
      .join("\n");
    navigator.clipboard?.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[360px]">
      {/* Glow Backdrop */}
      <div
        className="from-primary/20 via-primary/5 pointer-events-none absolute -inset-4 rounded-[48px] bg-gradient-to-b to-transparent blur-2xl"
        aria-hidden="true"
      />

      {/* Outer Phone Hardware Shell (Static, No Floating Animation) */}
      <div className="border-border/90 relative overflow-hidden rounded-[40px] border-[5px] bg-neutral-950 p-2.5 shadow-2xl ring-1 ring-white/10">
        {/* Dynamic Island / Speaker Pill */}
        <div className="absolute top-4 left-1/2 z-50 flex h-4 w-24 -translate-x-1/2 items-center justify-between rounded-full bg-black px-2.5 shadow-sm">
          <div className="h-2 w-2 rounded-full bg-neutral-800" />
          <div className="h-1.5 w-8 rounded-full bg-neutral-900" />
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/80" />
        </div>

        {/* Screen Bezel Container */}
        <div className="border-border/40 text-foreground relative flex h-[580px] flex-col overflow-hidden rounded-[32px] border bg-black select-none">
          {/* Status Bar */}
          <div className="text-muted-foreground flex h-9 shrink-0 items-center justify-between px-6 pt-1 text-[11px] font-semibold">
            <span>9:41</span>
            <div className="flex items-center gap-1.5 text-[10px]">
              <span>5G</span>
              <div className="border-muted-foreground/60 h-2.5 w-5 rounded-sm border p-0.5">
                <div className="bg-muted-foreground h-full w-3/4 rounded-xs" />
              </div>
            </div>
          </div>

          {/* Top Viewer Header Bar (Exact match to real mobile app screenshot) */}
          <div className="bg-background/90 flex h-12 shrink-0 items-center justify-between border-b px-3 backdrop-blur-xl">
            <div className="flex items-center gap-2">
              <RepoDeckIcon size={26} />
              <button
                type="button"
                onClick={() => setRepoPickerOpen(true)}
                className="text-foreground hover:bg-muted/60 flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-xs font-bold transition-colors"
              >
                <RepoIcon
                  owner="octocat"
                  repo="Hello-World"
                  branch="master"
                  iconClassName="h-3.5 w-3.5 shrink-0 rounded-xs"
                />
                <span className="text-sm font-semibold">Hello-World</span>
                <ChevronDown className="text-muted-foreground h-3 w-3 opacity-70" />
              </button>
            </div>

            {/* Profile Avatar */}
            <div className="flex items-center">
              <Avatar className="border-border/80 h-7 w-7 border shadow-2xs">
                <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-bold">
                  A
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Main Mobile Screen Display Container */}
          <div className="relative flex-1 overflow-hidden bg-black">
            {/* SCREEN 1: CODE VIEWER (Matches Screenshot 2) */}
            {activeTab === "code" && (
              <div className="flex h-full flex-col">
                {/* Sub-header Breadcrumb Toolbar (Exact match to Screenshot 2) */}
                <div className="border-border/40 flex h-10 shrink-0 items-center justify-between border-b px-3 text-xs">
                  <div className="text-muted-foreground flex items-center gap-2 truncate">
                    <button
                      type="button"
                      onClick={() => setActiveTab("files")}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>
                    <span className="text-foreground/90 truncate font-mono text-[11px] font-medium">
                      {DEMO_FILE.path}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="text-muted-foreground hover:text-foreground shrink-0 cursor-pointer"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("files")}
                    className="text-muted-foreground hover:text-foreground cursor-pointer pl-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Code Area with Exact Colors (Matches Screenshot 2) */}
                <div className="flex-1 overflow-y-auto bg-black p-3 font-mono text-xs leading-relaxed">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={DEMO_FILE.name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15 }}
                    >
                      {DEMO_FILE.tokens.map((lineTokens, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "flex gap-3 py-0.5",
                            wrapLines
                              ? "break-words whitespace-pre-wrap"
                              : "overflow-x-auto whitespace-pre",
                          )}
                        >
                          {showLineNumbers && (
                            <span className="text-muted-foreground/40 w-4 shrink-0 text-right font-mono text-[11px] select-none">
                              {idx + 1}
                            </span>
                          )}
                          <span className="text-foreground/90">
                            {lineTokens.length === 0
                              ? " "
                              : lineTokens.map((token, tIdx) => {
                                  let color = "#fafafa";
                                  if (token.type === "keyword")
                                    color = "#f97583";
                                  if (token.type === "function")
                                    color = "#b392f0";
                                  if (token.type === "string")
                                    color = "#9ecbff";
                                  if (token.type === "comment")
                                    color = "#6a737d";
                                  if (
                                    token.type === "type" ||
                                    token.type === "tag"
                                  )
                                    color = "#7ee787";
                                  if (token.type === "attr") color = "#79c0ff";

                                  return (
                                    <span key={tIdx} style={{ color }}>
                                      {token.text}
                                    </span>
                                  );
                                })}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Floating Code Tools FAB Button (Exact match to Screenshot 2) */}
                <div className="absolute right-4 bottom-4 z-20">
                  <button
                    type="button"
                    onClick={() => setToolsOpen(true)}
                    className="border-border/60 text-foreground flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border bg-neutral-900/90 shadow-xl backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
                    aria-label="Open code settings"
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* SCREEN 2: FILES TREE EXPLORER (Matches Screenshot 4) */}
            {activeTab === "files" && (
              <div className="flex h-full flex-col bg-black">
                {/* Tabs Row: Files 31172 vs Recents 1 (Exact match to Screenshot 4) */}
                <div className="border-border/40 flex h-10 shrink-0 items-center border-b px-3">
                  <div className="flex h-full w-full items-center">
                    <button
                      type="button"
                      onClick={() => setTreeTab("files")}
                      className={cn(
                        "relative flex h-full flex-1 cursor-pointer items-center justify-center gap-1.5 text-xs font-medium",
                        treeTab === "files"
                          ? "text-foreground after:bg-primary font-semibold after:absolute after:inset-x-0 after:bottom-0 after:h-0.5"
                          : "text-muted-foreground",
                      )}
                    >
                      <FolderTree className="text-primary h-4 w-4" />
                      <span>Files</span>
                      <Badge
                        variant="secondary"
                        className="bg-muted/60 h-4 px-1.5 font-mono text-[9px] font-bold"
                      >
                        31172
                      </Badge>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTreeTab("recents")}
                      className={cn(
                        "relative flex h-full flex-1 cursor-pointer items-center justify-center gap-1.5 text-xs font-medium",
                        treeTab === "recents"
                          ? "text-foreground after:bg-primary font-semibold after:absolute after:inset-x-0 after:bottom-0 after:h-0.5"
                          : "text-muted-foreground",
                      )}
                    >
                      <Clock className="h-4 w-4" />
                      <span>Recents</span>
                      <Badge
                        variant="secondary"
                        className="bg-muted/60 h-4 px-1.5 font-mono text-[9px]"
                      >
                        1
                      </Badge>
                    </button>
                  </div>
                </div>

                {/* Filter Search Row (Exact match to Screenshot 4) */}
                <div className="border-border/40 border-b p-2">
                  <div className="border-border/60 bg-muted/20 flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-xs">
                    <div className="flex items-center gap-2">
                      <Search className="text-muted-foreground h-3.5 w-3.5" />
                      <span className="text-muted-foreground">
                        Filter file tree...
                      </span>
                    </div>
                    <X className="text-muted-foreground h-3.5 w-3.5 opacity-60" />
                  </div>
                </div>

                {/* Directory List (Exact match to Screenshot 4) */}
                <div className="flex-1 space-y-1 overflow-y-auto p-2 font-mono text-xs">
                  {TREE_ITEMS.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setActiveTab("code")}
                      className="text-foreground hover:bg-muted/40 flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-left"
                    >
                      <ChevronRight className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                      <FileIcon
                        name={item}
                        isFolder={true}
                        className="h-4 w-4 shrink-0"
                      />
                      <span className="truncate">{item}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* SCREEN 3: UNIVERSAL SEARCH MODAL (Matches Screenshot 3) */}
            {activeTab === "search" && (
              <div className="flex h-full flex-col bg-black">
                {/* Search Input Bar (Exact match to Screenshot 3) */}
                <div className="border-border/40 flex items-center justify-between border-b p-3">
                  <div className="text-foreground flex flex-1 items-center gap-2">
                    <Command className="text-primary h-4 w-4 shrink-0" />
                    <span className="text-muted-foreground text-xs">
                      Search repositories by name...
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab("code")}
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Tabs Row (Exact match to Screenshot 3) */}
                <div className="border-border/40 no-scrollbar flex h-9 shrink-0 items-center gap-1 overflow-x-auto border-b px-2 text-xs">
                  <span className="text-muted-foreground px-2 py-1">
                    All <span className="font-mono text-[10px]">2451</span>
                  </span>
                  <span className="text-muted-foreground px-2 py-1">
                    Files <span className="font-mono text-[10px]">41</span>
                  </span>
                  <span className="text-muted-foreground px-2 py-1">
                    Branches <span className="font-mono text-[10px]">2370</span>
                  </span>
                  <span className="text-foreground after:bg-primary relative px-2 py-1 font-semibold after:absolute after:inset-x-0 after:bottom-0 after:h-0.5">
                    Repos <span className="font-mono text-[10px]">30</span>
                  </span>
                  <span className="text-muted-foreground px-2 py-1">
                    Commands
                  </span>
                </div>

                {/* Search Results List (Exact match to Screenshot 3) */}
                <div className="flex-1 space-y-1 overflow-y-auto p-2 text-xs">
                  {SEARCH_REPOS.map((repo, idx) => (
                    <div
                      key={repo.name}
                      onClick={() => setActiveTab("code")}
                      className={cn(
                        "cursor-pointer rounded-lg p-2.5 transition-colors",
                        idx === 0
                          ? "bg-muted/40 border-primary/20 border"
                          : "hover:bg-muted/30",
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {repo.isPrivate ? (
                          <Lock className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                        ) : (
                          <RepoDeckIcon size={14} className="shrink-0" />
                        )}
                        <span className="text-foreground truncate font-semibold">
                          {repo.name}
                        </span>
                        {repo.lang && (
                          <Badge
                            variant="outline"
                            className="ml-auto h-4 px-1 font-mono text-[9px]"
                          >
                            {repo.lang}
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground mt-1 truncate text-[11px]">
                        {repo.desc}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Subtle Footer (Matches Screenshot 3) */}
                <div className="border-border/40 text-muted-foreground border-t p-2 text-center font-mono text-[10px]">
                  octocat/Hello-World@master
                </div>
              </div>
            )}

            {/* SCREEN 4: REPOSITORY PICKER MODAL (Matches Screenshot 1) */}
            <AnimatePresence>
              {(repoPickerOpen || activeTab === "branch") && (
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 z-30 flex flex-col bg-black"
                >
                  {/* Header (Exact match to Screenshot 1) */}
                  <div className="border-border/40 flex items-center justify-between border-b px-3.5 py-3">
                    <div className="flex items-center gap-2">
                      <RepoDeckIcon size={20} />
                      <span className="text-foreground text-sm font-bold">
                        Select a repository
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-muted/60 h-4 px-1.5 font-mono text-[10px]"
                      >
                        46
                      </Badge>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setRepoPickerOpen(false);
                        if (activeTab === "branch") setActiveTab("code");
                      }}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Search Input Row (Exact match to Screenshot 1) */}
                  <div className="border-border/40 flex items-center gap-2 border-b p-3">
                    <div className="border-border/60 bg-muted/20 flex flex-1 items-center gap-2 rounded-lg border px-3 py-1.5 text-xs">
                      <Search className="text-muted-foreground h-3.5 w-3.5" />
                      <span className="text-muted-foreground">
                        Search repositories...
                      </span>
                    </div>
                    <button
                      type="button"
                      className="border-border/60 text-muted-foreground rounded-lg border p-2"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Filter Tabs (Exact match to Screenshot 1) */}
                  <div className="border-border/40 flex h-10 shrink-0 items-center gap-3 border-b px-3 text-xs">
                    <button
                      type="button"
                      onClick={() => setRepoFilterTab("all")}
                      className={cn(
                        "relative flex h-full cursor-pointer items-center gap-1.5",
                        repoFilterTab === "all"
                          ? "text-foreground after:bg-primary font-semibold after:absolute after:inset-x-0 after:bottom-0 after:h-0.5"
                          : "text-muted-foreground",
                      )}
                    >
                      <span>All</span>
                      <Badge
                        variant="secondary"
                        className="bg-primary/20 text-primary h-4 px-1 font-mono text-[9px]"
                      >
                        46
                      </Badge>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRepoFilterTab("public")}
                      className={cn(
                        "relative flex h-full cursor-pointer items-center gap-1.5",
                        repoFilterTab === "public"
                          ? "text-foreground after:bg-primary font-semibold after:absolute after:inset-x-0 after:bottom-0 after:h-0.5"
                          : "text-muted-foreground",
                      )}
                    >
                      <Globe className="h-3.5 w-3.5" />
                      <span>Public</span>
                      <Badge
                        variant="secondary"
                        className="bg-muted/60 h-4 px-1 font-mono text-[9px]"
                      >
                        17
                      </Badge>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRepoFilterTab("private")}
                      className={cn(
                        "relative flex h-full cursor-pointer items-center gap-1.5",
                        repoFilterTab === "private"
                          ? "text-foreground after:bg-primary font-semibold after:absolute after:inset-x-0 after:bottom-0 after:h-0.5"
                          : "text-muted-foreground",
                      )}
                    >
                      <Lock className="h-3.5 w-3.5 text-amber-500" />
                      <span>Private</span>
                      <Badge
                        variant="secondary"
                        className="bg-muted/60 h-4 px-1 font-mono text-[9px]"
                      >
                        29
                      </Badge>
                    </button>
                  </div>

                  {/* Section Title */}
                  <div className="text-muted-foreground flex items-center justify-between px-3.5 pt-3 pb-1 text-[10px] font-bold tracking-wider uppercase">
                    <span>OTHER REPOSITORIES</span>
                    <span>46</span>
                  </div>

                  {/* Repo Cards List (Exact match to Screenshot 1) */}
                  <div className="flex-1 space-y-2 overflow-y-auto p-3 text-xs">
                    {/* Card 1: RepoDeck */}
                    <div
                      onClick={() => {
                        setRepoPickerOpen(false);
                        setActiveTab("code");
                      }}
                      className="border-border/60 bg-muted/20 hover:border-primary/50 cursor-pointer space-y-2 rounded-xl border p-3 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <RepoIcon
                            owner="octocat"
                            repo="Hello-World"
                            className="h-4 w-4 shrink-0"
                          />
                          <span className="text-foreground font-bold">
                            Hello-World
                          </span>
                        </div>
                        <span className="text-muted-foreground flex items-center gap-0.5 text-[10px]">
                          Public
                        </span>
                      </div>
                      <div className="text-muted-foreground flex items-center justify-between font-mono text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                          <span>Markdown</span>
                          <span>Small demo</span>
                        </div>
                        <span className="bg-muted/60 text-foreground flex items-center gap-1 rounded-md px-1.5 py-0.5">
                          <GitBranch className="text-primary h-2.5 w-2.5" />{" "}
                          master
                        </span>
                      </div>
                    </div>

                    {/* Card 2: clsx */}
                    <div
                      onClick={() => {
                        setRepoPickerOpen(false);
                        setActiveTab("code");
                      }}
                      className="border-border/60 bg-muted/20 hover:border-primary/50 cursor-pointer space-y-2 rounded-xl border p-3 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <RepoIcon
                            owner="lukeed"
                            repo="clsx"
                            className="h-4 w-4 shrink-0"
                          />
                          <span className="text-foreground font-bold">
                            clsx
                          </span>
                          <Globe className="text-muted-foreground h-3 w-3" />
                        </div>
                        <span className="text-muted-foreground flex items-center gap-0.5 text-[10px]">
                          Public
                        </span>
                      </div>
                      <div className="text-muted-foreground flex items-center justify-between font-mono text-[10px]">
                        <span>Small utility repository</span>
                        <span className="bg-muted/60 text-foreground flex items-center gap-1 rounded-md px-1.5 py-0.5">
                          <GitBranch className="text-primary h-2.5 w-2.5" />{" "}
                          master
                        </span>
                      </div>
                    </div>

                    {/* Card 3: memoize */}
                    <div
                      onClick={() => {
                        setRepoPickerOpen(false);
                        setActiveTab("code");
                      }}
                      className="border-border/60 bg-muted/20 hover:border-primary/50 cursor-pointer space-y-1.5 rounded-xl border p-3 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <RepoIcon
                            owner="sindresorhus"
                            repo="memoize"
                            className="h-4 w-4 shrink-0"
                          />
                          <span className="text-foreground font-bold">
                            memoize
                          </span>
                          <Globe className="text-muted-foreground h-3 w-3" />
                        </div>
                        <span className="text-muted-foreground flex items-center gap-0.5 text-[10px]">
                          Public
                        </span>
                      </div>
                      <p className="text-muted-foreground text-[11px] leading-tight">
                        Small public module
                      </p>
                      <div className="text-muted-foreground flex items-center justify-between pt-1 font-mono text-[10px]">
                        <span>Small public repository</span>
                        <span className="bg-muted/60 text-foreground flex items-center gap-1 rounded-md px-1.5 py-0.5">
                          <GitBranch className="text-primary h-2.5 w-2.5" />{" "}
                          main
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* TOOLS DRAWER (Matches MobileCodeToolsDrawer.tsx) */}
            <AnimatePresence>
              {toolsOpen && (
                <motion.div
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "100%" }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute inset-0 z-30 flex flex-col bg-black/95 backdrop-blur-md"
                >
                  <div className="border-border/60 flex items-start justify-between border-b px-3.5 py-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-foreground text-xs font-semibold">
                          README.md
                        </span>
                        <Badge
                          variant="outline"
                          className="font-mono text-[9px]"
                        >
                          master
                        </Badge>
                      </div>
                      <p className="text-muted-foreground font-mono text-[10px]">
                        README.md
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setToolsOpen(false)}
                      className="text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-2.5 overflow-y-auto p-3 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setWrapLines(!wrapLines)}
                        className={cn(
                          "flex cursor-pointer flex-col items-start gap-1 rounded-xl border p-2.5 text-left transition-all",
                          wrapLines
                            ? "bg-primary/10 border-primary/40 text-primary"
                            : "bg-muted/30 border-border/80 text-foreground",
                        )}
                      >
                        <div className="flex w-full items-center justify-between">
                          <div className="flex items-center gap-1">
                            <WrapText className="h-3.5 w-3.5" />
                            <Kbd className="font-mono text-[8px]">Alt+Z</Kbd>
                          </div>
                          <Badge
                            variant={wrapLines ? "default" : "outline"}
                            className="h-3.5 px-1 text-[8px]"
                          >
                            {wrapLines ? "ON" : "OFF"}
                          </Badge>
                        </div>
                        <span className="mt-0.5 text-[11px] font-semibold">
                          Wrap Lines
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowLineNumbers(!showLineNumbers)}
                        className={cn(
                          "flex cursor-pointer flex-col items-start gap-1 rounded-xl border p-2.5 text-left transition-all",
                          showLineNumbers
                            ? "bg-primary/10 border-primary/40 text-primary"
                            : "bg-muted/30 border-border/80 text-foreground",
                        )}
                      >
                        <div className="flex w-full items-center justify-between">
                          <div className="flex items-center gap-1">
                            <ListOrdered className="h-3.5 w-3.5" />
                            <Kbd className="font-mono text-[8px]">Alt+L</Kbd>
                          </div>
                          <Badge
                            variant={showLineNumbers ? "default" : "outline"}
                            className="h-3.5 px-1 text-[8px]"
                          >
                            {showLineNumbers ? "ON" : "OFF"}
                          </Badge>
                        </div>
                        <span className="mt-0.5 text-[11px] font-semibold">
                          Line Numbers
                        </span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <Button
                        variant="outline"
                        className="h-9 cursor-pointer gap-1.5 text-xs font-semibold"
                        onClick={handleCopy}
                      >
                        {copied ? (
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="text-primary h-3.5 w-3.5" />
                        )}
                        <span>{copied ? "Copied!" : "Copy Code"}</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-9 cursor-pointer gap-1.5 text-xs font-semibold"
                      >
                        <Download className="text-primary h-3.5 w-3.5" />
                        <span>Download</span>
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Thumb Navigation Bar (Exact 1:1 match to Screenshot 2 & 4) */}
          <nav
            className="bg-background/95 border-border/80 flex h-18 touch-manipulation items-center justify-around border-t px-1.5 shadow-2xl backdrop-blur-xl select-none"
            aria-label="Mobile navigation bar"
          >
            {/* 1. Files Tab */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                setRepoPickerOpen(false);
                setActiveTab("files");
              }}
              aria-label="File Explorer"
              className={cn(
                "group flex h-full flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-hidden",
                activeTab === "files"
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-12 items-center justify-center rounded-lg transition-all duration-150",
                  activeTab === "files"
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground",
                )}
              >
                <FolderTree className="h-4 w-4" />
              </div>
              <span>Files</span>
            </motion.button>

            {/* 2. Universal Search Tab */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                setRepoPickerOpen(false);
                setActiveTab("search");
              }}
              aria-label="Search files and commands"
              className={cn(
                "group flex h-full flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-hidden",
                activeTab === "search"
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-12 items-center justify-center rounded-lg transition-all duration-150",
                  activeTab === "search"
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground",
                )}
              >
                <Search className="h-4 w-4" />
              </div>
              <span>Search</span>
            </motion.button>

            {/* 3. Code Viewer Tab */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                setRepoPickerOpen(false);
                setActiveTab("code");
              }}
              aria-label="Code Viewer"
              className={cn(
                "group flex h-full flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-hidden",
                activeTab === "code" && !repoPickerOpen
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-12 items-center justify-center rounded-lg transition-all duration-150",
                  activeTab === "code" && !repoPickerOpen
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground",
                )}
              >
                <FileCode2 className="h-4 w-4" />
              </div>
              <span>Code</span>
            </motion.button>

            {/* 4. Branch / Switcher Tab */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => setRepoPickerOpen(true)}
              aria-label="Switch branch or repository"
              className={cn(
                "group flex h-full flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 py-1 text-[11px] font-medium transition-colors focus-visible:outline-hidden",
                repoPickerOpen
                  ? "text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-12 items-center justify-center rounded-lg transition-all duration-150",
                  repoPickerOpen
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground",
                )}
              >
                <GitBranch className="h-4 w-4" />
              </div>
              <span className="max-w-20 truncate">canary</span>
            </motion.button>
          </nav>

          {/* iOS Home Indicator Line */}
          <div className="flex h-3 shrink-0 items-center justify-center bg-black">
            <div className="bg-muted-foreground/30 h-1 w-28 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
