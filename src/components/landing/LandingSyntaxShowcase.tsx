"use client";

import { useState, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import { codeToHtml } from "shiki";
import { Palette, Code2, Check, Sun, Moon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CODE_THEMES,
  DEFAULT_THEME_SETTINGS,
  getCodeTheme,
  getCodeThemeColors,
  isDarkHex,
} from "@/lib/theme";
import type { CodeThemeOption } from "@/lib/theme/types";
import { cn } from "@/lib/utils";

interface ThemeSnippet {
  code: string;
  lang: string;
  filename: string;
}

const THEME_SNIPPETS: Record<string, ThemeSnippet> = {
  github: {
    lang: "typescript",
    filename: "octokit.ts",
    code: `// GitHub Official Syntax Theme
import { Octokit } from "@octokit/rest";

export async function fetchRepositoryTree(owner: string, repo: string) {
  const octokit = new Octokit();
  const { data } = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: "HEAD",
    recursive: "true",
  });
  return { sha: data.sha, tree: data.tree };
}`,
  },
  "github-dimmed": {
    lang: "typescript",
    filename: "streamViewer.ts",
    code: `// GitHub Dimmed Low-Strain Theme
export interface StreamState {
  readonly activePath: string;
  readonly byteSize: number;
}

export function createStreamChannel(path: string): StreamState {
  const isCompressed = path.endsWith(".gz");
  return { activePath: path, byteSize: isCompressed ? 1024 : 4096 };
}`,
  },
  "tokyo-night": {
    lang: "typescript",
    filename: "tokyoNight.ts",
    code: `// Tokyo Night Neon Theme
export async function fetchFileContent(path: string): Promise<string> {
  const response = await fetch(\`/api/github/file?path=\${path}\`);
  if (!response.ok) {
    throw new Error("Failed to load file content");
  }
  return response.text();
}`,
  },
  catppuccin: {
    lang: "typescript",
    filename: "palette.ts",
    code: `// Catppuccin Soothing Pastel Theme
export const catppuccinPalette = {
  rosewater: "#f5e0dc",
  mauve: "#cba6f7",
  sapphire: "#74c7ec",
  green: "#a6e3a1",
  peach: "#fab387",
} as const;

export type PastelTone = keyof typeof catppuccinPalette;`,
  },
  "one-dark-pro": {
    lang: "typescript",
    filename: "syntaxParser.ts",
    code: `// One Dark Pro Iconic Balanced Theme
export interface TokenNode {
  readonly kind: "keyword" | "function" | "string";
  readonly value: string;
}

export function parseSyntaxTree(code: string): TokenNode[] {
  const tokens = code.split(/(\\s+)/);
  return tokens.map((value) => ({ kind: "keyword", value }));
}`,
  },
  dracula: {
    lang: "typescript",
    filename: "highlighter.tsx",
    code: `// Dracula Twilight Vampire Theme
import { codeToHtml } from "shiki";

export async function renderCodeBlock(code: string, theme = "dracula") {
  const highlighted = await codeToHtml(code, { lang: "typescript", theme });
  return <div dangerouslySetInnerHTML={{ __html: highlighted }} />;
}`,
  },
  nord: {
    lang: "typescript",
    filename: "arcticFrost.ts",
    code: `// Nord Arctic Frost Palette
export const arcticFrost = {
  polarNight: ["#2e3440", "#3b4252", "#434c5e", "#4c566a"],
  snowStorm: ["#d8dee9", "#e5e9f0", "#eceff4"],
  frost: ["#8fbcbb", "#88c0d0", "#81a1c1", "#5e81ac"],
};`,
  },
  vesper: {
    lang: "typescript",
    filename: "vesperConfig.ts",
    code: `// Vesper Minimalist Noir Theme
export interface ThemeConfig {
  readonly id: "vesper";
  accent: "#ffc799";
  tokens: { keywords: "#a0a0a0"; strings: "#99ffe4" };
}

export const vesperTheme: ThemeConfig = {
  id: "vesper",
  accent: "#ffc799",
  tokens: { keywords: "#a0a0a0", strings: "#99ffe4" },
};`,
  },
  "synthwave-84": {
    lang: "typescript",
    filename: "useRepository.ts",
    code: `// Synthwave '84 Cyberpunk Glow
export function useRepository(owner: string, repo: string) {
  const { data, error } = useSWR(\`/api/repos/\${owner}/\${repo}\`);
  const isGlowing = Boolean(data && !error);
  return { repository: data, isGlowing };
}`,
  },
  everforest: {
    lang: "typescript",
    filename: "forestTokens.ts",
    code: `// Everforest Organic Natural Theme
export const forestTokens = {
  background: "#2d353b",
  keyword: "#d699b6",
  function: "#a7c080",
  string: "#dbbc7f",
  comment: "#859289",
};`,
  },
  gruvbox: {
    lang: "typescript",
    filename: "astCalculator.ts",
    code: `// Gruvbox Warm Earth Tones
export function calculateAST(node: SyntaxTree): TokenResult {
  const { kind, span } = node;
  return { type: "gruvbox", span, parsed: true };
}`,
  },
  "rose-pine": {
    lang: "typescript",
    filename: "rosePine.ts",
    code: `// Rosé Pine Cozy Muted Warmth
export interface PineBranch {
  readonly name: string;
  readonly protected: boolean;
}

export function formatBranchLabel(branch: PineBranch): string {
  return branch.protected ? \`🔒 \${branch.name}\` : branch.name;
}`,
  },
  poimandres: {
    lang: "typescript",
    filename: "poimandres.ts",
    code: `// Poimandres Soft Mint Aesthetic
export function generateThemeMeta(name: string, isDark: boolean) {
  const accent = isDark ? "#5de4c7" : "#add7ff";
  return { themeName: name, accent, highContrast: false };
}`,
  },
  kanagawa: {
    lang: "typescript",
    filename: "kanagawaWave.ts",
    code: `// Kanagawa Katsushika Hokusai Waves
export async function streamFileChunks(reader: ReadableStreamDefaultReader) {
  const { value, done } = await reader.read();
  if (done) return new Uint8Array();
  return value;
}`,
  },
  monokai: {
    lang: "typescript",
    filename: "tokenizer.ts",
    code: `// Monokai High-Contrast Sublime Palette
export function tokenizeCode(source: string): string[] {
  const regex = /([A-Za-z0-9_]+|[^\\s])/g;
  return source.match(regex) ?? [];
}`,
  },
  "night-owl": {
    lang: "typescript",
    filename: "cacheStorage.ts",
    code: `// Night Owl Late-Night Deep Blue
export class CodeSnippetCache {
  private cache = new Map<string, string>();

  public get(key: string): string | undefined {
    return this.cache.get(key);
  }
}`,
  },
  solarized: {
    lang: "typescript",
    filename: "solarizedStream.ts",
    code: `// Solarized Terminal Precision
export function evaluatePrecision(value: number, threshold = 0.05): boolean {
  const delta = Math.abs(value - threshold);
  return delta <= 0.001;
}`,
  },
  vitesse: {
    lang: "typescript",
    filename: "vitesseClean.ts",
    code: `// Vitesse Anthony Fu Clean Minimal
export interface VitesseConfig {
  cleanTypography: boolean;
  contrastRatio: number;
}

export const defaultConfig: VitesseConfig = {
  cleanTypography: true,
  contrastRatio: 4.5,
};`,
  },
};

function getSnippetForTheme(theme: CodeThemeOption): ThemeSnippet {
  return (
    THEME_SNIPPETS[theme.id] || {
      lang: "typescript",
      filename: `${theme.id}.ts`,
      code: `// ${theme.name} Theme — ${theme.description}
export async function loadRepository(owner: string, repo: string): Promise<RepoData> {
  const endpoint = \`/api/repos/\${owner}/\${repo}\`;
  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(\`Failed to fetch \${owner}/\${repo}\`);
  }
  return response.json();
}`,
    }
  );
}

// Fallback line tokenizer using preview colors
function renderFallbackTokens(
  code: string,
  theme: CodeThemeOption,
  isDark: boolean,
) {
  const lines = code.split("\n");
  const keywordRegex =
    /\b(import|from|export|default|function|interface|type|const|let|var|return|async|await|if|else|throw|new|readonly|typeof|as|class|extends|implements)\b/;
  const typeOrFuncRegex =
    /\b(useSWR|useRepository|fetch|Boolean|Octokit|Error|Math|Promise|string|number|boolean|any|void|Record|Array|Map|Uint8Array|SyntaxTree|TokenResult|ThemeConfig|StreamState|TokenNode|PineBranch|VitesseConfig|ReadableStreamDefaultReader|CodeSnippetCache)\b/;

  const themeColors = getCodeThemeColors(theme, isDark ? "dark" : "light");
  const defaultTextColor = isDark ? "#e1e4e8" : "#24292e";
  const punctuationColor = isDark ? "#8b949e" : "#57606a";
  const commentColor = themeColors.comment;
  const stringColor = themeColors.string;
  const keywordColor = themeColors.keyword;
  const functionColor = themeColors.function;

  return lines.map((line, lineIdx) => {
    if (line.trim().startsWith("//")) {
      return (
        <div key={lineIdx} style={{ color: commentColor }}>
          {line}
        </div>
      );
    }

    const parts = line
      .split(
        /(".*?"|'.*?'|`.*?`|\b[a-zA-Z_$][a-zA-Z0-9_$]*\b|[^\w\s"'\`]+|\s+)/g,
      )
      .filter(Boolean);

    return (
      <div key={lineIdx}>
        {parts.map((part, partIdx) => {
          let color = defaultTextColor;
          if (
            part.startsWith('"') ||
            part.startsWith("'") ||
            part.startsWith("`")
          ) {
            color = stringColor;
          } else if (keywordRegex.test(part)) {
            color = keywordColor;
          } else if (typeOrFuncRegex.test(part)) {
            color = functionColor;
          } else if (/^[{}()[\].,;:?!=<>+\-*/%&|^~]+$/.test(part)) {
            color = punctuationColor;
          }

          return (
            <span key={partIdx} style={{ color }}>
              {part}
            </span>
          );
        })}
      </div>
    );
  });
}

export function LandingSyntaxShowcase() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const siteIsDark = mounted ? resolvedTheme === "dark" : true;

  const [selectedThemeId, setSelectedThemeId] = useState<string>(
    () => DEFAULT_THEME_SETTINGS.codeTheme || "github",
  );
  const [previewMode, setPreviewMode] = useState<"dark" | "light">("dark");
  const [highlightedHtml, setHighlightedHtml] = useState<string>("");

  const currentTheme = useMemo(
    () => getCodeTheme(selectedThemeId),
    [selectedThemeId],
  );
  const currentSnippet = useMemo(
    () => getSnippetForTheme(currentTheme),
    [currentTheme],
  );

  const isDark = previewMode === "dark";
  const themeColors = getCodeThemeColors(
    currentTheme,
    isDark ? "dark" : "light",
  );
  const canvasBg = themeColors.bg;

  const hasLightVariant = useMemo(() => {
    if (!currentTheme.lightTheme) return false;
    if (currentTheme.lightTheme === currentTheme.darkTheme) return false;
    if (
      currentTheme.lightPreviewColors &&
      isDarkHex(currentTheme.lightPreviewColors.bg)
    ) {
      return false;
    }
    return true;
  }, [currentTheme]);

  const hasDarkVariant = useMemo(() => {
    if (!currentTheme.darkTheme) return false;
    if (isDarkHex(currentTheme.previewColors.bg)) return true;
    return currentTheme.darkTheme !== currentTheme.lightTheme;
  }, [currentTheme]);

  // Automatically adjust preview mode if the current theme doesn't support the active mode
  useEffect(() => {
    if (!hasLightVariant && previewMode === "light") {
      setPreviewMode("dark");
    } else if (!hasDarkVariant && previewMode === "dark") {
      setPreviewMode("light");
    }
  }, [hasLightVariant, hasDarkVariant, previewMode]);

  // Generate real Shiki syntax highlighting on the fly
  useEffect(() => {
    let isCancelled = false;

    async function highlight() {
      try {
        const shikiThemeName =
          previewMode === "dark"
            ? currentTheme.darkTheme
            : currentTheme.lightTheme;

        const html = await codeToHtml(currentSnippet.code, {
          lang: currentSnippet.lang,
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
  }, [currentSnippet, currentTheme, previewMode]);

  return (
    <section id="syntax-studio" className="relative py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto mb-14 max-w-3xl space-y-3 text-center">
          <Badge
            variant="outline"
            className="border-border/80 text-foreground gap-1.5 px-3 py-1 text-xs font-semibold tracking-widest uppercase"
          >
            <Palette className="text-primary h-3.5 w-3.5" />
            <span>Studio Syntax Highlighting</span>
          </Badge>
          <h2 className="text-foreground text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {CODE_THEMES.length} syntax themes with authentic token contrast.
          </h2>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base leading-relaxed">
            Powered by Shiki 3 TextMate grammars. Switch themes on the fly from
            the toolbar or bind them to your favorite workspace preset in app
            settings.
          </p>
        </div>

        {/* Interactive Studio Playground */}
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
          {/* Left: Theme Switcher Selector Grid */}
          <div className="space-y-3 lg:col-span-5">
            <div className="flex items-center justify-between px-1">
              <span className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
                Select Syntax Theme
              </span>
              <span className="text-primary font-mono text-xs font-semibold">
                {CODE_THEMES.length} Available
              </span>
            </div>

            <ScrollArea className="h-[360px]" scrollShadow hideHorizontal>
              <div className="grid grid-cols-1 gap-2 px-1 pb-2 sm:grid-cols-2">
                {CODE_THEMES.map((theme) => {
                  const isSelected = theme.id === selectedThemeId;
                  const itemColors = getCodeThemeColors(
                    theme,
                    isDark ? "dark" : "light",
                  );
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => setSelectedThemeId(theme.id)}
                      className={cn(
                        "hover:bg-muted/40 relative flex w-full flex-col gap-1 rounded-lg border p-2.5 text-left transition-all",
                        isSelected
                          ? "shadow-xs"
                          : "border-border/60 bg-card/60",
                      )}
                      style={
                        isSelected
                          ? {
                              borderColor: siteIsDark
                                ? `${itemColors.keyword}99`
                                : `color-mix(in srgb, ${itemColors.keyword} 65%, var(--border))`,
                              backgroundColor: siteIsDark
                                ? `color-mix(in srgb, ${itemColors.keyword} 12%, var(--card))`
                                : `color-mix(in srgb, ${itemColors.keyword} 6%, var(--card))`,
                              boxShadow: siteIsDark
                                ? `0 0 0 1px ${itemColors.keyword}44, 0 2px 8px ${itemColors.keyword}18`
                                : `0 0 0 1px color-mix(in srgb, ${itemColors.keyword} 35%, transparent), 0 2px 8px rgba(0,0,0,0.04)`,
                            }
                          : undefined
                      }
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-foreground text-xs font-semibold">
                          {theme.name}
                        </span>
                        {isSelected && (
                          <div
                            className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full shadow-2xs"
                            style={{
                              backgroundColor: itemColors.keyword,
                              color: isDarkHex(itemColors.keyword)
                                ? "#ffffff"
                                : "#0f172a",
                            }}
                          >
                            <Check className="h-2.5 w-2.5 stroke-[2.5]" />
                          </div>
                        )}
                      </div>

                      <p className="text-muted-foreground line-clamp-1 text-[11px] leading-tight">
                        {theme.description}
                      </p>

                      <div className="mt-1 flex items-center gap-1.5">
                        <span
                          className="h-3 w-3 shrink-0 rounded-full border border-black/20 shadow-2xs"
                          style={{ backgroundColor: itemColors.bg }}
                          title={`Background: ${itemColors.bg}`}
                        />
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full shadow-2xs"
                          style={{
                            backgroundColor: itemColors.keyword,
                          }}
                          title={`Keywords: ${itemColors.keyword}`}
                        />
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full shadow-2xs"
                          style={{
                            backgroundColor: itemColors.function,
                          }}
                          title={`Functions: ${itemColors.function}`}
                        />
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full shadow-2xs"
                          style={{
                            backgroundColor: itemColors.string,
                          }}
                          title={`Strings: ${itemColors.string}`}
                        />
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full shadow-2xs"
                          style={{
                            backgroundColor: itemColors.comment,
                          }}
                          title={`Comments: ${itemColors.comment}`}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Right: Live Interactive Code Canvas */}
          <div className="lg:col-span-7">
            <div
              className={cn(
                "overflow-hidden rounded-2xl border transition-all duration-300",
                isDark ? "shadow-2xl" : "border-slate-200/90 shadow-xl",
              )}
              style={{
                backgroundColor: canvasBg,
                borderColor: isDark
                  ? `${themeColors.keyword}44`
                  : `${themeColors.keyword}35`,
                boxShadow: isDark
                  ? `0 20px 45px -15px ${themeColors.keyword}18, 0 0 0 1px ${themeColors.keyword}22`
                  : `0 15px 35px -10px ${themeColors.keyword}15, 0 0 0 1px ${themeColors.keyword}20`,
              }}
            >
              {/* Mock Window Header */}
              <div
                className={cn(
                  "flex items-center justify-between border-b px-4 py-3 transition-colors",
                  isDark
                    ? "border-white/10"
                    : "border-slate-200/90 bg-slate-100/90",
                )}
                style={
                  isDark
                    ? {
                        backgroundColor: `${themeColors.bg}ee`,
                        borderColor: `${themeColors.keyword}25`,
                      }
                    : {
                        backgroundColor: `color-mix(in srgb, ${themeColors.bg} 85%, #f1f5f9)`,
                        borderColor: `${themeColors.keyword}20`,
                      }
                }
              >
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
                    <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
                    <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
                  </div>
                  <div
                    className="ml-2 flex items-center gap-1.5 font-mono text-xs font-medium"
                    style={{ color: themeColors.comment }}
                  >
                    <Code2 className="h-3.5 w-3.5" />
                    <span>{currentSnippet.filename}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Light / Dark Preview Switcher */}
                  <div
                    className={cn(
                      "flex items-center rounded-lg border p-0.5",
                      isDark
                        ? "border-white/10 bg-black/30"
                        : "border-slate-300 bg-slate-200/70",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setPreviewMode("dark")}
                      disabled={!hasDarkVariant}
                      className={cn(
                        "flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors",
                        isDark
                          ? "bg-white/20 text-white shadow-2xs"
                          : "text-slate-600 hover:text-slate-900",
                        !hasDarkVariant
                          ? "cursor-not-allowed opacity-35 hover:bg-transparent hover:text-inherit"
                          : "cursor-pointer",
                      )}
                      title={
                        !hasDarkVariant
                          ? "Dark mode variant is not available for this theme"
                          : `Dark: ${currentTheme.darkTheme}`
                      }
                    >
                      <Moon className="h-3 w-3" />
                      <span>Dark</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPreviewMode("light")}
                      disabled={!hasLightVariant}
                      className={cn(
                        "flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors",
                        !isDark
                          ? "bg-white text-slate-900 shadow-2xs"
                          : "text-white/60 hover:text-white",
                        !hasLightVariant
                          ? "cursor-not-allowed opacity-35 hover:bg-transparent hover:text-inherit"
                          : "cursor-pointer",
                      )}
                      title={
                        !hasLightVariant
                          ? "Light mode variant is not available for this theme"
                          : `Light: ${currentTheme.lightTheme}`
                      }
                    >
                      <Sun className="h-3 w-3" />
                      <span>Light</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Code Content */}
              <div
                className={cn(
                  "scrollbar-styled h-[343px] overflow-auto p-5 font-mono text-xs leading-relaxed select-none sm:text-sm",
                  !isDark && "text-slate-800",
                )}
                style={{ backgroundColor: canvasBg }}
              >
                {highlightedHtml ? (
                  <div
                    dangerouslySetInnerHTML={{ __html: highlightedHtml }}
                    className="[&_code]:!bg-transparent [&_pre]:!m-0 [&_pre]:!bg-transparent [&_pre]:!p-0"
                  />
                ) : (
                  <pre className="whitespace-pre">
                    {renderFallbackTokens(
                      currentSnippet.code,
                      currentTheme,
                      isDark,
                    )}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
