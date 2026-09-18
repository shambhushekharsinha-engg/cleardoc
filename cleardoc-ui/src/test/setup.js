import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Polyfill window.matchMedia for Framer Motion / responsive tests
Object.defineProperty(window, 'matchMedia', {
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

// Polyfill ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Polyfill URL.createObjectURL and revokeObjectURL
if (!global.URL.createObjectURL) {
  global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
}
if (!global.URL.revokeObjectURL) {
  global.URL.revokeObjectURL = vi.fn();
}

// Polyfill navigator.clipboard
if (!navigator.clipboard) {
  Object.defineProperty(navigator, 'clipboard', {
    value: {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn().mockResolvedValue(''),
    },
    writable: true,
  });
} else {
  navigator.clipboard.writeText = vi.fn().mockResolvedValue(undefined);
}

// Polyfill Element.prototype.scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

// Polyfill window.print
window.print = vi.fn();
