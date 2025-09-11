import type { Message, Task } from '../types/messaging';
import { processText } from '../services/geminiService';

console.log('Service Worker Loaded');

const taskQueue: Task[] = [];
let isProcessing = false;

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse) => {
    if (message.type === 'START_PROCESSING') {
      const { tabs, operations } = message.payload;
      taskQueue.length = 0; // Clear any previous queue

      chrome.tabs.query({}, (allTabs) => {
        const initialTasks: Task[] = [];
        for (const tabId of tabs) {
          const tab = allTabs.find((t) => t.id === tabId);
          if (tab) {
            for (const operation of operations) {
              const taskId = `${tabId}-${operation}`;
              const task: Task = {
                taskId,
                tabId,
                operation,
                tabTitle: tab.title || 'Untitled',
                status: 'pending',
              };
              initialTasks.push(task);
              taskQueue.push(task);
            }
          }
        }

        // **NEW**: Send the entire list of pending tasks to the UI
        chrome.runtime.sendMessage({
          type: 'ALL_TASKS_QUEUED',
          payload: { tasks: initialTasks },
        });

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

    // **NEW**: Notify UI that this specific task has started
    chrome.runtime.sendMessage({
      type: 'TASK_STARTED',
      payload: { taskId: task.taskId },
    });

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
          payload: { ...task, status: 'complete', result: apiResult },
        });
      }
    } catch (error: unknown) {
      let errorMessage = 'An unknown error occurred.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error(`Task failed for tab ${task.tabId}:`, error);
      chrome.runtime.sendMessage({
        type: 'TASK_ERROR',
        payload: { ...task, status: 'error', error: errorMessage },
      });
    }
  }

  setTimeout(processQueue, 1000);
}
