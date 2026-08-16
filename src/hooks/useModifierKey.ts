"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect whether the user is on macOS or Windows/Linux,
 * returning the appropriate modifier key label ("⌘" vs "Ctrl").
 */
export function useModifierKey(): "⌘" | "Ctrl" {
  const [modifier, setModifier] = useState<"⌘" | "Ctrl">("Ctrl");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const isMac = /(Mac|iPhone|iPod|iPad)/i.test(
        navigator.userAgent || navigator.platform || "",
      );
      setModifier(isMac ? "⌘" : "Ctrl");
    }
  }, []);

  return modifier;
}
