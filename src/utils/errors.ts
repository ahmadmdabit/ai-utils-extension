export class GeminiApiError extends Error {
  // 1. Declare the property explicitly
  public status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'GeminiApiError';
    // 2. Assign it in the constructor body
    this.status = status;
  }
}
