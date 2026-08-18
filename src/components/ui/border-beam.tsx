"use client";

import React, { CSSProperties } from "react";
import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  duration?: number; // Seconds per rotation (default 8s)
  borderWidth?: number; // Border thickness in px (default 1.5px)
  colorFrom?: string;
  colorTo?: string;
  size?: number; // Spread angle in degrees (default 50deg)
  opacity?: number; // Overall beam opacity (default 0.45)
}

/**
 * BorderBeam creates an animated traveling beam along the border of any container.
 * Uses inline CSS masking to guarantee 100% exact border-radius inheritance in all browsers.
 */
export function BorderBeam({
  className,
  duration = 10,
  borderWidth = 1.5,
  colorFrom = "rgba(56, 189, 248, 0.85)",
  colorTo = "rgba(59, 130, 246, 0.85)",
  size = 50,
  opacity = 0.75,
}: BorderBeamProps) {
  const maskStyle: CSSProperties = {
    WebkitMask:
      "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
    WebkitMaskComposite: "xor",
    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
    maskComposite: "exclude",
    padding: `${borderWidth}px`,
    borderRadius: "inherit",
  };

  const gradientAngle = Math.max(15, Math.min(size, 90));
  const transparentAngle = 360 - gradientAngle;

  return (
    <div
      style={maskStyle}
      className={cn(
        "pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-[inherit]",
        className,
      )}
    >
      <div
        style={{
          opacity,
          animation: `spin ${duration}s linear infinite`,
          background: `conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent ${transparentAngle}deg, ${colorFrom} ${transparentAngle + gradientAngle / 2}deg, ${colorTo} 360deg)`,
        }}
        className="absolute -inset-[250%] m-auto aspect-square"
      />
    </div>
  );
}
