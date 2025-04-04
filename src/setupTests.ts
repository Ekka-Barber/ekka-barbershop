import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.matchMedia for Vitest/jsdom
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock other potentially missing APIs if needed later
// e.g., Object.defineProperty(window, 'ResizeObserver', { ... }); 
