export interface StartProcessingPayload {
  tabs: number[];
  operations: string[];
}

// A new, comprehensive Task type
export interface Task {
  taskId: string; // Unique ID for each task
  tabId: number;
  operation: string;
  tabTitle: string;
  status: 'pending' | 'processing' | 'complete' | 'error';
  result?: string;
  error?: string;
}

export type Message =
  | { type: 'START_PROCESSING'; payload: StartProcessingPayload }
  | { type: 'ALL_TASKS_QUEUED'; payload: { tasks: Task[] } }
  | { type: 'TASK_STARTED'; payload: { taskId: string } }
  | { type: 'TASK_COMPLETE'; payload: Task }
  | { type: 'TASK_ERROR'; payload: Task };
