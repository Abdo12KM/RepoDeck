"use client";

import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface HybridHintProps {
  /** The trigger element */
  children: React.ReactNode;
  /** The hint content to display */
  content: React.ReactNode;
  /** Side to display the hint */
  side?: "top" | "bottom" | "left" | "right";
  /** Additional class for the content container */
  contentClassName?: string;
}

/**
 * HybridHint - Shows tooltip on hover-capable devices, popover on touch devices.
 *
 * Uses CSS media query `(pointer: fine)` to detect if the device has a precise pointer (mouse).
 * This is more reliable than `(hover: hover)` for distinguishing real mobile devices.
 * - Desktop/mouse: Shows tooltip on hover
 * - Touch/mobile: Shows popover on tap
 */
export function HybridHint({
  children,
  content,
  side = "top",
  contentClassName,
}: HybridHintProps) {
  const [hasFinePointer, setHasFinePointer] = React.useState<boolean | null>(
    null,
  );
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    // Check if device has a fine pointer (mouse) - more reliable than hover detection
    // `(pointer: fine)` is true for mouse/trackpad, false for touch-only devices
    const mediaQuery = window.matchMedia("(pointer: fine)");
    setHasFinePointer(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setHasFinePointer(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // SSR/initial render - return children only until we know pointer capability
  if (hasFinePointer === null) {
    return <>{children}</>;
  }

  // Desktop: Use Tooltip (hover-triggered)
  if (hasFinePointer) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} className={contentClassName}>
          {content}
        </TooltipContent>
      </Tooltip>
    );
  }

  // Touch/Mobile: Use Popover (click-triggered)
  // Important: We need to handle the touch events properly to prevent
  // the popover from closing immediately after opening
  const handleTouchEnd = (e: React.TouchEvent) => {
    // Prevent the touch event from triggering a synthetic click
    // that might propagate and close the popover
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  const handleClick = (e: React.MouseEvent) => {
    // Prevent click from bubbling up to parent elements
    e.stopPropagation();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <span
          role="button"
          tabIndex={0}
          className="inline-flex"
          onTouchEnd={handleTouchEnd}
          onClick={handleClick}
        >
          {children}
        </span>
      </PopoverTrigger>
      <PopoverContent
        side={side}
        className={contentClassName}
        onOpenAutoFocus={(e) => e.preventDefault()}
        onPointerDownOutside={() => {
          // Close the popover when tapping outside
          setIsOpen(false);
        }}
        onInteractOutside={(e) => {
          // Prevent the outside interaction from triggering other actions
          e.preventDefault();
        }}
      >
        {content}
      </PopoverContent>
    </Popover>
  );
}
