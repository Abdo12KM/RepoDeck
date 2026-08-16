/**
 * Theme Module Exports
 */

// Types
export type {
  ThemeSettings,
  ThemePreset,
  AccentColorOption,
  BaseColorOption,
  RadiusOption,
  FontOption,
  CodeThemeOption,
  CodeThemePreviewColors,
} from "./types";

// Configuration
export {
  DEFAULT_THEME_SETTINGS,
  FONTS,
  ACCENT_COLORS,
  RADIUS_OPTIONS,
  CODE_THEMES,
  getCodeTheme,
  getCodeThemeColors,
  getAccentColor,
  getFont,
  RECOMMENDATIONS,
  getRecommendedBases,
  getRecommendedAccents,
} from "./config";

// Presets
export { THEME_PRESETS, getPreset } from "./presets";

// Utilities
export {
  generateCSSVariables,
  generateCSSString,
  applyCSSVariables,
  clearCSSVariables,
  loadFont,
  BASE_COLORS,
  getBaseColor,
  isDarkHex,
} from "./utils";

// Favicon
export {
  generateTintedFavicon,
  updateFavicon,
  applyThemeFavicon,
} from "./favicon";
