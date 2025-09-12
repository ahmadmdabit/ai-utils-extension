// src/services/geminiService.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { processText } from './geminiService';
import * as chromeService from './chromeService';

vi.mock('./chromeService');

describe('geminiService', () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw an error if API key is not found', async () => {
    vi.mocked(chromeService.getApiKey).mockResolvedValue(null);
    await expect(processText('summarize', 'text')).rejects.toThrow('API Key not found');
  });

  it('should return processed text on a successful API call', async () => {
    vi.mocked(chromeService.getApiKey).mockResolvedValue('VALID_KEY');
    const mockResponse = { candidates: [{ content: { parts: [{ text: 'Summary' }] } }] };
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => mockResponse } as Response);
    const result = await processText('summarize', 'text');
    expect(result).toBe('Summary');
  });

  it('should throw a GeminiApiError on a failed API call', async () => {
    vi.mocked(chromeService.getApiKey).mockResolvedValue('VALID_KEY');
    const mockError = { error: { message: 'Invalid key' } };
    vi.mocked(fetch).mockResolvedValue({ ok: false, status: 400, json: async () => mockError } as Response);
    await expect(processText('summarize', 'text')).rejects.toThrow('Invalid key');
  });

  // --- NEW TESTS FOR 100% COVERAGE ---
  it('should throw a GeminiApiError if API returns no candidates', async () => {
    vi.mocked(chromeService.getApiKey).mockResolvedValue('VALID_KEY');
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({}) } as Response);
    await expect(processText('summarize', 'text')).rejects.toThrow('No content received from the API.');
  });

  it('should construct the correct prompt for "translate"', async () => {
    vi.mocked(chromeService.getApiKey).mockResolvedValue('VALID_KEY');
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: '' }] } }] }) } as Response);
    await processText('translate', 'hello');
    const requestBody = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
    expect(requestBody.contents[0].parts[0].text).toContain('Translate the following text to English');
  });

  it('should pass the full prompt for "custom"', async () => {
    vi.mocked(chromeService.getApiKey).mockResolvedValue('VALID_KEY');
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: '' }] } }] }) } as Response);
    await processText('custom', 'My custom prompt');
    const requestBody = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
    expect(requestBody.contents[0].parts[0].text).toBe('My custom prompt');
  });

  it('should construct the correct prompt for "helpful" scrape option', async () => {
    vi.mocked(chromeService.getApiKey).mockResolvedValue('VALID_KEY');
    vi.mocked(fetch).mockResolvedValue({ ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: '' }] } }] }) } as Response);
    await processText('Extract helpful information from the following text, formatted nicely:', 'page content');
    const requestBody = JSON.parse(vi.mocked(fetch).mock.calls[0][1]?.body as string);
    expect(requestBody.contents[0].parts[0].text).toContain('Extract helpful information from the following text, formatted nicely:');
  });
});