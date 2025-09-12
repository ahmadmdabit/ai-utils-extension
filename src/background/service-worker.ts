import type { Message, Task } from '../types/messaging';
import { processText } from '../services/geminiService';

console.log('Service Worker Loaded');

let isProcessing = false;
const taskQueue: Task[] = [];

// --- Processor for the default, non-combined workflow ---
async function processSimpleQueue() {
  if (taskQueue.length === 0) {
    isProcessing = false;
    console.log('Simple queue finished.');
    return;
  }
  isProcessing = true;
  const task = taskQueue.shift();
  if (task) {
    chrome.runtime.sendMessage({
      type: 'TASK_STARTED',
      payload: { taskId: task.taskId },
    });
    try {
      const content =
        (
          await chrome.scripting.executeScript({
            target: { tabId: task.tabId },
            func: () => document.body.innerText,
          })
        )?.[0]?.result || '';
      const targetLanguage =
        task.languageOption === 'custom'
          ? task.customLanguage
          : task.languageOption;
      const result = await processText(task.operation, content, targetLanguage);
      chrome.runtime.sendMessage({
        type: 'TASK_COMPLETE',
        payload: { ...task, status: 'complete', result },
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred.';
      chrome.runtime.sendMessage({
        type: 'TASK_ERROR',
        payload: { ...task, status: 'error', error: errorMessage },
      });
    }
  }
  setTimeout(processSimpleQueue, 1000);
}

// --- Processor for the new, clean "Combine" workflow ---
async function processCombinedBatch(batch: Task[]) {
  isProcessing = true;
  console.log('Processing combined batch...');

  const intermediateResults = await Promise.all(
    batch.map(async (task) => {
      try {
        const content =
          (
            await chrome.scripting.executeScript({
              target: { tabId: task.tabId },
              func: () => document.body.innerText,
            })
          )?.[0]?.result || '';
        const targetLanguage =
          task.languageOption === 'custom'
            ? task.customLanguage
            : task.languageOption;
        const result = await processText(
          task.operation,
          content,
          targetLanguage,
        );
        return { ...task, status: 'complete', result };
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'An unknown error occurred.';
        return { ...task, status: 'error', error: errorMessage };
      }
    }),
  );

  const opsToCombine = new Set(batch.map((t) => t.operation));
  for (const operation of opsToCombine) {
    const relevantTasks = intermediateResults.filter(
      (t) => t.operation === operation && t.status === 'complete',
    );
    if (relevantTasks.length > 1) {
      const combinedTaskId = `combined-${operation}`;
      const combinedTask: Task = {
        taskId: combinedTaskId,
        tabId: 0,
        operation,
        tabTitle: `Combining ${operation}...`,
        status: 'processing',
        isCombinedResult: true,
      };
      chrome.runtime.sendMessage({
        type: 'TASK_STARTED',
        payload: { taskId: combinedTaskId },
      });

      try {
        const textsToCombine = relevantTasks.map((t) => t.result!);
        const targetLanguage =
          batch[0].languageOption === 'custom'
            ? batch[0].customLanguage
            : batch[0].languageOption;

        const [finalResult, generatedTitle] = await Promise.all([
          processText(operation, textsToCombine, targetLanguage),
          processText('generate-title', textsToCombine),
        ]);

        chrome.runtime.sendMessage({
          type: 'TASK_COMPLETE',
          payload: {
            ...combinedTask,
            status: 'complete',
            result: finalResult,
            tabTitle: generatedTitle.replace(/"/g, ''),
          },
        });
      } catch (error: unknown) {
        const errorMessage =
          error instanceof Error ? error.message : 'An unknown error occurred.';
        chrome.runtime.sendMessage({
          type: 'TASK_ERROR',
          payload: { ...combinedTask, status: 'error', error: errorMessage },
        });
      }
    } else if (relevantTasks.length === 1) {
      chrome.runtime.sendMessage({
        type: 'TASK_COMPLETE',
        payload: relevantTasks[0],
      });
    }
  }
  isProcessing = false;
  console.log('Combined batch finished.');
}

// --- The Main Router ---
chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse) => {
    if (message.type === 'START_PROCESSING') {
      const { tabs, operations, combineResults, ...options } = message.payload;

      chrome.tabs.query({}, (allTabs) => {
        const initialTasks: Task[] = [];
        for (const tabId of tabs) {
          const tab = allTabs.find((t) => t.id === tabId);
          if (tab) {
            for (const operation of operations) {
              const taskId = `${tabId}-${operation}`;
              initialTasks.push({
                taskId,
                tabId,
                operation,
                tabTitle: tab.title || 'Untitled',
                status: 'pending',
                ...options,
              });
            }
          }
        }

        // Only send initial tasks to UI if we are NOT combining
        if (!combineResults) {
          chrome.runtime.sendMessage({
            type: 'ALL_TASKS_QUEUED',
            payload: { tasks: initialTasks },
          });
        }
        sendResponse({ status: 'queued' });

        if (!isProcessing) {
          if (combineResults && initialTasks.length > 1) {
            processCombinedBatch(initialTasks);
          } else {
            taskQueue.push(...initialTasks);
            processSimpleQueue();
          }
        }
      });
    }
    return true;
  },
);
