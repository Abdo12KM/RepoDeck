"use client";

import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useTheme } from "next-themes";
import {
  ThemeSettings,
  ThemePreset,
  DEFAULT_THEME_SETTINGS,
  THEME_PRESETS,
  ACCENT_COLORS,
  BASE_COLORS,
  RADIUS_OPTIONS,
  FONTS,
  CODE_THEMES,
  getCodeTheme,
  getCodeThemeColors,
  getRecommendedBases,
  getRecommendedAccents,
  generateCSSVariables,
  applyCSSVariables,
  applyThemeFavicon,
  loadFont,
} from "@/lib/theme";

interface AppearanceContextType {
  settings: ThemeSettings;
  updateSettings: (partial: Partial<ThemeSettings>) => void;
  resetSettings: () => void;
  applyPreset: (preset: ThemePreset) => void;
  presets: ThemePreset[];
  accentColors: typeof ACCENT_COLORS;
  baseColors: typeof BASE_COLORS;
  radiusOptions: typeof RADIUS_OPTIONS;
  fonts: typeof FONTS;
  codeThemes: typeof CODE_THEMES;
  getCodeTheme: typeof getCodeTheme;
  getCodeThemeColors: typeof getCodeThemeColors;
  getRecommendedBases: typeof getRecommendedBases;
  getRecommendedAccents: typeof getRecommendedAccents;
}

const AppearanceContext = createContext<AppearanceContextType | null>(null);
const STORAGE_KEY = "repodeck:theme-settings";

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [settings, setSettings] = useState<ThemeSettings>(
    DEFAULT_THEME_SETTINGS,
  );

  // Sync state from localStorage on client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSettings((prev) => ({ ...prev, ...JSON.parse(saved) }));
      }
    } catch {
      // Ignore storage read error
    }
  }, []);

  const applyTheme = useCallback(
    (currentSettings: ThemeSettings, currentMode?: string) => {
      if (typeof window === "undefined") return;
      try {
        const mode = (currentMode === "dark" ? "dark" : "light") as
          | "light"
          | "dark";
        const vars = generateCSSVariables(currentSettings, mode);
        applyCSSVariables(vars);

        if (currentSettings.font) {
          loadFont(currentSettings.font);
        }

        applyThemeFavicon(currentSettings, mode);
      } catch {
        // Ignore errors
      }
    },
    [],
  );

  // Apply immediately before paint on layout effect
  const useIsomorphicLayoutEffect =
    typeof window !== "undefined" ? useLayoutEffect : useEffect;

  useIsomorphicLayoutEffect(() => {
    applyTheme(settings, resolvedTheme);
  }, [settings, resolvedTheme, applyTheme]);

  const updateSettings = useCallback(
    (partial: Partial<ThemeSettings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...partial };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // Ignore write error
        }
        applyTheme(next, resolvedTheme);
        return next;
      });
    },
    [resolvedTheme, applyTheme],
  );

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_THEME_SETTINGS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_THEME_SETTINGS));
    } catch {
      // Ignore write error
    }
    applyTheme(DEFAULT_THEME_SETTINGS, resolvedTheme);
  }, [resolvedTheme, applyTheme]);

  const applyPreset = useCallback(
    (preset: ThemePreset) => {
      setSettings(preset.settings);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(preset.settings));
      } catch {
        // Ignore write error
      }
      if (preset.mode) {
        setTheme(preset.mode);
        applyTheme(preset.settings, preset.mode);
      } else {
        applyTheme(preset.settings, resolvedTheme);
      }
    },
    [resolvedTheme, setTheme, applyTheme],
  );

  return (
    <AppearanceContext.Provider
      value={{
        settings,
        updateSettings,
        resetSettings,
        applyPreset,
        presets: THEME_PRESETS,
        accentColors: ACCENT_COLORS,
        baseColors: BASE_COLORS,
        radiusOptions: RADIUS_OPTIONS,
        fonts: FONTS,
        codeThemes: CODE_THEMES,
        getCodeTheme,
        getCodeThemeColors,
        getRecommendedBases,
        getRecommendedAccents,
      }}
    >
      {children}
    </AppearanceContext.Provider>
  );
}

export function useAppearanceSettings() {
  const context = useContext(AppearanceContext);
  if (!context) {
    return {
      settings: DEFAULT_THEME_SETTINGS,
      updateSettings: () => {},
      resetSettings: () => {},
      applyPreset: () => {},
      presets: THEME_PRESETS,
      accentColors: ACCENT_COLORS,
      baseColors: BASE_COLORS,
      radiusOptions: RADIUS_OPTIONS,
      fonts: FONTS,
      codeThemes: CODE_THEMES,
      getCodeTheme,
      getCodeThemeColors,
      getRecommendedBases,
      getRecommendedAccents,
    };
  }
  return context;
}
