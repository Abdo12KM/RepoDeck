/**
 * Theme Types
 * TypeScript interfaces for the theme customization system
 */

/**
 * Theme settings that can be customized by the user.
 * Note: light/dark mode is handled separately by next-themes.
 */
export interface ThemeSettings {
  /** Primary accent color name (e.g., "blue", "purple") */
  accentColor: string;
  /** Base neutral color palette name (e.g., "zinc", "slate", "neutral") */
  baseColor: string;
  /** Border radius in rem (e.g., 0, 0.3, 0.5, 0.75, 1.0) */
  radius: number;
  /** Font family name */
  font: string;
  /** Code syntax highlighting theme identifier (e.g. "github", "tokyo-night", "dracula") */
  codeTheme?: string;
  /** Whether to force transparent background for code editor to match app background */
  transparentCodeBg?: boolean;
}

export interface CodeThemePreviewColors {
  bg: string;
  keyword: string;
  string: string;
  function: string;
  comment: string;
}

/**
 * Code syntax highlighting theme option
 */
export interface CodeThemeOption {
  /** Unique theme identifier */
  id: string;
  /** Display name */
  name: string;
  /** Shiki theme name for light mode */
  lightTheme: string;
  /** Shiki theme name for dark mode */
  darkTheme: string;
  /** Short description of the aesthetic */
  description: string;
  /** Preview colors for editor tokens (dark mode / default) */
  previewColors: CodeThemePreviewColors;
  /** Preview colors for editor tokens in light mode */
  lightPreviewColors?: CodeThemePreviewColors;
}

/**
 * Accent color option for the color picker
 */
export interface AccentColorOption {
  /** Display name */
  name: string;
  /** OKLCH color value for light mode primary */
  lightValue: string;
  /** OKLCH color value for dark mode primary */
  darkValue: string;
  /** Preview color (hex) for swatches */
  preview: string;
}

/**
 * Base color option for neutral palette selection
 */
export interface BaseColorOption {
  /** Display name */
  name: string;
  /** Identifier used in CSS variable generation */
  value: string;
}

/**
 * Radius option for the radius slider/selector
 */
export interface RadiusOption {
  /** Display label (e.g., "None", "Small", "Medium") */
  label: string;
  /** Value in rem */
  value: number;
}

/**
 * Font option for typography selection
 */
export interface FontOption {
  /** Display name */
  name: string;
  /** CSS font-family value */
  value: string;
  /** Whether to load from Google Fonts */
  googleFont: boolean;
}

/**
 * Curated preset theme definition
 */
export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  mode?: "light" | "dark" | "system";
  settings: ThemeSettings;
  previewColors: {
    primary: string;
    background: string;
    card: string;
    foreground: string;
    border: string;
    muted: string;
    badgeBg: string;
  };
}
