"use client";

import React, { useMemo } from "react";
import { Check, Copy, ExternalLink, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

interface Block {
  type:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "p"
    | "code"
    | "ul"
    | "ol"
    | "blockquote"
    | "hr"
    | "table";
  content?: string;
  lang?: string;
  items?: string[];
  headers?: string[];
  rows?: string[][];
}

export function MarkdownPreview({ content, className }: MarkdownPreviewProps) {
  const blocks = useMemo(() => parseMarkdownBlocks(content), [content]);

  return (
    <div
      className={cn(
        "text-foreground/90 mx-auto max-w-4xl space-y-4 p-4 text-sm leading-relaxed sm:p-8",
        className,
      )}
    >
      {blocks.map((block, idx) => (
        <React.Fragment key={idx}>{renderBlock(block, idx)}</React.Fragment>
      ))}
    </div>
  );
}

function renderBlock(block: Block, index: number) {
  switch (block.type) {
    case "h1":
      return (
        <div className="group border-border/80 border-b pt-6 pb-3 first:pt-0">
          <h1 className="text-foreground flex items-center gap-2 text-2xl font-bold tracking-tight sm:text-3xl">
            <span className="text-primary/40 font-mono text-lg">#</span>
            {renderInline(block.content || "")}
          </h1>
        </div>
      );
    case "h2":
      return (
        <div className="group border-border/60 border-b pt-6 pb-2">
          <h2 className="text-foreground flex items-center gap-2 text-xl font-semibold tracking-tight sm:text-2xl">
            <span className="text-primary/40 font-mono text-base">##</span>
            {renderInline(block.content || "")}
          </h2>
        </div>
      );
    case "h3":
      return (
        <h3 className="text-foreground flex items-center gap-1.5 pt-4 text-base font-semibold sm:text-lg">
          <Hash className="text-primary/40 h-4 w-4 shrink-0" />
          {renderInline(block.content || "")}
        </h3>
      );
    case "h4":
      return (
        <h4 className="text-foreground/90 pt-2 text-sm font-semibold">
          {renderInline(block.content || "")}
        </h4>
      );
    case "p":
      return (
        <p className="text-foreground/80 leading-7">
          {renderInline(block.content || "")}
        </p>
      );
    case "code":
      return (
        <MarkdownCodeBlock
          code={block.content || ""}
          lang={block.lang}
          key={index}
        />
      );
    case "blockquote":
      return (
        <blockquote className="border-primary/50 bg-muted/40 text-muted-foreground rounded-r-lg border-l-4 px-4 py-2.5 text-sm italic">
          {renderInline(block.content || "")}
        </blockquote>
      );
    case "hr":
      return <hr className="border-border/60 my-6" />;
    case "ul":
      return (
        <ul className="text-foreground/85 list-disc space-y-1.5 pl-5">
          {block.items?.map((item, i) => (
            <li key={i} className="leading-6">
              {renderInline(item)}
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="text-foreground/85 list-decimal space-y-1.5 pl-5">
          {block.items?.map((item, i) => (
            <li key={i} className="leading-6">
              {renderInline(item)}
            </li>
          ))}
        </ol>
      );
    case "table":
      return (
        <div className="border-border/80 my-4 overflow-x-auto rounded-lg border">
          <table className="w-full text-left text-xs sm:text-sm">
            {block.headers && block.headers.length > 0 && (
              <thead className="bg-muted/60 border-border/80 text-foreground border-b font-semibold">
                <tr>
                  {block.headers.map((h, i) => (
                    <th key={i} className="px-4 py-2.5 font-medium">
                      {renderInline(h)}
                    </th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody className="divide-border/60 divide-y">
              {block.rows?.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-muted/30 transition-colors">
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="text-foreground/80 px-4 py-2">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    default:
      return null;
  }
}

function MarkdownCodeBlock({ code, lang }: { code: string; lang?: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="border-border/80 bg-muted/40 relative my-3 overflow-hidden rounded-xl border shadow-xs">
      <div className="border-border/60 bg-muted/70 text-muted-foreground flex items-center justify-between border-b px-3.5 py-1.5 font-mono text-xs">
        <span className="text-[11px] font-medium tracking-wider uppercase">
          {lang || "code"}
        </span>
        <Button
          variant="ghost"
          size="xs"
          onClick={handleCopy}
          className="hover:text-foreground h-6 gap-1 px-2 text-[11px]"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-500" />
              <span className="text-emerald-500">Copied</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>Copy</span>
            </>
          )}
        </Button>
      </div>
      <pre className="text-foreground/90 overflow-x-auto p-4 font-mono text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  if (!text) return null;

  // Split by inline code `...`
  const codeParts = text.split(/(`[^`]+`)/g);
  return codeParts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="bg-muted text-primary border-border/60 rounded border px-1.5 py-0.5 font-mono text-[0.85em] font-medium"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Parse links [text](url) and bold **bold**
    return parseFormattedText(part, i);
  });
}

function parseFormattedText(text: string, baseKey: number): React.ReactNode {
  // Check for link [title](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(
        parseBoldItalic(
          text.substring(lastIndex, match.index),
          `${baseKey}-${lastIndex}`,
        ),
      );
    }
    const label = match[1];
    const url = match[2];
    parts.push(
      <a
        key={`${baseKey}-link-${match.index}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary inline-flex items-center gap-0.5 font-medium underline-offset-2 hover:underline"
      >
        <span>{label}</span>
        <ExternalLink className="inline h-3 w-3 opacity-60" />
      </a>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(
      parseBoldItalic(text.substring(lastIndex), `${baseKey}-${lastIndex}`),
    );
  }

  return <React.Fragment key={baseKey}>{parts}</React.Fragment>;
}

function parseBoldItalic(text: string, key: string): React.ReactNode {
  // Parse **bold** and *italic*
  const formatted = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return formatted.map((sub, j) => {
    if (sub.startsWith("**") && sub.endsWith("**")) {
      return (
        <strong key={`${key}-b-${j}`} className="text-foreground font-semibold">
          {sub.slice(2, -2)}
        </strong>
      );
    }
    if (sub.startsWith("*") && sub.endsWith("*")) {
      return (
        <em key={`${key}-i-${j}`} className="italic">
          {sub.slice(1, -1)}
        </em>
      );
    }
    return sub;
  });
}

function parseMarkdownBlocks(raw: string): Block[] {
  const lines = raw.split(/\r?\n/);
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced Code block
    if (line.trim().startsWith("```")) {
      const lang = line.trim().slice(3).trim();
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({
        type: "code",
        lang: lang || undefined,
        content: codeLines.join("\n"),
      });
      i++;
      continue;
    }

    // Horizontal Rule
    if (/^(\*{3,}|-{3,}|_{3,})$/.test(line.trim())) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    // Headings
    if (line.startsWith("# ")) {
      blocks.push({ type: "h1", content: line.slice(2).trim() });
      i++;
      continue;
    }
    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", content: line.slice(3).trim() });
      i++;
      continue;
    }
    if (line.startsWith("### ")) {
      blocks.push({ type: "h3", content: line.slice(4).trim() });
      i++;
      continue;
    }
    if (line.startsWith("#### ")) {
      blocks.push({ type: "h4", content: line.slice(5).trim() });
      i++;
      continue;
    }

    // Blockquote
    if (line.startsWith("> ")) {
      const quoteLines = [line.slice(2).trim()];
      i++;
      while (i < lines.length && lines[i].startsWith("> ")) {
        quoteLines.push(lines[i].slice(2).trim());
        i++;
      }
      blocks.push({ type: "blockquote", content: quoteLines.join(" ") });
      continue;
    }

    // Table detection: line with | ... | followed by separator | --- |
    if (
      line.includes("|") &&
      i + 1 < lines.length &&
      lines[i + 1].includes("---")
    ) {
      const headers = line
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean);
      i += 2; // skip header and delimiter line
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes("|")) {
        const row = lines[i]
          .split("|")
          .map((c) => c.trim())
          .filter(Boolean);
        if (row.length > 0) rows.push(row);
        i++;
      }
      blocks.push({ type: "table", headers, rows });
      continue;
    }

    // Unordered list
    if (/^(\*|-|\+)\s/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^(\*|-|\+)\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^(\*|-|\+)\s+/, ""));
        i++;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    // Ordered list
    if (/^\d+\.\s/.test(line.trim())) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    // Empty line
    if (!line.trim()) {
      i++;
      continue;
    }

    // Paragraph (collect contiguous lines)
    const pLines = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].startsWith("#") &&
      !lines[i].startsWith("```") &&
      !lines[i].startsWith("> ") &&
      !lines[i].trim().startsWith("- ") &&
      !lines[i].trim().startsWith("* ") &&
      !/^\d+\.\s/.test(lines[i].trim())
    ) {
      pLines.push(lines[i]);
      i++;
    }
    blocks.push({ type: "p", content: pLines.join(" ") });
  }

  return blocks;
}
