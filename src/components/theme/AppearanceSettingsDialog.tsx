"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sun,
  Moon,
  Laptop,
  Paintbrush,
  RotateCcw,
  Check,
  Code2,
  Type,
  Palette,
  Layers,
  SquareDashed,
  Wand2,
  FileCode2,
  Search,
  X,
} from "lucide-react";
import { useAppearanceSettings } from "@/hooks/useAppearanceSettings";
import { isDarkHex } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface AppearanceSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppearanceSettingsDialog({
  open,
  onOpenChange,
}: AppearanceSettingsDialogProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [presetSearch, setPresetSearch] = useState("");
  const [presetModeFilter, setPresetModeFilter] = useState<
    "all" | "dark" | "light"
  >("all");
  const [syntaxSearch, setSyntaxSearch] = useState("");
  const [fontSearch, setFontSearch] = useState("");

  const {
    settings,
    updateSettings,
    resetSettings,
    presets,
    applyPreset,
    accentColors,
    baseColors,
    radiusOptions,
    fonts,
    codeThemes,
    getCodeThemeColors,
    getRecommendedBases,
  } = useAppearanceSettings();

  const recommendedBases = getRecommendedBases(settings.accentColor);
  const activeAccent = accentColors.find(
    (c) => c.name.toLowerCase() === settings.accentColor.toLowerCase(),
  );

  const filteredPresets = presets.filter((preset) => {
    if (presetModeFilter !== "all" && preset.mode !== presetModeFilter) {
      return false;
    }
    const q = presetSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      preset.name.toLowerCase().includes(q) ||
      preset.description.toLowerCase().includes(q) ||
      preset.settings.accentColor.toLowerCase().includes(q) ||
      preset.settings.baseColor.toLowerCase().includes(q) ||
      (preset.mode && preset.mode.toLowerCase().includes(q))
    );
  });

  const filteredCodeThemes = codeThemes.filter((th) => {
    const q = syntaxSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      th.name.toLowerCase().includes(q) ||
      th.description.toLowerCase().includes(q) ||
      th.id.toLowerCase().includes(q)
    );
  });

  const filteredFonts = fonts.filter((f) => {
    const q = fontSearch.toLowerCase().trim();
    if (!q) return true;
    return (
      f.name.toLowerCase().includes(q) || f.value.toLowerCase().includes(q)
    );
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        overlayClassName="bg-black/15 backdrop-blur-none backdrop-filter-none supports-backdrop-filter:backdrop-blur-none"
        className="border-border/80 bg-background flex h-full w-full max-w-full flex-col gap-0 overflow-hidden border-l p-0 shadow-2xl data-[side=right]:w-full data-[side=right]:max-w-full data-[side=right]:sm:max-w-full md:w-[660px] md:max-w-[660px] data-[side=right]:md:max-w-[660px] lg:w-[770px] lg:max-w-[770px] data-[side=right]:lg:max-w-[770px]"
      >
        {/* Header */}
        {/* if you're an AI dont change the 9.5px value ever unless explicitly instructed */}
        <SheetHeader className="bg-muted/20 shrink-0 border-b px-6 py-[9.5px] text-left">
          <div className="flex items-center gap-3 pr-8">
            <div
              className="text-primary flex h-8 w-8 shrink-0 items-center justify-center"
              style={{ borderRadius: `${settings.radius}rem` }}
            >
              <Paintbrush className="h-4 w-4 shrink-0" />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-foreground text-sm leading-tight font-bold">
                Theme & Appearance Studio
              </SheetTitle>
            </div>
          </div>
        </SheetHeader>

        {/* Tabbed Content Area */}
        <Tabs
          defaultValue="presets"
          className="flex min-h-0 flex-1 flex-col gap-0 overflow-hidden"
        >
          <div className="bg-background shrink-0">
            <TabsList
              variant="line"
              className="bg-muted/10 border-border/60 h-9! w-full gap-0 border-b p-0"
            >
              <TabsTrigger
                value="presets"
                className="text-muted-foreground data-[state=active]:text-foreground gap-1.5 px-3.5 py-2 text-xs font-medium transition-colors sm:py-2.5"
              >
                <Wand2 className="h-3.5 w-3.5" />
                <span>Presets</span>
              </TabsTrigger>
              <TabsTrigger
                value="palette"
                className="text-muted-foreground data-[state=active]:text-foreground gap-1.5 px-3.5 py-2 text-xs font-medium transition-colors sm:py-2.5"
              >
                <Palette className="h-3.5 w-3.5" />
                <span>Colors</span>
              </TabsTrigger>
              <TabsTrigger
                value="syntax"
                className="text-muted-foreground data-[state=active]:text-foreground gap-1.5 px-3.5 py-2 text-xs font-medium transition-colors sm:py-2.5"
              >
                <Code2 className="h-3.5 w-3.5" />
                <span>Syntax</span>
              </TabsTrigger>
              <TabsTrigger
                value="typography"
                className="text-muted-foreground data-[state=active]:text-foreground gap-1.5 px-3.5 py-2 text-xs font-medium transition-colors sm:py-2.5"
              >
                <Type className="h-3.5 w-3.5" />
                <span>Fonts</span>
              </TabsTrigger>
              <TabsTrigger
                value="geometry"
                className="text-muted-foreground data-[state=active]:text-foreground gap-1.5 px-3.5 py-2 text-xs font-medium transition-colors sm:py-2.5"
              >
                <SquareDashed className="h-3.5 w-3.5" />
                <span>Radius</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="min-h-0 flex-1 px-6 py-4" hideHorizontal>
            <div className="space-y-6">
              {/* 1. Presets Tab - Each Box Displays Its Own Live Theme Styling */}
              <TabsContent value="presets" className="mt-0 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 pr-2">
                    <h4 className="text-foreground text-xs font-semibold">
                      Curated Theme Presets
                    </h4>
                    <p className="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">
                      Click any preset to instantly apply its colors,
                      typography, mode, and radius.
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-primary shrink-0 font-mono text-[11px]"
                  >
                    {filteredPresets.length === presets.length
                      ? `${presets.length} Presets`
                      : `${filteredPresets.length} / ${presets.length}`}
                  </Badge>
                </div>

                {/* Search Bar & Mode Filter for Presets */}
                <div className="flex items-center gap-1.5 px-0.5">
                  <div className="relative min-w-0 flex-1">
                    <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
                    <input
                      type="text"
                      value={presetSearch}
                      onChange={(e) => setPresetSearch(e.target.value)}
                      placeholder="Search presets by name, accent, base tone..."
                      className="bg-muted/30 border-border/80 placeholder:text-muted-foreground focus:border-primary/80 focus:ring-primary/30 h-8.5 w-full border pr-8 pl-8.5 text-xs transition-colors focus:ring-1 focus:outline-hidden"
                      style={{ borderRadius: `${settings.radius}rem` }}
                    />
                    {presetSearch && (
                      <button
                        type="button"
                        onClick={() => setPresetSearch("")}
                        className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded-sm p-0.5 transition-colors"
                        title="Clear search"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Mode Filter Toggle Group */}
                  <div
                    className="bg-muted/40 border-border/80 flex h-8.5 shrink-0 items-center border p-0.5 shadow-2xs"
                    style={{ borderRadius: `${settings.radius}rem` }}
                  >
                    <button
                      type="button"
                      onClick={() => setPresetModeFilter("all")}
                      className={cn(
                        "h-full cursor-pointer px-2.5 text-[11px] font-medium transition-all",
                        presetModeFilter === "all"
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                      style={{
                        borderRadius: `calc(${settings.radius}rem - 2px)`,
                      }}
                      title="Show all presets"
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setPresetModeFilter("dark")}
                      className={cn(
                        "flex h-full cursor-pointer items-center gap-1 px-2 text-[11px] font-medium transition-all",
                        presetModeFilter === "dark"
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                      style={{
                        borderRadius: `calc(${settings.radius}rem - 2px)`,
                      }}
                      title="Show dark presets only"
                    >
                      <Moon className="h-3 w-3" />
                      <span className="hidden sm:inline">Dark</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPresetModeFilter("light")}
                      className={cn(
                        "flex h-full cursor-pointer items-center gap-1 px-2 text-[11px] font-medium transition-all",
                        presetModeFilter === "light"
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                      style={{
                        borderRadius: `calc(${settings.radius}rem - 2px)`,
                      }}
                      title="Show light presets only"
                    >
                      <Sun className="h-3 w-3" />
                      <span className="hidden sm:inline">Light</span>
                    </button>
                  </div>
                </div>

                {filteredPresets.length === 0 ? (
                  <div
                    className="bg-muted/15 flex flex-col items-center justify-center space-y-2.5 border border-dashed p-8 text-center"
                    style={{ borderRadius: `${settings.radius}rem` }}
                  >
                    <div className="bg-muted text-muted-foreground flex h-10 w-10 items-center justify-center rounded-xl">
                      <Wand2 className="h-5 w-5 opacity-60" />
                    </div>
                    <div>
                      <p className="text-foreground text-xs font-semibold">
                        No matching presets
                      </p>
                      <p className="text-muted-foreground mt-0.5 text-[11px]">
                        {presetSearch
                          ? `No curated themes match "${presetSearch}".`
                          : `No curated themes found for ${presetModeFilter} mode.`}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => {
                        setPresetSearch("");
                        setPresetModeFilter("all");
                      }}
                      className="h-7 cursor-pointer text-xs"
                    >
                      Clear filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                    {filteredPresets.map((preset) => {
                      const isCurrent =
                        settings.accentColor === preset.settings.accentColor &&
                        settings.baseColor === preset.settings.baseColor &&
                        settings.font === preset.settings.font &&
                        settings.radius === preset.settings.radius &&
                        (!preset.mode || theme === preset.mode);

                      const fontObj = fonts.find(
                        (f) => f.value === preset.settings.font,
                      );
                      const fontName = fontObj?.name || preset.settings.font;

                      return (
                        <button
                          key={preset.id}
                          type="button"
                          onClick={() => applyPreset(preset)}
                          className={cn(
                            "group relative flex cursor-pointer flex-col justify-between border p-3.5 text-left shadow-2xs transition-all duration-150 hover:!border-[var(--hover-border)] hover:ring-2 hover:ring-[var(--hover-border)]/25",
                          )}
                          style={
                            {
                              backgroundColor: preset.previewColors.background,
                              color: preset.previewColors.foreground,
                              borderColor: isCurrent
                                ? preset.previewColors.primary
                                : preset.previewColors.border,
                              borderRadius: `${preset.settings.radius}rem`,
                              borderWidth: isCurrent ? "2px" : "1px",
                              borderStyle: "solid",
                              fontFamily: fontName,
                              boxShadow: isCurrent
                                ? `0 0 16px ${preset.previewColors.primary}44`
                                : undefined,
                              "--hover-border": preset.previewColors.primary,
                            } as React.CSSProperties
                          }
                        >
                          {/* Preset Card Top Bar */}
                          <div className="w-full space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span
                                  className="h-3.5 w-3.5 shrink-0 rounded-full shadow-xs"
                                  style={{
                                    backgroundColor:
                                      preset.previewColors.primary,
                                  }}
                                />
                                <span className="text-xs font-bold tracking-tight">
                                  {preset.name}
                                </span>
                              </div>

                              {isCurrent ? (
                                <span
                                  className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
                                  style={{
                                    backgroundColor: `${preset.previewColors.primary}22`,
                                    color: preset.previewColors.primary,
                                    borderRadius: `${preset.settings.radius}rem`,
                                  }}
                                >
                                  <Check className="h-3 w-3 stroke-[3]" />{" "}
                                  Active
                                </span>
                              ) : (
                                preset.mode && (
                                  <span
                                    className="rounded-sm px-1.5 py-0.5 text-[9px] font-semibold tracking-wider uppercase opacity-75"
                                    style={{
                                      backgroundColor:
                                        preset.previewColors.badgeBg,
                                      color: preset.previewColors.muted,
                                      borderRadius: `calc(${preset.settings.radius}rem * 0.5)`,
                                    }}
                                  >
                                    {preset.mode}
                                  </span>
                                )
                              )}
                            </div>

                            <p
                              className="line-clamp-2 text-[11px] leading-relaxed"
                              style={{ color: preset.previewColors.muted }}
                            >
                              {preset.description}
                            </p>

                            {/* Mini In-Box Theme Showcase */}
                            <div
                              className="space-y-1.5 p-2.5 transition-all"
                              style={{
                                backgroundColor: preset.previewColors.card,
                                borderColor: preset.previewColors.border,
                                borderWidth: "1px",
                                borderStyle: "solid",
                                borderRadius: `calc(${preset.settings.radius}rem * 0.75)`,
                              }}
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className="truncate font-mono text-[10px]"
                                  style={{ color: preset.previewColors.muted }}
                                >
                                  $ git switch {preset.settings.accentColor}
                                </span>
                                <span
                                  className="ml-1 shrink-0 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-2xs"
                                  style={{
                                    backgroundColor:
                                      preset.previewColors.primary,
                                    borderRadius: `calc(${preset.settings.radius}rem * 0.5)`,
                                  }}
                                >
                                  Aa 123
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Preset Meta Footer */}
                          <div
                            className="mt-2 flex items-center gap-1.5 pt-2 font-mono text-[10px]"
                            style={{
                              borderTop: `1px solid ${preset.previewColors.border}`,
                              color: preset.previewColors.muted,
                            }}
                          >
                            <span className="capitalize">
                              {preset.settings.accentColor}
                            </span>
                            <span>·</span>
                            <span className="capitalize">
                              {preset.settings.baseColor}
                            </span>
                            <span>·</span>
                            <span>{preset.settings.radius}rem</span>
                            <span>·</span>
                            <span className="truncate">{fontName}</span>
                            <span>·</span>
                            <span className="capitalize">
                              {preset.settings.codeTheme || "github"}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* 2. Palette & Colors Tab */}
              <TabsContent value="palette" className="mt-0 space-y-6">
                {/* Theme Mode Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                      <Sun className="text-primary h-3.5 w-3.5" /> Appearance
                      Mode
                    </span>
                    <span className="text-muted-foreground font-mono text-[11px] capitalize">
                      {theme || "system"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setTheme("light")}
                      className={cn(
                        "flex cursor-pointer items-center justify-center gap-2 border px-3 py-2.5 text-xs font-medium shadow-2xs transition-all",
                        theme === "light"
                          ? "bg-primary/10 border-primary text-primary shadow-xs"
                          : "bg-card border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground",
                      )}
                      style={{ borderRadius: `${settings.radius}rem` }}
                    >
                      <Sun className="h-4 w-4" />
                      <span>Light</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      className={cn(
                        "flex cursor-pointer items-center justify-center gap-2 border px-3 py-2.5 text-xs font-medium shadow-2xs transition-all",
                        theme === "dark"
                          ? "bg-primary/10 border-primary text-primary shadow-xs"
                          : "bg-card border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground",
                      )}
                      style={{ borderRadius: `${settings.radius}rem` }}
                    >
                      <Moon className="h-4 w-4" />
                      <span>Dark</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTheme("system")}
                      className={cn(
                        "flex cursor-pointer items-center justify-center gap-2 border px-3 py-2.5 text-xs font-medium shadow-2xs transition-all",
                        theme === "system"
                          ? "bg-primary/10 border-primary text-primary shadow-xs"
                          : "bg-card border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground",
                      )}
                      style={{ borderRadius: `${settings.radius}rem` }}
                    >
                      <Laptop className="h-4 w-4" />
                      <span>System</span>
                    </button>
                  </div>
                </div>

                {/* Accent Colors Palette */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                      <Palette className="text-primary h-3.5 w-3.5" /> Primary
                      Accent Color
                    </span>
                    <Badge
                      variant="outline"
                      className="border-primary/30 text-primary text-[11px] font-medium capitalize"
                    >
                      {activeAccent?.name || settings.accentColor}
                    </Badge>
                  </div>

                  <div
                    className="border-border/80 bg-muted/20 grid grid-cols-6 gap-3 border p-3.5 sm:grid-cols-9"
                    style={{
                      borderRadius: `calc(${settings.radius}rem + 4px)`,
                    }}
                  >
                    {accentColors.map((color) => {
                      const isSelected =
                        settings.accentColor.toLowerCase() ===
                        color.name.toLowerCase();
                      const swatchRadius =
                        settings.radius >= 1.0
                          ? "9999px"
                          : settings.radius === 0
                            ? "0px"
                            : `calc(${settings.radius}rem * 1.3)`;

                      return (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() =>
                            updateSettings({
                              accentColor: color.name.toLowerCase(),
                            })
                          }
                          className="group hover:bg-muted/50 relative flex cursor-pointer flex-col items-center justify-center rounded-lg p-1.5 transition-colors"
                          title={color.name}
                        >
                          <span
                            className="flex h-8 w-8 items-center justify-center transition-colors duration-150"
                            style={{
                              borderRadius: swatchRadius,
                              background: `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${color.preview} 70%, white 30%) 0%, ${color.preview} 55%, color-mix(in srgb, ${color.preview} 70%, black 30%) 100%)`,
                              boxShadow: isSelected
                                ? `inset 0 1px 2px rgba(255,255,255,0.6), inset 0 -2px 4px rgba(0,0,0,0.4), 0 0 0 2.5px var(--background), 0 0 0 4.5px ${color.preview}, 0 4px 12px ${color.preview}66`
                                : "inset 0 1px 1.5px rgba(255,255,255,0.4), inset 0 -1.5px 3px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.3)",
                            }}
                          >
                            {isSelected && (
                              <Check className="h-4 w-4 stroke-[3] text-white drop-shadow-xs" />
                            )}
                          </span>
                          <span
                            className={cn(
                              "mt-1.5 max-w-full truncate text-center text-[9px] font-medium transition-colors",
                              isSelected
                                ? "text-foreground font-semibold"
                                : "text-muted-foreground group-hover:text-foreground",
                            )}
                          >
                            {color.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Neutral Base Tones */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
                      <Layers className="text-primary h-3.5 w-3.5" /> Base
                      Neutral Tone
                    </span>
                    <span className="text-muted-foreground font-mono text-[11px] capitalize">
                      {settings.baseColor}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {baseColors.map((base) => {
                      const isSelected = settings.baseColor === base.value;
                      const isRecommended = recommendedBases.includes(
                        base.value,
                      );
                      return (
                        <button
                          key={base.value}
                          type="button"
                          onClick={() =>
                            updateSettings({ baseColor: base.value })
                          }
                          className={cn(
                            "relative flex cursor-pointer items-center justify-center border p-2.5 text-center shadow-2xs transition-colors",
                            isSelected
                              ? "bg-primary/10 border-primary text-primary font-semibold shadow-xs"
                              : "bg-card border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground",
                          )}
                          style={{
                            borderRadius: `${settings.radius}rem`,
                          }}
                        >
                          <span className="text-xs">{base.name}</span>
                          {isRecommended && (
                            <span
                              className="bg-primary absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full shadow-xs"
                              title="Recommended pairing"
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Harmony Legend */}
                  <div className="text-muted-foreground flex items-center gap-2 pt-0.5 text-[11px]">
                    <span className="bg-primary h-2 w-2 shrink-0 rounded-full shadow-xs" />
                    <span>
                      <strong className="text-foreground font-medium">
                        Harmony:
                      </strong>{" "}
                      Recommended neutral pairings tailored for{" "}
                      <span className="text-foreground font-medium capitalize">
                        {settings.accentColor}
                      </span>
                      .
                    </span>
                  </div>
                </div>
              </TabsContent>

              {/* 3. Code Syntax Highlighting Tab */}
              <TabsContent value="syntax" className="mt-0 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 pr-2">
                    <h4 className="text-foreground text-xs font-semibold">
                      Code Syntax Highlighting
                    </h4>
                    <p className="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">
                      Powered by Shiki 3. Choose your preferred code editor
                      theme for viewing files.
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-primary shrink-0 font-mono text-[11px] uppercase"
                  >
                    {filteredCodeThemes.length === codeThemes.length
                      ? `${codeThemes.length} Themes`
                      : `${filteredCodeThemes.length} / ${codeThemes.length}`}
                  </Badge>
                </div>

                {/* Search Bar for Syntax Themes */}
                <div className="relative">
                  <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
                  <input
                    type="text"
                    value={syntaxSearch}
                    onChange={(e) => setSyntaxSearch(e.target.value)}
                    placeholder="Search syntax themes by name, id..."
                    className="bg-muted/30 border-border/80 placeholder:text-muted-foreground focus:border-primary/80 focus:ring-primary/30 h-8.5 w-full border pr-8 pl-8.5 text-xs transition-colors focus:ring-1 focus:outline-hidden"
                    style={{ borderRadius: `${settings.radius}rem` }}
                  />
                  {syntaxSearch && (
                    <button
                      type="button"
                      onClick={() => setSyntaxSearch("")}
                      className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded-sm p-0.5 transition-colors"
                      title="Clear search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Canvas Background Mode Tab Switcher */}
                <div
                  className="border-border/80 bg-card flex flex-col gap-2.5 border p-3.5 shadow-2xs sm:flex-row sm:items-center sm:justify-between"
                  style={{ borderRadius: `${settings.radius}rem` }}
                >
                  <div className="space-y-0.5 sm:max-w-[65%]">
                    <span className="text-foreground text-xs font-semibold">
                      Canvas Background
                    </span>
                    <p className="text-muted-foreground text-[11px] leading-relaxed">
                      Use the theme&apos;s authentic editor background or match
                      the app canvas.
                    </p>
                  </div>

                  <div
                    role="tablist"
                    aria-label="Code canvas background mode"
                    className="bg-muted/40 border-border/80 grid h-8.5 w-full grid-cols-2 items-center border p-0.5 shadow-2xs sm:flex sm:h-8 sm:w-auto sm:shrink-0"
                    style={{ borderRadius: `${settings.radius}rem` }}
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={!settings.transparentCodeBg}
                      onClick={() =>
                        updateSettings({ transparentCodeBg: false })
                      }
                      className={cn(
                        "flex h-full cursor-pointer items-center justify-center px-3 text-xs font-medium transition-all",
                        !settings.transparentCodeBg
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                      style={{
                        borderRadius: `calc(${settings.radius}rem - 2px)`,
                      }}
                    >
                      Authentic
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={settings.transparentCodeBg}
                      onClick={() =>
                        updateSettings({ transparentCodeBg: true })
                      }
                      className={cn(
                        "flex h-full cursor-pointer items-center justify-center px-3 text-xs font-medium transition-all",
                        settings.transparentCodeBg
                          ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                      style={{
                        borderRadius: `calc(${settings.radius}rem - 2px)`,
                      }}
                    >
                      Match App
                    </button>
                  </div>
                </div>

                {filteredCodeThemes.length === 0 ? (
                  <div
                    className="bg-muted/15 flex flex-col items-center justify-center space-y-2.5 border border-dashed p-8 text-center"
                    style={{ borderRadius: `${settings.radius}rem` }}
                  >
                    <div className="bg-muted text-muted-foreground flex h-10 w-10 items-center justify-center rounded-xl">
                      <FileCode2 className="h-5 w-5 opacity-60" />
                    </div>
                    <div>
                      <p className="text-foreground text-xs font-semibold">
                        No matching syntax themes
                      </p>
                      <p className="text-muted-foreground mt-0.5 text-[11px]">
                        No syntax themes match &quot;{syntaxSearch}&quot;.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setSyntaxSearch("")}
                      className="h-7 cursor-pointer text-xs"
                    >
                      Clear search
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {filteredCodeThemes.map((th) => {
                      const isSelected =
                        (settings.codeTheme || "github") === th.id;
                      const thColors = getCodeThemeColors(
                        th,
                        isDark ? "dark" : "light",
                      );
                      const bgIsDark = isDarkHex(thColors.bg);
                      const textColor = settings.transparentCodeBg
                        ? undefined
                        : bgIsDark
                          ? "#e2e8f0"
                          : "#1e293b";
                      return (
                        <button
                          key={th.id}
                          type="button"
                          onClick={() => updateSettings({ codeTheme: th.id })}
                          className={cn(
                            "group hover:bg-muted/30 relative flex cursor-pointer flex-col justify-between border p-3 text-left shadow-xs transition-colors hover:!border-[var(--hover-border)]",
                            isSelected
                              ? "bg-primary/5 border-primary ring-primary/30 ring-2"
                              : "bg-card border-border/80 hover:border-border",
                          )}
                          style={
                            {
                              borderRadius: `${settings.radius}rem`,
                              "--hover-border": thColors.keyword,
                            } as React.CSSProperties
                          }
                        >
                          <div className="w-full space-y-2">
                            {/* Top Line: Name + Active Badge */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileCode2 className="text-primary h-4 w-4" />
                                <span className="text-foreground text-xs font-bold">
                                  {th.name}
                                </span>
                              </div>

                              {isSelected && (
                                <Badge
                                  variant="secondary"
                                  className="bg-primary/15 text-primary h-4.5 gap-1 px-1.5 text-[10px] font-bold"
                                >
                                  <Check className="h-3 w-3 stroke-[3]" />{" "}
                                  Active
                                </Badge>
                              )}
                            </div>

                            <p className="text-muted-foreground line-clamp-1 text-[11px]">
                              {th.description}
                            </p>

                            {/* Live Syntax Code Preview Box */}
                            <div
                              className="space-y-0.5 border p-2.5 font-mono text-[11px] shadow-inner transition-colors"
                              style={{
                                borderRadius: `calc(${settings.radius}rem * 0.75)`,
                                backgroundColor: settings.transparentCodeBg
                                  ? "var(--muted)"
                                  : thColors.bg,
                                color: textColor,
                                borderColor: isSelected
                                  ? `${thColors.keyword}55`
                                  : isDark
                                    ? "rgba(255,255,255,0.08)"
                                    : "rgba(0,0,0,0.08)",
                              }}
                            >
                              <div>
                                <span style={{ color: thColors.keyword }}>
                                  const
                                </span>{" "}
                                <span style={{ color: thColors.function }}>
                                  useRepo
                                </span>{" "}
                                = (
                                <span style={{ color: thColors.string }}>
                                  &quot;main&quot;
                                </span>
                                ) =&gt; &#123;
                              </div>
                              <div className="pl-3">
                                <span style={{ color: thColors.comment }}>
                                  {"// "}
                                  {th.name} Shiki theme
                                </span>
                              </div>
                              <div className="pl-3">
                                <span style={{ color: thColors.keyword }}>
                                  return
                                </span>{" "}
                                <span style={{ color: thColors.function }}>
                                  createAST
                                </span>
                                ();
                              </div>
                              <div>&#125;</div>
                            </div>
                          </div>

                          {/* Mini Color Dots */}
                          <div className="border-border/50 text-muted-foreground mt-2 flex items-center gap-1.5 border-t pt-2 text-[10px]">
                            <span className="font-mono text-[9px] tracking-wider uppercase">
                              Palette:
                            </span>
                            <div className="flex items-center gap-1">
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{
                                  backgroundColor: thColors.keyword,
                                }}
                                title="Keyword"
                              />
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{
                                  backgroundColor: thColors.function,
                                }}
                                title="Function"
                              />
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{
                                  backgroundColor: thColors.string,
                                }}
                                title="String"
                              />
                              <span
                                className="h-2 w-2 rounded-full"
                                style={{
                                  backgroundColor: thColors.comment,
                                }}
                                title="Comment"
                              />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* 4. Typography Tab */}
              <TabsContent value="typography" className="mt-0 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 pr-2">
                    <h4 className="text-foreground text-xs font-semibold">
                      Application Typeface
                    </h4>
                    <p className="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">
                      Select a Google Font or system typeface. Applied
                      application-wide.
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-primary shrink-0 font-mono text-[11px]"
                  >
                    {filteredFonts.length === fonts.length
                      ? `${fonts.length} Fonts`
                      : `${filteredFonts.length} / ${fonts.length}`}
                  </Badge>
                </div>

                {/* Search Bar for Fonts */}
                <div className="relative">
                  <Search className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 h-3.5 w-3.5 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fontSearch}
                    onChange={(e) => setFontSearch(e.target.value)}
                    placeholder="Search fonts by name..."
                    className="bg-muted/30 border-border/80 placeholder:text-muted-foreground focus:border-primary/80 focus:ring-primary/30 h-8.5 w-full border pr-8 pl-8.5 text-xs transition-colors focus:ring-1 focus:outline-hidden"
                    style={{ borderRadius: `${settings.radius}rem` }}
                  />
                  {fontSearch && (
                    <button
                      type="button"
                      onClick={() => setFontSearch("")}
                      className="text-muted-foreground hover:text-foreground absolute top-1/2 right-2.5 -translate-y-1/2 cursor-pointer rounded-sm p-0.5 transition-colors"
                      title="Clear search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {filteredFonts.length === 0 ? (
                  <div
                    className="bg-muted/15 flex flex-col items-center justify-center space-y-2.5 border border-dashed p-8 text-center"
                    style={{ borderRadius: `${settings.radius}rem` }}
                  >
                    <div className="bg-muted text-muted-foreground flex h-10 w-10 items-center justify-center rounded-xl">
                      <Type className="h-5 w-5 opacity-60" />
                    </div>
                    <div>
                      <p className="text-foreground text-xs font-semibold">
                        No matching fonts
                      </p>
                      <p className="text-muted-foreground mt-0.5 text-[11px]">
                        No typefaces match &quot;{fontSearch}&quot;.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="xs"
                      onClick={() => setFontSearch("")}
                      className="h-7 cursor-pointer text-xs"
                    >
                      Clear search
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {filteredFonts.map((f) => {
                      const isSelected = settings.font === f.value;
                      return (
                        <button
                          key={f.value}
                          type="button"
                          onClick={() => updateSettings({ font: f.value })}
                          className={cn(
                            "group flex cursor-pointer items-center justify-between border p-3 text-left shadow-2xs transition-all",
                            isSelected
                              ? "bg-primary/10 border-primary text-primary shadow-xs"
                              : "bg-card border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground",
                          )}
                          style={{
                            fontFamily: f.name,
                            borderRadius: `${settings.radius}rem`,
                          }}
                        >
                          <div className="min-w-0">
                            <p className="text-foreground group-hover:text-primary text-xs font-medium transition-colors">
                              {f.name}
                            </p>
                            <p className="text-muted-foreground text-[11px] opacity-80">
                              The quick brown fox jumps
                            </p>
                          </div>
                          {isSelected ? (
                            <Check className="text-primary ml-2 h-4 w-4 shrink-0" />
                          ) : (
                            <span className="font-mono text-xs opacity-40">
                              Aa
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </TabsContent>

              {/* 5. Geometry & Radius Tab */}
              <TabsContent value="geometry" className="mt-0 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1 pr-2">
                    <h4 className="text-foreground text-xs font-semibold">
                      Corner Radius Scale
                    </h4>
                    <p className="text-muted-foreground mt-0.5 text-[11px] leading-relaxed">
                      Controls corner curvature across buttons, cards, dialogs,
                      and panels.
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-primary shrink-0 font-mono text-[11px]"
                  >
                    {settings.radius}rem
                  </Badge>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {radiusOptions.map((opt) => {
                    const isSelected = settings.radius === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateSettings({ radius: opt.value })}
                        className={cn(
                          "flex cursor-pointer flex-col items-center gap-2 border p-3 text-center shadow-2xs transition-all",
                          isSelected
                            ? "bg-primary/10 border-primary text-primary font-semibold shadow-xs"
                            : "bg-card border-border/80 hover:bg-muted text-muted-foreground hover:text-foreground",
                        )}
                        style={{
                          borderRadius: `${settings.radius}rem`,
                        }}
                      >
                        <div
                          className="bg-primary/10 h-8 w-10 border-2 border-current shadow-2xs"
                          style={{ borderRadius: `${opt.value}rem` }}
                        />
                        <span className="text-[11px] font-medium">
                          {opt.label}
                        </span>
                        <span className="font-mono text-[9px] opacity-60">
                          {opt.value}rem
                        </span>
                      </button>
                    );
                  })}
                </div>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>

        {/* Footer */}
        <SheetFooter className="bg-muted/20 mt-0 flex shrink-0 flex-row items-center justify-between border-t px-6 py-3.5 sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={resetSettings}
            className="text-muted-foreground hover:text-foreground h-8 cursor-pointer gap-1.5 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reset to default preset</span>
          </Button>

          <Button
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 cursor-pointer px-5 text-xs font-semibold shadow-xs"
          >
            Done
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
