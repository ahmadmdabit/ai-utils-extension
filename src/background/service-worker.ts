// src/background/service-worker.ts
import type { Message, Task, PipelineOperation, StartProcessingPayload } from '../types/messaging';
import { processText } from '../services/geminiService';
import { pipelines } from './pipelines';

console.log('Service Worker Loaded');

let isProcessing = false;

export function setIsProcessing(value: boolean) {
  isProcessing = value;
}

async function getContent(tabId: number): Promise<string> {
  const results = await chrome.scripting.executeScript({ target: { tabId }, func: () => document.body.innerText });
  return results?.[0]?.result || '';
}

async function runWorkflow(payload: StartProcessingPayload) {
  setIsProcessing(true);
  const { pipeline, tabs, combineResults, ...options } = payload;
  const pipelineSteps = pipelines[pipeline];

  if (!pipelineSteps) {
    console.error(`Unknown pipeline: ${pipeline}`);
    setIsProcessing(false);
    return;
  }

  const workflowState: Record<string, string> = {};

  try {
    // Step 1: Get content for all tabs in parallel.
    const contentResults = await Promise.all(tabs.map(tabId => getContent(tabId)));
    tabs.forEach((tabId, index) => {
      workflowState[`content_${tabId}`] = contentResults[index];
    });

    // Step 2: Execute the defined pipeline steps sequentially for each tab.
    for (const step of pipelineSteps) {
      const inputsForThisStep = tabs.map(tabId => workflowState[`${step.input}_${tabId}`]);
      
      const stepResults: string[] = [];
      for (const input of inputsForThisStep) {
        const result = await processText(step.name, input, options.selectedModel, options.languageOption === 'custom' ? options.customLanguage : options.languageOption);
        stepResults.push(result);
      }

      tabs.forEach((tabId, index) => {
        workflowState[`${step.output}_${tabId}`] = stepResults[index];
      });
    }

    // Step 3: Format the final output based on the results from the pipeline.
    let finalResult: string;
    let finalTitle = `Processed: ${pipeline}`;

    if (combineResults && tabs.length > 1) {
      // --- Combined Logic ---
      const summaryKey = pipelines[pipeline][0]?.output; // e.g., 'summary'
      const translationKey = pipelines[pipeline][1]?.output; // e.g., 'translation'

      if (pipeline === 'dual-lang-summary' && summaryKey && translationKey) {
        const combinedSummary = await processText('synthesize', tabs.map(t => workflowState[`${summaryKey}_${t}`]), options.selectedModel);
        const combinedTranslation = await processText('synthesize', tabs.map(t => workflowState[`${translationKey}_${t}`]), options.selectedModel);
        finalResult = `--- Original Combined Summary ---\n${combinedSummary}\n\n--- Translated Combined Summary ---\n${combinedTranslation}`;
      } else {
        // Generic synthesis for single-step pipelines (like summarize, translate)
        const finalStepOutputKey = pipelineSteps[pipelineSteps.length - 1].output;
        const textsToSynthesize = tabs.map(tabId => workflowState[`${finalStepOutputKey}_${tabId}`]);
        finalResult = await processText('synthesize', textsToSynthesize, options.selectedModel, options.languageOption === 'custom' ? options.customLanguage : options.languageOption);
      }

      // Title generation is always the last step for combined results.
      const contentArray = tabs.map(tabId => workflowState[`content_${tabId}`]);
      finalTitle = await processText('generate-title', getTitleGenerationPrompt(contentArray), options.selectedModel);

    } else {
      // --- Non-Combined Logic ---
      if (pipeline === 'dual-lang-summary') {
        const summaryKey = pipelines[pipeline][0].output;
        const translationKey = pipelines[pipeline][1].output;
        finalResult = tabs.map(tabId => `--- Tab: ${tabId} ---\nOriginal: ${workflowState[`${summaryKey}_${tabId}`]}\nTranslated: ${workflowState[`${translationKey}_${tabId}`]}`).join('\n\n');
      } else {
        const finalStepOutputKey = pipelineSteps[pipelineSteps.length - 1].output;
        finalResult = tabs.map(tabId => workflowState[`${finalStepOutputKey}_${tabId}`]).join('\n\n---\n\n');
      }

      if (tabs.length === 1) {
        const tab = await chrome.tabs.get(tabs[0]);
        finalTitle = tab.title || `Processed: ${pipeline}`;
      }
    }

    chrome.runtime.sendMessage({
      type: 'TASK_COMPLETE',
      payload: {
        taskId: `final-${pipeline}`, tabId: 0, operation: pipeline as PipelineOperation,
        tabTitle: finalTitle.replace(/"/g, ''),
        status: 'complete', result: finalResult, isCombinedResult: combineResults,
      },
    });

  } catch (error: unknown) {
    console.error('Workflow error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    chrome.runtime.sendMessage({
      type: 'TASK_ERROR',
      payload: {
        taskId: `error-${pipeline}`, tabId: 0, operation: pipeline as PipelineOperation,
        tabTitle: 'Workflow Error', status: 'error', error: errorMessage,
      },
    });
  }
  setIsProcessing(false);
}

// --- THIS IS THE FIX: Make the listener async and await the promise ---
export const messageListener = async (message: Message, _sender: chrome.runtime.MessageSender, sendResponse: (response?: unknown) => void): Promise<void> => {
  if (message.type === 'START_PROCESSING') {
    if (isProcessing) {
      console.warn("A process is already running.");
      sendResponse({ status: 'busy' });
      return;
    }

    try {
      const allTabs = await new Promise<chrome.tabs.Tab[]>(resolve => {
        chrome.tabs.query({}, tabs => resolve(tabs));
      });

      const initialTasks: Task[] = [];
      for (const tabId of message.payload.tabs) {
        const tab = allTabs.find((t) => t.id === tabId);
        if (tab) {
          initialTasks.push({
            taskId: `workflow-${message.payload.pipeline}-${tabId}`,
            tabId,
            operation: message.payload.pipeline,
            tabTitle: 'Workflow starting...',
            status: 'pending',
          });
        }
      }

      chrome.runtime.sendMessage({ type: 'ALL_TASKS_QUEUED', payload: { tasks: initialTasks } });
      sendResponse({ status: 'queued' });

      // Now runWorkflow is part of the main async flow
      await runWorkflow(message.payload);
    } catch (error: unknown) {
      // This is the global safety net. Any unhandled error from runWorkflow will be caught here.
      console.error("CRITICAL: Unhandled error in messageListener workflow:", error);
      const errorMessage = error instanceof Error ? error.message : 'A critical unknown error occurred.';
      chrome.runtime.sendMessage({
        type: 'TASK_ERROR',
        payload: {
          taskId: `error-critical-${Date.now()}`, tabId: 0, operation: message.payload.pipeline,
          tabTitle: 'Critical Workflow Error', status: 'error', error: errorMessage,
        },
      });
      // Ensure processing is always reset on a critical failure
      setIsProcessing(false);
    }
  }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  messageListener(message, sender, sendResponse);
  return true; // Still return true for asynchronous sendResponse
});

function getTitleGenerationPrompt(texts: string[]): string {
  const joinedTexts = texts.map((text, i) => `--- Document ${i + 1} ---\n${text}`).join('\n\n');
  return `Based on the following documents, generate a short, appropriate title (less than 10 words) that summarizes the main topic.\n\n${joinedTexts}`;
}