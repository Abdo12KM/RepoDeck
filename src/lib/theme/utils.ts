/**
 * Theme Utilities
 * Helper functions for generating and applying CSS custom properties
 */

import type { ThemeSettings, BaseColorOption } from "./types";
import {
  getAccentColor,
  getCodeTheme,
  getCodeThemeColors,
  FONTS,
} from "./config";

/**
 * Base color palettes in OKLCH format
 * Each palette defines values for background, foreground, card, etc.
 */
export const BASE_COLOR_PALETTES: Record<
  string,
  {
    name: string;
    light: Record<string, string>;
    dark: Record<string, string>;
  }
> = {
  zinc: {
    name: "Zinc",
    light: {
      background: "oklch(1 0 0)",
      foreground: "oklch(0.141 0.005 285.823)",
      card: "oklch(1 0 0)",
      "card-foreground": "oklch(0.141 0.005 285.823)",
      popover: "oklch(1 0 0)",
      "popover-foreground": "oklch(0.141 0.005 285.823)",
      secondary: "oklch(0.967 0.001 286.375)",
      "secondary-foreground": "oklch(0.21 0.006 285.885)",
      muted: "oklch(0.967 0.001 286.375)",
      "muted-foreground": "oklch(0.552 0.016 285.938)",
      accent: "oklch(0.967 0.001 286.375)",
      "accent-foreground": "oklch(0.21 0.006 285.885)",
      border: "oklch(0.92 0.004 286.32)",
      input: "oklch(0.92 0.004 286.32)",
      ring: "oklch(0.705 0.015 286.067)",
      sidebar: "oklch(0.985 0 0)",
      "sidebar-foreground": "oklch(0.141 0.005 285.823)",
      "sidebar-accent": "oklch(0.967 0.001 286.375)",
      "sidebar-accent-foreground": "oklch(0.21 0.006 285.885)",
      "sidebar-border": "oklch(0.92 0.004 286.32)",
      "sidebar-ring": "oklch(0.705 0.015 286.067)",
    },
    dark: {
      background: "oklch(0.141 0.005 285.823)",
      foreground: "oklch(0.985 0 0)",
      card: "oklch(0.21 0.006 285.885)",
      "card-foreground": "oklch(0.985 0 0)",
      popover: "oklch(0.21 0.006 285.885)",
      "popover-foreground": "oklch(0.985 0 0)",
      secondary: "oklch(0.274 0.006 286.033)",
      "secondary-foreground": "oklch(0.985 0 0)",
      muted: "oklch(0.274 0.006 286.033)",
      "muted-foreground": "oklch(0.705 0.015 286.067)",
      accent: "oklch(0.274 0.006 286.033)",
      "accent-foreground": "oklch(0.985 0 0)",
      border: "oklch(1 0 0 / 10%)",
      input: "oklch(1 0 0 / 15%)",
      ring: "oklch(0.552 0.016 285.938)",
      sidebar: "oklch(0.21 0.006 285.885)",
      "sidebar-foreground": "oklch(0.985 0 0)",
      "sidebar-accent": "oklch(0.274 0.006 286.033)",
      "sidebar-accent-foreground": "oklch(0.985 0 0)",
      "sidebar-border": "oklch(1 0 0 / 10%)",
      "sidebar-ring": "oklch(0.552 0.016 285.938)",
    },
  },
  slate: {
    name: "Slate",
    light: {
      background: "oklch(1 0 0)",
      foreground: "oklch(0.129 0.02 220)",
      card: "oklch(1 0 0)",
      "card-foreground": "oklch(0.129 0.02 220)",
      popover: "oklch(1 0 0)",
      "popover-foreground": "oklch(0.129 0.02 220)",
      secondary: "oklch(0.968 0.005 220)",
      "secondary-foreground": "oklch(0.208 0.02 225)",
      muted: "oklch(0.968 0.005 220)",
      "muted-foreground": "oklch(0.554 0.02 220)",
      accent: "oklch(0.968 0.005 220)",
      "accent-foreground": "oklch(0.208 0.02 225)",
      border: "oklch(0.929 0.01 220)",
      input: "oklch(0.929 0.01 220)",
      ring: "oklch(0.704 0.02 220)",
      sidebar: "oklch(0.985 0 0)",
      "sidebar-foreground": "oklch(0.129 0.02 220)",
      "sidebar-accent": "oklch(0.968 0.005 220)",
      "sidebar-accent-foreground": "oklch(0.208 0.02 225)",
      "sidebar-border": "oklch(0.929 0.01 220)",
      "sidebar-ring": "oklch(0.704 0.02 220)",
    },
    dark: {
      background: "oklch(0.129 0.02 220)",
      foreground: "oklch(0.984 0.002 220)",
      card: "oklch(0.208 0.02 225)",
      "card-foreground": "oklch(0.984 0.002 220)",
      popover: "oklch(0.208 0.02 225)",
      "popover-foreground": "oklch(0.984 0.002 220)",
      secondary: "oklch(0.279 0.02 220)",
      "secondary-foreground": "oklch(0.984 0.002 220)",
      muted: "oklch(0.279 0.02 220)",
      "muted-foreground": "oklch(0.704 0.02 220)",
      accent: "oklch(0.279 0.02 220)",
      "accent-foreground": "oklch(0.984 0.002 220)",
      border: "oklch(1 0 0 / 10%)",
      input: "oklch(1 0 0 / 15%)",
      ring: "oklch(0.554 0.02 220)",
      sidebar: "oklch(0.208 0.02 225)",
      "sidebar-foreground": "oklch(0.984 0.002 220)",
      "sidebar-accent": "oklch(0.279 0.02 220)",
      "sidebar-accent-foreground": "oklch(0.984 0.002 220)",
      "sidebar-border": "oklch(1 0 0 / 10%)",
      "sidebar-ring": "oklch(0.554 0.02 220)",
    },
  },
  gray: {
    name: "Gray",
    light: {
      background: "oklch(1 0 0)",
      foreground: "oklch(0.145 0.015 240)",
      card: "oklch(1 0 0)",
      "card-foreground": "oklch(0.145 0.015 240)",
      popover: "oklch(1 0 0)",
      "popover-foreground": "oklch(0.145 0.015 240)",
      secondary: "oklch(0.967 0.003 240)",
      "secondary-foreground": "oklch(0.22 0.02 240)",
      muted: "oklch(0.967 0.003 240)",
      "muted-foreground": "oklch(0.551 0.015 240)",
      accent: "oklch(0.967 0.003 240)",
      "accent-foreground": "oklch(0.22 0.02 240)",
      border: "oklch(0.928 0.005 240)",
      input: "oklch(0.928 0.005 240)",
      ring: "oklch(0.707 0.015 240)",
      sidebar: "oklch(0.985 0 0)",
      "sidebar-foreground": "oklch(0.145 0.015 240)",
      "sidebar-accent": "oklch(0.967 0.003 240)",
      "sidebar-accent-foreground": "oklch(0.22 0.02 240)",
      "sidebar-border": "oklch(0.928 0.005 240)",
      "sidebar-ring": "oklch(0.707 0.015 240)",
    },
    dark: {
      background: "oklch(0.145 0.015 240)",
      foreground: "oklch(0.985 0.002 240)",
      card: "oklch(0.22 0.02 240)",
      "card-foreground": "oklch(0.985 0.002 240)",
      popover: "oklch(0.22 0.02 240)",
      "popover-foreground": "oklch(0.985 0.002 240)",
      secondary: "oklch(0.279 0.025 240)",
      "secondary-foreground": "oklch(0.985 0.002 240)",
      muted: "oklch(0.279 0.025 240)",
      "muted-foreground": "oklch(0.707 0.015 240)",
      accent: "oklch(0.279 0.025 240)",
      "accent-foreground": "oklch(0.985 0.002 240)",
      border: "oklch(1 0 0 / 10%)",
      input: "oklch(1 0 0 / 15%)",
      ring: "oklch(0.551 0.015 240)",
      sidebar: "oklch(0.22 0.02 240)",
      "sidebar-foreground": "oklch(0.985 0.002 240)",
      "sidebar-accent": "oklch(0.279 0.025 240)",
      "sidebar-accent-foreground": "oklch(0.985 0.002 240)",
      "sidebar-border": "oklch(1 0 0 / 10%)",
      "sidebar-ring": "oklch(0.551 0.015 240)",
    },
  },
  neutral: {
    name: "Neutral",
    light: {
      background: "oklch(1 0 0)",
      foreground: "oklch(0.145 0 0)",
      card: "oklch(1 0 0)",
      "card-foreground": "oklch(0.145 0 0)",
      popover: "oklch(1 0 0)",
      "popover-foreground": "oklch(0.145 0 0)",
      secondary: "oklch(0.97 0 0)",
      "secondary-foreground": "oklch(0.205 0 0)",
      muted: "oklch(0.97 0 0)",
      "muted-foreground": "oklch(0.556 0 0)",
      accent: "oklch(0.97 0 0)",
      "accent-foreground": "oklch(0.205 0 0)",
      border: "oklch(0.922 0 0)",
      input: "oklch(0.922 0 0)",
      ring: "oklch(0.708 0 0)",
      sidebar: "oklch(0.985 0 0)",
      "sidebar-foreground": "oklch(0.145 0 0)",
      "sidebar-accent": "oklch(0.97 0 0)",
      "sidebar-accent-foreground": "oklch(0.205 0 0)",
      "sidebar-border": "oklch(0.922 0 0)",
      "sidebar-ring": "oklch(0.708 0 0)",
    },
    dark: {
      background: "oklch(0.145 0 0)",
      foreground: "oklch(0.985 0 0)",
      card: "oklch(0.205 0 0)",
      "card-foreground": "oklch(0.985 0 0)",
      popover: "oklch(0.205 0 0)",
      "popover-foreground": "oklch(0.985 0 0)",
      secondary: "oklch(0.269 0 0)",
      "secondary-foreground": "oklch(0.985 0 0)",
      muted: "oklch(0.269 0 0)",
      "muted-foreground": "oklch(0.708 0 0)",
      accent: "oklch(0.269 0 0)",
      "accent-foreground": "oklch(0.985 0 0)",
      border: "oklch(1 0 0 / 10%)",
      input: "oklch(1 0 0 / 15%)",
      ring: "oklch(0.556 0 0)",
      sidebar: "oklch(0.205 0 0)",
      "sidebar-foreground": "oklch(0.985 0 0)",
      "sidebar-accent": "oklch(0.269 0 0)",
      "sidebar-accent-foreground": "oklch(0.985 0 0)",
      "sidebar-border": "oklch(1 0 0 / 10%)",
      "sidebar-ring": "oklch(0.556 0 0)",
    },
  },
  stone: {
    name: "Stone",
    light: {
      background: "oklch(1 0 0)",
      foreground: "oklch(0.147 0.004 49.25)",
      card: "oklch(1 0 0)",
      "card-foreground": "oklch(0.147 0.004 49.25)",
      popover: "oklch(1 0 0)",
      "popover-foreground": "oklch(0.147 0.004 49.25)",
      secondary: "oklch(0.97 0.001 106.424)",
      "secondary-foreground": "oklch(0.216 0.006 56.259)",
      muted: "oklch(0.97 0.001 106.424)",
      "muted-foreground": "oklch(0.553 0.013 58.071)",
      accent: "oklch(0.97 0.001 106.424)",
      "accent-foreground": "oklch(0.216 0.006 56.259)",
      border: "oklch(0.923 0.003 48.717)",
      input: "oklch(0.923 0.003 48.717)",
      ring: "oklch(0.709 0.01 56.259)",
      sidebar: "oklch(0.985 0 0)",
      "sidebar-foreground": "oklch(0.147 0.004 49.25)",
      "sidebar-accent": "oklch(0.97 0.001 106.424)",
      "sidebar-accent-foreground": "oklch(0.216 0.006 56.259)",
      "sidebar-border": "oklch(0.923 0.003 48.717)",
      "sidebar-ring": "oklch(0.709 0.01 56.259)",
    },
    dark: {
      background: "oklch(0.147 0.004 49.25)",
      foreground: "oklch(0.985 0.001 106.424)",
      card: "oklch(0.216 0.006 56.259)",
      "card-foreground": "oklch(0.985 0.001 106.424)",
      popover: "oklch(0.216 0.006 56.259)",
      "popover-foreground": "oklch(0.985 0.001 106.424)",
      secondary: "oklch(0.268 0.007 34.298)",
      "secondary-foreground": "oklch(0.985 0.001 106.424)",
      muted: "oklch(0.268 0.007 34.298)",
      "muted-foreground": "oklch(0.709 0.01 56.259)",
      accent: "oklch(0.268 0.007 34.298)",
      "accent-foreground": "oklch(0.985 0.001 106.424)",
      border: "oklch(1 0 0 / 10%)",
      input: "oklch(1 0 0 / 15%)",
      ring: "oklch(0.553 0.013 58.071)",
      sidebar: "oklch(0.216 0.006 56.259)",
      "sidebar-foreground": "oklch(0.985 0.001 106.424)",
      "sidebar-accent": "oklch(0.268 0.007 34.298)",
      "sidebar-accent-foreground": "oklch(0.985 0.001 106.424)",
      "sidebar-border": "oklch(1 0 0 / 10%)",
      "sidebar-ring": "oklch(0.553 0.013 58.071)",
    },
  },
  // Sand - warm beige/tan neutral (hue ~75-85)
  sand: {
    name: "Sand",
    light: {
      background: "oklch(0.995 0.002 90)",
      foreground: "oklch(0.18 0.02 75)",
      card: "oklch(0.995 0.002 90)",
      "card-foreground": "oklch(0.18 0.02 75)",
      popover: "oklch(0.995 0.002 90)",
      "popover-foreground": "oklch(0.18 0.02 75)",
      secondary: "oklch(0.96 0.008 85)",
      "secondary-foreground": "oklch(0.25 0.025 80)",
      muted: "oklch(0.96 0.008 85)",
      "muted-foreground": "oklch(0.58 0.035 80)",
      accent: "oklch(0.96 0.008 85)",
      "accent-foreground": "oklch(0.25 0.025 80)",
      border: "oklch(0.91 0.015 85)",
      input: "oklch(0.91 0.015 85)",
      ring: "oklch(0.68 0.04 80)",
      sidebar: "oklch(0.985 0.002 90)",
      "sidebar-foreground": "oklch(0.18 0.02 75)",
      "sidebar-accent": "oklch(0.96 0.008 85)",
      "sidebar-accent-foreground": "oklch(0.25 0.025 80)",
      "sidebar-border": "oklch(0.91 0.015 85)",
      "sidebar-ring": "oklch(0.68 0.04 80)",
    },
    dark: {
      background: "oklch(0.16 0.015 75)",
      foreground: "oklch(0.98 0.005 85)",
      card: "oklch(0.22 0.018 78)",
      "card-foreground": "oklch(0.98 0.005 85)",
      popover: "oklch(0.22 0.018 78)",
      "popover-foreground": "oklch(0.98 0.005 85)",
      secondary: "oklch(0.28 0.02 80)",
      "secondary-foreground": "oklch(0.98 0.005 85)",
      muted: "oklch(0.28 0.02 80)",
      "muted-foreground": "oklch(0.68 0.04 80)",
      accent: "oklch(0.28 0.02 80)",
      "accent-foreground": "oklch(0.98 0.005 85)",
      border: "oklch(1 0 0 / 10%)",
      input: "oklch(1 0 0 / 15%)",
      ring: "oklch(0.58 0.035 80)",
      sidebar: "oklch(0.22 0.018 78)",
      "sidebar-foreground": "oklch(0.98 0.005 85)",
      "sidebar-accent": "oklch(0.28 0.02 80)",
      "sidebar-accent-foreground": "oklch(0.98 0.005 85)",
      "sidebar-border": "oklch(1 0 0 / 10%)",
      "sidebar-ring": "oklch(0.58 0.035 80)",
    },
  },
  // Olive - green-tinted neutral (hue ~125-135)
  olive: {
    name: "Olive",
    light: {
      background: "oklch(0.995 0.002 130)",
      foreground: "oklch(0.17 0.025 135)",
      card: "oklch(0.995 0.002 130)",
      "card-foreground": "oklch(0.17 0.025 135)",
      popover: "oklch(0.995 0.002 130)",
      "popover-foreground": "oklch(0.17 0.025 135)",
      secondary: "oklch(0.965 0.01 130)",
      "secondary-foreground": "oklch(0.24 0.03 132)",
      muted: "oklch(0.965 0.01 130)",
      "muted-foreground": "oklch(0.56 0.03 130)",
      accent: "oklch(0.965 0.01 130)",
      "accent-foreground": "oklch(0.24 0.03 132)",
      border: "oklch(0.92 0.015 130)",
      input: "oklch(0.92 0.015 130)",
      ring: "oklch(0.67 0.04 130)",
      sidebar: "oklch(0.985 0.002 130)",
      "sidebar-foreground": "oklch(0.17 0.025 135)",
      "sidebar-accent": "oklch(0.965 0.01 130)",
      "sidebar-accent-foreground": "oklch(0.24 0.03 132)",
      "sidebar-border": "oklch(0.92 0.015 130)",
      "sidebar-ring": "oklch(0.67 0.04 130)",
    },
    dark: {
      background: "oklch(0.155 0.02 130)",
      foreground: "oklch(0.98 0.005 130)",
      card: "oklch(0.21 0.025 132)",
      "card-foreground": "oklch(0.98 0.005 130)",
      popover: "oklch(0.21 0.025 132)",
      "popover-foreground": "oklch(0.98 0.005 130)",
      secondary: "oklch(0.27 0.028 130)",
      "secondary-foreground": "oklch(0.98 0.005 130)",
      muted: "oklch(0.27 0.028 130)",
      "muted-foreground": "oklch(0.67 0.04 130)",
      accent: "oklch(0.27 0.028 130)",
      "accent-foreground": "oklch(0.98 0.005 130)",
      border: "oklch(1 0 0 / 10%)",
      input: "oklch(1 0 0 / 15%)",
      ring: "oklch(0.56 0.03 130)",
      sidebar: "oklch(0.21 0.025 132)",
      "sidebar-foreground": "oklch(0.98 0.005 130)",
      "sidebar-accent": "oklch(0.27 0.028 130)",
      "sidebar-accent-foreground": "oklch(0.98 0.005 130)",
      "sidebar-border": "oklch(1 0 0 / 10%)",
      "sidebar-ring": "oklch(0.56 0.03 130)",
    },
  },
  // Mauve - purple-tinted neutral (hue ~310-330)
  mauve: {
    name: "Mauve",
    light: {
      background: "oklch(0.995 0.002 320)",
      foreground: "oklch(0.17 0.02 325)",
      card: "oklch(0.995 0.002 320)",
      "card-foreground": "oklch(0.17 0.02 325)",
      popover: "oklch(0.995 0.002 320)",
      "popover-foreground": "oklch(0.17 0.02 325)",
      secondary: "oklch(0.965 0.008 320)",
      "secondary-foreground": "oklch(0.24 0.025 322)",
      muted: "oklch(0.965 0.008 320)",
      "muted-foreground": "oklch(0.57 0.025 320)",
      accent: "oklch(0.965 0.008 320)",
      "accent-foreground": "oklch(0.24 0.025 322)",
      border: "oklch(0.92 0.012 320)",
      input: "oklch(0.92 0.012 320)",
      ring: "oklch(0.68 0.035 320)",
      sidebar: "oklch(0.985 0.002 320)",
      "sidebar-foreground": "oklch(0.17 0.02 325)",
      "sidebar-accent": "oklch(0.965 0.008 320)",
      "sidebar-accent-foreground": "oklch(0.24 0.025 322)",
      "sidebar-border": "oklch(0.92 0.012 320)",
      "sidebar-ring": "oklch(0.68 0.035 320)",
    },
    dark: {
      background: "oklch(0.155 0.015 325)",
      foreground: "oklch(0.98 0.004 320)",
      card: "oklch(0.21 0.02 322)",
      "card-foreground": "oklch(0.98 0.004 320)",
      popover: "oklch(0.21 0.02 322)",
      "popover-foreground": "oklch(0.98 0.004 320)",
      secondary: "oklch(0.27 0.022 320)",
      "secondary-foreground": "oklch(0.98 0.004 320)",
      muted: "oklch(0.27 0.022 320)",
      "muted-foreground": "oklch(0.68 0.035 320)",
      accent: "oklch(0.27 0.022 320)",
      "accent-foreground": "oklch(0.98 0.004 320)",
      border: "oklch(1 0 0 / 10%)",
      input: "oklch(1 0 0 / 15%)",
      ring: "oklch(0.57 0.025 320)",
      sidebar: "oklch(0.21 0.02 322)",
      "sidebar-foreground": "oklch(0.98 0.004 320)",
      "sidebar-accent": "oklch(0.27 0.022 320)",
      "sidebar-accent-foreground": "oklch(0.98 0.004 320)",
      "sidebar-border": "oklch(1 0 0 / 10%)",
      "sidebar-ring": "oklch(0.57 0.025 320)",
    },
  },
  // Sage - greener neutral (hue ~140-150)
  sage: {
    name: "Sage",
    light: {
      background: "oklch(0.995 0.002 140)",
      foreground: "oklch(0.17 0.025 145)",
      card: "oklch(0.995 0.002 140)",
      "card-foreground": "oklch(0.17 0.025 145)",
      popover: "oklch(0.995 0.002 140)",
      "popover-foreground": "oklch(0.17 0.025 145)",
      secondary: "oklch(0.965 0.01 140)",
      "secondary-foreground": "oklch(0.24 0.03 142)",
      muted: "oklch(0.965 0.01 140)",
      "muted-foreground": "oklch(0.56 0.03 140)",
      accent: "oklch(0.965 0.01 140)",
      "accent-foreground": "oklch(0.24 0.03 142)",
      border: "oklch(0.92 0.015 140)",
      input: "oklch(0.92 0.015 140)",
      ring: "oklch(0.67 0.04 140)",
      sidebar: "oklch(0.985 0.002 140)",
      "sidebar-foreground": "oklch(0.17 0.025 145)",
      "sidebar-accent": "oklch(0.965 0.01 140)",
      "sidebar-accent-foreground": "oklch(0.24 0.03 142)",
      "sidebar-border": "oklch(0.92 0.015 140)",
      "sidebar-ring": "oklch(0.67 0.04 140)",
    },
    dark: {
      background: "oklch(0.155 0.02 140)",
      foreground: "oklch(0.98 0.005 140)",
      card: "oklch(0.21 0.025 142)",
      "card-foreground": "oklch(0.98 0.005 140)",
      popover: "oklch(0.21 0.025 142)",
      "popover-foreground": "oklch(0.98 0.005 140)",
      secondary: "oklch(0.27 0.028 140)",
      "secondary-foreground": "oklch(0.98 0.005 140)",
      muted: "oklch(0.27 0.028 140)",
      "muted-foreground": "oklch(0.67 0.04 140)",
      accent: "oklch(0.27 0.028 140)",
      "accent-foreground": "oklch(0.98 0.005 140)",
      border: "oklch(1 0 0 / 10%)",
      input: "oklch(1 0 0 / 15%)",
      ring: "oklch(0.56 0.03 140)",
      sidebar: "oklch(0.21 0.025 142)",
      "sidebar-foreground": "oklch(0.98 0.005 140)",
      "sidebar-accent": "oklch(0.27 0.028 140)",
      "sidebar-accent-foreground": "oklch(0.98 0.005 140)",
      "sidebar-border": "oklch(1 0 0 / 10%)",
      "sidebar-ring": "oklch(0.56 0.03 140)",
    },
  },
  // Cream - warm ivory & latte neutral (hue ~85-95)
  cream: {
    name: "Cream",
    light: {
      background: "oklch(0.992 0.006 95)",
      foreground: "oklch(0.17 0.018 85)",
      card: "oklch(0.98 0.008 95)",
      "card-foreground": "oklch(0.17 0.018 85)",
      popover: "oklch(0.98 0.008 95)",
      "popover-foreground": "oklch(0.17 0.018 85)",
      secondary: "oklch(0.95 0.012 95)",
      "secondary-foreground": "oklch(0.23 0.02 85)",
      muted: "oklch(0.95 0.012 95)",
      "muted-foreground": "oklch(0.56 0.025 85)",
      accent: "oklch(0.95 0.012 95)",
      "accent-foreground": "oklch(0.23 0.02 85)",
      border: "oklch(0.91 0.015 95)",
      input: "oklch(0.91 0.015 95)",
      ring: "oklch(0.68 0.035 85)",
      sidebar: "oklch(0.985 0.006 95)",
      "sidebar-foreground": "oklch(0.17 0.018 85)",
      "sidebar-accent": "oklch(0.95 0.012 95)",
      "sidebar-accent-foreground": "oklch(0.23 0.02 85)",
      "sidebar-border": "oklch(0.91 0.015 95)",
      "sidebar-ring": "oklch(0.68 0.035 85)",
    },
    dark: {
      background: "oklch(0.16 0.015 85)",
      foreground: "oklch(0.97 0.008 95)",
      card: "oklch(0.21 0.018 85)",
      "card-foreground": "oklch(0.97 0.008 95)",
      popover: "oklch(0.21 0.018 85)",
      "popover-foreground": "oklch(0.97 0.008 95)",
      secondary: "oklch(0.27 0.022 85)",
      "secondary-foreground": "oklch(0.97 0.008 95)",
      muted: "oklch(0.27 0.022 85)",
      "muted-foreground": "oklch(0.68 0.025 85)",
      accent: "oklch(0.27 0.022 85)",
      "accent-foreground": "oklch(0.97 0.008 95)",
      border: "oklch(1 0 0 / 10%)",
      input: "oklch(1 0 0 / 15%)",
      ring: "oklch(0.58 0.03 85)",
      sidebar: "oklch(0.21 0.018 85)",
      "sidebar-foreground": "oklch(0.97 0.008 95)",
      "sidebar-accent": "oklch(0.27 0.022 85)",
      "sidebar-accent-foreground": "oklch(0.97 0.008 95)",
      "sidebar-border": "oklch(1 0 0 / 10%)",
      "sidebar-ring": "oklch(0.58 0.03 85)",
    },
  },
  // Nordic - arctic frost & glacier neutral (hue ~235-245)
  nordic: {
    name: "Nordic",
    light: {
      background: "oklch(0.985 0.008 240)",
      foreground: "oklch(0.18 0.025 240)",
      card: "oklch(1 0 0)",
      "card-foreground": "oklch(0.18 0.025 240)",
      popover: "oklch(1 0 0)",
      "popover-foreground": "oklch(0.18 0.025 240)",
      secondary: "oklch(0.95 0.015 235)",
      "secondary-foreground": "oklch(0.22 0.03 240)",
      muted: "oklch(0.95 0.015 235)",
      "muted-foreground": "oklch(0.54 0.03 240)",
      accent: "oklch(0.95 0.015 235)",
      "accent-foreground": "oklch(0.22 0.03 240)",
      border: "oklch(0.91 0.02 235)",
      input: "oklch(0.91 0.02 235)",
      ring: "oklch(0.68 0.06 235)",
      sidebar: "oklch(0.975 0.01 240)",
      "sidebar-foreground": "oklch(0.18 0.025 240)",
      "sidebar-accent": "oklch(0.95 0.015 235)",
      "sidebar-accent-foreground": "oklch(0.22 0.03 240)",
      "sidebar-border": "oklch(0.91 0.02 235)",
      "sidebar-ring": "oklch(0.68 0.06 235)",
    },
    dark: {
      background: "oklch(0.18 0.02 245)",
      foreground: "oklch(0.96 0.01 240)",
      card: "oklch(0.23 0.025 245)",
      "card-foreground": "oklch(0.96 0.01 240)",
      popover: "oklch(0.23 0.025 245)",
      "popover-foreground": "oklch(0.96 0.01 240)",
      secondary: "oklch(0.28 0.03 245)",
      "secondary-foreground": "oklch(0.96 0.01 240)",
      muted: "oklch(0.28 0.03 245)",
      "muted-foreground": "oklch(0.68 0.03 240)",
      accent: "oklch(0.28 0.03 245)",
      "accent-foreground": "oklch(0.96 0.01 240)",
      border: "oklch(1 0 0 / 10%)",
      input: "oklch(1 0 0 / 15%)",
      ring: "oklch(0.58 0.05 240)",
      sidebar: "oklch(0.23 0.025 245)",
      "sidebar-foreground": "oklch(0.96 0.01 240)",
      "sidebar-accent": "oklch(0.28 0.03 245)",
      "sidebar-accent-foreground": "oklch(0.96 0.01 240)",
      "sidebar-border": "oklch(1 0 0 / 10%)",
      "sidebar-ring": "oklch(0.58 0.05 240)",
    },
  },
  // Paper - Japanese washi & bamboo neutral (hue ~70-80)
  paper: {
    name: "Paper",
    light: {
      background: "oklch(0.975 0.012 80)",
      foreground: "oklch(0.18 0.02 60)",
      card: "oklch(0.955 0.015 80)",
      "card-foreground": "oklch(0.18 0.02 60)",
      popover: "oklch(0.955 0.015 80)",
      "popover-foreground": "oklch(0.18 0.02 60)",
      secondary: "oklch(0.93 0.02 80)",
      "secondary-foreground": "oklch(0.24 0.025 60)",
      muted: "oklch(0.93 0.02 80)",
      "muted-foreground": "oklch(0.54 0.03 70)",
      accent: "oklch(0.93 0.02 80)",
      "accent-foreground": "oklch(0.24 0.025 60)",
      border: "oklch(0.88 0.025 80)",
      input: "oklch(0.88 0.025 80)",
      ring: "oklch(0.65 0.04 70)",
      sidebar: "oklch(0.96 0.012 80)",
      "sidebar-foreground": "oklch(0.18 0.02 60)",
      "sidebar-accent": "oklch(0.93 0.02 80)",
      "sidebar-accent-foreground": "oklch(0.24 0.025 60)",
      "sidebar-border": "oklch(0.88 0.025 80)",
      "sidebar-ring": "oklch(0.65 0.04 70)",
    },
    dark: {
      background: "oklch(0.16 0.015 70)",
      foreground: "oklch(0.96 0.01 80)",
      card: "oklch(0.21 0.018 70)",
      "card-foreground": "oklch(0.96 0.01 80)",
      popover: "oklch(0.21 0.018 70)",
      "popover-foreground": "oklch(0.96 0.01 80)",
      secondary: "oklch(0.26 0.022 70)",
      "secondary-foreground": "oklch(0.96 0.01 80)",
      muted: "oklch(0.26 0.022 70)",
      "muted-foreground": "oklch(0.66 0.03 75)",
      accent: "oklch(0.26 0.022 70)",
      "accent-foreground": "oklch(0.96 0.01 80)",
      border: "oklch(1 0 0 / 10%)",
      input: "oklch(1 0 0 / 15%)",
      ring: "oklch(0.56 0.035 70)",
      sidebar: "oklch(0.21 0.018 70)",
      "sidebar-foreground": "oklch(0.96 0.01 80)",
      "sidebar-accent": "oklch(0.26 0.022 70)",
      "sidebar-accent-foreground": "oklch(0.96 0.01 80)",
      "sidebar-border": "oklch(1 0 0 / 10%)",
      "sidebar-ring": "oklch(0.56 0.035 70)",
    },
  },
  // Dusk - vintage rosewood & blush neutral (hue ~340-355)
  dusk: {
    name: "Dusk",
    light: {
      background: "oklch(0.985 0.006 15)",
      foreground: "oklch(0.18 0.02 20)",
      card: "oklch(0.965 0.008 15)",
      "card-foreground": "oklch(0.18 0.02 20)",
      popover: "oklch(0.965 0.008 15)",
      "popover-foreground": "oklch(0.18 0.02 20)",
      secondary: "oklch(0.94 0.012 15)",
      "secondary-foreground": "oklch(0.24 0.025 20)",
      muted: "oklch(0.94 0.012 15)",
      "muted-foreground": "oklch(0.55 0.025 20)",
      accent: "oklch(0.94 0.012 15)",
      "accent-foreground": "oklch(0.24 0.025 20)",
      border: "oklch(0.90 0.015 15)",
      input: "oklch(0.90 0.015 15)",
      ring: "oklch(0.68 0.04 15)",
      sidebar: "oklch(0.975 0.006 15)",
      "sidebar-foreground": "oklch(0.18 0.02 20)",
      "sidebar-accent": "oklch(0.94 0.012 15)",
      "sidebar-accent-foreground": "oklch(0.24 0.025 20)",
      "sidebar-border": "oklch(0.90 0.015 15)",
      "sidebar-ring": "oklch(0.68 0.04 15)",
    },
    dark: {
      background: "oklch(0.15 0.018 310)",
      foreground: "oklch(0.97 0.006 15)",
      card: "oklch(0.20 0.022 310)",
      "card-foreground": "oklch(0.97 0.006 15)",
      popover: "oklch(0.20 0.022 310)",
      "popover-foreground": "oklch(0.97 0.006 15)",
      secondary: "oklch(0.25 0.026 310)",
      "secondary-foreground": "oklch(0.97 0.006 15)",
      muted: "oklch(0.25 0.026 310)",
      "muted-foreground": "oklch(0.66 0.03 310)",
      accent: "oklch(0.25 0.026 310)",
      "accent-foreground": "oklch(0.97 0.006 15)",
      border: "oklch(1 0 0 / 10%)",
      input: "oklch(1 0 0 / 15%)",
      ring: "oklch(0.56 0.03 310)",
      sidebar: "oklch(0.20 0.022 310)",
      "sidebar-foreground": "oklch(0.97 0.006 15)",
      "sidebar-accent": "oklch(0.25 0.026 310)",
      "sidebar-accent-foreground": "oklch(0.97 0.006 15)",
      "sidebar-border": "oklch(1 0 0 / 10%)",
      "sidebar-ring": "oklch(0.56 0.03 310)",
    },
  },
  // Obsidian - deep pitch noir & high-contrast monochrome
  obsidian: {
    name: "Obsidian",
    light: {
      background: "oklch(1 0 0)",
      foreground: "oklch(0.12 0 0)",
      card: "oklch(0.985 0 0)",
      "card-foreground": "oklch(0.12 0 0)",
      popover: "oklch(0.985 0 0)",
      "popover-foreground": "oklch(0.12 0 0)",
      secondary: "oklch(0.94 0 0)",
      "secondary-foreground": "oklch(0.18 0 0)",
      muted: "oklch(0.94 0 0)",
      "muted-foreground": "oklch(0.52 0 0)",
      accent: "oklch(0.94 0 0)",
      "accent-foreground": "oklch(0.18 0 0)",
      border: "oklch(0.89 0 0)",
      input: "oklch(0.89 0 0)",
      ring: "oklch(0.60 0 0)",
      sidebar: "oklch(0.98 0 0)",
      "sidebar-foreground": "oklch(0.12 0 0)",
      "sidebar-accent": "oklch(0.94 0 0)",
      "sidebar-accent-foreground": "oklch(0.18 0 0)",
      "sidebar-border": "oklch(0.89 0 0)",
      "sidebar-ring": "oklch(0.60 0 0)",
    },
    dark: {
      background: "oklch(0.10 0 0)",
      foreground: "oklch(0.98 0 0)",
      card: "oklch(0.15 0 0)",
      "card-foreground": "oklch(0.98 0 0)",
      popover: "oklch(0.15 0 0)",
      "popover-foreground": "oklch(0.98 0 0)",
      secondary: "oklch(0.20 0 0)",
      "secondary-foreground": "oklch(0.98 0 0)",
      muted: "oklch(0.20 0 0)",
      "muted-foreground": "oklch(0.65 0 0)",
      accent: "oklch(0.20 0 0)",
      "accent-foreground": "oklch(0.98 0 0)",
      border: "oklch(1 0 0 / 12%)",
      input: "oklch(1 0 0 / 18%)",
      ring: "oklch(0.50 0 0)",
      sidebar: "oklch(0.14 0 0)",
      "sidebar-foreground": "oklch(0.98 0 0)",
      "sidebar-accent": "oklch(0.20 0 0)",
      "sidebar-accent-foreground": "oklch(0.98 0 0)",
      "sidebar-border": "oklch(1 0 0 / 12%)",
      "sidebar-ring": "oklch(0.50 0 0)",
    },
  },
  // Midnight - deep nocturnal indigo & sapphire neutral (hue ~260-270)
  midnight: {
    name: "Midnight",
    light: {
      background: "oklch(0.99 0.005 265)",
      foreground: "oklch(0.16 0.025 265)",
      card: "oklch(1 0 0)",
      "card-foreground": "oklch(0.16 0.025 265)",
      popover: "oklch(1 0 0)",
      "popover-foreground": "oklch(0.16 0.025 265)",
      secondary: "oklch(0.96 0.012 265)",
      "secondary-foreground": "oklch(0.22 0.03 265)",
      muted: "oklch(0.96 0.012 265)",
      "muted-foreground": "oklch(0.54 0.025 265)",
      accent: "oklch(0.96 0.012 265)",
      "accent-foreground": "oklch(0.22 0.03 265)",
      border: "oklch(0.91 0.015 265)",
      input: "oklch(0.91 0.015 265)",
      ring: "oklch(0.68 0.05 265)",
      sidebar: "oklch(0.98 0.008 265)",
      "sidebar-foreground": "oklch(0.16 0.025 265)",
      "sidebar-accent": "oklch(0.96 0.012 265)",
      "sidebar-accent-foreground": "oklch(0.22 0.03 265)",
      "sidebar-border": "oklch(0.91 0.015 265)",
      "sidebar-ring": "oklch(0.68 0.05 265)",
    },
    dark: {
      background: "oklch(0.14 0.025 265)",
      foreground: "oklch(0.97 0.008 265)",
      card: "oklch(0.19 0.03 265)",
      "card-foreground": "oklch(0.97 0.008 265)",
      popover: "oklch(0.19 0.03 265)",
      "popover-foreground": "oklch(0.97 0.008 265)",
      secondary: "oklch(0.25 0.035 265)",
      "secondary-foreground": "oklch(0.97 0.008 265)",
      muted: "oklch(0.25 0.035 265)",
      "muted-foreground": "oklch(0.68 0.03 265)",
      accent: "oklch(0.25 0.035 265)",
      "accent-foreground": "oklch(0.97 0.008 265)",
      border: "oklch(1 0 0 / 10%)",
      input: "oklch(1 0 0 / 15%)",
      ring: "oklch(0.58 0.045 265)",
      sidebar: "oklch(0.19 0.03 265)",
      "sidebar-foreground": "oklch(0.97 0.008 265)",
      "sidebar-accent": "oklch(0.25 0.035 265)",
      "sidebar-accent-foreground": "oklch(0.97 0.008 265)",
      "sidebar-border": "oklch(1 0 0 / 10%)",
      "sidebar-ring": "oklch(0.58 0.045 265)",
    },
  },
};

/**
 * Derived list of available base color options
 */
export const BASE_COLORS: BaseColorOption[] = Object.entries(
  BASE_COLOR_PALETTES,
).map(([value, palette]) => ({
  name: palette.name,
  value,
}));

/**
 * Get base color option by value
 */
export function getBaseColor(value: string): BaseColorOption | undefined {
  const palette = BASE_COLOR_PALETTES[value];
  if (!palette) return undefined;
  return {
    name: palette.name,
    value,
  };
}

/**
 * Load a font (from Google Fonts if needed) and apply to body
 */
export function loadFont(fontValue: string): void {
  if (typeof document === "undefined") return;

  const fontConfig = FONTS.find((f) => f.value === fontValue);
  if (!fontConfig) return;

  // Load from Google Fonts if needed
  if (fontConfig.googleFont) {
    const fontId = `font-${fontValue}`;
    if (!document.getElementById(fontId)) {
      const link = document.createElement("link");
      link.id = fontId;
      link.rel = "stylesheet";
      // Use the display name for Google Fonts URL
      link.href = `https://fonts.googleapis.com/css2?family=${fontConfig.name.replace(/\s+/g, "+")}:wght@300;400;500;600;700&display=swap`;
      document.head.appendChild(link);
    }
  }

  // Apply font directly to body element and CSS variables
  const fontFamily = `"${fontConfig.name}", system-ui, sans-serif`;
  document.body.style.fontFamily = fontFamily;
  document.documentElement.style.setProperty("--font-sans", fontFamily);

  // If mono font, also apply to code blocks
  if (fontConfig.value.includes("mono")) {
    document.documentElement.style.setProperty(
      "--font-geist-mono",
      `"${fontConfig.name}", monospace`,
    );
  }
}

/**
 * Generate CSS custom properties from theme settings
 */
export function generateCSSVariables(
  theme: ThemeSettings,
  mode: "light" | "dark",
): Record<string, string> {
  const accentColor = getAccentColor(theme.accentColor);
  const basePalette =
    BASE_COLOR_PALETTES[theme.baseColor] || BASE_COLOR_PALETTES.zinc;
  const modeColors = mode === "dark" ? basePalette.dark : basePalette.light;

  // Get primary colors from accent
  const primaryValue = accentColor
    ? mode === "dark"
      ? accentColor.darkValue
      : accentColor.lightValue
    : mode === "dark"
      ? "oklch(0.68 0.15 237)"
      : "oklch(0.59 0.14 242)";

  // Primary foreground - white for dark primary, dark for light primary
  const primaryForeground =
    mode === "dark" ? "oklch(0.29 0.06 243)" : "oklch(0.98 0.01 237)";

  const activeCodeTheme = getCodeTheme(theme.codeTheme || "github");
  const codeThemeColors = getCodeThemeColors(activeCodeTheme, mode);
  const codeBg = theme.transparentCodeBg ? "transparent" : codeThemeColors.bg;

  return {
    "--background": modeColors.background,
    "--foreground": modeColors.foreground,
    "--card": modeColors.card,
    "--card-foreground": modeColors["card-foreground"],
    "--popover": modeColors.popover,
    "--popover-foreground": modeColors["popover-foreground"],
    "--primary": primaryValue,
    "--primary-foreground": primaryForeground,
    "--secondary": modeColors.secondary,
    "--secondary-foreground": modeColors["secondary-foreground"],
    "--muted": modeColors.muted,
    "--muted-foreground": modeColors["muted-foreground"],
    "--accent": modeColors.accent,
    "--accent-foreground": modeColors["accent-foreground"],
    "--border": modeColors.border,
    "--input": modeColors.input,
    "--ring": modeColors.ring,
    "--radius": `${theme.radius}rem`,
    "--code-bg": codeBg,
    "--code-keyword": codeThemeColors.keyword,
    "--code-function": codeThemeColors.function,
    "--code-string": codeThemeColors.string,
    "--code-comment": codeThemeColors.comment,
    "--sidebar": modeColors.sidebar,
    "--sidebar-foreground": modeColors["sidebar-foreground"],
    "--sidebar-primary": primaryValue,
    "--sidebar-primary-foreground": primaryForeground,
    "--sidebar-accent": modeColors["sidebar-accent"],
    "--sidebar-accent-foreground": modeColors["sidebar-accent-foreground"],
    "--sidebar-border": modeColors["sidebar-border"],
    "--sidebar-ring": modeColors["sidebar-ring"],
  };
}

/**
 * Apply CSS variables to the document root
 * Should only be called on the client side
 */
export function applyCSSVariables(variables: Record<string, string>): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  for (const [key, value] of Object.entries(variables)) {
    root.style.setProperty(key, value);
  }
}

/**
 * Clear custom CSS variables (revert to stylesheet defaults)
 */
export function clearCSSVariables(variableNames: string[]): void {
  if (typeof document === "undefined") return;

  const root = document.documentElement;
  for (const name of variableNames) {
    root.style.removeProperty(name);
  }
}

/**
 * Generate CSS string for SSR injection
 * Creates inline styles for both :root and .dark selectors
 */
export function generateCSSString(theme: ThemeSettings): string {
  const lightVars = generateCSSVariables(theme, "light");
  const darkVars = generateCSSVariables(theme, "dark");

  const formatVars = (vars: Record<string, string>) =>
    Object.entries(vars)
      .map(([key, value]) => `${key}: ${value};`)
      .join(" ");

  return `:root { ${formatVars(lightVars)} } .dark { ${formatVars(darkVars)} }`;
}

/**
 * Determine if a given hex color is dark (relative luminance < 0.55)
 */
export function isDarkHex(hex: string): boolean {
  if (!hex || hex === "transparent") return false;
  const c = hex.replace("#", "");
  const num = parseInt(
    c.length === 3
      ? c
          .split("")
          .map((ch) => ch + ch)
          .join("")
      : c,
    16,
  );
  if (isNaN(num)) return false;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.55;
}
