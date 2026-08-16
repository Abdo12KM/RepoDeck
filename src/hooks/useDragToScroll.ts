"use client";

import * as React from "react";

export interface DragToScrollOptions {
  /**
   * Whether drag-to-scroll is enabled. Defaults to `true`.
   */
  enabled?: boolean;
  /**
   * Minimum movement in pixels before considering it a drag gesture.
   * Defaults to `4`.
   */
  threshold?: number;
  /**
   * Whether mouse wheel (vertical scroll) over the element scrolls horizontally
   * when content overflows horizontally. Defaults to `true`.
   */
  wheelToScroll?: boolean;
  /**
   * Optional ref to attach to instead of creating a local ref.
   */
  ref?: React.RefObject<HTMLDivElement | null>;
}

/**
 * Hook to enable smooth mouse/pointer drag-to-scroll and mouse wheel horizontal scrolling
 * for horizontally overflowing containers (e.g., tabs, chips, breadcrumbs).
 *
 * Automatically suppresses click events on children when a drag gesture occurs,
 * and maintains native touch scrolling on touch devices.
 */
export function useDragToScroll<T extends HTMLElement = HTMLDivElement>(
  options: DragToScrollOptions = {},
) {
  const {
    enabled = true,
    threshold = 4,
    wheelToScroll = true,
    ref: externalRef,
  } = options;

  const internalRef = React.useRef<T | null>(null);
  const elementRef = (externalRef || internalRef) as React.RefObject<T | null>;

  const isPointerDownRef = React.useRef(false);
  const hasDraggedRef = React.useRef(false);
  const startXRef = React.useRef(0);
  const startScrollLeftRef = React.useRef(0);
  const activePointerIdRef = React.useRef<number | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) return;
    const el = elementRef.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      // Only drag on primary mouse button (left click) or non-touch pointer
      if (e.pointerType === "touch" || e.button !== 0) return;

      // Don't intercept if clicking an interactive control like a close button
      const target = e.target as HTMLElement | null;
      if (
        target?.closest("button[aria-label*='Close'], button[title*='Close']")
      ) {
        return;
      }

      isPointerDownRef.current = true;
      hasDraggedRef.current = false;
      startXRef.current = e.clientX;
      startScrollLeftRef.current = el.scrollLeft;
      activePointerIdRef.current = e.pointerId;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isPointerDownRef.current) return;

      const deltaX = e.clientX - startXRef.current;

      if (!hasDraggedRef.current && Math.abs(deltaX) >= threshold) {
        hasDraggedRef.current = true;
        setIsDragging(true);
        try {
          if (activePointerIdRef.current !== null && el.setPointerCapture) {
            el.setPointerCapture(activePointerIdRef.current);
          }
        } catch {
          // Ignore if pointer capture fails
        }
      }

      if (hasDraggedRef.current) {
        e.preventDefault();
        el.scrollLeft = startScrollLeftRef.current - deltaX;
      }
    };

    const onPointerUp = () => {
      if (!isPointerDownRef.current) return;

      if (hasDraggedRef.current) {
        try {
          if (activePointerIdRef.current !== null && el.releasePointerCapture) {
            el.releasePointerCapture(activePointerIdRef.current);
          }
        } catch {
          // Ignore
        }
      }

      isPointerDownRef.current = false;
      activePointerIdRef.current = null;

      if (hasDraggedRef.current) {
        requestAnimationFrame(() => {
          setIsDragging(false);
          // Keep hasDraggedRef true for a brief tick so click capture listener can catch and prevent the click
          setTimeout(() => {
            hasDraggedRef.current = false;
          }, 60);
        });
      }
    };

    const onPointerCancel = () => {
      isPointerDownRef.current = false;
      hasDraggedRef.current = false;
      activePointerIdRef.current = null;
      setIsDragging(false);
    };

    // Capture phase click listener to prevent activating tabs when user was dragging
    const onClickCapture = (e: MouseEvent) => {
      if (hasDraggedRef.current) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    };

    // Mouse wheel horizontal scrolling
    const onWheel = (e: WheelEvent) => {
      if (!wheelToScroll) return;
      if (e.deltaY === 0) return;

      // Only convert vertical delta to horizontal scroll if the container is horizontally scrollable
      const canScrollHorizontally = el.scrollWidth > el.clientWidth;
      if (canScrollHorizontally && !e.shiftKey) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerCancel);
    el.addEventListener("click", onClickCapture, true);
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerCancel);
      el.removeEventListener("click", onClickCapture, true);
      el.removeEventListener("wheel", onWheel);
    };
  }, [enabled, threshold, wheelToScroll, elementRef]);

  return {
    ref: elementRef,
    isDragging,
  };
}
