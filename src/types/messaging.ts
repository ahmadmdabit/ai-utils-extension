export type ScrapeOption =
  | 'helpful'
  | 'headings'
  | 'links'
  | 'tables'
  | 'custom';

export type LanguageOption = 'Turkish' | 'Arabic' | 'English' | 'custom';
// --- NEW: Define the available pipelines ---
export type PipelineOperation =
  | 'summarize'
  | 'translate'
  | 'scrape'
  | 'translated-summary'
  | 'dual-lang-summary';

export interface StartProcessingPayload {
  tabs: number[];
  pipeline: PipelineOperation; // <-- REPLACES 'operations'
  scrapeOption: ScrapeOption;
  customPrompt?: string;
  languageOption: LanguageOption;
  customLanguage?: string;
  // 'combineResults' (for tabs) is still relevant
  combineResults: boolean;
}

// A new, comprehensive Task type
export interface Task {
  taskId: string; // Unique ID for each task
  tabId: number;
  operation: PipelineOperation; // <-- Use the new type
  tabTitle: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  result?: string;
  error?: string;
  // Add scrape-specific data to the task
  scrapeOption?: ScrapeOption;
  customPrompt?: string;
  languageOption?: LanguageOption;
  customLanguage?: string;
  isCombinedResult?: boolean; // <-- ADD: To flag the final synthesized result
}

export type Message =
  | { type: 'START_PROCESSING'; payload: StartProcessingPayload }
  | { type: 'ALL_TASKS_QUEUED'; payload: { tasks: Task[] } }
  | { type: 'TASK_STARTED'; payload: { taskId: string } }
  | { type: 'TASK_COMPLETE'; payload: Task }
  | { type: 'TASK_ERROR'; payload: Task };
