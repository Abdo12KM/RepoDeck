"use client";

import React, { useState } from "react";
import {
  Check,
  Copy,
  FileCode2,
  ListOrdered,
  Palette,
  WrapText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ThemeDefinition {
  id: string;
  name: string;
  author: string;
  bg: string;
  border: string;
  foreground: string;
  tokens: {
    keyword: string;
    function: string;
    string: string;
    comment: string;
    type: string;
    number: string;
  };
}

const SHIKI_THEMES: Record<string, ThemeDefinition> = {
  "repodeck-clean": {
    id: "repodeck-clean",
    name: "RepoDeck Clean",
    author: "RepoDeck",
    bg: "#090d14",
    border: "#223447",
    foreground: "#edf7f7",
    tokens: {
      keyword: "#f472b6",
      function: "#60a5fa",
      string: "#34d399",
      comment: "#6b7280",
      type: "#38bdf8",
      number: "#c084fc",
    },
  },
  vesper: {
    id: "vesper",
    name: "Vesper",
    author: "Raunofre",
    bg: "#101010",
    border: "#282828",
    foreground: "#ffffff",
    tokens: {
      keyword: "#ff5f56",
      function: "#ffc799",
      string: "#99ffe4",
      comment: "#505050",
      type: "#ff99b3",
      number: "#ff9955",
    },
  },
  "tokyo-night": {
    id: "tokyo-night",
    name: "Tokyo Night",
    author: "Enkia",
    bg: "#1a1b26",
    border: "#292e42",
    foreground: "#a9b1d6",
    tokens: {
      keyword: "#bb9af7",
      function: "#7aa2f7",
      string: "#9ece6a",
      comment: "#565f89",
      type: "#2ac3de",
      number: "#ff9e64",
    },
  },
  dracula: {
    id: "dracula",
    name: "Dracula",
    author: "Zeno Rocha",
    bg: "#282a36",
    border: "#44475a",
    foreground: "#f8f8f2",
    tokens: {
      keyword: "#ff79c6",
      function: "#50fa7b",
      string: "#f1fa8c",
      comment: "#6272a4",
      type: "#8be9fd",
      number: "#bd93f9",
    },
  },
  catppuccin: {
    id: "catppuccin",
    name: "Catppuccin Mocha",
    author: "Catppuccin",
    bg: "#1e1e2e",
    border: "#313244",
    foreground: "#cdd6f4",
    tokens: {
      keyword: "#cba6f7",
      function: "#89b4fa",
      string: "#a6e3a1",
      comment: "#6c7086",
      type: "#f5c2e7",
      number: "#fab387",
    },
  },
  "one-dark-pro": {
    id: "one-dark-pro",
    name: "One Dark Pro",
    author: "Binaryify",
    bg: "#282c34",
    border: "#3e4451",
    foreground: "#abb2bf",
    tokens: {
      keyword: "#c678dd",
      function: "#61afef",
      string: "#98c379",
      comment: "#5c6370",
      type: "#e5c07b",
      number: "#d19a66",
    },
  },
  nord: {
    id: "nord",
    name: "Nord",
    author: "Arctic Ice Studio",
    bg: "#2e3440",
    border: "#434c5e",
    foreground: "#d8dee9",
    tokens: {
      keyword: "#81a1c1",
      function: "#88c0d0",
      string: "#a3be8c",
      comment: "#616e88",
      type: "#8fbcbb",
      number: "#b48ead",
    },
  },
  "synthwave-84": {
    id: "synthwave-84",
    name: "Synthwave '84",
    author: "Robb Owen",
    bg: "#262335",
    border: "#494368",
    foreground: "#f92aad",
    tokens: {
      keyword: "#fede5d",
      function: "#36f9f6",
      string: "#ff7edb",
      comment: "#848bbd",
      type: "#fe4450",
      number: "#f97e72",
    },
  },
};

interface Snippet {
  lang: string;
  path: string;
  filename: string;
  size: string;
  codeLines: {
    num: string;
    text: string;
    tokenType?:
      | "keyword"
      | "function"
      | "string"
      | "comment"
      | "type"
      | "number";
  }[];
}

const SNIPPETS: Record<string, Snippet> = {
  typescript: {
    lang: "TypeScript",
    path: "src/lib/fetchRepository.ts",
    filename: "fetchRepository.ts",
    size: "1.4 KB",
    codeLines: [
      {
        num: "01",
        text: "// Stream repository AST directly from GitHub API",
        tokenType: "comment",
      },
      {
        num: "02",
        text: "import { Octokit } from '@octokit/rest';",
        tokenType: "keyword",
      },
      { num: "03", text: "" },
      {
        num: "04",
        text: "export async function fetchTree(owner: string, repo: string): Promise<Tree> {",
        tokenType: "function",
      },
      {
        num: "05",
        text: "  const octokit = new Octokit();",
        tokenType: "keyword",
      },
      {
        num: "06",
        text: "  const { data } = await octokit.rest.git.getTree({",
        tokenType: "function",
      },
      {
        num: "07",
        text: "    owner, repo, tree_sha: 'HEAD', recursive: 'true'",
        tokenType: "string",
      },
      { num: "08", text: "  });" },
      {
        num: "09",
        text: "  return { sha: data.sha, nodes: data.tree };",
        tokenType: "keyword",
      },
      { num: "10", text: "}" },
    ],
  },
  rust: {
    lang: "Rust",
    path: "src/core/lib.rs",
    filename: "lib.rs",
    size: "2.1 KB",
    codeLines: [
      {
        num: "01",
        text: "// High-performance zero-copy syntax parser",
        tokenType: "comment",
      },
      {
        num: "02",
        text: "use std::collections::HashMap;",
        tokenType: "keyword",
      },
      { num: "03", text: "" },
      { num: "04", text: "pub struct RepoReader<'a> {", tokenType: "keyword" },
      {
        num: "05",
        text: "    pub cache: HashMap<&'a str, Vec<u8>>,",
        tokenType: "type",
      },
      { num: "06", text: "}" },
      { num: "07", text: "" },
      { num: "08", text: "impl<'a> RepoReader<'a> {", tokenType: "keyword" },
      { num: "09", text: "    pub fn new() -> Self {", tokenType: "function" },
      {
        num: "10",
        text: "        Self { cache: HashMap::new() }",
        tokenType: "function",
      },
      { num: "11", text: "    }" },
      { num: "12", text: "}" },
    ],
  },
  go: {
    lang: "Go",
    path: "pkg/stream/stream.go",
    filename: "stream.go",
    size: "1.8 KB",
    codeLines: [
      {
        num: "01",
        text: "// Concurrent repository tree stream handler",
        tokenType: "comment",
      },
      { num: "02", text: "package repodeck", tokenType: "keyword" },
      { num: "03", text: "" },
      { num: "04", text: 'import "net/http"', tokenType: "keyword" },
      { num: "05", text: "" },
      {
        num: "06",
        text: "func HandleFileRequest(w http.ResponseWriter, r *http.Request) {",
        tokenType: "function",
      },
      {
        num: "07",
        text: '    w.Header().Set("Cache-Control", "public, max-age=60")',
        tokenType: "string",
      },
      {
        num: "08",
        text: "    w.WriteHeader(http.StatusOK)",
        tokenType: "function",
      },
      { num: "09", text: "}" },
    ],
  },
  python: {
    lang: "Python",
    path: "scripts/analyzer.py",
    filename: "analyzer.py",
    size: "1.2 KB",
    codeLines: [
      {
        num: "01",
        text: "# Lightweight AST analyzer for repository metrics",
        tokenType: "comment",
      },
      { num: "02", text: "import os, sys", tokenType: "keyword" },
      { num: "03", text: "" },
      { num: "04", text: "class RepoInspector:", tokenType: "keyword" },
      {
        num: "05",
        text: "    def __init__(self, owner: str, repo: str):",
        tokenType: "function",
      },
      {
        num: "06",
        text: "        self.endpoint = f'https://api.github.com/repos/{owner}/{repo}'",
        tokenType: "string",
      },
      { num: "07", text: "        self.is_ready = True", tokenType: "keyword" },
    ],
  },
};

export function LandingV3ThemeStudio() {
  const [selectedThemeId, setSelectedThemeId] = useState("repodeck-clean");
  const [selectedLang, setSelectedLang] = useState<
    "typescript" | "rust" | "go" | "python"
  >("typescript");
  const [wrapLines, setWrapLines] = useState(false);
  const [showLineNumbers, setShowLineNumbers] = useState(true);
  const [copied, setCopied] = useState(false);

  const themeList = Object.values(SHIKI_THEMES);
  const activeTheme =
    SHIKI_THEMES[selectedThemeId] || SHIKI_THEMES["repodeck-clean"];
  const activeSnippet = SNIPPETS[selectedLang] || SNIPPETS.typescript;

  const handleCopy = () => {
    const text = activeSnippet.codeLines.map((l) => l.text).join("\n");
    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const getTokenColor = (tokenType?: string) => {
    if (!tokenType) return activeTheme.foreground;
    switch (tokenType) {
      case "keyword":
        return activeTheme.tokens.keyword;
      case "function":
        return activeTheme.tokens.function;
      case "string":
        return activeTheme.tokens.string;
      case "comment":
        return activeTheme.tokens.comment;
      case "type":
        return activeTheme.tokens.type;
      case "number":
        return activeTheme.tokens.number;
      default:
        return activeTheme.foreground;
    }
  };

  return (
    <section
      id="syntax-studio"
      className="border-border/40 relative border-t py-16 sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading */}
        <div className="mx-auto max-w-3xl space-y-3 text-center">
          <div className="border-primary/20 bg-primary/5 text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-medium">
            <Palette className="h-3.5 w-3.5" />
            <span>Studio Syntax Engine</span>
          </div>

          <h2 className="text-foreground text-2xl font-bold tracking-tight [text-wrap:balance] sm:text-4xl">
            18 Studio-grade Shiki syntax themes.
          </h2>

          <p className="text-muted-foreground text-sm leading-relaxed [text-wrap:pretty] sm:text-base">
            Read code in the environment you love. Powered by TextMate grammars
            and Shiki tokens with zero compilation overhead.
          </p>
        </div>

        {/* Theme Studio Interactive Playground */}
        <div className="border-border/80 bg-card mt-12 overflow-hidden rounded-xl border shadow-2xl">
          {/* Top Bar: Theme Pills Carousel / Grid */}
          <div className="border-border/60 bg-muted/20 border-b p-3 sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              {/* Theme Selection Chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                {themeList.map((theme) => {
                  const isSelected = selectedThemeId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setSelectedThemeId(theme.id)}
                      className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all",
                        isSelected
                          ? "border-primary bg-primary/15 text-primary font-semibold shadow-xs"
                          : "border-border/60 bg-background/60 text-muted-foreground hover:border-border hover:bg-muted/50 hover:text-foreground",
                      )}
                    >
                      {/* Theme Color Dots Indicator */}
                      <span className="flex items-center gap-0.5">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: theme.tokens.keyword }}
                        />
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: theme.tokens.string }}
                        />
                      </span>
                      <span>{theme.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Language Switcher Tabs */}
              <div className="border-border/60 bg-background flex items-center gap-1 self-start rounded-lg border p-1 lg:self-auto">
                {(["typescript", "rust", "go", "python"] as const).map(
                  (lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setSelectedLang(lang)}
                      className={cn(
                        "cursor-pointer rounded-md px-2.5 py-1 text-xs font-medium capitalize transition-colors",
                        selectedLang === lang
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      {lang}
                    </button>
                  ),
                )}
              </div>
            </div>
          </div>

          {/* Code Viewer Preview with Live Theme Styling */}
          <div
            className="transition-colors duration-200"
            style={{ backgroundColor: activeTheme.bg }}
          >
            {/* Header within preview */}
            <div
              className="flex h-10 items-center justify-between border-b px-4 font-mono text-xs"
              style={{
                borderColor: activeTheme.border,
                backgroundColor: `${activeTheme.bg}cc`,
              }}
            >
              <div className="flex items-center gap-2">
                <FileCode2
                  className="h-3.5 w-3.5"
                  style={{ color: activeTheme.tokens.keyword }}
                />
                <span
                  style={{ color: activeTheme.foreground }}
                  className="font-semibold"
                >
                  {activeSnippet.filename}
                </span>
                <span className="text-muted-foreground/60 hidden sm:inline">
                  ({activeSnippet.path})
                </span>
              </div>

              {/* Controls */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setWrapLines(!wrapLines)}
                  className="flex cursor-pointer items-center gap-1 rounded px-2 py-0.5 font-mono text-[11px] transition-opacity hover:opacity-80"
                  style={{
                    color: wrapLines
                      ? activeTheme.tokens.keyword
                      : activeTheme.foreground,
                    backgroundColor: wrapLines
                      ? `${activeTheme.tokens.keyword}22`
                      : "transparent",
                  }}
                >
                  <WrapText className="h-3 w-3" />
                  <span className="hidden sm:inline">Wrap</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowLineNumbers(!showLineNumbers)}
                  className="flex cursor-pointer items-center gap-1 rounded px-2 py-0.5 font-mono text-[11px] transition-opacity hover:opacity-80"
                  style={{
                    color: showLineNumbers
                      ? activeTheme.tokens.type
                      : activeTheme.foreground,
                    backgroundColor: showLineNumbers
                      ? `${activeTheme.tokens.type}22`
                      : "transparent",
                  }}
                >
                  <ListOrdered className="h-3 w-3" />
                </button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-6 gap-1 rounded px-2 font-mono text-[11px]"
                  style={{
                    color: activeTheme.foreground,
                    backgroundColor: `${activeTheme.foreground}15`,
                  }}
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Code Lines Display */}
            <div
              className={cn(
                "min-h-[260px] overflow-x-auto p-4 font-mono text-xs leading-relaxed",
                wrapLines ? "whitespace-pre-wrap" : "whitespace-pre",
              )}
            >
              {activeSnippet.codeLines.map((line, idx) => (
                <div key={idx} className="flex items-baseline gap-3">
                  {showLineNumbers && (
                    <span
                      className="w-6 shrink-0 text-right font-mono text-[11px] opacity-40 select-none"
                      style={{ color: activeTheme.foreground }}
                    >
                      {line.num}
                    </span>
                  )}
                  <span
                    style={{
                      color: getTokenColor(line.tokenType),
                      fontStyle:
                        line.tokenType === "comment" ? "italic" : "normal",
                    }}
                  >
                    {line.text || " "}
                  </span>
                </div>
              ))}
            </div>

            {/* Color Token Swatches Footer Bar */}
            <div
              className="flex flex-wrap items-center justify-between gap-3 border-t p-3 font-mono text-xs"
              style={{
                borderColor: activeTheme.border,
                backgroundColor: `${activeTheme.bg}ee`,
              }}
            >
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: activeTheme.tokens.keyword }}
                  />
                  <span style={{ color: activeTheme.tokens.keyword }}>
                    Keyword
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: activeTheme.tokens.function }}
                  />
                  <span style={{ color: activeTheme.tokens.function }}>
                    Function
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: activeTheme.tokens.string }}
                  />
                  <span style={{ color: activeTheme.tokens.string }}>
                    String
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: activeTheme.tokens.type }}
                  />
                  <span style={{ color: activeTheme.tokens.type }}>Type</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: activeTheme.tokens.comment }}
                  />
                  <span style={{ color: activeTheme.tokens.comment }}>
                    Comment
                  </span>
                </div>
              </div>

              <div className="text-muted-foreground text-[11px]">
                Theme:{" "}
                <strong style={{ color: activeTheme.foreground }}>
                  {activeTheme.name}
                </strong>{" "}
                by {activeTheme.author}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
