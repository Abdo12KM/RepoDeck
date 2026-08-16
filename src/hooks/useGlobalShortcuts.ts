"use client";

import { useEffect } from "react";

interface GlobalShortcutOptions {
  onToggleQuickSwitcher?: () => void;
  onToggleAppearance?: () => void;
  onToggleSidebar?: () => void;
  onOpenRepoPicker?: () => void;
  onOpenShortcutsHelp?: () => void;
  onCloseActiveTab?: () => void;
  onNextTab?: () => void;
  onPrevTab?: () => void;
  onSelectTabIndex?: (index: number) => void;
}

/**
 * Global Keyboard Shortcut listener hook with smart input guardrails
 * and collision-free modifier keys.
 */
export function useGlobalShortcuts({
  onToggleQuickSwitcher,
  onToggleAppearance,
  onToggleSidebar,
  onOpenRepoPicker,
  onOpenShortcutsHelp,
  onCloseActiveTab,
  onNextTab,
  onPrevTab,
  onSelectTabIndex,
}: GlobalShortcutOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.getAttribute("role") === "textbox");

      const isModifier = e.metaKey || e.ctrlKey;

      // 1. Universal Command Palette: Ctrl+K / ⌘K (and Ctrl+P / ⌘P for muscle memory)
      if (
        isModifier &&
        (e.key.toLowerCase() === "k" || e.key.toLowerCase() === "p")
      ) {
        e.preventDefault();
        onToggleQuickSwitcher?.();
        return;
      }

      // 2. Open / Switch Repository: Ctrl+O / ⌘O
      if (isModifier && e.key.toLowerCase() === "o") {
        e.preventDefault();
        onOpenRepoPicker?.();
        return;
      }

      // 3. Toggle Sidebar Explorer: Ctrl+B / ⌘B or Ctrl+\ / ⌘\
      if (
        isModifier &&
        (e.key.toLowerCase() === "b" || e.key === "\\" || e.key === "|")
      ) {
        e.preventDefault();
        onToggleSidebar?.();
        return;
      }

      // 4. Toggle Appearance & Theme Settings: Ctrl+, / ⌘,
      if (isModifier && e.key === ",") {
        e.preventDefault();
        onToggleAppearance?.();
        return;
      }

      // 5. Alt-based Tab & Editor Shortcuts
      if (e.altKey && !isModifier) {
        if (e.key === "[" || e.key === "ArrowLeft") {
          e.preventDefault();
          onPrevTab?.();
          return;
        }
        if (e.key === "]" || e.key === "ArrowRight") {
          e.preventDefault();
          onNextTab?.();
          return;
        }
        // Alt+O or Alt+R: Switch Repository
        if (e.key.toLowerCase() === "o" || e.key.toLowerCase() === "r") {
          e.preventDefault();
          onOpenRepoPicker?.();
          return;
        }
        // Alt+W: Close active tab
        if (e.key.toLowerCase() === "w") {
          e.preventDefault();
          onCloseActiveTab?.();
          return;
        }
        // Alt+1 .. Alt+9: Jump to specific tab
        const num = parseInt(e.key, 10);
        if (!isNaN(num) && num >= 1 && num <= 9) {
          e.preventDefault();
          onSelectTabIndex?.(num - 1);
          return;
        }
        // Alt+T: Appearance & Theme Studio
        if (e.key.toLowerCase() === "t") {
          e.preventDefault();
          onToggleAppearance?.();
          return;
        }
        // Alt+Z: Toggle Word Wrap
        if (e.key.toLowerCase() === "z") {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("repodeck:toggle-wrap"));
          return;
        }
        // Alt+L: Toggle Line Numbers
        if (e.key.toLowerCase() === "l") {
          e.preventDefault();
          window.dispatchEvent(new CustomEvent("repodeck:toggle-line-numbers"));
          return;
        }
      }

      // 5. Help / Shortcuts Reference Modal: ? (Shift+/) when not typing in an input
      if (!isModifier && !e.altKey && e.key === "?" && !isInput) {
        e.preventDefault();
        onOpenShortcutsHelp?.();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    onToggleQuickSwitcher,
    onToggleAppearance,
    onToggleSidebar,
    onOpenRepoPicker,
    onOpenShortcutsHelp,
    onCloseActiveTab,
    onNextTab,
    onPrevTab,
    onSelectTabIndex,
  ]);
}
