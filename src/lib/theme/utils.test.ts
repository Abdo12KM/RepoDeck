import { describe, it, expect } from "vitest";
import {
  generateCSSVariables,
  generateCSSString,
  getCodeTheme,
  getCodeThemeColors,
  DEFAULT_THEME_SETTINGS,
} from "./index";

describe("Theme utilities and authentic code background", () => {
  it("generates authentic code background in light mode when transparentCodeBg is false", () => {
    // Solarized has an authentic light background (#fdf6e3)
    const solarizedSettings = {
      ...DEFAULT_THEME_SETTINGS,
      codeTheme: "solarized",
      transparentCodeBg: false,
    };

    const lightVars = generateCSSVariables(solarizedSettings, "light");
    expect(lightVars["--code-bg"]).toBe("#fdf6e3");
    expect(lightVars["--code-bg"]).not.toBe("transparent");

    // Catppuccin Latte has an authentic light background (#eff1f5)
    const catppuccinSettings = {
      ...DEFAULT_THEME_SETTINGS,
      codeTheme: "catppuccin",
      transparentCodeBg: false,
    };

    const catppuccinLightVars = generateCSSVariables(
      catppuccinSettings,
      "light",
    );
    expect(catppuccinLightVars["--code-bg"]).toBe("#eff1f5");
  });

  it("generates authentic code background in dark mode when transparentCodeBg is false", () => {
    const solarizedSettings = {
      ...DEFAULT_THEME_SETTINGS,
      codeTheme: "solarized",
      transparentCodeBg: false,
    };

    const darkVars = generateCSSVariables(solarizedSettings, "dark");
    expect(darkVars["--code-bg"]).toBe("#002b36");

    const catppuccinSettings = {
      ...DEFAULT_THEME_SETTINGS,
      codeTheme: "catppuccin",
      transparentCodeBg: false,
    };

    const catppuccinDarkVars = generateCSSVariables(catppuccinSettings, "dark");
    expect(catppuccinDarkVars["--code-bg"]).toBe("#1e1e2e");
  });

  it("sets --code-bg to transparent in both modes when transparentCodeBg is true", () => {
    const transparentSettings = {
      ...DEFAULT_THEME_SETTINGS,
      codeTheme: "solarized",
      transparentCodeBg: true,
    };

    const lightVars = generateCSSVariables(transparentSettings, "light");
    expect(lightVars["--code-bg"]).toBe("transparent");

    const darkVars = generateCSSVariables(transparentSettings, "dark");
    expect(darkVars["--code-bg"]).toBe("transparent");
  });

  it("resolves getCodeThemeColors correctly for light and dark modes", () => {
    const catppuccin = getCodeTheme("catppuccin");
    const lightColors = getCodeThemeColors(catppuccin, "light");
    const darkColors = getCodeThemeColors(catppuccin, "dark");

    expect(lightColors.bg).toBe("#eff1f5");
    expect(darkColors.bg).toBe("#1e1e2e");
    expect(lightColors.keyword).toBe("#8839ef");
    expect(darkColors.keyword).toBe("#cba6f7");

    const oneDarkPro = getCodeTheme("one-dark-pro");
    const oneLightColors = getCodeThemeColors(oneDarkPro, "light");
    const oneDarkColors = getCodeThemeColors(oneDarkPro, "dark");

    expect(oneLightColors.bg).toBe("#fafafa");
    expect(oneDarkColors.bg).toBe("#282c34");
  });

  it("generates SSR CSS string containing both :root and .dark rules", () => {
    const settings = {
      ...DEFAULT_THEME_SETTINGS,
      codeTheme: "gruvbox",
      transparentCodeBg: false,
    };

    const cssString = generateCSSString(settings);
    expect(cssString).toContain(":root {");
    expect(cssString).toContain(".dark {");
    expect(cssString).toContain("--code-bg: #fbf1c7;"); // Gruvbox light bg
    expect(cssString).toContain("--code-bg: #282828;"); // Gruvbox dark bg
  });

  it("supports all 15 base neutral tones and generates valid variables for each", () => {
    const expectedBases = [
      "zinc",
      "slate",
      "gray",
      "neutral",
      "stone",
      "sand",
      "olive",
      "mauve",
      "sage",
      "cream",
      "nordic",
      "paper",
      "dusk",
      "obsidian",
      "midnight",
    ];

    for (const base of expectedBases) {
      const settings = {
        ...DEFAULT_THEME_SETTINGS,
        baseColor: base,
      };

      const lightVars = generateCSSVariables(settings, "light");
      const darkVars = generateCSSVariables(settings, "dark");

      expect(lightVars["--background"]).toBeDefined();
      expect(lightVars["--foreground"]).toBeDefined();
      expect(lightVars["--card"]).toBeDefined();
      expect(darkVars["--background"]).toBeDefined();
      expect(darkVars["--foreground"]).toBeDefined();
      expect(darkVars["--card"]).toBeDefined();
    }
  });
});
