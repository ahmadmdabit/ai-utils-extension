// src/types/messaging.ts
export interface StartProcessingPayload {
  tabs: number[];
  operations: string[];
}

export interface Message {
  type: 'START_PROCESSING';
  payload: StartProcessingPayload;
}
