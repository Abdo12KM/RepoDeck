/**
 * Dynamic Favicon Generator
 * Tints /favicon.png according to the active theme's accent color
 * matching the color blend mode & opacity used in RepoDeckIcon.
 */

import { getAccentColor } from "./config";
import type { ThemeSettings } from "./types";

let cachedBaseImage: HTMLImageElement | null = null;
let baseImagePromise: Promise<HTMLImageElement> | null = null;
const faviconCache = new Map<string, string>();

/**
 * Load and cache base favicon image
 */
function loadBaseImage(src = "/favicon.png"): Promise<HTMLImageElement> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Window is not defined"));
  }

  if (
    cachedBaseImage &&
    cachedBaseImage.complete &&
    cachedBaseImage.naturalWidth > 0
  ) {
    return Promise.resolve(cachedBaseImage);
  }

  if (baseImagePromise) {
    return baseImagePromise;
  }

  baseImagePromise = new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const timer = setTimeout(() => {
      baseImagePromise = null;
      reject(new Error("Image load timeout"));
    }, 2000);

    img.onload = () => {
      clearTimeout(timer);
      cachedBaseImage = img;
      resolve(img);
    };
    img.onerror = (err) => {
      clearTimeout(timer);
      baseImagePromise = null;
      reject(err);
    };
    img.src = src;
  });

  return baseImagePromise;
}

/**
 * Render tinted favicon data URL via Canvas
 */
export async function generateTintedFavicon(
  primaryColor: string,
  fallbackHex?: string,
  src = "/favicon.png",
  size = 64,
): Promise<string> {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return src;
  }

  const cacheKey = `${src}:${primaryColor}:${fallbackHex || ""}`;
  if (faviconCache.has(cacheKey)) {
    return faviconCache.get(cacheKey)!;
  }

  try {
    const img = await loadBaseImage(src);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return src;

    // 1. Draw original base image
    ctx.drawImage(img, 0, 0, size, size);

    // 2. Apply theme color tint with color blend mode (matches RepoDeckIcon mix-blend-mode: color)
    ctx.save();
    ctx.globalAlpha = 0.6;
    ctx.globalCompositeOperation = "color";

    let colorApplied = false;
    try {
      ctx.fillStyle = primaryColor;
      if (ctx.fillStyle) colorApplied = true;
    } catch {
      // Ignore OKLCH parsing issues on older canvas implementations
    }

    if (!colorApplied && fallbackHex) {
      ctx.fillStyle = fallbackHex;
    }

    ctx.fillRect(0, 0, size, size);
    ctx.restore();

    // 3. Mask to original alpha channel to preserve crisp transparency
    ctx.save();
    ctx.globalAlpha = 1.0;
    ctx.globalCompositeOperation = "destination-in";
    ctx.drawImage(img, 0, 0, size, size);
    ctx.restore();

    const dataUrl = canvas.toDataURL("image/png");
    faviconCache.set(cacheKey, dataUrl);
    return dataUrl;
  } catch {
    return src;
  }
}

/**
 * Update active document favicon links with tinted data URL
 */
export function updateFavicon(url: string): void {
  if (typeof document === "undefined") return;

  const head = document.head || document.getElementsByTagName("head")[0];
  if (!head) return;

  // Update or create rel="icon"
  let iconLink = document.querySelector<HTMLLinkElement>(
    "link[rel='icon'], link[rel='shortcut icon']",
  );
  if (!iconLink) {
    iconLink = document.createElement("link");
    iconLink.rel = "icon";
    iconLink.type = "image/png";
    head.appendChild(iconLink);
  }
  iconLink.href = url;

  // Also update apple-touch-icon if present
  const appleLink = document.querySelector<HTMLLinkElement>(
    "link[rel='apple-touch-icon']",
  );
  if (appleLink) {
    appleLink.href = url;
  }
}

/**
 * Apply theme-based tinted favicon
 */
export async function applyThemeFavicon(
  settings: ThemeSettings,
  mode: "light" | "dark" = "dark",
  src = "/favicon.png",
): Promise<void> {
  if (typeof window === "undefined") return;

  const accent = getAccentColor(settings.accentColor);
  const isDark = mode === "dark";
  const primaryColor = accent
    ? isDark
      ? accent.darkValue
      : accent.lightValue
    : isDark
      ? "oklch(0.68 0.15 237)"
      : "oklch(0.59 0.14 242)";
  const fallbackHex = accent?.preview;

  try {
    const tintedUrl = await generateTintedFavicon(
      primaryColor,
      fallbackHex,
      src,
    );
    updateFavicon(tintedUrl);
  } catch {
    // Fallback to static src if tinting fails
    updateFavicon(src);
  }
}
