"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Tabs as TabsPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";
import { useDragToScroll } from "@/hooks/useDragToScroll";

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-[orientation=horizontal]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  "rounded-md p-[3px] group-data-horizontal/tabs:h-10 data-[variant=line]:rounded-none data-[variant=line]:border-0 data-[variant=line]:p-0 group/tabs-list text-muted-foreground inline-flex max-w-full items-center justify-start overflow-x-auto no-scrollbar group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col group-data-[orientation=vertical]/tabs:overflow-x-hidden group-data-[orientation=vertical]/tabs:overflow-y-auto",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-1 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface TabsListProps
  extends
    React.ComponentProps<typeof TabsPrimitive.List>,
    VariantProps<typeof tabsListVariants> {
  scrollShadow?:
    | boolean
    | "left"
    | "right"
    | "both"
    | "horizontal"
    | "vertical"
    | "top"
    | "bottom";
  shadowSize?: number;
  dragToScroll?: boolean;
  wheelToScroll?: boolean;
  /** CSS classes applied to the outer mask-wrapper div (use for width/flex sizing) */
  wrapperClassName?: string;
}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  (
    {
      className,
      wrapperClassName,
      variant = "default",
      scrollShadow = true,
      shadowSize = 24,
      dragToScroll = true,
      wheelToScroll = true,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const listRef = React.useRef<HTMLDivElement | null>(null);
    const [canScrollLeft, setCanScrollLeft] = React.useState(false);
    const [canScrollRight, setCanScrollRight] = React.useState(false);
    const [canScrollTop, setCanScrollTop] = React.useState(false);
    const [canScrollBottom, setCanScrollBottom] = React.useState(false);

    useDragToScroll({
      ref: listRef,
      enabled: dragToScroll,
      wheelToScroll,
    });

    React.useImperativeHandle(ref, () => listRef.current as HTMLDivElement);

    React.useEffect(() => {
      if (!scrollShadow) {
        setCanScrollLeft(false);
        setCanScrollRight(false);
        setCanScrollTop(false);
        setCanScrollBottom(false);
        return;
      }
      const el = listRef.current;
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
        setCanScrollTop(maxScrollY > 4 && scrollTop > 4);
        setCanScrollBottom(maxScrollY > 4 && scrollTop < maxScrollY - 4);
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
    }, [scrollShadow, children]);

    const maskImage = React.useMemo(() => {
      if (!scrollShadow) return undefined;

      const showLeft =
        (scrollShadow === true ||
          scrollShadow === "left" ||
          scrollShadow === "both" ||
          scrollShadow === "horizontal") &&
        canScrollLeft;

      const showRight =
        (scrollShadow === true ||
          scrollShadow === "right" ||
          scrollShadow === "both" ||
          scrollShadow === "horizontal") &&
        canScrollRight;

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

      const hasHorizontal = showLeft || showRight;
      const hasVertical = showTop || showBottom;

      if (hasHorizontal && hasVertical) {
        const hGrad =
          showLeft && showRight
            ? `linear-gradient(to right, transparent 0px, black ${shadowSize}px, black calc(100% - ${shadowSize}px), transparent 100%)`
            : showLeft
              ? `linear-gradient(to right, transparent 0px, black ${shadowSize}px, black 100%)`
              : `linear-gradient(to right, black 0px, black calc(100% - ${shadowSize}px), transparent 100%)`;

        const vGrad =
          showTop && showBottom
            ? `linear-gradient(to bottom, transparent 0px, black ${shadowSize}px, black calc(100% - ${shadowSize}px), transparent 100%)`
            : showTop
              ? `linear-gradient(to bottom, transparent 0px, black ${shadowSize}px, black 100%)`
              : `linear-gradient(to bottom, black 0px, black calc(100% - ${shadowSize}px), transparent 100%)`;

        return `${hGrad}, ${vGrad}`;
      }

      if (hasHorizontal) {
        if (showLeft && showRight) {
          return `linear-gradient(to right, transparent 0px, black ${shadowSize}px, black calc(100% - ${shadowSize}px), transparent 100%)`;
        }
        if (showLeft) {
          return `linear-gradient(to right, transparent 0px, black ${shadowSize}px, black 100%)`;
        }
        if (showRight) {
          return `linear-gradient(to right, black 0px, black calc(100% - ${shadowSize}px), transparent 100%)`;
        }
      }

      if (hasVertical) {
        if (showTop && showBottom) {
          return `linear-gradient(to bottom, transparent 0px, black ${shadowSize}px, black calc(100% - ${shadowSize}px), transparent 100%)`;
        }
        if (showTop) {
          return `linear-gradient(to bottom, transparent 0px, black ${shadowSize}px, black 100%)`;
        }
        if (showBottom) {
          return `linear-gradient(to bottom, black 0px, black calc(100% - ${shadowSize}px), transparent 100%)`;
        }
      }

      return undefined;
    }, [
      scrollShadow,
      shadowSize,
      canScrollLeft,
      canScrollRight,
      canScrollTop,
      canScrollBottom,
    ]);

    const listStyle = maskImage
      ? { maskImage, WebkitMaskImage: maskImage, ...style }
      : style;

    return (
      <div
        data-slot="tabs-list-wrapper"
        style={style}
        className={cn("relative", wrapperClassName ?? className)}
      >
        <TabsPrimitive.List
          ref={listRef}
          data-slot="tabs-list"
          data-variant={variant}
          style={listStyle}
          className={cn(tabsListVariants({ variant }), className)}
          {...props}
        >
          {children}
        </TabsPrimitive.List>
      </div>
    );
  },
);
TabsList.displayName = TabsPrimitive.List.displayName ?? "TabsList";

function TabsTrigger({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring text-foreground/60 hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground relative inline-flex h-[calc(100%-1px)] min-w-max flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-xs font-medium whitespace-nowrap transition-all group-data-vertical/tabs:py-[calc(--spacing(1.25))] group-data-[orientation=vertical]/tabs:w-full group-data-[orientation=vertical]/tabs:justify-start focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        "group-data-[variant=line]/tabs-list:rounded-none group-data-[variant=line]/tabs-list:border-0 group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent",
        "data-active:bg-background dark:data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 data-active:text-foreground",
        "after:bg-primary after:absolute after:opacity-0 after:transition-opacity group-data-[orientation=horizontal]/tabs:after:inset-x-0 group-data-[orientation=horizontal]/tabs:after:bottom-0 group-data-[orientation=horizontal]/tabs:after:h-[3px] group-data-[orientation=vertical]/tabs:after:inset-y-0 group-data-[orientation=vertical]/tabs:after:-right-1 group-data-[orientation=vertical]/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 text-xs/relaxed outline-none", className)}
      {...props}
    />
  );
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsListVariants,
  type TabsListProps,
};
