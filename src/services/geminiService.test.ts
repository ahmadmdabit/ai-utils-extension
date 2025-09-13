import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { processText } from './geminiService';
import * as chromeService from './chromeService';
import { GeminiApiError } from '../utils/errors';

// Mock dependencies
vi.mock('./chromeService');

describe('geminiService', () => {
  const getApiKeyMock = vi.spyOn(chromeService, 'getApiKey');
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = fetchMock;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should throw GeminiApiError if API key is not found', async () => {
    getApiKeyMock.mockResolvedValue(null);
    await expect(processText('summarize', 'test')).rejects.toThrow(
      new GeminiApiError(
        'API Key not found. Please set it in the settings.',
        401,
      ),
    );
  });

  it('should process text successfully with the default model', async () => {
    getApiKeyMock.mockResolvedValue('test-api-key');
    const mockResponse = {
      candidates: [{ content: { parts: [{ text: 'summary text' }] } }],
    };
    fetchMock.mockResolvedValue({ ok: true, json: async () => mockResponse });

    const result = await processText('summarize', 'some long text');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=test-api-key',
      expect.any(Object),
    );
    expect(result).toBe('summary text');
  });

  it('should use the specified model in the API URL', async () => {
    getApiKeyMock.mockResolvedValue('test-api-key');
    const mockResponse = {
      candidates: [{ content: { parts: [{ text: 'pro summary' }] } }],
    };
    fetchMock.mockResolvedValue({ ok: true, json: async () => mockResponse });

    await processText('summarize', 'some long text', 'gemini-2.5-pro');

    expect(fetchMock).toHaveBeenCalledWith(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=test-api-key',
      expect.any(Object),
    );
  });

  it('should throw GeminiApiError on a failed API response with a standard error message', async () => {
    getApiKeyMock.mockResolvedValue('test-api-key');
    const errorResponse = { error: { message: 'Invalid API key' } };
    fetchMock.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => errorResponse,
    });

    await expect(processText('summarize', 'test')).rejects.toThrow(
      new GeminiApiError('Invalid API key', 400),
    );
  });

  it('should throw GeminiApiError with a default message for unknown API errors', async () => {
    getApiKeyMock.mockResolvedValue('test-api-key');
    fetchMock.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    });

    await expect(processText('summarize', 'test')).rejects.toThrow(
      new GeminiApiError('An unknown API error occurred.', 500),
    );
  });

  it('should throw GeminiApiError if no candidates are returned', async () => {
    getApiKeyMock.mockResolvedValue('test-api-key');
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ candidates: [] }),
    });

    await expect(processText('summarize', 'test')).rejects.toThrow(
      new GeminiApiError('No content received from the API.', 500),
    );
  });

  describe('Prompt Generation Logic', () => {
    beforeEach(() => {
      getApiKeyMock.mockResolvedValue('test-api-key');
      const mockResponse = {
        candidates: [{ content: { parts: [{ text: 'ok' }] } }],
      };
      fetchMock.mockResolvedValue({ ok: true, json: async () => mockResponse });
    });

    it('should use getSynthesisPrompt for array input (summarize)', async () => {
      await processText('summarize', ['text1', 'text2']);
      const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(requestBody.contents[0].parts[0].text).toContain(
        'cohesive synthesis',
      );
    });

    it('should use getSynthesisPrompt for array input (translate)', async () => {
      await processText(
        'translate',
        ['text1', 'text2'],
        'gemini-2.5-flash-lite',
        'German',
      );
      const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(requestBody.contents[0].parts[0].text).toContain(
        'Translate each of the following documents to German',
      );
    });

    it("should use getTitleGenerationPrompt for 'generate-title' operation", async () => {
      await processText('generate-title', ['text1', 'text2']);
      const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(requestBody.contents[0].parts[0].text).toContain(
        'generate a short, appropriate title',
      );
    });

    it('should use getPromptForOperation for string input (translate)', async () => {
      await processText(
        'translate',
        'hello',
        'gemini-2.5-flash-lite',
        'Spanish',
      );
      const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(requestBody.contents[0].parts[0].text).toContain(
        'Translate the following text to Spanish',
      );
    });

    it('should create a prompt for an "Extract" operation', async () => {
      // This test specifically targets line 33
      await processText('Extract all links from the page', 'some html content');

      const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      const expectedPrompt = 'Extract all links from the page:\n\nsome html content';

      expect(requestBody.contents[0].parts[0].text).toBe(expectedPrompt);
    });

    it('should use the default synthesis prompt for other array operations', async () => {
      // This test specifically targets line 56
      await processText('scrape', ['data chunk 1', 'data chunk 2']);

      const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);

      expect(requestBody.contents[0].parts[0].text).toContain(
        'Combine and present the following information in a clear, structured format:'
      );
      expect(requestBody.contents[0].parts[0].text).toContain('--- Document 1 ---\ndata chunk 1');
      expect(requestBody.contents[0].parts[0].text).toContain('--- Document 2 ---\ndata chunk 2');
    });

    it('should default to English for translation if no language is provided', async () => {
      await processText(
        'translate',
        'hello',
        'gemini-2.5-flash-lite',
        undefined,
      );
      const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(requestBody.contents[0].parts[0].text).toContain(
        'Translate the following text to English',
      );
    });

    it('should handle the default case in getSynthesisPrompt', async () => {
      await processText('other', ['text1', 'text2']);
      const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(requestBody.contents[0].parts[0].text).toContain(
        'Combine and present the following information',
      );
    });

    it('should handle the extract operation in getPromptForOperation', async () => {
      await processText('Extract something', 'some text');
      const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(requestBody.contents[0].parts[0].text).toContain(
        'Extract something',
      );
    });

    it('should handle another extract operation variation', async () => {
      await processText('Extract Links', 'some html');
      const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(requestBody.contents[0].parts[0].text).toBe(
        'Extract Links:\n\nsome html',
      );
    });

    it('should correctly join documents for synthesis translation', async () => {
      await processText(
        'translate',
        ['hello', 'world'],
        'gemini-2.5-flash-lite',
        'French',
      );
      const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      const expectedPrompt = `Translate each of the following documents to French, keeping them clearly separated.\n\n--- Document 1 ---\nhello\n\n--- Document 2 ---\nworld`;
      expect(requestBody.contents[0].parts[0].text).toBe(expectedPrompt);
    });

    it('should handle the custom prompt operation', async () => {
      await processText('custom', 'This is a custom prompt');
      const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(requestBody.contents[0].parts[0].text).toBe(
        'This is a custom prompt',
      );
    });

    it('should handle the default case in getPromptForOperation', async () => {
      await processText('some-other-op', 'some text');
      const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(requestBody.contents[0].parts[0].text).toBe('some text');
    });
  });

  // Additional tests for 100% coverage
  describe('Helper Function Tests', () => {
    beforeEach(() => {
      getApiKeyMock.mockResolvedValue('test-api-key');
      const mockResponse = {
        candidates: [{ content: { parts: [{ text: 'ok' }] } }],
      };
      fetchMock.mockResolvedValue({ ok: true, json: async () => mockResponse });
    });

    it('should handle getTitleGenerationPrompt with empty array', async () => {
      await processText('generate-title', []);
      const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(requestBody.contents[0].parts[0].text).toContain(
        'generate a short, appropriate title',
      );
    });

    it('should handle getTitleGenerationPrompt with single document', async () => {
      await processText('generate-title', ['single document']);
      const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(requestBody.contents[0].parts[0].text).toContain('Document 1');
    });

    it('should handle getSynthesisPrompt with empty array', async () => {
      await processText('other', []);
      const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(requestBody.contents[0].parts[0].text).toContain(
        'Combine and present the following information'
      );
    });

    it('should handle getSynthesisPrompt with single document', async () => {
      await processText('other', ['single document']);
      const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(requestBody.contents[0].parts[0].text).toContain('Document 1');
    });

    it('should handle getPromptForOperation with summarize operation', async () => {
      await processText('summarize', 'text to summarize');
      const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(requestBody.contents[0].parts[0].text).toContain(
        'Please provide a concise summary'
      );
    });

    it('should handle getPromptForOperation with translate operation and default language', async () => {
      await processText('translate', 'text to translate');
      const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(requestBody.contents[0].parts[0].text).toContain(
        'Translate the following text to English'
      );
    });
  });

  // Edge case tests
  describe('Edge Cases', () => {
    it('should handle processText with empty string input', async () => {
      getApiKeyMock.mockResolvedValue('test-api-key');
      const mockResponse = {
        candidates: [{ content: { parts: [{ text: 'result' }] } }],
      };
      fetchMock.mockResolvedValue({ ok: true, json: async () => mockResponse });

      const result = await processText('summarize', '');
      expect(result).toBe('result');
    });

    it('should handle processText with empty array input', async () => {
      getApiKeyMock.mockResolvedValue('test-api-key');
      const mockResponse = {
        candidates: [{ content: { parts: [{ text: 'result' }] } }],
      };
      fetchMock.mockResolvedValue({ ok: true, json: async () => mockResponse });

      const result = await processText('summarize', []);
      expect(result).toBe('result');
    });
  });
});
