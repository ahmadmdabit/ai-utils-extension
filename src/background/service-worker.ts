import type { Message, Task, ScrapeOption } from '../types/messaging';
import { processText } from '../services/geminiService';
import { getHeadings, getLinks, getTables } from './scrapers';

console.log('Service Worker Loaded');

const taskQueue: Task[] = [];
let isProcessing = false;

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// --- UPDATE onMessage LISTENER ---
chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse) => {
    if (message.type === 'START_PROCESSING') {
      const { tabs, operations, scrapeOption, customPrompt } = message.payload;
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
                scrapeOption: operation === 'scrape' ? scrapeOption : undefined,
                customPrompt: operation === 'scrape' ? customPrompt : undefined,
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

// --- NEW HELPER FUNCTION FOR DOM SCRAPING ---
async function executeDomScrape(
  tabId: number,
  option: ScrapeOption,
): Promise<string> {
  let funcToInject: () => unknown;

  switch (option) {
    case 'headings':
      funcToInject = getHeadings;
      break;
    case 'links':
      funcToInject = getLinks;
      break;
    case 'tables':
      funcToInject = getTables;
      break;
    default:
      return 'Invalid DOM scrape option.';
  }

  const results = await chrome.scripting.executeScript({
    target: { tabId },
    func: funcToInject,
  });

  if (results && results.length > 0) {
    // Format the result for nice display
    return JSON.stringify(results[0].result, null, 2);
  }
  return 'No data found.';
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
      let apiResult: string;

      if (task.operation === 'scrape' && task.scrapeOption) {
        // --- SCRAPE LOGIC ---
        switch (task.scrapeOption) {
          case 'helpful':
            const contentForHelpfulResult =
              await chrome.scripting.executeScript({
                target: { tabId: task.tabId },
                func: () => document.body.innerText,
              });
            const contentForHelpful =
              contentForHelpfulResult && contentForHelpfulResult[0]
                ? contentForHelpfulResult[0].result || ''
                : '';
            apiResult = await processText(
              'Extract helpful information from the following text, formatted nicely:',
              contentForHelpful,
            );
            break;
          case 'custom':
            const contentForCustomResult = await chrome.scripting.executeScript(
              {
                target: { tabId: task.tabId },
                func: () => document.body.innerText,
              },
            );
            const contentForCustom =
              contentForCustomResult && contentForCustomResult[0]
                ? contentForCustomResult[0].result || ''
                : '';
            const prompt = `${task.customPrompt || ''}:

${contentForCustom}`;
            apiResult = await processText('custom', prompt); // Use a generic operation name
            break;
          default: // headings, links, tables
            apiResult = await executeDomScrape(
              task.tabId,
              task.scrapeOption || 'helpful',
            );
            break;
        }
      } else {
        // --- ORIGINAL LOGIC for Summarize/Translate ---
        const scriptResults = await chrome.scripting.executeScript({
          target: { tabId: task.tabId },
          func: () => document.body.innerText,
        });
        const pageContent =
          scriptResults && scriptResults[0]
            ? scriptResults[0].result || ''
            : '';
        apiResult = await processText(task.operation, pageContent);
      }

      chrome.runtime.sendMessage({
        type: 'TASK_COMPLETE',
        payload: { ...task, status: 'complete', result: apiResult },
      });
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
