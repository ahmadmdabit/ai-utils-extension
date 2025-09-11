// src/types/messaging.ts
export interface StartProcessingPayload {
  tabs: number[];
  operations: string[];
}

export interface TaskResult {
  tabId: number;
  operation: string;
  result: string;
  tabTitle: string;
}

export interface TaskError {
  tabId: number;
  operation: string;
  error: string;
  tabTitle: string;
}

export type Message =
  | { type: 'START_PROCESSING'; payload: StartProcessingPayload }
  | { type: 'TASK_COMPLETE'; payload: TaskResult }
  | { type: 'TASK_ERROR'; payload: TaskError };
