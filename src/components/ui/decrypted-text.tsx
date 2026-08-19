"use client";

import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface DecryptedTextProps {
  text: string;
  speed?: number;
  maxIterations?: number;
  sequential?: boolean;
  revealDirection?: "start" | "end" | "center";
  useOriginalCharsOnly?: boolean;
  characters?: string;
  className?: string;
  parentClassName?: string;
  encryptedClassName?: string;
  animateOn?: "hover" | "view" | "both";
}

export function DecryptedText({
  text,
  speed = 45,
  maxIterations = 10,
  sequential = true,
  revealDirection = "start",
  useOriginalCharsOnly = false,
  characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+",
  className,
  parentClassName,
  encryptedClassName: _encryptedClassName,
  animateOn = "hover",
}: DecryptedTextProps) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);
  const [isScrolledIntoView, _setIsScrolledIntoView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const containerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let currentIteration = 0;

    const shouldAnimate =
      (animateOn === "hover" && isHovering) ||
      (animateOn === "view" && isScrolledIntoView && !hasAnimated) ||
      (animateOn === "both" &&
        (isHovering || (isScrolledIntoView && !hasAnimated)));

    if (shouldAnimate) {
      interval = setInterval(() => {
        setDisplayText(() =>
          text
            .split("")
            .map((char, index) => {
              if (char === " ") return " ";
              if (currentIteration >= maxIterations) return char;

              if (sequential) {
                if (index <= (currentIteration / maxIterations) * text.length) {
                  return char;
                }
              }

              if (useOriginalCharsOnly) {
                const nonSpaceChars = text.replace(/\s/g, "");
                return nonSpaceChars[
                  Math.floor(Math.random() * nonSpaceChars.length)
                ];
              }

              return characters[Math.floor(Math.random() * characters.length)];
            })
            .join(""),
        );

        currentIteration++;
        if (currentIteration > maxIterations) {
          clearInterval(interval);
          setDisplayText(text);
          if (isScrolledIntoView) setHasAnimated(true);
        }
      }, speed);
    } else {
      setDisplayText(text);
    }

    return () => clearInterval(interval);
  }, [
    text,
    speed,
    maxIterations,
    sequential,
    revealDirection,
    characters,
    useOriginalCharsOnly,
    isHovering,
    isScrolledIntoView,
    hasAnimated,
    animateOn,
  ]);

  return (
    <span
      ref={containerRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={cn("inline-block cursor-default font-mono", parentClassName)}
    >
      <span className={className}>{displayText}</span>
    </span>
  );
}
