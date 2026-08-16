"use client";

import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Kbd } from "@/components/ui/kbd";
import { useModifierKey } from "@/hooks/useModifierKey";
import { Command, Compass, Files, Code2, X } from "lucide-react";

interface ShortcutsHelpDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
}

interface ShortcutCategory {
  title: string;
  icon: React.ReactNode;
  shortcuts: ShortcutItem[];
}

export function ShortcutsHelpDialog({
  open,
  onOpenChange,
}: ShortcutsHelpDialogProps) {
  const modifier = useModifierKey();

  const categories: ShortcutCategory[] = useMemo(
    () => [
      {
        title: "Navigation & Universal",
        icon: <Compass className="text-primary h-4 w-4" />,
        shortcuts: [
          {
            keys: [`${modifier}+K`, `${modifier}+P`],
            description: "Command Palette & Universal Switcher",
          },
          {
            keys: [`${modifier}+O`],
            description: "Open / Switch Repository & Branch",
          },
          {
            keys: [`${modifier}+B`, `${modifier}+\\`],
            description: "Toggle File Tree Sidebar",
          },
          {
            keys: [`${modifier}+,`],
            description: "Appearance & Theme Settings",
          },
          {
            keys: ["?"],
            description: "Open Keyboard Shortcuts Reference",
          },
          {
            keys: ["Esc"],
            description: "Close active modal, drawer, or palette",
          },
        ],
      },
      {
        title: "File Tabs Management",
        icon: <Files className="text-primary h-4 w-4" />,
        shortcuts: [
          {
            keys: ["Alt+[", "Alt+]"],
            description: "Switch to Previous / Next Tab",
          },
          {
            keys: ["Alt+←", "Alt+→"],
            description: "Cycle through open file tabs",
          },
          {
            keys: ["Alt+W"],
            description: "Close active file tab",
          },
          {
            keys: ["Alt+1..9"],
            description: "Jump directly to tab 1 through 9",
          },
        ],
      },
      {
        title: "Code Viewer",
        icon: <Code2 className="text-primary h-4 w-4" />,
        shortcuts: [
          {
            keys: ["Alt+Z"],
            description: "Toggle line word wrapping",
          },
          {
            keys: ["Alt+L"],
            description: "Toggle line numbers gutter",
          },
        ],
      },
    ],
    [modifier],
  );

  const totalCount = categories.reduce(
    (acc, cat) => acc + cat.shortcuts.length,
    0,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent
        showCloseButton={false}
        onOpenAutoFocus={(event) => {
          if (event.currentTarget instanceof HTMLElement)
            event.currentTarget.focus();
        }}
        className="border-border/80 bg-background fixed top-0 left-0 bottom-18 z-50 flex h-auto max-h-[calc(100dvh-4.5rem)] w-dvw max-w-none translate-x-0 translate-y-0 flex-col gap-0 overflow-hidden rounded-none border-0 p-0 shadow-2xl ring-0 sm:top-1/2 sm:left-1/2 sm:bottom-auto sm:h-auto sm:max-h-[85vh] sm:w-full sm:max-w-lg sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:border sm:ring-1"
      >
        <VisuallyHidden>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>
            Quick reference for power-user navigation and controls
          </DialogDescription>
        </VisuallyHidden>

        {/* Dialog Header */}
        <DialogHeader className="bg-muted/20 shrink-0 border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Command className="text-primary h-4 w-4" />
              <span className="text-foreground text-sm font-semibold">
                Keyboard Shortcuts
              </span>
              <Badge
                variant="secondary"
                className="h-4.5 px-1.5 font-mono text-[10px]"
              >
                {totalCount}
              </Badge>
            </div>

            <Button
              variant="ghost"
              size="icon-xs"
              className="text-muted-foreground hover:text-foreground -mr-1 h-7 w-7 cursor-pointer rounded-md"
              onClick={() => onOpenChange(false)}
              title="Close (Esc)"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Shortcuts List Content */}
        <ScrollArea
          className="min-h-0 flex-1 p-4 sm:h-[420px] sm:flex-none"
          hideHorizontal
          scrollShadow
        >
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category.title} className="space-y-2">
                <p className="text-muted-foreground flex items-center gap-1.5 px-1 text-[11px] font-semibold tracking-wider uppercase">
                  {category.icon}
                  {category.title}
                </p>

                <div className="bg-card border-border/70 divide-border/40 divide-y overflow-hidden rounded-xl border shadow-2xs">
                  {category.shortcuts.map((item) => (
                    <div
                      key={item.description}
                      className="hover:bg-muted/30 flex items-center justify-between gap-3 px-3 py-2 text-xs transition-colors"
                    >
                      <span className="text-foreground/90 font-medium">
                        {item.description}
                      </span>
                      <div className="flex shrink-0 items-center gap-1">
                        {item.keys.map((k) => (
                          <Kbd
                            key={k}
                            className="bg-muted/60 border-border font-mono text-[10px]"
                          >
                            {k}
                          </Kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
