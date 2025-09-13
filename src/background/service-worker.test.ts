import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as geminiService from '../services/geminiService';
import * as chromeService from '../services/chromeService';
import type { Message, StartProcessingPayload } from '../types/messaging';

vi.mock('../services/geminiService');
vi.mock('../services/chromeService');

import { messageListener, setIsProcessing } from './service-worker';

describe('Service Worker Message Listener', () => {
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
    vi.mocked(geminiService.processText).mockResolvedValue(
      'default mock result',
    );
    setIsProcessing(false);
    vi.mocked(chrome.tabs.query).mockImplementation((_query, callback) =>
      callback([mockTab, { ...mockTab, id: 2 }]),
    );
    vi.mocked(chrome.tabs.get).mockImplementation(async () => mockTab);
    vi.mocked(chrome.scripting.executeScript).mockImplementation(async () => [
      { result: 'page content' },
    ]);
    vi.spyOn(console, 'error');
    vi.spyOn(console, 'warn');
  });

  it('should correctly handle a combined, dual-language summary pipeline', async () => {
    vi.mocked(geminiService.processText)
      .mockResolvedValueOnce('Summary A')
      .mockResolvedValueOnce('Summary B')
      .mockResolvedValueOnce('Translation A')
      .mockResolvedValueOnce('Translation B')
      .mockResolvedValueOnce('Combined Summary')
      .mockResolvedValueOnce('Combined Translation')
      .mockResolvedValue('Combined Title');
    const sendResponse = vi.fn();
    const message: Message = {
      type: 'START_PROCESSING',
      payload: createPayload({
        pipeline: 'dual-lang-summary',
        combineResults: true,
        tabs: [1, 2],
      }),
    };

    await messageListener(
      message,
      {} as chrome.runtime.MessageSender,
      sendResponse,
    );

    expect(geminiService.processText).toHaveBeenCalledWith(
      'generate-title',
      expect.stringContaining('--- Document 1 ---\npage content'),
      'gemini-2.5-flash-lite',
      undefined,
      expect.any(AbortSignal),
    );

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'TASK_COMPLETE',
        payload: expect.objectContaining({
          tabTitle: 'Combined Title',
          result:
            '--- Original Combined Summary ---\nCombined Summary\n\n--- Translated Combined Summary ---\nCombined Translation',
        }),
      }),
    );
  });

  it('should handle a CANCEL_PROCESSING message', async () => {
    const sendResponse = vi.fn();
    const startMessage: Message = {
      type: 'START_PROCESSING',
      payload: createPayload({}),
    };
    const cancelMessage: Message = { type: 'CANCEL_PROCESSING' };

    const processingPromise = messageListener(
      startMessage,
      {} as chrome.runtime.MessageSender,
      sendResponse,
    );
    await messageListener(
      cancelMessage,
      {} as chrome.runtime.MessageSender,
      sendResponse,
    );
    await processingPromise;

    const lastCall = vi.mocked(chrome.runtime.sendMessage).mock.calls.pop();
    const messageSent = lastCall?.[0] as unknown as Message;
    expect(messageSent?.type).toBe('TASK_ERROR');
    if (messageSent?.type === 'TASK_ERROR') {
      expect(messageSent.payload.error).toContain('cancelled');
    }
  });

  it('should time out a long-running process', async () => {
    vi.useFakeTimers();
    const sendResponse = vi.fn();
    const startMessage: Message = {
      type: 'START_PROCESSING',
      payload: createPayload({}),
    };

    vi.mocked(chromeService.getTimeoutSetting).mockResolvedValue(10); // 10 seconds
    vi.mocked(geminiService.processText).mockImplementation(
      async (_, __, ___, ____, signal) => {
        return new Promise((resolve, reject) => {
          // Set up timeout
          const timeoutId = setTimeout(() => {
            resolve('should not return this');
          }, 20000); // 20 seconds

          // Set up abort signal listener
          if (signal) {
            signal.addEventListener('abort', () => {
              clearTimeout(timeoutId);
              reject(
                new DOMException('The operation was aborted', 'AbortError'),
              );
            });
          }
        });
      },
    );

    const workflowPromise = messageListener(
      startMessage,
      {} as chrome.runtime.MessageSender,
      sendResponse,
    );
    await vi.advanceTimersByTimeAsync(11000); // 11 seconds
    // Wait a bit more for the abort to propagate
    await vi.advanceTimersByTimeAsync(100);
    await workflowPromise;

    const lastCall = vi.mocked(chrome.runtime.sendMessage).mock.calls.pop();
    const messageSent = lastCall?.[0] as unknown as Message;
    expect(messageSent?.type).toBe('TASK_ERROR');
    if (messageSent?.type === 'TASK_ERROR') {
      expect(messageSent.payload.error).toContain('timed out');
    }

    vi.useRealTimers();
  }, 15000);

  it('should handle an unknown pipeline gracefully', async () => {
    const sendResponse = vi.fn();
    const message: Message = {
      type: 'START_PROCESSING',
      payload: createPayload({ pipeline: 'unknown-pipeline' as any }),
    };

    await messageListener(
      message,
      {} as chrome.runtime.MessageSender,
      sendResponse,
    );

    expect(console.error).toHaveBeenCalledWith(
      'Unknown pipeline: unknown-pipeline',
    );
  });
});
