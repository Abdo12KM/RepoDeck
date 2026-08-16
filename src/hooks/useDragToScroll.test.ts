// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDragToScroll } from "./useDragToScroll";

describe("useDragToScroll hook", () => {
  let element: HTMLDivElement;

  beforeEach(() => {
    vi.restoreAllMocks();
    element = document.createElement("div");
    // Mock scroll properties
    Object.defineProperty(element, "clientWidth", {
      value: 200,
      configurable: true,
    });
    Object.defineProperty(element, "scrollWidth", {
      value: 600,
      configurable: true,
    });
    Object.defineProperty(element, "scrollLeft", {
      value: 0,
      configurable: true,
      writable: true,
    });
    element.setPointerCapture = vi.fn();
    element.releasePointerCapture = vi.fn();
    document.body.appendChild(element);
  });

  it("attaches event listeners and does not drag on simple click", () => {
    const ref = { current: element };
    const { result } = renderHook(() => useDragToScroll({ ref }));

    expect(result.current.isDragging).toBe(false);

    // Pointer down
    const pointerDownEvent = new MouseEvent("pointerdown", {
      bubbles: true,
      clientX: 100,
      button: 0,
    });
    Object.defineProperty(pointerDownEvent, "pointerType", { value: "mouse" });
    Object.defineProperty(pointerDownEvent, "pointerId", { value: 1 });

    act(() => {
      element.dispatchEvent(pointerDownEvent);
    });

    // Pointer up without moving past threshold
    const pointerUpEvent = new MouseEvent("pointerup", {
      bubbles: true,
      clientX: 101,
    });
    Object.defineProperty(pointerUpEvent, "pointerType", { value: "mouse" });
    Object.defineProperty(pointerUpEvent, "pointerId", { value: 1 });

    act(() => {
      element.dispatchEvent(pointerUpEvent);
    });

    expect(result.current.isDragging).toBe(false);
    expect(element.scrollLeft).toBe(0);
  });

  it("drags and updates scrollLeft when moving past threshold", () => {
    const ref = { current: element };
    const { result } = renderHook(() => useDragToScroll({ ref, threshold: 4 }));

    // Pointer down at x=100
    const pointerDownEvent = new MouseEvent("pointerdown", {
      bubbles: true,
      clientX: 100,
      button: 0,
    });
    Object.defineProperty(pointerDownEvent, "pointerType", { value: "mouse" });
    Object.defineProperty(pointerDownEvent, "pointerId", { value: 1 });

    act(() => {
      element.dispatchEvent(pointerDownEvent);
    });

    // Move left to x=50 (delta = -50, scrollLeft should increase by 50)
    const pointerMoveEvent = new MouseEvent("pointermove", {
      bubbles: true,
      clientX: 50,
    });
    Object.defineProperty(pointerMoveEvent, "pointerType", { value: "mouse" });

    act(() => {
      element.dispatchEvent(pointerMoveEvent);
    });

    expect(result.current.isDragging).toBe(true);
    expect(element.scrollLeft).toBe(50);
  });

  it("scrolls horizontally on mouse wheel deltaY", () => {
    const ref = { current: element };
    renderHook(() => useDragToScroll({ ref, wheelToScroll: true }));

    // Wheel event with deltaY = 40
    const wheelEvent = new Event("wheel", { bubbles: true, cancelable: true });
    Object.defineProperty(wheelEvent, "deltaY", { value: 40 });
    Object.defineProperty(wheelEvent, "shiftKey", { value: false });

    act(() => {
      element.dispatchEvent(wheelEvent);
    });

    expect(element.scrollLeft).toBe(40);
  });

  it("ignores touch pointerdown to preserve native touch scrolling", () => {
    const ref = { current: element };
    const { result } = renderHook(() => useDragToScroll({ ref }));

    const touchPointerDown = new MouseEvent("pointerdown", {
      bubbles: true,
      clientX: 100,
      button: 0,
    });
    Object.defineProperty(touchPointerDown, "pointerType", { value: "touch" });

    act(() => {
      element.dispatchEvent(touchPointerDown);
    });

    const touchPointerMove = new MouseEvent("pointermove", {
      bubbles: true,
      clientX: 40,
    });
    Object.defineProperty(touchPointerMove, "pointerType", { value: "touch" });

    act(() => {
      element.dispatchEvent(touchPointerMove);
    });

    expect(result.current.isDragging).toBe(false);
    expect(element.scrollLeft).toBe(0);
  });
});
