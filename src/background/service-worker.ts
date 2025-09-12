import type { Message, Task } from '../types/messaging';
import { processText } from '../services/geminiService';

console.log('Service Worker Loaded');

// --- Helper function to get page content ---
async function getContent(tabId: number): Promise<string> {
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => document.body.innerText,
  });
  return results?.[0]?.result || '';
}

// --- Specific Pipeline Implementations ---

async function runTranslatedSummaryPipeline(
  task: Task,
  language?: string,
): Promise<Task> {
  const content = await getContent(task.tabId);
  const summary = await processText('summarize', content);
  const translatedSummary = await processText('translate', summary, language);
  return { ...task, status: 'complete', result: translatedSummary };
}

async function runDualLangSummaryPipeline(
  task: Task,
  language?: string,
): Promise<Task> {
  const content = await getContent(task.tabId);
  const summary = await processText('summarize', content);
  const translatedSummary = await processText('translate', summary, language);

  const dualLangResult = `--- Original Summary ---\n${summary}\n\n--- Translated Summary (${language}) ---\n${translatedSummary}`;
  return { ...task, status: 'complete', result: dualLangResult };
}

// --- The main router that decides which pipeline to run ---
async function processPipelineForTab(task: Task): Promise<Task> {
  const { operation, tabId, languageOption, customLanguage } = task;
  const targetLanguage =
    languageOption === 'custom' ? customLanguage : languageOption;

  try {
    switch (operation) {
      case 'summarize':
      case 'translate':
      case 'scrape': {
        // Simple, one-step pipelines
        const content = await getContent(tabId);
        const result = await processText(operation, content, targetLanguage);
        return { ...task, status: 'complete', result };
      }
      case 'translated-summary':
        return runTranslatedSummaryPipeline(task, targetLanguage);

      case 'dual-lang-summary':
        return runDualLangSummaryPipeline(task, targetLanguage);

      default:
        throw new Error(`Unknown pipeline: ${operation}`);
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return { ...task, status: 'error', error: errorMessage };
  }
}

// --- The main processing logic now loops through tabs and calls the pipeline processor ---
let isProcessing = false;

async function processBatch(tasks: Task[]) {
  isProcessing = true;
  for (const task of tasks) {
    chrome.runtime.sendMessage({
      type: 'TASK_STARTED',
      payload: { taskId: task.taskId },
    });
    const finalTask = await processPipelineForTab(task);
    const messageType =
      finalTask.status === 'complete' ? 'TASK_COMPLETE' : 'TASK_ERROR';
    chrome.runtime.sendMessage({ type: messageType, payload: finalTask });
  }
  isProcessing = false;
  console.log('Batch finished.');
}

// The onMessage listener is now much simpler
chrome.runtime.onMessage.addListener(
  (message: Message, _sender, sendResponse) => {
    if (message.type === 'START_PROCESSING') {
      const { tabs, pipeline, ...options } = message.payload;

      chrome.tabs.query({}, (allTabs) => {
        const initialTasks: Task[] = [];
        for (const tabId of tabs) {
          const tab = allTabs.find((t) => t.id === tabId);
          if (tab) {
            initialTasks.push({
              taskId: `${tabId}-${pipeline}`,
              tabId,
              operation: pipeline,
              tabTitle: tab.title || 'Untitled',
              status: 'pending',
              ...options,
            });
          }
        }

        chrome.runtime.sendMessage({
          type: 'ALL_TASKS_QUEUED',
          payload: { tasks: initialTasks },
        });
        sendResponse({ status: 'queued' });

        if (!isProcessing) {
          // For now, we ignore "Combine Tabs" for this new pipeline logic to keep it simple.
          // We would add that logic back here if needed.
          processBatch(initialTasks);
        }
      });
    }
    return true;
  },
);
