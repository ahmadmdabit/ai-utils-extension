// src/setupTests.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Create a mock that satisfies the essential parts of the chrome API type
const mockChrome = {
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn(),
    },
    lastError: undefined as { message?: string } | undefined,
  },
  storage: {
    local: {
      get: vi.fn(),
      set: vi.fn(),
      clear: vi.fn(),
      remove: vi.fn(),
      getBytesInUse: vi.fn(),
    },
  },
  tabs: {
    query: vi.fn(),
    // Add other tabs methods if you use them
  },
  scripting: {
    executeScript: vi.fn(),
    // Add other scripting methods if you use them
  },
};

vi.stubGlobal('chrome', mockChrome);
