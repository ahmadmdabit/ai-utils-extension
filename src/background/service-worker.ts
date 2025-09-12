// src/background/service-worker.ts
import type { Message, Task, GeminiModel } from '../types/messaging';
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
  model?: GeminiModel,
  language?: string,
): Promise<Task> {
  const content = await getContent(task.tabId);
  const summary = await processText('summarize', content, model);
  const translatedSummary = await processText(
    'translate',
    summary,
    model,
    language,
  );
  return { ...task, status: 'complete', result: translatedSummary };
}

async function runDualLangSummaryPipeline(
  task: Task,
  model?: GeminiModel,
  language?: string,
): Promise<Task> {
  const content = await getContent(task.tabId);
  const summary = await processText('summarize', content, model);
  const translatedSummary = await processText(
    'translate',
    summary,
    model,
    language,
  );
  const dualLangResult = `--- Original Summary ---\n${summary}\n\n--- Translated Summary (${language}) ---\n${translatedSummary}`;
  return { ...task, status: 'complete', result: dualLangResult };
}

// --- The main router that decides which pipeline to run ---
async function processPipelineForTab(task: Task): Promise<Task> {
  const { operation, tabId, languageOption, customLanguage, selectedModel } =
    task;
  const targetLanguage =
    languageOption === 'custom' ? customLanguage : languageOption;
  try {
    switch (operation) {
      case 'summarize':
      case 'translate':
      case 'scrape': {
        const content = await getContent(tabId);
        const result = await processText(
          operation,
          content,
          selectedModel,
          targetLanguage,
        );
        return { ...task, status: 'complete', result };
      }
      case 'translated-summary':
        return runTranslatedSummaryPipeline(
          task,
          selectedModel,
          targetLanguage,
        );
      case 'dual-lang-summary':
        return runDualLangSummaryPipeline(task, selectedModel, targetLanguage);
      default:
        throw new Error(`Unknown pipeline: ${operation}`);
    }
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    return { ...task, status: 'error', error: errorMessage };
  }
}

// --- The main processing logic ---
let isProcessing = false;

// --- EXPORTED SETTER FOR TESTING ---
export function setIsProcessing(value: boolean) {
  isProcessing = value;
}

async function processBatch(tasks: Task[]) {
  setIsProcessing(true);
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
  setIsProcessing(false);
  console.log('Batch finished.');
}

// --- EXPORT THE LISTENER FOR TESTING ---
export const messageListener = (
  message: Message,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void,
): boolean => {
  if (message.type === 'START_PROCESSING') {
    const { tabs, pipeline, ...options } = message.payload;

    // Wrap the callback-based API in a promise to make the listener fully async
    new Promise<chrome.tabs.Tab[]>((resolve) => {
      chrome.tabs.query({}, (tabs) => resolve(tabs));
    }).then((allTabs) => {
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
        processBatch(initialTasks);
      }
    });
  }
  return true; // Indicate that sendResponse will be called asynchronously
};

// --- The top-level code now just registers the exported listener ---
chrome.runtime.onMessage.addListener(messageListener);
