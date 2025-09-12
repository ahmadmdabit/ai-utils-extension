export type ScrapeOption =
  | 'helpful'
  | 'headings'
  | 'links'
  | 'tables'
  | 'custom';

export type LanguageOption = 'Turkish' | 'Arabic' | 'English' | 'custom';

export type PipelineOperation =
  | 'summarize'
  | 'translate'
  | 'scrape'
  | 'translated-summary'
  | 'dual-lang-summary';

// --- NEW: Define the available models ---
export type GeminiModel =
  | 'gemini-2.5-pro'
  | 'gemini-2.5-flash'
  | 'gemini-2.5-flash-lite';

export interface StartProcessingPayload {
  tabs: number[];
  pipeline: PipelineOperation;
  scrapeOption: ScrapeOption;
  customPrompt?: string;
  languageOption: LanguageOption;
  customLanguage?: string;
  combineResults: boolean;
  selectedModel: GeminiModel; // <-- ADD
}

// A new, comprehensive Task type
export interface Task {
  taskId: string; // Unique ID for each task
  tabId: number;
  operation: PipelineOperation;
  tabTitle: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  result?: string;
  error?: string;
  // Add scrape-specific data to the task
  scrapeOption?: ScrapeOption;
  customPrompt?: string;
  languageOption?: LanguageOption;
  customLanguage?: string;
  isCombinedResult?: boolean;
  selectedModel?: GeminiModel; // <-- ADD
}

export type Message =
  | { type: 'START_PROCESSING'; payload: StartProcessingPayload }
  | { type: 'ALL_TASKS_QUEUED'; payload: { tasks: Task[] } }
  | { type: 'TASK_STARTED'; payload: { taskId: string } }
  | { type: 'TASK_COMPLETE'; payload: Task }
  | { type: 'TASK_ERROR'; payload: Task };
