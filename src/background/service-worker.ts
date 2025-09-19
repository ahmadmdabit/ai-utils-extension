import type {
  Message,
  Task,
  PipelineOperation,
  StartProcessingPayload,
} from '../types/messaging';
import { processText } from '../services/geminiService';
import { getTimeoutSetting } from '../services/chromeService';
import { pipelines } from './pipelines';
import { parseLinkedInPage } from './scrapers';
import { renderLinkedInDataToHtml } from './renderer';

console.log('Service Worker Loaded');

let isProcessing = false;
let workflowAbortController: AbortController | null = null;
let workflowTimeoutId: NodeJS.Timeout | null = null;

export function setIsProcessing(value: boolean) {
  isProcessing = value;
}

async function getContent(tabId: number): Promise<string> {
  // For LinkedIn, we need the full HTML, not just innerText
  const tab = await chrome.tabs.get(tabId);
  if (tab.url && tab.url.includes('linkedin.com/jobs/search')) {
    console.log(`[DEBUG] Getting full HTML for LinkedIn tab ${tabId}`);
    const results = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => document.documentElement.outerHTML,
    });
    return results?.[0]?.result || '';
  }
  // For all other pages, get the simple text content
  console.log(`[DEBUG] Getting innerText for tab ${tabId}`);
  const results = await chrome.scripting.executeScript({
    target: { tabId },
    func: () => document.body.innerText,
  });
  return results?.[0]?.result || '';
}

async function runWorkflow(
  payload: StartProcessingPayload,
  signal: AbortSignal,
) {
  console.log('[DEBUG] Starting runWorkflow with payload:', payload);
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
    const contentResults = await Promise.all(
      tabs.map((tabId) => getContent(tabId)),
    );
    if (signal.aborted) throw new Error('Workflow cancelled by user.');
    tabs.forEach((tabId, index) => {
      workflowState[`content_${tabId}`] = contentResults[index];
    });

    // Step 2: Execute the defined pipeline steps sequentially.
    for (const step of pipelineSteps) {
      if (signal.aborted) throw new Error('Workflow cancelled by user.');
      const inputsForThisStep = tabs.map(
        (tabId) => workflowState[`${step.input}_${tabId}`],
      );

      const stepResults: string[] = [];
      for (const [index, input] of inputsForThisStep.entries()) {
        if (signal.aborted) throw new Error('Workflow cancelled by user.');

        let result: string;
        // --- THIS IS THE FIX: Special handling for LinkedIn scrape ---
        if (
          step.name === 'scrape' &&
          options.scrapeOption === 'linkedin-jobs'
        ) {
          console.log(
            `[DEBUG] Executing LinkedIn Page Parser for tab ${tabs[index]}`,
          );
          const parsedData = parseLinkedInPage(input);
          // --- THIS IS THE FIX: Check the output format ---
          if (options.outputFormat === 'html') {
            result = renderLinkedInDataToHtml(parsedData);
            // Open in new tab
            chrome.tabs.create({
              url: 'data:text/html;charset=UTF-8,' + encodeURIComponent(result),
            });
            // chrome.windows.create({
            //   url: 'data:text/html;charset=UTF-8,' + encodeURIComponent(result),
            //   type: 'popup',
            //   width: 500,
            //   height: 600,
            // });
          } else {
            // Default to JSON
            result = JSON.stringify(parsedData, null, 2);
          }
          // -------------------------------------------------
        } else {
          // Original logic for all other operations
          result = await processText(
            step.name,
            input,
            options.selectedModel,
            options.languageOption === 'custom'
              ? options.customLanguage
              : options.languageOption,
            signal,
          );
        }
        // -----------------------------------------------------------
        stepResults.push(result);
      }

      tabs.forEach((tabId, index) => {
        workflowState[`${step.output}_${tabId}`] = stepResults[index];
      });
    }

    // Step 3: Format the final output.
    console.log(
      `[DEBUG] Formatting final output, combineResults: ${combineResults}, tabs.length: ${tabs.length}`,
    );
    let finalResult: string;
    let finalTitle = `Processed: ${pipeline}`;

    if (combineResults && tabs.length > 1) {
      console.log(`[DEBUG] Combining results for ${tabs.length} tabs`);
      const summaryKey = pipelines[pipeline][0]?.output;
      const translationKey = pipelines[pipeline][1]?.output;

      if (pipeline === 'dual-lang-summary' && summaryKey && translationKey) {
        console.log(`[DEBUG] Processing dual-lang-summary pipeline`);
        const combinedSummary = await processText(
          'synthesize',
          tabs.map((t) => workflowState[`${summaryKey}_${t}`]),
          options.selectedModel,
          undefined,
          signal,
        );
        const combinedTranslation = await processText(
          'synthesize',
          tabs.map((t) => workflowState[`${translationKey}_${t}`]),
          options.selectedModel,
          undefined,
          signal,
        );
        finalResult = `--- Original Combined Summary ---\n${combinedSummary}\n\n--- Translated Combined Summary ---\n${combinedTranslation}`;
        console.log(
          `[DEBUG] Dual-lang-summary result lengths - Summary: ${combinedSummary.length}, Translation: ${combinedTranslation.length}`,
        );
      } else {
        console.log(`[DEBUG] Processing regular synthesis pipeline`);
        const finalStepOutputKey =
          pipelineSteps[pipelineSteps.length - 1].output;
        const textsToSynthesize = tabs.map(
          (tabId) => workflowState[`${finalStepOutputKey}_${tabId}`],
        );
        finalResult = await processText(
          'synthesize',
          textsToSynthesize,
          options.selectedModel,
          options.languageOption === 'custom'
            ? options.customLanguage
            : options.languageOption,
          signal,
        );
        console.log(`[DEBUG] Synthesis result length: ${finalResult.length}`);
      }

      const contentArray = tabs.map(
        (tabId) => workflowState[`content_${tabId}`],
      );
      finalTitle = await processText(
        'generate-title',
        getTitleGenerationPrompt(contentArray),
        options.selectedModel,
        undefined,
        signal,
      );
      console.log(`[DEBUG] Generated title: ${finalTitle}`);
    } else {
      console.log(`[DEBUG] Not combining results, processing individually`);
      if (pipeline === 'dual-lang-summary') {
        console.log(`[DEBUG] Processing dual-lang-summary individually`);
        const summaryKey = pipelines[pipeline][0].output;
        const translationKey = pipelines[pipeline][1].output;
        finalResult = tabs
          .map(
            (tabId) =>
              `--- Tab: ${tabId} ---\nOriginal: ${workflowState[`${summaryKey}_${tabId}`]}\nTranslated: ${workflowState[`${translationKey}_${tabId}`]}`,
          )
          .join('\\n\\n');
        console.log(
          `[DEBUG] Individual dual-lang-summary result length: ${finalResult.length}`,
        );
      } else {
        console.log(`[DEBUG] Processing regular pipeline individually`);
        const finalStepOutputKey =
          pipelineSteps[pipelineSteps.length - 1].output;
        finalResult = tabs
          .map((tabId) => workflowState[`${finalStepOutputKey}_${tabId}`])
          .join('\\n\\n---\\n\\n');
        console.log(`[DEBUG] Individual result length: ${finalResult.length}`);
      }

      if (tabs.length === 1) {
        console.log(`[DEBUG] Single tab, getting tab title`);
        const tab = await chrome.tabs.get(tabs[0]);
        finalTitle = tab.title || `Processed: ${pipeline}`;
        console.log(`[DEBUG] Tab title: ${finalTitle}`);
      }
    }

    console.log(
      `[DEBUG] Sending TASK_COMPLETE message with result length: ${finalResult.length}`,
    );
    // For individual results (not combined), we need to send a separate message for each tab
    if (!combineResults && tabs.length > 0) {
      for (let i = 0; i < tabs.length; i++) {
        const tabId = tabs[i];
        const tab = await chrome.tabs.get(tabId);
        const tabTitle =
          tabs.length === 1
            ? tab.title || `Processed: ${pipeline}`
            : `Tab ${i + 1}: ${tab.title || 'Untitled'}`;
        chrome.runtime.sendMessage({
          type: 'TASK_COMPLETE',
          payload: {
            taskId: `workflow-${pipeline}-${tabId}`,
            tabId: tabId,
            operation: pipeline as PipelineOperation,
            tabTitle: tabTitle.replace(/\"/g, ''),
            status: 'complete',
            result: finalResult.split('\n\n---\n\n')[i] || finalResult,
            isCombinedResult: false,
            selectedModel: options.selectedModel,
          },
        });
      }
    } else {
      // For combined results or single tab, send one final message
      chrome.runtime.sendMessage({
        type: 'TASK_COMPLETE',
        payload: {
          taskId: `final-${pipeline}`,
          tabId: 0,
          operation: pipeline as PipelineOperation,
          tabTitle: finalTitle.replace(/\"/g, ''),
          status: 'complete',
          result: finalResult,
          isCombinedResult: combineResults,
          selectedModel: options.selectedModel,
        },
      });
    }
  } catch (error: unknown) {
    console.error('[DEBUG] Workflow error:', error);
    let errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred.';
    if (error instanceof DOMException && error.name === 'AbortError') {
      errorMessage = 'Process cancelled or timed out.';
    }
    console.log(
      `[DEBUG] Sending TASK_ERROR message with error: ${errorMessage}`,
    );
    chrome.runtime.sendMessage({
      type: 'TASK_ERROR',
      payload: {
        taskId: `error-${pipeline}`,
        tabId: 0,
        operation: pipeline as PipelineOperation,
        tabTitle: 'Workflow Error',
        status: 'error',
        error: errorMessage,
      },
    });
  } finally {
    console.log('[DEBUG] Cleaning up workflow resources');
    if (workflowTimeoutId) {
      console.log('[DEBUG] Clearing timeout');
      clearTimeout(workflowTimeoutId);
    }
    workflowAbortController = null;
    workflowTimeoutId = null;
    setIsProcessing(false);
    console.log('[DEBUG] Workflow completed and cleaned up');
  }
}

export const messageListener = async (
  message: Message,
  _sender: chrome.runtime.MessageSender,
  sendResponse: (response?: unknown) => void,
): Promise<void> => {
  console.log('[DEBUG] messageListener received message:', message);
  if (message.type === 'START_PROCESSING') {
    if (isProcessing) {
      console.warn('[DEBUG] A process is already running.');
      sendResponse({ status: 'busy' });
      return;
    }

    workflowAbortController = new AbortController();
    const signal = workflowAbortController.signal;

    try {
      const timeoutSeconds = await getTimeoutSetting();
      console.log(`[DEBUG] Setting timeout to ${timeoutSeconds} seconds`);
      workflowTimeoutId = setTimeout(() => {
        console.log(
          `[DEBUG] Workflow timed out after ${timeoutSeconds} seconds.`,
        );
        workflowAbortController?.abort();
      }, timeoutSeconds * 1000);

      console.log('[DEBUG] Querying tabs');
      const allTabs = await new Promise<chrome.tabs.Tab[]>((resolve) => {
        chrome.tabs.query({}, (tabs) => resolve(tabs));
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

      console.log(
        `[DEBUG] Sending ALL_TASKS_QUEUED message with ${initialTasks.length} tasks`,
      );
      chrome.runtime.sendMessage({
        type: 'ALL_TASKS_QUEUED',
        payload: { tasks: initialTasks },
      });
      sendResponse({ status: 'queued' });

      await runWorkflow(message.payload, signal);
    } catch (error: unknown) {
      console.error(
        '[DEBUG] CRITICAL: Unhandled error in messageListener workflow:',
        error,
      );
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'A critical unknown error occurred.';
      chrome.runtime.sendMessage({
        type: 'TASK_ERROR',
        payload: {
          taskId: `error-critical-${Date.now()}`,
          tabId: 0,
          operation: message.payload.pipeline,
          tabTitle: 'Critical Workflow Error',
          status: 'error',
          error: errorMessage,
        },
      });
      setIsProcessing(false);
    }
  } else if (message.type === 'CANCEL_PROCESSING') {
    console.log('[DEBUG] Cancellation requested.');
    if (workflowAbortController) {
      workflowAbortController.abort();
    }
  }
};

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  messageListener(message, sender, sendResponse);
  return true;
});

function getTitleGenerationPrompt(texts: string[]): string {
  const joinedTexts = texts
    .map(
      (text, i) => `--- Document ${i + 1} ---
${text}`,
    )
    .join('\n\n');
  return `Based on the following documents, generate a short, appropriate title (less than 10 words) that summarizes the main topic.\n\n${joinedTexts}`;
}
