"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { FileIcon } from "@/components/repo/tree/FileIcon";
import { cn } from "@/lib/utils";
import { useDragToScroll } from "@/hooks/useDragToScroll";

interface ViewerTabsProps {
  openFiles: string[];
  activePath: string | null;
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
  onCloseAll?: () => void;
}

export function ViewerTabs({
  openFiles,
  activePath,
  onSelect,
  onClose,
}: ViewerTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const { isDragging } = useDragToScroll({
    ref: scrollRef,
    enabled: true,
    wheelToScroll: true,
  });

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const updateShadows = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      const maxScrollX = scrollWidth - clientWidth;
      setCanScrollLeft(maxScrollX > 4 && scrollLeft > 4);
      setCanScrollRight(maxScrollX > 4 && scrollLeft < maxScrollX - 4);
    };

    updateShadows();
    el.addEventListener("scroll", updateShadows, { passive: true });
    const resizeObserver = new ResizeObserver(updateShadows);
    resizeObserver.observe(el);

    return () => {
      el.removeEventListener("scroll", updateShadows);
      resizeObserver.disconnect();
    };
  }, [openFiles]);

  const maskImage = useMemo(() => {
    if (canScrollLeft && canScrollRight) {
      return "linear-gradient(to right, transparent 0px, black 24px, black calc(100% - 24px), transparent 100%)";
    }
    if (canScrollLeft) {
      return "linear-gradient(to right, transparent 0px, black 24px, black 100%)";
    }
    if (canScrollRight) {
      return "linear-gradient(to right, black 0px, black calc(100% - 24px), transparent 100%)";
    }
    return undefined;
  }, [canScrollLeft, canScrollRight]);

  if (openFiles.length === 0) return null;

  return (
    <div
      ref={scrollRef}
      style={
        maskImage
          ? {
              maskImage,
              WebkitMaskImage: maskImage,
            }
          : undefined
      }
      className={cn(
        "bg-muted/40 no-scrollbar flex h-9 shrink-0 items-stretch overflow-x-auto border-b select-none",
        isDragging && "cursor-grabbing",
      )}
    >
      <div className="divide-border/60 flex items-stretch divide-x">
        {openFiles.map((path, index) => {
          const fileName = path.split("/").pop() || path;
          const isActive = path === activePath;
          const tabShortcut = index < 9 ? `Alt+${index + 1}` : null;
          const tabTitle = tabShortcut ? `${path} (${tabShortcut})` : path;
          const closeTitle = isActive
            ? "Close tab (Alt+W)"
            : `Close ${fileName}`;

          return (
            <div
              key={path}
              onClick={() => onSelect(path)}
              className={cn(
                "group relative flex max-w-56 cursor-pointer items-center gap-1.5 px-3 text-xs transition-colors",
                isActive
                  ? "bg-background text-foreground border-b-primary border-b-[3px] font-medium shadow-xs"
                  : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
              )}
              title={tabTitle}
            >
              <FileIcon
                name={fileName}
                isFolder={false}
                className="h-3.5 w-3.5 shrink-0"
              />
              <span className="truncate text-[12px]">{fileName}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose(path);
                }}
                className={cn(
                  "text-muted-foreground hover:bg-muted hover:text-foreground rounded-sm p-0.5 transition-opacity",
                  isActive
                    ? "opacity-70 hover:opacity-100"
                    : "opacity-0 group-hover:opacity-70 hover:!opacity-100",
                )}
                title={closeTitle}
                aria-label={closeTitle}
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
