import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as geminiService from '../services/geminiService';
import type { Message, StartProcessingPayload } from '../types/messaging';

// Mock dependencies before any imports
vi.mock('../services/geminiService');

// Import the functions we want to test
import { messageListener, setIsProcessing } from './service-worker';

describe('Service Worker Message Listener', () => {
  // Helper to create a valid, complete message payload for our tests
  const createPayload = (
    overrides: Partial<StartProcessingPayload>,
  ): StartProcessingPayload => ({
    tabs: [1],
    pipeline: 'summarize',
    scrapeOption: 'helpful',
    customPrompt: '',
    languageOption: 'English',
    customLanguage: '',
    combineResults: false,
    selectedModel: 'gemini-2.5-flash-lite',
    ...overrides,
  });

  const mockTab: chrome.tabs.Tab = {
    id: 1,
    title: 'Test Tab',
    url: 'https://example.com',
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

  beforeEach(() => {
    vi.clearAllMocks();
    setIsProcessing(false);
    vi.useFakeTimers(); // <-- ADD FAKE TIMERS

    vi.mocked(chrome.tabs.query).mockImplementation(
      (
        _query: chrome.tabs.QueryInfo,
        callback: (tabs: chrome.tabs.Tab[]) => void,
      ) => {
        callback([mockTab]);
      },
    );
  });

  afterEach(() => {
    vi.useRealTimers(); // <-- CLEAN UP FAKE TIMERS
  });

  it('should correctly handle a simple summarize pipeline', async () => {
    // --- THIS IS THE FIX: Use mockImplementation with an async function ---
    vi.mocked(chrome.scripting.executeScript).mockImplementation(async () => {
      return [{ result: 'page content' }];
    });
    // --------------------------------------------------------------------
    vi.mocked(geminiService.processText).mockResolvedValue('summary result');
    const sendResponse = vi.fn();

    const message: Message = {
      type: 'START_PROCESSING',
      payload: createPayload({}),
    };

    await new Promise<void>((resolve) => {
      messageListener(
        message,
        {} as chrome.runtime.MessageSender,
        (response) => {
          sendResponse(response);
          resolve();
        },
      );
    });
    await vi.runAllTimersAsync();

    expect(sendResponse).toHaveBeenCalledWith({ status: 'queued' });
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'TASK_COMPLETE',
        payload: expect.objectContaining({ result: 'summary result' }),
      }),
    );
  });

  it('should correctly handle a translated-summary pipeline', async () => {
    // --- APPLY THE FIX HERE AS WELL ---
    vi.mocked(chrome.scripting.executeScript).mockImplementation(async () => {
      return [{ result: 'page content' }];
    });
    // ----------------------------------
    vi.mocked(geminiService.processText)
      .mockResolvedValueOnce('summary result')
      .mockResolvedValueOnce('translated result');

    const message: Message = {
      type: 'START_PROCESSING',
      payload: createPayload({ pipeline: 'translated-summary' }),
    };
    await new Promise<void>((resolve) =>
      messageListener(message, {} as chrome.runtime.MessageSender, () =>
        resolve(),
      ),
    );
    await vi.runAllTimersAsync();

    expect(geminiService.processText).toHaveBeenCalledTimes(2);
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'TASK_COMPLETE',
        payload: expect.objectContaining({ result: 'translated result' }),
      }),
    );
  });

  // ... the other tests are correct
  it('should not start a new batch if one is already processing', async () => {
    /* ... */
  });
  it('should ignore messages with incorrect type', async () => {
    /* ... */
  });
});
