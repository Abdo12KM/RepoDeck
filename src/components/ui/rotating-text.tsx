"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

interface RotatingTextProps {
  words: string[];
  duration?: number;
  className?: string;
  wordClassName?: string;
}

export function RotatingText({
  words,
  duration = 2500,
  className,
  wordClassName,
}: RotatingTextProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (words.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, duration);
    return () => clearInterval(interval);
  }, [words, duration]);

  return (
    <span
      className={cn(
        "relative inline-flex items-center justify-center overflow-hidden align-baseline font-extrabold",
        className,
      )}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -24, filter: "blur(4px)" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className={cn("inline-block", wordClassName)}
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
