// src/setupTests.ts
import { vi, afterEach } from 'vitest';
import type { Message } from './types/messaging';

// Enable React act() warnings
(
  global as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

// Global cleanup: unmount roots after each test (assuming test-utils handles mounts)
afterEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = '';
});

// No RTL setup; native DOM via jsdom

// Create a mock that satisfies the essential parts of the chrome API type
const mockChrome = {
  runtime: {
    // sendMessage: vi.fn(),
    sendMessage: vi.fn(
      (_message: Message, callback?: (response: object) => void) => {
        if (callback) callback({ status: 'mock response from setup' });
      },
    ),
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
      hasListener: vi.fn(),
    },
    lastError: undefined as { message?: string } | undefined,
  },
  storage: {
    local: {
      get: vi.fn().mockResolvedValue({}),
      set: vi.fn().mockResolvedValue(undefined),
      clear: vi.fn(),
      remove: vi.fn(),
      getBytesInUse: vi.fn(),
    },
  },
  tabs: {
    // query: vi.fn(),
    query: vi.fn(
      (
        _query: chrome.tabs.QueryInfo,
        callback: (tabs: chrome.tabs.Tab[]) => void,
      ) => {
        callback([]);
      },
    ),
    // --- THIS IS THE FIX ---
    get: vi.fn(async (tabId: number) => {
      return {
        id: tabId,
        title: `Mock Tab ${tabId}`,
        url: `https://example.com/${tabId}`,
        index: 0,
        pinned: false,
        highlighted: false,
        windowId: 0,
        active: false,
        incognito: false,
        discarded: false,
        autoDiscardable: false,
        groupId: 0,
        selected: false,
        frozen: false,
      };
    }),
    // -----------------------
  },
  scripting: {
    // executeScript: vi.fn(),
    executeScript: vi
      .fn()
      .mockResolvedValue([] as chrome.scripting.InjectionResult[]),
    // Add other scripting methods if you use them
  },
};

vi.stubGlobal('chrome', mockChrome);
