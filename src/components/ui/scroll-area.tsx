"use client";

import * as React from "react";
import { ScrollArea as ScrollAreaPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

interface ScrollAreaProps extends React.ComponentProps<
  typeof ScrollAreaPrimitive.Root
> {
  viewportClassName?: string;
  viewportRef?: React.Ref<HTMLDivElement>;
  hideHorizontal?: boolean;
  hideVertical?: boolean;
  scrollShadow?:
    | boolean
    | "top"
    | "bottom"
    | "both"
    | "vertical"
    | "horizontal";
  shadowSize?: number;
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  (
    {
      className,
      children,
      viewportClassName,
      viewportRef,
      hideHorizontal,
      hideVertical,
      scrollShadow = true,
      shadowSize = 28,
      ...props
    },
    ref,
  ) => {
    const localViewportRef = React.useRef<HTMLDivElement | null>(null);
    const [canScrollTop, setCanScrollTop] = React.useState(false);
    const [canScrollBottom, setCanScrollBottom] = React.useState(false);
    const [canScrollLeft, setCanScrollLeft] = React.useState(false);
    const [canScrollRight, setCanScrollRight] = React.useState(false);

    React.useImperativeHandle(
      viewportRef,
      () => localViewportRef.current as HTMLDivElement,
    );

    React.useEffect(() => {
      if (!scrollShadow) {
        setCanScrollTop(false);
        setCanScrollBottom(false);
        setCanScrollLeft(false);
        setCanScrollRight(false);
        return;
      }
      const el = localViewportRef.current;
      if (!el) return;

      const updateShadows = () => {
        const {
          scrollTop,
          scrollHeight,
          clientHeight,
          scrollLeft,
          scrollWidth,
          clientWidth,
        } = el;
        const maxScrollY = scrollHeight - clientHeight;
        const maxScrollX = scrollWidth - clientWidth;
        setCanScrollTop(scrollTop > 4);
        setCanScrollBottom(maxScrollY > 4 && scrollTop < maxScrollY - 4);
        setCanScrollLeft(scrollLeft > 4);
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
    }, [scrollShadow]);

    const maskImage = React.useMemo(() => {
      if (!scrollShadow) return undefined;

      const isHorizontalOnly =
        scrollShadow === "horizontal" ||
        (hideVertical && !hideHorizontal && scrollShadow !== "vertical");

      if (isHorizontalOnly) {
        if (canScrollLeft && canScrollRight) {
          return `linear-gradient(to right, transparent 0px, black ${shadowSize}px, black calc(100% - ${shadowSize}px), transparent 100%)`;
        }
        if (canScrollLeft) {
          return `linear-gradient(to right, transparent 0px, black ${shadowSize}px, black 100%)`;
        }
        if (canScrollRight) {
          return `linear-gradient(to right, black 0px, black calc(100% - ${shadowSize}px), transparent 100%)`;
        }
        return undefined;
      }

      const showTop =
        (scrollShadow === true ||
          scrollShadow === "top" ||
          scrollShadow === "both" ||
          scrollShadow === "vertical") &&
        canScrollTop;

      const showBottom =
        (scrollShadow === true ||
          scrollShadow === "bottom" ||
          scrollShadow === "both" ||
          scrollShadow === "vertical") &&
        canScrollBottom;

      if (showTop && showBottom) {
        return `linear-gradient(to bottom, transparent 0px, black ${shadowSize}px, black calc(100% - ${shadowSize}px), transparent 100%)`;
      }
      if (showTop) {
        return `linear-gradient(to bottom, transparent 0px, black ${shadowSize}px, black 100%)`;
      }
      if (showBottom) {
        return `linear-gradient(to bottom, black 0px, black calc(100% - ${shadowSize}px), transparent 100%)`;
      }
      return undefined;
    }, [
      scrollShadow,
      hideVertical,
      hideHorizontal,
      canScrollTop,
      canScrollBottom,
      canScrollLeft,
      canScrollRight,
      shadowSize,
    ]);

    return (
      <ScrollAreaPrimitive.Root
        ref={ref}
        data-slot="scroll-area"
        className={cn("relative overflow-hidden", className)}
        {...props}
      >
        <ScrollAreaPrimitive.Viewport
          ref={localViewportRef}
          data-slot="scroll-area-viewport"
          style={
            maskImage
              ? {
                  maskImage,
                  WebkitMaskImage: maskImage,
                }
              : undefined
          }
          className={cn(
            "focus-visible:ring-ring/50 size-full max-h-[inherit] rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1",
            !hideVertical && "pr-3",
            !hideHorizontal && "pb-3",
            hideHorizontal && "[&>div]:!block",
            viewportClassName,
          )}
        >
          {children}
        </ScrollAreaPrimitive.Viewport>
        {!hideVertical && <ScrollBar />}
        {!hideHorizontal && <ScrollBar orientation="horizontal" />}
        <ScrollAreaPrimitive.Corner />
      </ScrollAreaPrimitive.Root>
    );
  },
);
ScrollArea.displayName = "ScrollArea";

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "flex touch-none p-0.5 transition-colors select-none data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent",
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-border hover:bg-muted-foreground relative flex-1 rounded-full transition-colors duration-200"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };
