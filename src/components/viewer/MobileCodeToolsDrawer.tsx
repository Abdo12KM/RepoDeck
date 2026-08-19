"use client";

import React from "react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Kbd } from "@/components/ui/kbd";
import {
  Copy,
  Check,
  Download,
  ExternalLink,
  ListOrdered,
  RotateCcw,
  WrapText,
  ZoomIn,
  ZoomOut,
  BookOpen,
  Code2,
  Paintbrush,
} from "lucide-react";
import { useModifierKey } from "@/hooks/useModifierKey";
import { cn } from "@/lib/utils";

interface MobileCodeToolsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filePath: string | null;
  owner: string;
  repo: string;
  branch: string;
  wrapLines: boolean;
  onToggleWrapLines: () => void;
  showLineNumbers: boolean;
  onToggleLineNumbers: () => void;
  fontSizeLabel: string;
  canZoomIn: boolean;
  canZoomOut: boolean;
  isDefaultZoom: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  isMarkdown: boolean;
  previewMode: "preview" | "code";
  onTogglePreviewMode: () => void;
  onCopy: () => void;
  copied: boolean;
  onDownload: () => void;
  onOpenAppearance?: () => void;
}

export function MobileCodeToolsDrawer({
  open,
  onOpenChange,
  filePath,
  owner,
  repo,
  branch,
  wrapLines,
  onToggleWrapLines,
  showLineNumbers,
  onToggleLineNumbers,
  fontSizeLabel,
  canZoomIn,
  canZoomOut,
  isDefaultZoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  isMarkdown,
  previewMode,
  onTogglePreviewMode,
  onCopy,
  copied,
  onDownload,
  onOpenAppearance,
}: MobileCodeToolsDrawerProps) {
  const modifier = useModifierKey();
  if (!filePath) return null;
  const fileName = filePath.split("/").pop() || "File";

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className="border-b pb-3 text-left">
          <div className="flex items-center justify-between">
            <DrawerTitle className="max-w-xs truncate text-sm font-semibold">
              {fileName}
            </DrawerTitle>
            <Badge variant="outline" className="font-mono text-[10px]">
              {branch}
            </Badge>
          </div>
          <DrawerDescription className="text-muted-foreground truncate font-mono text-xs">
            {filePath}
          </DrawerDescription>
        </DrawerHeader>

        {/* Quick Tool Grid under Thumb */}
        <div className="space-y-4 p-4">
          {/* Markdown Toggle if applicable */}
          {isMarkdown && (
            <div className="border-border/80 bg-muted/20 flex items-center justify-between rounded-xl border p-3">
              <div>
                <p className="text-foreground text-xs font-semibold">
                  Markdown Mode
                </p>
                <p className="text-muted-foreground text-[11px]">
                  Switch between rendered preview and raw code
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onTogglePreviewMode}
                className="h-8 shrink-0 gap-1.5 text-xs"
              >
                {previewMode === "preview" ? (
                  <>
                    <BookOpen className="text-primary h-3.5 w-3.5" />
                    <span>Preview</span>
                  </>
                ) : (
                  <>
                    <Code2 className="text-primary h-3.5 w-3.5" />
                    <span>Raw Code</span>
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Reading Toggles Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Wrap Lines */}
            <button
              type="button"
              onClick={onToggleWrapLines}
              className={cn(
                "flex cursor-pointer flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all",
                wrapLines
                  ? "bg-primary/10 border-primary/40 text-primary"
                  : "bg-muted/30 border-border/80 hover:bg-muted/60 text-foreground",
              )}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <WrapText className="h-4 w-4" />
                  <Kbd className="font-mono text-[9px]">Alt+Z</Kbd>
                </div>
                <Badge
                  variant={wrapLines ? "default" : "outline"}
                  className="h-4 px-1 text-[9px]"
                >
                  {wrapLines ? "ON" : "OFF"}
                </Badge>
              </div>
              <span className="mt-1 text-xs font-semibold">Wrap Lines</span>
              <span className="text-muted-foreground text-[10px]">
                Avoid horizontal scroll
              </span>
            </button>

            {/* Line Numbers */}
            <button
              type="button"
              onClick={onToggleLineNumbers}
              className={cn(
                "flex cursor-pointer flex-col items-start gap-1 rounded-xl border p-3 text-left transition-all",
                showLineNumbers
                  ? "bg-primary/10 border-primary/40 text-primary"
                  : "bg-muted/30 border-border/80 hover:bg-muted/60 text-foreground",
              )}
            >
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <ListOrdered className="h-4 w-4" />
                  <Kbd className="font-mono text-[9px]">Alt+L</Kbd>
                </div>
                <Badge
                  variant={showLineNumbers ? "default" : "outline"}
                  className="h-4 px-1 text-[9px]"
                >
                  {showLineNumbers ? "ON" : "OFF"}
                </Badge>
              </div>
              <span className="mt-1 text-xs font-semibold">Line Numbers</span>
              <span className="text-muted-foreground text-[10px]">
                Show line counters
              </span>
            </button>
          </div>

          {/* Font Scaling Row */}
          <div className="border-border/80 bg-muted/20 flex items-center justify-between rounded-xl border p-3">
            <div>
              <p className="text-foreground text-xs font-semibold">
                Font Size Scale
              </p>
              <p className="text-muted-foreground font-mono text-[10px]">
                Current: {fontSizeLabel}
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={onZoomOut}
                disabled={!canZoomOut}
                className="h-8 w-8"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="min-w-10 text-center font-mono text-xs font-semibold">
                {fontSizeLabel}
              </span>
              <Button
                variant="outline"
                size="icon-sm"
                onClick={onZoomIn}
                disabled={!canZoomIn}
                className="h-8 w-8"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              {!isDefaultZoom && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={onResetZoom}
                  className="text-muted-foreground h-8 w-8"
                  title="Reset zoom"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="h-10 gap-2 text-xs font-semibold shadow-xs"
              onClick={onCopy}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-500">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="text-primary h-4 w-4" />
                  <span>Copy Code</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              className="h-10 gap-2 text-xs font-semibold shadow-xs"
              onClick={onDownload}
            >
              <Download className="text-primary h-4 w-4" />
              <span>Download File</span>
            </Button>
          </div>

          {/* Open on GitHub External Link */}
          <Button
            variant="ghost"
            asChild
            className="text-muted-foreground hover:text-foreground h-9 w-full justify-center gap-1.5 text-xs"
          >
            <a
              href={`https://github.com/${owner}/${repo}/blob/${branch}/${filePath}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>View original on GitHub</span>
              <ExternalLink className="ml-1 h-3.5 w-3.5" />
            </a>
          </Button>

          {/* Theme & Appearance Settings Button */}
          {onOpenAppearance && (
            <Button
              variant="outline"
              className="text-muted-foreground hover:text-foreground border-border/80 h-9 w-full justify-between gap-2 px-3 text-xs"
              onClick={() => {
                onOpenChange(false);
                onOpenAppearance();
              }}
            >
              <div className="flex items-center gap-2">
                <Paintbrush className="text-primary h-3.5 w-3.5" />
                <span>Theme & Appearance Studio</span>
              </div>
              <Kbd className="text-[10px]">{modifier}+,</Kbd>
            </Button>
          )}
        </div>

        <DrawerFooter className="pt-0 pb-6 sm:pb-4">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="w-full text-xs"
          >
            Done
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
