"use client";

import React, { useRef } from "react";
import { motion, useInView } from "motion/react";
import { cn } from "@/lib/utils";

interface FadeContentProps {
  children: React.ReactNode;
  blur?: boolean;
  duration?: number;
  easing?: [number, number, number, number];
  threshold?: number;
  initialOpacity?: number;
  className?: string;
}

export function FadeContent({
  children,
  blur = true,
  duration = 0.7,
  easing = [0.16, 1, 0.3, 1],
  threshold = 0.1,
  initialOpacity = 0,
  className,
}: FadeContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: threshold });

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: initialOpacity,
        filter: blur ? "blur(8px)" : "none",
        y: 20,
      }}
      animate={
        isInView
          ? {
              opacity: 1,
              filter: "blur(0px)",
              y: 0,
            }
          : {
              opacity: initialOpacity,
              filter: blur ? "blur(8px)" : "none",
              y: 20,
            }
      }
      transition={{
        duration,
        ease: easing,
      }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  );
}
