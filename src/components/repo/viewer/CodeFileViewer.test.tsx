// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { CodeFileViewer } from "./CodeFileViewer";

vi.mock("@/hooks/useFileContent", () => ({
  useFileContent: () => ({
    content: "const hello = 'world';",
    isLoading: false,
    error: undefined,
    data: {
      content: "const hello = 'world';",
      sha: "123",
      path: "src/index.ts",
      size: 24,
    },
    refetch: vi.fn(),
  }),
}));

vi.mock("next-themes", () => ({
  useTheme: () => ({
    theme: "dark",
    resolvedTheme: "dark",
    setTheme: vi.fn(),
  }),
}));

vi.mock("@/hooks/useAppearanceSettings", () => ({
  useAppearanceSettings: () => ({
    settings: {
      fontFamily: "var(--font-geist-mono)",
      radius: 0.5,
      transparentCodeBg: false,
      codeTheme: "github",
    },
    getCodeTheme: () => ({
      id: "github",
      label: "GitHub",
      dark: "github-dark",
      light: "github-light",
    }),
    updateSetting: vi.fn(),
  }),
}));

vi.mock("shiki", () => ({
  codeToHtml: vi
    .fn()
    .mockResolvedValue("<pre><code>const hello = 'world';</code></pre>"),
}));

describe("CodeFileViewer mobile controls button", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    if (typeof window.ResizeObserver === "undefined") {
      class MockResizeObserver {
        observe = vi.fn();
        unobserve = vi.fn();
        disconnect = vi.fn();
      }
      window.ResizeObserver =
        MockResizeObserver as unknown as typeof ResizeObserver;
    }
  });

  it("renders the floating mobile controls button on bottom right and triggers tools drawer", () => {
    const handleToolsOpenChange = vi.fn();

    const { getByLabelText } = render(
      <CodeFileViewer
        owner="test-owner"
        repo="test-repo"
        branch="main"
        filePath="src/index.ts"
        toolsOpen={false}
        onToolsOpenChange={handleToolsOpenChange}
      />,
    );

    const floatingButton = getByLabelText("Open code controls");
    expect(floatingButton).toBeTruthy();

    act(() => {
      fireEvent.click(floatingButton);
    });

    expect(handleToolsOpenChange).toHaveBeenCalledWith(true);
  });
});
