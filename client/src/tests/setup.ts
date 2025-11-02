import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

afterEach(() => {
  cleanup();
  localStorage.clear();
  sessionStorage.clear();
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

global.IntersectionObserver = class MockIntersectionObserver
  implements IntersectionObserver
{
  readonly root = null;
  readonly rootMargin = "";
  readonly thresholds = [];

  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  unobserve() {}
};

global.ResizeObserver = class MockResizeObserver implements ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
};
