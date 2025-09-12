import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  sendMessageToServiceWorker,
  setApiKey,
  getApiKey,
} from './chromeService';
import type { Message } from '../types/messaging';

// The global `chrome` object is mocked in `src/setupTests.ts`.
declare const chrome: any;

describe('chromeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    chrome.runtime.lastError = undefined;
  });

  describe('sendMessageToServiceWorker', () => {
    it('should send a message to the runtime and log the response', () => {
      const message: Message = {
        type: 'START_PROCESSING',
        payload: {
          tabs: [1],
          pipeline: 'summarize',
          scrapeOption: 'helpful',
          customPrompt: '',
          languageOption: 'English',
          customLanguage: '',
          combineResults: false,
          selectedModel: 'gemini-2.5-flash-lite',
        },
      };

      // --- FIX: Implement the mock to actually call the callback ---
      vi.mocked(chrome.runtime.sendMessage).mockImplementation(
        (_msg: any, callback: any) => {
          if (callback) {
            // Simulate a response from the service worker
            callback({ status: 'ok' });
          }
        },
      );
      // -----------------------------------------------------------

      sendMessageToServiceWorker(message);

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
        message,
        expect.any(Function),
      );
      expect(console.log).toHaveBeenCalledWith('Service worker responded:', {
        status: 'ok',
      });
    });

    it('should log an error if chrome.runtime.lastError is set', () => {
      const message: Message = {
        /* ... */
      } as Message;
      chrome.runtime.lastError = { message: 'Test error' };

      // --- FIX: The mock needs to call the callback for the error to be logged ---
      vi.mocked(chrome.runtime.sendMessage).mockImplementation(
        (_msg: any, callback: any) => {
          if (callback) {
            callback(undefined); // The response is undefined when there's an error
          }
        },
      );
      // -----------------------------------------------------------------------

      sendMessageToServiceWorker(message);

      expect(console.error).toHaveBeenCalledWith(
        'Error sending message:',
        'Test error',
      );
    });
  });

  describe('setApiKey', () => {
    it('should call chrome.storage.local.set with the correct key-value pair', async () => {
      await setApiKey('my-secret-key');
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        geminiApiKey: 'my-secret-key',
      });
    });
  });

  describe('getApiKey', () => {
    it('should retrieve and return the API key if it exists', async () => {
      vi.mocked(chrome.storage.local.get).mockResolvedValue({
        geminiApiKey: 'my-saved-key',
      });
      const key = await getApiKey();
      expect(key).toBe('my-saved-key');
    });

    it('should return null if the API key does not exist in storage', async () => {
      // --- FIX: Explicitly set the mock for this specific test case ---
      vi.mocked(chrome.storage.local.get).mockResolvedValue({});
      // ----------------------------------------------------------------
      const key = await getApiKey();
      expect(key).toBeNull();
    });
  });
});
