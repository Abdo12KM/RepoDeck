// @vitest-environment jsdom
import React from "react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, act } from "@testing-library/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./tabs";

describe("Tabs & TabsList Scroll Shadow", () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    // Mock maskImage and webkitMaskImage on CSSStyleDeclaration for jsdom
    Object.defineProperty(CSSStyleDeclaration.prototype, "maskImage", {
      get() {
        return this._maskImage || "";
      },
      set(val) {
        this._maskImage = val;
      },
      configurable: true,
    });
    Object.defineProperty(CSSStyleDeclaration.prototype, "webkitMaskImage", {
      get() {
        return this._webkitMaskImage || "";
      },
      set(val) {
        this._webkitMaskImage = val;
      },
      configurable: true,
    });

    // Mock ResizeObserver if not defined in jsdom
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

  it("renders Tabs and TabsList with proper data-slots and classes", () => {
    const { getByRole, getAllByRole } = render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Content 1</TabsContent>
        <TabsContent value="tab2">Content 2</TabsContent>
      </Tabs>,
    );

    const tabList = getByRole("tablist");
    expect(tabList).toBeTruthy();
    expect(tabList.getAttribute("data-slot")).toBe("tabs-list");

    const tabs = getAllByRole("tab");
    expect(tabs.length).toBe(2);
  });

  it("does not apply maskImage when content does not overflow", () => {
    const { getByRole } = render(
      <Tabs defaultValue="tab1">
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    const tabList = getByRole("tablist");
    // scrollWidth === clientWidth in jsdom default (both 0)
    expect(tabList.style.maskImage).toBe("");
  });

  it("applies horizontal scroll shadow when scrolled horizontally", () => {
    let resizeCallback: (() => void) | null = null;
    class MockResizeObserver {
      callback: () => void;
      constructor(callback: () => void) {
        this.callback = callback;
        resizeCallback = callback;
      }
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    window.ResizeObserver =
      MockResizeObserver as unknown as typeof ResizeObserver;

    const { getByRole } = render(
      <Tabs defaultValue="tab1">
        <TabsList shadowSize={20}>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    const tabList = getByRole("tablist");

    // Simulate overflow: clientWidth=200, scrollWidth=500
    Object.defineProperty(tabList, "clientWidth", {
      value: 200,
      configurable: true,
    });
    Object.defineProperty(tabList, "scrollWidth", {
      value: 500,
      configurable: true,
    });
    Object.defineProperty(tabList, "scrollLeft", {
      value: 0,
      configurable: true,
      writable: true,
    });

    act(() => {
      if (resizeCallback) resizeCallback();
      tabList.dispatchEvent(new Event("scroll"));
    });

    // When at start and can scroll right: right shadow gradient
    expect(tabList.style.maskImage).toContain(
      "linear-gradient(to right, black 0px, black calc(100% - 20px), transparent 100%)",
    );

    // Scrolled into middle
    tabList.scrollLeft = 100;
    act(() => {
      tabList.dispatchEvent(new Event("scroll"));
    });
    expect(tabList.style.maskImage).toContain(
      "linear-gradient(to right, transparent 0px, black 20px, black calc(100% - 20px), transparent 100%)",
    );

    // Scrolled to the right end (maxScrollX = 300)
    tabList.scrollLeft = 300;
    act(() => {
      tabList.dispatchEvent(new Event("scroll"));
    });
    expect(tabList.style.maskImage).toContain(
      "linear-gradient(to right, transparent 0px, black 20px, black 100%)",
    );
  });

  it("does not apply scroll shadow if scrollShadow={false}", () => {
    let resizeCallback: (() => void) | null = null;
    class MockResizeObserver {
      callback: () => void;
      constructor(callback: () => void) {
        this.callback = callback;
        resizeCallback = callback;
      }
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
    }
    window.ResizeObserver =
      MockResizeObserver as unknown as typeof ResizeObserver;

    const { getByRole } = render(
      <Tabs defaultValue="tab1">
        <TabsList scrollShadow={false}>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
        </TabsList>
      </Tabs>,
    );

    const tabList = getByRole("tablist");
    Object.defineProperty(tabList, "clientWidth", {
      value: 200,
      configurable: true,
    });
    Object.defineProperty(tabList, "scrollWidth", {
      value: 500,
      configurable: true,
    });
    Object.defineProperty(tabList, "scrollLeft", {
      value: 50,
      configurable: true,
    });

    act(() => {
      if (resizeCallback) resizeCallback();
      tabList.dispatchEvent(new Event("scroll"));
    });

    expect(tabList.style.maskImage).toBe("");
  });
});
