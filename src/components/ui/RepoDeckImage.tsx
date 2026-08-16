"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface RepoDeckImageProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
  variant?: "flat" | "glass" | "plain";
  src?: string;
  glow?: boolean;
  tint?: boolean;
}

/**
 * RepoDeck Image Component: Uses RepoDeckIcon under the hood to ensure
 * theme color tinting preserves all lines, edges, and internal details.
 */
export function RepoDeckImage({
  size = 24,
  variant = "flat",
  src,
  glow = false,
  tint = true,
  className,
  style,
  ...props
}: RepoDeckImageProps) {
  const resolvedSrc =
    src ?? (variant === "glass" ? "/logo.png" : "/logo-flat.png");

  return (
    <div
      className={cn(
        "relative shrink-0 transition-all duration-200 select-none",
        glow && "drop-shadow-[0_0_8px_var(--primary)]",
        className,
      )}
      style={{ width: size, height: size, isolation: "isolate", ...style }}
      {...props}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolvedSrc}
        alt="RepoDeck Logo"
        draggable={false}
        className="h-full w-full object-contain"
      />
      {tint && variant !== "plain" && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: "var(--primary)",
            mixBlendMode: "color",
            opacity: 0.6,
            maskImage: `url('${resolvedSrc}')`,
            WebkitMaskImage: `url('${resolvedSrc}')`,
            maskSize: "contain",
            maskRepeat: "no-repeat",
            maskPosition: "center",
          }}
        />
      )}
    </div>
  );
}
