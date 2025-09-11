// src/services/chromeService.ts
import type { Message } from '../types/messaging';

/**
 * Sends a message to the service worker.
 * @param message - The message object to send.
 */
export function sendMessageToServiceWorker(message: Message): void {
  chrome.runtime.sendMessage(message, (response) => {
    if (chrome.runtime.lastError) {
      console.error('Error sending message:', chrome.runtime.lastError.message);
    } else {
      console.log('Service worker responded:', response);
    }
  });
}

export async function setApiKey(apiKey: string): Promise<void> {
  await chrome.storage.local.set({ geminiApiKey: apiKey });
}

export async function getApiKey(): Promise<string | null> {
  const result = await chrome.storage.local.get('geminiApiKey');
  return result.geminiApiKey || null;
}
