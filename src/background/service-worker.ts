// src/background/service-worker.ts
import type { Message } from '../types/messaging';
import { processText } from '../services/geminiService';

console.log('Service Worker Loaded');

const taskQueue: { tabId: number; operation: string; tabTitle: string }[] = [];
let isProcessing = false;

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse) => {
    if (message.type === 'START_PROCESSING') {
      const { tabs, operations } = message.payload;

      chrome.tabs.query({}, (allTabs) => {
        for (const tabId of tabs) {
          const tab = allTabs.find((t) => t.id === tabId);
          if (tab) {
            for (const operation of operations) {
              taskQueue.push({
                tabId,
                operation,
                tabTitle: tab.title || 'Untitled',
              });
            }
          }
        }
        console.log('Current task queue:', taskQueue);
        sendResponse({ status: 'queued', queueLength: taskQueue.length });
        if (!isProcessing) processQueue();
      });
    }
    return true;
  },
);

function getPageContent(): string {
  return document.body.innerText;
}

async function processQueue() {
  if (taskQueue.length === 0) {
    isProcessing = false;
    console.log('Queue finished.');
    return;
  }

  isProcessing = true;
  const task = taskQueue.shift();

  if (task) {
    console.log(`Processing task: ${task.operation} on tab ${task.tabId}`);
    try {
      const scriptResults = await chrome.scripting.executeScript({
        target: { tabId: task.tabId },
        func: getPageContent,
      });

      if (scriptResults && scriptResults.length > 0) {
        const pageContent = scriptResults[0].result;
        const apiResult = await processText(task.operation, pageContent!);

        chrome.runtime.sendMessage({
          type: 'TASK_COMPLETE',
          payload: { ...task, result: apiResult },
        });
      }
    } catch (error: unknown) {
      console.error(`Task failed for tab ${task.tabId}:`, error);

      // type guard to safely access the message
      let errorMessage = 'An unknown error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      chrome.runtime.sendMessage({
        type: 'TASK_ERROR',
        payload: { ...task, error: errorMessage },
      });
    }
  }

  setTimeout(processQueue, 1000); // Increased delay for API rate limits
}
