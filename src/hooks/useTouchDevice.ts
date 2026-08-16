"use client";

import { useState, useEffect } from "react";

/**
 * Custom hook to detect if the current device is primarily a touch / coarse pointer device (mobile, tablet).
 * Uses CSS media queries (pointer: coarse / hover: none) and navigator.maxTouchPoints for robust detection.
 *
 * @returns boolean `true` if device is a touch-first interface, `false` for mouse / desktop keyboard setups.
 */
export function useIsTouchDevice(): boolean {
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mqlCoarse = window.matchMedia("(pointer: coarse)");
    const mqlHoverNone = window.matchMedia("(hover: none)");

    const evaluateTouch = () => {
      const hasTouchCapability =
        navigator.maxTouchPoints > 0 ||
        "ontouchstart" in window ||
        // @ts-expect-error msMaxTouchPoints is non-standard IE/Edge legacy fallback
        navigator.msMaxTouchPoints > 0;

      const isCoarsePointer = mqlCoarse.matches || mqlHoverNone.matches;

      setIsTouchDevice(Boolean(hasTouchCapability && isCoarsePointer));
    };

    evaluateTouch();

    const handleMediaChange = () => evaluateTouch();

    mqlCoarse.addEventListener("change", handleMediaChange);
    mqlHoverNone.addEventListener("change", handleMediaChange);

    return () => {
      mqlCoarse.removeEventListener("change", handleMediaChange);
      mqlHoverNone.removeEventListener("change", handleMediaChange);
    };
  }, []);

  return isTouchDevice;
}
