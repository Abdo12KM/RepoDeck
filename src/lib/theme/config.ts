/**
 * Theme Configuration
 * Available options and defaults for the theme customization system
 */

import type {
  ThemeSettings,
  AccentColorOption,
  RadiusOption,
  FontOption,
  CodeThemeOption,
} from "./types";

/**
 * Default theme settings - matches "RepoDeck Clean" curated preset
 */
export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
  accentColor: "blue",
  baseColor: "zinc",
  radius: 0.5,
  font: "geist-sans",
  codeTheme: "github",
  transparentCodeBg: true,
};

/**
 * Available font options
 */
export const FONTS: FontOption[] = [
  { name: "Geist Sans", value: "geist-sans", googleFont: false },
  { name: "Inter", value: "inter", googleFont: true },
  { name: "Plus Jakarta Sans", value: "plus-jakarta-sans", googleFont: true },
  { name: "Noto Sans", value: "noto-sans", googleFont: true },
  { name: "Nunito Sans", value: "nunito-sans", googleFont: true },
  { name: "Figtree", value: "figtree", googleFont: true },
  { name: "Roboto", value: "roboto", googleFont: true },
  { name: "Raleway", value: "raleway", googleFont: true },
  { name: "DM Sans", value: "dm-sans", googleFont: true },
  { name: "Public Sans", value: "public-sans", googleFont: true },
  { name: "Outfit", value: "outfit", googleFont: true },
  { name: "JetBrains Mono", value: "jetbrains-mono", googleFont: true },
];

/**
 * Available accent colors
 * Values are OKLCH format for both light and dark modes
 * Organized by hue angle (0-360°) for visual consistency
 * Light values: L ~0.52-0.65 for WCAG AA contrast on white
 * Dark values: L ~0.68-0.82 for WCAG AA contrast on dark bg
 */
export const ACCENT_COLORS: AccentColorOption[] = [
  // Reds (hue ~15-25)
  {
    name: "Red",
    lightValue: "oklch(0.55 0.22 25)",
    darkValue: "oklch(0.68 0.19 25)",
    preview: "#ef4444",
  },
  {
    name: "Rose",
    lightValue: "oklch(0.58 0.21 12)",
    darkValue: "oklch(0.70 0.19 12)",
    preview: "#f43f5e",
  },
  // Coral (hue ~35)
  {
    name: "Coral",
    lightValue: "oklch(0.60 0.20 35)",
    darkValue: "oklch(0.72 0.18 35)",
    preview: "#fa5d55",
  },
  // Oranges (hue ~40-60)
  {
    name: "Orange",
    lightValue: "oklch(0.65 0.19 48)",
    darkValue: "oklch(0.75 0.16 48)",
    preview: "#f97316",
  },
  {
    name: "Amber",
    lightValue: "oklch(0.70 0.16 70)",
    darkValue: "oklch(0.80 0.14 70)",
    preview: "#f59e0b",
  },
  // Yellows (hue ~85-95)
  {
    name: "Yellow",
    lightValue: "oklch(0.75 0.15 90)",
    darkValue: "oklch(0.85 0.14 90)",
    preview: "#eab308",
  },
  // Greens (hue ~125-160)
  {
    name: "Lime",
    lightValue: "oklch(0.62 0.19 130)",
    darkValue: "oklch(0.78 0.17 130)",
    preview: "#84cc16",
  },
  {
    name: "Green",
    lightValue: "oklch(0.55 0.17 145)",
    darkValue: "oklch(0.70 0.16 145)",
    preview: "#22c55e",
  },
  {
    name: "Emerald",
    lightValue: "oklch(0.52 0.15 160)",
    darkValue: "oklch(0.68 0.14 160)",
    preview: "#10b981",
  },
  // Teals & Cyans (hue ~175-210)
  {
    name: "Teal",
    lightValue: "oklch(0.52 0.13 180)",
    darkValue: "oklch(0.70 0.12 180)",
    preview: "#14b8a6",
  },
  {
    name: "Cyan",
    lightValue: "oklch(0.55 0.12 200)",
    darkValue: "oklch(0.72 0.11 200)",
    preview: "#06b6d4",
  },
  {
    name: "Sky",
    lightValue: "oklch(0.56 0.13 220)",
    darkValue: "oklch(0.72 0.12 220)",
    preview: "#0ea5e9",
  },
  // Blues (hue ~235-255)
  {
    name: "Blue",
    lightValue: "oklch(0.55 0.16 245)",
    darkValue: "oklch(0.68 0.15 245)",
    preview: "#3b82f6",
  },
  {
    name: "Indigo",
    lightValue: "oklch(0.50 0.18 265)",
    darkValue: "oklch(0.65 0.17 265)",
    preview: "#6366f1",
  },
  // Purples & Violets (hue ~280-310)
  {
    name: "Violet",
    lightValue: "oklch(0.52 0.20 285)",
    darkValue: "oklch(0.68 0.18 285)",
    preview: "#8b5cf6",
  },
  {
    name: "Purple",
    lightValue: "oklch(0.52 0.22 295)",
    darkValue: "oklch(0.68 0.20 295)",
    preview: "#a855f7",
  },
  {
    name: "Fuchsia",
    lightValue: "oklch(0.55 0.23 320)",
    darkValue: "oklch(0.72 0.21 320)",
    preview: "#d946ef",
  },
  // Pinks (hue ~340-355)
  {
    name: "Pink",
    lightValue: "oklch(0.60 0.20 350)",
    darkValue: "oklch(0.72 0.18 350)",
    preview: "#ec4899",
  },
];

/**
 * Available border radius options
 */
export const RADIUS_OPTIONS: RadiusOption[] = [
  { label: "None", value: 0 },
  { label: "Small", value: 0.3 },
  { label: "Medium", value: 0.5 },
  { label: "Large", value: 0.75 },
  { label: "Max", value: 1.0 },
];

/**
 * Get accent color option by name
 */
export function getAccentColor(name: string): AccentColorOption | undefined {
  return ACCENT_COLORS.find((c) => c.name.toLowerCase() === name.toLowerCase());
}

/**
 * Get font option by value
 */
export function getFont(value: string): FontOption | undefined {
  return FONTS.find((f) => f.value === value);
}

/**
 * Color Harmony Recommendations
 * Based on color theory principles:
 * - Temperature alignment (warm accents with warm bases, cool with cool)
 * - Hue proximity for subtle harmony
 * - Universal neutrals as safe fallbacks
 */
export const RECOMMENDATIONS = {
  /**
   * For a selected accent color, these base colors create harmonious pairings
   */
  accentToBases: {
    Red: ["sand", "stone", "neutral", "sage", "obsidian", "paper"],
    Rose: ["sand", "stone", "neutral", "mauve", "dusk", "cream"],
    Coral: ["sand", "stone", "neutral", "dusk", "cream", "obsidian"],
    Orange: ["stone", "sand", "neutral", "cream", "paper"],
    Amber: ["sand", "stone", "neutral", "cream", "paper"],
    Yellow: ["sand", "neutral", "olive", "paper", "cream"],
    Lime: ["olive", "sage", "neutral"],
    Green: ["sage", "olive", "neutral", "paper", "obsidian"],
    Emerald: ["sage", "olive", "neutral", "slate", "paper", "obsidian"],
    Teal: ["olive", "slate", "neutral", "nordic", "cream"],
    Cyan: ["slate", "gray", "neutral", "nordic", "midnight", "obsidian"],
    Sky: ["slate", "gray", "neutral", "nordic", "midnight"],
    Blue: ["gray", "slate", "zinc", "neutral", "nordic", "obsidian"],
    Indigo: ["zinc", "gray", "neutral", "midnight", "nordic"],
    Violet: ["zinc", "mauve", "neutral", "dusk", "cream", "midnight"],
    Purple: ["mauve", "zinc", "neutral", "paper", "midnight", "dusk"],
    Fuchsia: ["mauve", "zinc", "neutral", "dusk", "obsidian"],
    Pink: ["mauve", "stone", "neutral", "dusk", "cream"],
  } as Record<string, string[]>,
  /**
   * For a selected base color, these accent colors create harmonious pairings
   */
  baseToAccents: {
    zinc: ["Blue", "Indigo", "Violet", "Purple"],
    slate: ["Sky", "Blue", "Cyan", "Teal"],
    gray: ["Blue", "Sky", "Indigo", "Cyan"],
    neutral: ["Blue", "Green", "Red", "Coral"],
    stone: ["Orange", "Amber", "Red", "Rose", "Coral"],
    sand: ["Amber", "Yellow", "Orange", "Red", "Coral"],
    olive: ["Lime", "Green", "Emerald", "Teal"],
    mauve: ["Violet", "Purple", "Fuchsia", "Pink"],
    sage: ["Green", "Emerald", "Lime", "Yellow"],
    cream: ["Amber", "Orange", "Violet", "Rose", "Teal", "Coral"],
    nordic: ["Cyan", "Sky", "Teal", "Blue"],
    paper: ["Purple", "Emerald", "Green", "Amber"],
    dusk: ["Rose", "Pink", "Violet", "Fuchsia", "Coral"],
    obsidian: ["Blue", "Fuchsia", "Emerald", "Cyan", "Red", "Coral"],
    midnight: ["Indigo", "Sky", "Cyan", "Violet"],
  } as Record<string, string[]>,
} as const;

/**
 * Get recommended base colors for a given accent color
 */
export function getRecommendedBases(accentName: string): string[] {
  // Normalize accent name to title case for lookup
  const normalized =
    accentName.charAt(0).toUpperCase() + accentName.slice(1).toLowerCase();
  return RECOMMENDATIONS.accentToBases[normalized] || [];
}

/**
 * Get recommended accent colors for a given base color
 */
export function getRecommendedAccents(baseValue: string): string[] {
  return RECOMMENDATIONS.baseToAccents[baseValue.toLowerCase()] || [];
}

/**
 * Available Code Syntax Highlighting Themes (Shiki 3)
 * Exact token colors verified directly against Shiki 3 bundle output.
 */
export const CODE_THEMES: CodeThemeOption[] = [
  {
    id: "github",
    name: "GitHub",
    lightTheme: "github-light",
    darkTheme: "github-dark",
    description: "Official GitHub code syntax palette with crisp contrast",
    previewColors: {
      bg: "#24292e",
      keyword: "#f97583",
      function: "#b392f0",
      string: "#9ecbff",
      comment: "#6a737d",
    },
    lightPreviewColors: {
      bg: "#ffffff",
      keyword: "#d73a49",
      function: "#6f42c1",
      string: "#032f62",
      comment: "#6a737d",
    },
  },
  {
    id: "github-dimmed",
    name: "GitHub Dimmed",
    lightTheme: "github-light-default",
    darkTheme: "github-dark-dimmed",
    description: "Muted low-strain variant of the GitHub developer theme",
    previewColors: {
      bg: "#22272e",
      keyword: "#f47067",
      function: "#dcbdfb",
      string: "#96d0ff",
      comment: "#768390",
    },
    lightPreviewColors: {
      bg: "#f6f8fa",
      keyword: "#cf222e",
      function: "#8250df",
      string: "#0a3069",
      comment: "#6e7781",
    },
  },
  {
    id: "tokyo-night",
    name: "Tokyo Night",
    lightTheme: "tokyo-night",
    darkTheme: "tokyo-night",
    description: "Neon cyan and lavender celebrating Downtown Tokyo",
    previewColors: {
      bg: "#1a1b26",
      keyword: "#7dcfff",
      function: "#7aa2f7",
      string: "#9ece6a",
      comment: "#565f89",
    },
    lightPreviewColors: {
      bg: "#1a1b26",
      keyword: "#7dcfff",
      function: "#7aa2f7",
      string: "#9ece6a",
      comment: "#565f89",
    },
  },
  {
    id: "catppuccin",
    name: "Catppuccin",
    lightTheme: "catppuccin-latte",
    darkTheme: "catppuccin-mocha",
    description: "Soothing pastel syntax palette with warm harmonies",
    previewColors: {
      bg: "#1e1e2e",
      keyword: "#cba6f7",
      function: "#89b4fa",
      string: "#a6e3a1",
      comment: "#9399b2",
    },
    lightPreviewColors: {
      bg: "#eff1f5",
      keyword: "#8839ef",
      function: "#1e66f5",
      string: "#40a02b",
      comment: "#9ca0b0",
    },
  },
  {
    id: "one-dark-pro",
    name: "One Dark Pro",
    lightTheme: "one-light",
    darkTheme: "one-dark-pro",
    description: "Atom & VS Code's iconic balanced syntax theme",
    previewColors: {
      bg: "#282c34",
      keyword: "#c678dd",
      function: "#61afef",
      string: "#98c379",
      comment: "#7f848e",
    },
    lightPreviewColors: {
      bg: "#fafafa",
      keyword: "#a626a4",
      function: "#4078f2",
      string: "#50a14f",
      comment: "#a0a1a7",
    },
  },
  {
    id: "dracula",
    name: "Dracula",
    lightTheme: "dracula-soft",
    darkTheme: "dracula",
    description: "Famous vampire theme with vibrant pink & green highlights",
    previewColors: {
      bg: "#282a36",
      keyword: "#ff79c6",
      function: "#50fa7b",
      string: "#f1fa8c",
      comment: "#6272a4",
    },
    lightPreviewColors: {
      bg: "#282a36",
      keyword: "#ff79c6",
      function: "#50fa7b",
      string: "#f1fa8c",
      comment: "#6272a4",
    },
  },
  {
    id: "nord",
    name: "Nord",
    lightTheme: "nord",
    darkTheme: "nord",
    description: "Arctic Scandinavian palette with frosty blues",
    previewColors: {
      bg: "#2e3440",
      keyword: "#81a1c1",
      function: "#88c0d0",
      string: "#a3be8c",
      comment: "#616e88",
    },
    lightPreviewColors: {
      bg: "#2e3440",
      keyword: "#81a1c1",
      function: "#88c0d0",
      string: "#a3be8c",
      comment: "#616e88",
    },
  },
  {
    id: "vesper",
    name: "Vesper",
    lightTheme: "vesper",
    darkTheme: "vesper",
    description:
      "Ultra-minimal noir theme with muted gray keywords and peach/mint accents",
    previewColors: {
      bg: "#101010",
      keyword: "#a0a0a0",
      function: "#ffc799",
      string: "#99ffe4",
      comment: "#505050",
    },
    lightPreviewColors: {
      bg: "#101010",
      keyword: "#a0a0a0",
      function: "#ffc799",
      string: "#99ffe4",
      comment: "#505050",
    },
  },
  {
    id: "synthwave-84",
    name: "Synthwave '84",
    lightTheme: "snazzy-light",
    darkTheme: "synthwave-84",
    description: "80s retro-futuristic glowing neon cyberpunk aesthetic",
    previewColors: {
      bg: "#262335",
      keyword: "#fede5d",
      function: "#36f9f6",
      string: "#ff8b39",
      comment: "#848bbd",
    },
    lightPreviewColors: {
      bg: "#fafafa",
      keyword: "#ff5c57",
      function: "#57c7ff",
      string: "#5af78e",
      comment: "#78787e",
    },
  },
  {
    id: "everforest",
    name: "Everforest",
    lightTheme: "everforest-light",
    darkTheme: "everforest-dark",
    description:
      "Comfortable natural green palette designed to be easy on the eyes",
    previewColors: {
      bg: "#2d353b",
      keyword: "#d699b6",
      function: "#a7c080",
      string: "#dbbc7f",
      comment: "#859289",
    },
    lightPreviewColors: {
      bg: "#fdf6e3",
      keyword: "#f85552",
      function: "#8da101",
      string: "#3a94c5",
      comment: "#939f91",
    },
  },
  {
    id: "gruvbox",
    name: "Gruvbox",
    lightTheme: "gruvbox-light-medium",
    darkTheme: "gruvbox-dark-medium",
    description: "Retro groove warm earth tones with reddish-orange accents",
    previewColors: {
      bg: "#282828",
      keyword: "#fb4934",
      function: "#fabd2f",
      string: "#b8bb26",
      comment: "#928374",
    },
    lightPreviewColors: {
      bg: "#fbf1c7",
      keyword: "#9d0006",
      function: "#b57614",
      string: "#79740e",
      comment: "#928374",
    },
  },
  {
    id: "rose-pine",
    name: "Rosé Pine",
    lightTheme: "rose-pine-dawn",
    darkTheme: "rose-pine",
    description: "Cozy pine, muted warmth, and vintage gold accents",
    previewColors: {
      bg: "#191724",
      keyword: "#31748f",
      function: "#ebbcba",
      string: "#f6c177",
      comment: "#6e6a86",
    },
    lightPreviewColors: {
      bg: "#faf4ed",
      keyword: "#286983",
      function: "#d7827e",
      string: "#ea9d34",
      comment: "#9893a5",
    },
  },
  {
    id: "poimandres",
    name: "Poimandres",
    lightTheme: "min-light",
    darkTheme: "poimandres",
    description:
      "Modern aesthetic dark theme with mint green and soft blue tones",
    previewColors: {
      bg: "#1b1e28",
      keyword: "#5de4c7",
      function: "#add7ff",
      string: "#5de4c7",
      comment: "#767c9d",
    },
    lightPreviewColors: {
      bg: "#ffffff",
      keyword: "#1976d2",
      function: "#2e7d32",
      string: "#388e3c",
      comment: "#6c757d",
    },
  },
  {
    id: "kanagawa",
    name: "Kanagawa",
    lightTheme: "kanagawa-lotus",
    darkTheme: "kanagawa-wave",
    description:
      "Inspired by the famous Katsushika Hokusai woodblock paintings",
    previewColors: {
      bg: "#1f1f28",
      keyword: "#957fb8",
      function: "#7e9cd8",
      string: "#98bb6c",
      comment: "#727169",
    },
    lightPreviewColors: {
      bg: "#f2ecde",
      keyword: "#624c7e",
      function: "#4d699b",
      string: "#6f894e",
      comment: "#8a8980",
    },
  },
  {
    id: "monokai",
    name: "Monokai",
    lightTheme: "monokai",
    darkTheme: "monokai",
    description: "Retro high-contrast Sublime Text color scheme",
    previewColors: {
      bg: "#272822",
      keyword: "#f92672",
      function: "#a6e22e",
      string: "#e6db74",
      comment: "#88846f",
    },
    lightPreviewColors: {
      bg: "#272822",
      keyword: "#f92672",
      function: "#a6e22e",
      string: "#e6db74",
      comment: "#88846f",
    },
  },
  {
    id: "night-owl",
    name: "Night Owl",
    lightTheme: "night-owl-light",
    darkTheme: "night-owl",
    description: "Optimized for late-night coding with vibrant purples",
    previewColors: {
      bg: "#011627",
      keyword: "#c792ea",
      function: "#82aaff",
      string: "#ecc48d",
      comment: "#637777",
    },
    lightPreviewColors: {
      bg: "#f0f0f0",
      keyword: "#994cc3",
      function: "#403f53",
      string: "#c96765",
      comment: "#93a1a1",
    },
  },
  {
    id: "solarized",
    name: "Solarized",
    lightTheme: "solarized-light",
    darkTheme: "solarized-dark",
    description: "Precision low-contrast colors for terminal purists",
    previewColors: {
      bg: "#002b36",
      keyword: "#859900",
      function: "#268bd2",
      string: "#2aa198",
      comment: "#586e75",
    },
    lightPreviewColors: {
      bg: "#fdf6e3",
      keyword: "#859900",
      function: "#268bd2",
      string: "#2aa198",
      comment: "#93a1a1",
    },
  },
  {
    id: "vitesse",
    name: "Vitesse",
    lightTheme: "vitesse-light",
    darkTheme: "vitesse-dark",
    description: "Anthony Fu's clean aesthetic theme with soft red & sage",
    previewColors: {
      bg: "#121212",
      keyword: "#4d9375",
      function: "#cb7676",
      string: "#c98a7d",
      comment: "#758575",
    },
    lightPreviewColors: {
      bg: "#ffffff",
      keyword: "#ab5959",
      function: "#1e754f",
      string: "#b56959",
      comment: "#a0ada0",
    },
  },
];

/**
 * Get code syntax highlighting theme option by ID
 */
export function getCodeTheme(id?: string): CodeThemeOption {
  const found = CODE_THEMES.find(
    (t) => t.id.toLowerCase() === (id || "github").toLowerCase(),
  );
  return found || CODE_THEMES[0];
}

/**
 * Get the preview/editor token colors for a code theme in either light or dark mode
 */
export function getCodeThemeColors(
  theme: CodeThemeOption,
  mode: "light" | "dark" = "dark",
): CodeThemeOption["previewColors"] {
  if (mode === "light" && theme.lightPreviewColors) {
    return theme.lightPreviewColors;
  }
  return theme.previewColors;
}
