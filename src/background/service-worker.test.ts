import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as geminiService from '../services/geminiService';
import type { Message, StartProcessingPayload } from '../types/messaging';

vi.mock('../services/geminiService');

import { messageListener, setIsProcessing } from './service-worker';

describe('Service Worker Message Listener', () => {
  const createPayload = (overrides: Partial<StartProcessingPayload>): StartProcessingPayload => ({
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

  const mockTab = {
    id: 1, title: 'Test Tab', url: 'https://example.com', index: 0,
    pinned: false,
    highlighted: false,
    windowId: 0,
    active: false,
    frozen: false,
    incognito: false,
    selected: false,
    discarded: false,
    autoDiscardable: false,
    groupId: 0
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // --- THIS IS THE FIX: Reset the mock implementation to a default successful state ---
    vi.mocked(geminiService.processText).mockResolvedValue('default mock result');
    // ---------------------------------------------------------------------------------
    setIsProcessing(false);

    vi.mocked(chrome.tabs.query).mockImplementation((_query, callback) => callback([mockTab, { ...mockTab, id: 2, }]));
    vi.mocked(chrome.tabs.get).mockImplementation(async () => mockTab as chrome.tabs.Tab);
    vi.mocked(chrome.scripting.executeScript).mockImplementation(async () => [{ result: 'page content' }]);
  });

  it('should correctly handle a combined, dual-language summary pipeline', async () => {
    // Set up a more detailed sequence of mock return values for this specific test
    vi.mocked(geminiService.processText)
      .mockResolvedValueOnce('Summary A')
      .mockResolvedValueOnce('Summary B')
      .mockResolvedValueOnce('Translation A')
      .mockResolvedValueOnce('Translation B')
      .mockResolvedValueOnce('Combined Summary')
      .mockResolvedValueOnce('Combined Translation')
      .mockResolvedValue('Combined Title');
    const sendResponse = vi.fn();
    const message: Message = { type: 'START_PROCESSING', payload: createPayload({ pipeline: 'dual-lang-summary', combineResults: true, tabs: [1, 2] }) };

    await messageListener(message, {} as chrome.runtime.MessageSender, sendResponse);

    // Check that the final title generation was called
    // expect(geminiService.processText).toHaveBeenCalledWith('generate-title', expect.any(Array), expect.any(String));
    expect(geminiService.processText).toHaveBeenCalledWith('generate-title', expect.any(String), expect.any(String));

    // Check the final output
    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'TASK_COMPLETE',
        payload: expect.objectContaining({
          tabTitle: 'Combined Title',
          result: '--- Original Combined Summary ---\nCombined Summary\n\n--- Translated Combined Summary ---\nCombined Translation',
        }),
      })
    );
  });

  it('should handle a workflow error and send a TASK_ERROR message', async () => {
    // --- THIS IS THE FIX: Explicitly reject the mock for this test ---
    vi.mocked(geminiService.processText).mockRejectedValue(new Error('API Failure'));
    // ----------------------------------------------------------------
    const sendResponse = vi.fn();
    const message: Message = { type: 'START_PROCESSING', payload: createPayload({}) };

    await messageListener(message, {} as chrome.runtime.MessageSender, sendResponse);

    expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'TASK_ERROR',
        payload: expect.objectContaining({ error: 'API Failure' }),
      })
    );
  });
});