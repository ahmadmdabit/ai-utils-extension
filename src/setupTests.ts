// src/setupTests.ts
import '@testing-library/jest-dom';
import { vi } from 'vitest';

const mockChrome = {
  runtime: {
    sendMessage: vi.fn((_message, callback) => { if (callback) callback({ status: 'mock response' }); }),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn(),
    },
    lastError: undefined,
  },
  storage: {
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
    },
  },
  tabs: {
    query: vi.fn().mockImplementation((_query, callback) => callback([])),
  },
  scripting: {
    executeScript: vi.fn().mockResolvedValue([]),
  },
};

vi.stubGlobal('chrome', mockChrome);