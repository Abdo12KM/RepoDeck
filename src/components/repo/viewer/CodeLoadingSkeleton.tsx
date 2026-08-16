"use client";

/**
 * Studio-Grade Code Loading Skeleton Component
 * Renders an authentic, syntax-aware code loading skeleton that dynamically
 * respects the active code theme palette, base neutral theme, and background color.
 * Features line gutters, code token segmenting, language-adapted structures,
 * and a high-contrast traveling shimmer wave.
 */

import { useMemo, useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { useAppearanceSettings } from "@/hooks/useAppearanceSettings";
import { cn } from "@/lib/utils";

interface CodeLoadingSkeletonProps {
  filePath?: string | null;
  showLineNumbers?: boolean;
  fontSizeClass?: string;
  wrapLines?: boolean;
  className?: string;
  linesCount?: number;
}

type TokenType =
  | "keyword"
  | "function"
  | "string"
  | "comment"
  | "variable"
  | "punctuation"
  | "type";

interface SkeletonToken {
  type: TokenType;
  width: string; // e.g. "w-12", "w-20", "w-8"
}

interface SkeletonLine {
  indent: number; // in characters / level
  tokens: SkeletonToken[];
  isEmpty?: boolean;
}

/**
 * Generate syntax-aware skeleton line structures matching the file language
 */
function getSkeletonLinesForFile(filePath?: string | null): SkeletonLine[] {
  const ext = filePath ? filePath.split(".").pop()?.toLowerCase() : "";

  // 1. JSON
  if (ext === "json" || ext === "jsonc" || ext === "json5") {
    return [
      { indent: 0, tokens: [{ type: "punctuation", width: "w-3" }] },
      {
        indent: 2,
        tokens: [
          { type: "string", width: "w-16" },
          { type: "punctuation", width: "w-2" },
          { type: "string", width: "w-24" },
          { type: "punctuation", width: "w-2" },
        ],
      },
      {
        indent: 2,
        tokens: [
          { type: "string", width: "w-20" },
          { type: "punctuation", width: "w-2" },
          { type: "string", width: "w-14" },
          { type: "punctuation", width: "w-2" },
        ],
      },
      {
        indent: 2,
        tokens: [
          { type: "string", width: "w-16" },
          { type: "punctuation", width: "w-2" },
          { type: "keyword", width: "w-10" },
          { type: "punctuation", width: "w-2" },
        ],
      },
      {
        indent: 2,
        tokens: [
          { type: "string", width: "w-28" },
          { type: "punctuation", width: "w-2" },
          { type: "punctuation", width: "w-3" },
        ],
      },
      {
        indent: 4,
        tokens: [
          { type: "string", width: "w-14" },
          { type: "punctuation", width: "w-2" },
          { type: "string", width: "w-20" },
          { type: "punctuation", width: "w-2" },
        ],
      },
      {
        indent: 4,
        tokens: [
          { type: "string", width: "w-16" },
          { type: "punctuation", width: "w-2" },
          { type: "string", width: "w-16" },
          { type: "punctuation", width: "w-2" },
        ],
      },
      {
        indent: 4,
        tokens: [
          { type: "string", width: "w-20" },
          { type: "punctuation", width: "w-2" },
          { type: "string", width: "w-18" },
          { type: "punctuation", width: "w-2" },
        ],
      },
      {
        indent: 4,
        tokens: [
          { type: "string", width: "w-24" },
          { type: "punctuation", width: "w-2" },
          { type: "string", width: "w-16" },
        ],
      },
      { indent: 2, tokens: [{ type: "punctuation", width: "w-4" }] },
      {
        indent: 2,
        tokens: [
          { type: "string", width: "w-18" },
          { type: "punctuation", width: "w-2" },
          { type: "punctuation", width: "w-3" },
        ],
      },
      {
        indent: 4,
        tokens: [
          { type: "string", width: "w-12" },
          { type: "punctuation", width: "w-2" },
          { type: "string", width: "w-22" },
          { type: "punctuation", width: "w-2" },
        ],
      },
      {
        indent: 4,
        tokens: [
          { type: "string", width: "w-14" },
          { type: "punctuation", width: "w-2" },
          { type: "string", width: "w-24" },
        ],
      },
      { indent: 2, tokens: [{ type: "punctuation", width: "w-3" }] },
      { indent: 0, tokens: [{ type: "punctuation", width: "w-3" }] },
    ];
  }

  // 2. CSS / SCSS / LESS
  if (ext === "css" || ext === "scss" || ext === "less") {
    return [
      {
        indent: 0,
        tokens: [{ type: "comment", width: "w-48" }],
      },
      {
        indent: 0,
        tokens: [
          { type: "function", width: "w-28" },
          { type: "punctuation", width: "w-3" },
        ],
      },
      {
        indent: 2,
        tokens: [
          { type: "keyword", width: "w-20" },
          { type: "punctuation", width: "w-2" },
          { type: "variable", width: "w-16" },
          { type: "punctuation", width: "w-2" },
        ],
      },
      {
        indent: 2,
        tokens: [
          { type: "keyword", width: "w-28" },
          { type: "punctuation", width: "w-2" },
          { type: "function", width: "w-20" },
          { type: "punctuation", width: "w-2" },
        ],
      },
      {
        indent: 2,
        tokens: [
          { type: "keyword", width: "w-24" },
          { type: "punctuation", width: "w-2" },
          { type: "string", width: "w-32" },
          { type: "punctuation", width: "w-2" },
        ],
      },
      { indent: 0, tokens: [{ type: "punctuation", width: "w-3" }] },
      { indent: 0, tokens: [], isEmpty: true },
      {
        indent: 0,
        tokens: [
          { type: "keyword", width: "w-16" },
          { type: "function", width: "w-24" },
          { type: "punctuation", width: "w-3" },
        ],
      },
      {
        indent: 2,
        tokens: [
          { type: "function", width: "w-20" },
          { type: "punctuation", width: "w-3" },
        ],
      },
      {
        indent: 4,
        tokens: [
          { type: "keyword", width: "w-22" },
          { type: "punctuation", width: "w-2" },
          { type: "variable", width: "w-14" },
          { type: "punctuation", width: "w-2" },
        ],
      },
      { indent: 2, tokens: [{ type: "punctuation", width: "w-3" }] },
      { indent: 0, tokens: [{ type: "punctuation", width: "w-3" }] },
    ];
  }

  // 3. Python / Go / Rust
  if (ext === "py" || ext === "go" || ext === "rs" || ext === "rb") {
    return [
      {
        indent: 0,
        tokens: [
          { type: "keyword", width: "w-14" },
          { type: "variable", width: "w-20" },
        ],
      },
      {
        indent: 0,
        tokens: [
          { type: "keyword", width: "w-12" },
          { type: "variable", width: "w-16" },
          { type: "keyword", width: "w-10" },
          { type: "variable", width: "w-24" },
        ],
      },
      { indent: 0, tokens: [], isEmpty: true },
      {
        indent: 0,
        tokens: [{ type: "comment", width: "w-52" }],
      },
      {
        indent: 0,
        tokens: [
          { type: "keyword", width: "w-10" },
          { type: "function", width: "w-28" },
          { type: "punctuation", width: "w-2" },
          { type: "variable", width: "w-16" },
          { type: "punctuation", width: "w-2" },
          { type: "type", width: "w-12" },
          { type: "punctuation", width: "w-2" },
        ],
      },
      {
        indent: 2,
        tokens: [{ type: "comment", width: "w-40" }],
      },
      {
        indent: 2,
        tokens: [
          { type: "keyword", width: "w-8" },
          { type: "keyword", width: "w-8" },
          { type: "variable", width: "w-14" },
          { type: "punctuation", width: "w-2" },
        ],
      },
      {
        indent: 4,
        tokens: [
          { type: "keyword", width: "w-14" },
          { type: "keyword", width: "w-10" },
        ],
      },
      { indent: 2, tokens: [], isEmpty: true },
      {
        indent: 2,
        tokens: [
          { type: "variable", width: "w-16" },
          { type: "punctuation", width: "w-2" },
          { type: "function", width: "w-20" },
          { type: "punctuation", width: "w-2" },
          { type: "variable", width: "w-14" },
          { type: "punctuation", width: "w-2" },
        ],
      },
      {
        indent: 2,
        tokens: [
          { type: "keyword", width: "w-14" },
          { type: "variable", width: "w-18" },
        ],
      },
    ];
  }

  // 4. Default: TypeScript / JavaScript / TSX / JSX / C-family
  return [
    {
      indent: 0,
      tokens: [
        { type: "keyword", width: "w-14" },
        { type: "punctuation", width: "w-2" },
        { type: "variable", width: "w-18" },
        { type: "punctuation", width: "w-2" },
        { type: "variable", width: "w-20" },
        { type: "punctuation", width: "w-2" },
        { type: "keyword", width: "w-10" },
        { type: "string", width: "w-20" },
        { type: "punctuation", width: "w-2" },
      ],
    },
    {
      indent: 0,
      tokens: [
        { type: "keyword", width: "w-14" },
        { type: "keyword", width: "w-10" },
        { type: "punctuation", width: "w-2" },
        { type: "type", width: "w-28" },
        { type: "punctuation", width: "w-2" },
        { type: "keyword", width: "w-10" },
        { type: "string", width: "w-24" },
        { type: "punctuation", width: "w-2" },
      ],
    },
    {
      indent: 0,
      tokens: [
        { type: "keyword", width: "w-14" },
        { type: "punctuation", width: "w-2" },
        { type: "function", width: "w-24" },
        { type: "punctuation", width: "w-2" },
        { type: "keyword", width: "w-10" },
        { type: "string", width: "w-32" },
        { type: "punctuation", width: "w-2" },
      ],
    },
    { indent: 0, tokens: [], isEmpty: true },
    {
      indent: 0,
      tokens: [{ type: "comment", width: "w-64" }],
    },
    {
      indent: 0,
      tokens: [
        { type: "keyword", width: "w-14" },
        { type: "keyword", width: "w-18" },
        { type: "type", width: "w-28" },
        { type: "punctuation", width: "w-3" },
      ],
    },
    {
      indent: 2,
      tokens: [
        { type: "variable", width: "w-16" },
        { type: "punctuation", width: "w-2" },
        { type: "type", width: "w-14" },
        { type: "punctuation", width: "w-2" },
      ],
    },
    {
      indent: 2,
      tokens: [
        { type: "variable", width: "w-20" },
        { type: "punctuation", width: "w-2" },
        { type: "type", width: "w-24" },
        { type: "punctuation", width: "w-2" },
      ],
    },
    { indent: 0, tokens: [{ type: "punctuation", width: "w-3" }] },
    { indent: 0, tokens: [], isEmpty: true },
    {
      indent: 0,
      tokens: [
        { type: "keyword", width: "w-14" },
        { type: "keyword", width: "w-16" },
        { type: "function", width: "w-32" },
        { type: "punctuation", width: "w-2" },
        { type: "punctuation", width: "w-2" },
        { type: "variable", width: "w-14" },
        { type: "punctuation", width: "w-2" },
        { type: "variable", width: "w-12" },
        { type: "punctuation", width: "w-2" },
        { type: "type", width: "w-22" },
        { type: "punctuation", width: "w-3" },
      ],
    },
    {
      indent: 2,
      tokens: [
        { type: "keyword", width: "w-12" },
        { type: "punctuation", width: "w-2" },
        { type: "variable", width: "w-16" },
        { type: "punctuation", width: "w-2" },
        { type: "function", width: "w-18" },
        { type: "punctuation", width: "w-2" },
        { type: "punctuation", width: "w-2" },
        { type: "function", width: "w-20" },
        { type: "punctuation", width: "w-2" },
        { type: "keyword", width: "w-10" },
        { type: "punctuation", width: "w-2" },
        { type: "punctuation", width: "w-2" },
      ],
    },
    {
      indent: 2,
      tokens: [
        { type: "keyword", width: "w-12" },
        { type: "variable", width: "w-18" },
        { type: "punctuation", width: "w-2" },
        { type: "function", width: "w-16" },
        { type: "punctuation", width: "w-2" },
        { type: "type", width: "w-24" },
        { type: "punctuation", width: "w-2" },
        { type: "keyword", width: "w-10" },
        { type: "punctuation", width: "w-2" },
      ],
    },
    { indent: 2, tokens: [], isEmpty: true },
    {
      indent: 2,
      tokens: [
        { type: "function", width: "w-24" },
        { type: "punctuation", width: "w-2" },
        { type: "punctuation", width: "w-2" },
        { type: "punctuation", width: "w-2" },
        { type: "punctuation", width: "w-4" },
        { type: "punctuation", width: "w-3" },
      ],
    },
    {
      indent: 4,
      tokens: [
        { type: "keyword", width: "w-8" },
        { type: "punctuation", width: "w-2" },
        { type: "punctuation", width: "w-2" },
        { type: "variable", width: "w-14" },
        { type: "punctuation", width: "w-2" },
        { type: "keyword", width: "w-12" },
        { type: "punctuation", width: "w-2" },
      ],
    },
    {
      indent: 4,
      tokens: [
        { type: "function", width: "w-22" },
        { type: "punctuation", width: "w-2" },
        { type: "variable", width: "w-14" },
        { type: "punctuation", width: "w-2" },
        { type: "punctuation", width: "w-2" },
        { type: "variable", width: "w-10" },
        { type: "punctuation", width: "w-2" },
        { type: "function", width: "w-18" },
        { type: "punctuation", width: "w-2" },
        { type: "punctuation", width: "w-2" },
      ],
    },
    {
      indent: 2,
      tokens: [
        { type: "punctuation", width: "w-3" },
        { type: "punctuation", width: "w-2" },
        { type: "punctuation", width: "w-2" },
        { type: "variable", width: "w-14" },
        { type: "punctuation", width: "w-2" },
        { type: "punctuation", width: "w-2" },
        { type: "punctuation", width: "w-2" },
      ],
    },
    { indent: 2, tokens: [], isEmpty: true },
    {
      indent: 2,
      tokens: [
        { type: "keyword", width: "w-14" },
        { type: "punctuation", width: "w-3" },
      ],
    },
    {
      indent: 4,
      tokens: [
        { type: "punctuation", width: "w-2" },
        { type: "type", width: "w-10" },
        { type: "variable", width: "w-18" },
        { type: "punctuation", width: "w-2" },
        { type: "string", width: "w-28" },
        { type: "punctuation", width: "w-2" },
      ],
    },
    {
      indent: 6,
      tokens: [
        { type: "punctuation", width: "w-2" },
        { type: "type", width: "w-14" },
        { type: "variable", width: "w-12" },
        { type: "punctuation", width: "w-2" },
        { type: "string", width: "w-24" },
        { type: "punctuation", width: "w-4" },
      ],
    },
    {
      indent: 4,
      tokens: [
        { type: "punctuation", width: "w-2" },
        { type: "punctuation", width: "w-2" },
        { type: "type", width: "w-10" },
        { type: "punctuation", width: "w-2" },
      ],
    },
    {
      indent: 2,
      tokens: [
        { type: "punctuation", width: "w-3" },
        { type: "punctuation", width: "w-2" },
      ],
    },
    { indent: 0, tokens: [{ type: "punctuation", width: "w-3" }] },
  ];
}

export function CodeLoadingSkeleton({
  filePath,
  showLineNumbers = true,
  fontSizeClass = "text-[13px] leading-5",
  wrapLines = false,
  className,
  linesCount,
}: CodeLoadingSkeletonProps) {
  const { resolvedTheme } = useTheme();
  const { settings, getCodeTheme, getCodeThemeColors } =
    useAppearanceSettings();
  const activeCodeTheme = getCodeTheme(settings.codeTheme || "github");

  // Avoid SSR/client hydration mismatch: resolvedTheme is undefined on the
  // server, so we defer all theme-dependent styles until after mount.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const codeThemeColors = getCodeThemeColors(
    activeCodeTheme,
    isDark ? "dark" : "light",
  );

  const { keyword, function: func, string: str, comment } = codeThemeColors;

  const skeletonLines = useMemo(() => {
    const lines = getSkeletonLinesForFile(filePath);
    if (linesCount && linesCount > 0) {
      return lines.slice(0, linesCount);
    }
    return lines;
  }, [filePath, linesCount]);

  /**
   * Helper to return high-contrast, theme-accurate token colors
   */
  const getTokenStyle = (type: TokenType) => {
    switch (type) {
      case "keyword":
        return {
          backgroundColor: keyword,
          opacity: isDark ? 0.45 : 0.55,
          boxShadow: isDark ? `0 0 10px ${keyword}25` : undefined,
        };
      case "function":
        return {
          backgroundColor: func,
          opacity: isDark ? 0.5 : 0.6,
          boxShadow: isDark ? `0 0 10px ${func}25` : undefined,
        };
      case "string":
        return {
          backgroundColor: str,
          opacity: isDark ? 0.45 : 0.55,
          boxShadow: isDark ? `0 0 10px ${str}25` : undefined,
        };
      case "type":
        return {
          backgroundColor: func,
          opacity: isDark ? 0.4 : 0.5,
        };
      case "comment":
        return {
          backgroundColor: comment,
          opacity: isDark ? 0.35 : 0.4,
        };
      case "punctuation":
        return {
          backgroundColor: isDark
            ? "rgba(255, 255, 255, 0.22)"
            : "rgba(0, 0, 0, 0.18)",
          opacity: 0.8,
        };
      case "variable":
      default:
        return {
          backgroundColor: isDark
            ? "rgba(255, 255, 255, 0.3)"
            : "rgba(0, 0, 0, 0.22)",
          opacity: 0.7,
        };
    }
  };

  return (
    <div
      className={cn(
        "code-viewer-container min-h-full flex-1 animate-pulse font-mono transition-opacity duration-150 select-none",
        fontSizeClass,
        showLineNumbers && "has-line-numbers",
        wrapLines ? "code-wrap" : "code-nowrap",
        className,
      )}
      aria-label="Loading code file..."
      role="status"
    >
      <pre
        className="m-0 min-h-full w-full flex-1 px-1 py-3 sm:px-2"
        style={{ background: "transparent" }}
      >
        <code className="grid min-w-full">
          {skeletonLines.map((line, lineIndex) => {
            return (
              <span
                key={lineIndex}
                className="line relative flex min-h-[1.5rem] items-center py-[2px] leading-[1.5]"
              >
                {/* Indent Spacer */}
                {line.indent > 0 && (
                  <span
                    className="inline-block shrink-0"
                    style={{
                      width: `${line.indent * 0.55}rem`,
                    }}
                  />
                )}

                {/* Line Code Tokens */}
                {!line.isEmpty && (
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    {line.tokens.map((token, tokenIndex) => (
                      <span
                        key={tokenIndex}
                        className={cn(
                          "inline-block h-[0.72em] shrink-0 rounded-xs transition-all",
                          token.width,
                        )}
                        style={getTokenStyle(token.type)}
                      />
                    ))}
                  </span>
                )}
              </span>
            );
          })}
        </code>
      </pre>
    </div>
  );
}
