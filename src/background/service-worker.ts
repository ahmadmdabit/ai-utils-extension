// src/background/service-worker.ts
import type { Message } from '../types/messaging';

console.log('Service Worker Loaded');

// A simple in-memory queue for our tasks
const taskQueue: { tabId: number; operation: string }[] = [];
let isProcessing = false;

// Listen for the initial panel open action
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Main message listener
chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse) => {
    console.log('Received message:', message);

    if (message.type === 'START_PROCESSING') {
      const { tabs, operations } = message.payload;

      // Create individual tasks and add them to the queue
      for (const tabId of tabs) {
        for (const operation of operations) {
          taskQueue.push({ tabId, operation });
        }
      }

      console.log('Current task queue:', taskQueue);
      sendResponse({ status: 'queued', queueLength: taskQueue.length });

      // Start processing the queue if it's not already running
      if (!isProcessing) {
        processQueue();
      }
    }

    // Return true to indicate you wish to send a response asynchronously
    return true;
  },
);

// This is the function that will be injected.
// It's defined here for clarity, but its source is what's used.
function getPageContent() {
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
      const results = await chrome.scripting.executeScript({
        target: { tabId: task.tabId },
        func: getPageContent,
      });

      if (results && results.length > 0) {
        const pageContent = results[0].result;
        console.log(
          `Content extracted from tab ${task.tabId} (first 100 chars):`,
          pageContent?.substring(0, 100),
        );
        // In Phase 3, we will send this 'pageContent' to the Gemini API.
      }
    } catch (error) {
      console.error(`Failed to extract content from tab ${task.tabId}:`, error);
    }
  }

  setTimeout(processQueue, 200);
}
