"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface RepoDeckIconProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: number;
  glow?: boolean;
  tint?: boolean;
  variant?: "glass" | "flat";
  imgClassName?: string;
  src?: string;
  alt?: string;
}

/**
 * RepoDeck Icon: Supports both 3D Frosted Glass and 2.5D Flat isometric stack emblems.
 * Renders the full detail PNG and overlays a theme-aware `mix-blend-mode: color` tint
 * so the emblem shifts to match the active theme accent color while keeping all internal
 * lines, commit nodes, and details perfectly crisp.
 */
export function RepoDeckIcon({
  size = 20,
  glow = false,
  tint = true,
  variant = "glass",
  imgClassName,
  src,
  alt = "RepoDeck",
  className,
  style,
  ...props
}: RepoDeckIconProps) {
  const resolvedSrc =
    src ?? (variant === "flat" ? "/logo-flat.png" : "/logo.png");

  return (
    <div
      className={cn(
        "relative shrink-0 transition-all duration-200 select-none",
        glow && "drop-shadow-[0_0_10px_var(--primary)]",
        className,
      )}
      style={{ width: size, height: size, isolation: "isolate", ...style }}
      {...props}
    >
      {/* Base PNG emblem with all details, lines, and layers */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={resolvedSrc}
        alt={alt}
        draggable={false}
        className={cn("h-full w-full object-contain", imgClassName)}
      />
      {/* Theme color tint — masked to image shape with color blend mode so details are preserved */}
      {tint && (
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

export interface RepoDeckLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  iconSize?: number;
  showBadge?: boolean;
  badgeText?: string;
  glow?: boolean;
  tint?: boolean;
}

/**
 * Full RepoDeck Logo with 3D glass icon and typography.
 */
export function RepoDeckLogo({
  iconSize = 24,
  showBadge = false,
  badgeText = "v0.1",
  glow = false,
  tint = true,
  className,
  ...props
}: RepoDeckLogoProps) {
  return (
    <div
      className={cn("group flex shrink-0 items-center gap-3.5", className)}
      {...props}
    >
      <RepoDeckIcon
        size={iconSize}
        glow={glow}
        tint={tint}
        className="transition-transform duration-200 group-hover:scale-105"
      />
      <div className="flex items-center gap-2">
        <span className="text-foreground text-sm font-bold tracking-tight sm:text-base">
          RepoDeck
        </span>
        {showBadge && (
          <span className="border-border text-muted-foreground hidden rounded-sm border px-1.5 py-0 font-mono text-[10px] sm:inline-flex">
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
}
