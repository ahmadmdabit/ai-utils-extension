import { getApiKey } from './chromeService';
import { GeminiApiError } from '../utils/errors';

const API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

function getPromptForOperation(
  operation: string,
  text: string,
  language?: string,
): string {
  switch (operation) {
    case 'summarize':
      return `Please provide a concise summary of the following text:

${text}`;
    case 'translate':
      // Use the provided language, default to English
      const targetLanguage = language || 'English';
      return `Translate the following text to ${targetLanguage}:

${text}`;
    case 'custom':
      // For custom prompts, the text is already the full prompt
      return text;
    // Add more scrape operations later
    default:
      // For scrape operations like 'helpful', the operation is the prompt itself
      if (operation.startsWith('Extract')) {
        return `${operation}:

${text}`;
      }
      return text;
  }
}

function getSynthesisPrompt(
  operation: string,
  texts: string[],
  language?: string,
): string {
  const joinedTexts = texts.map(
    (text, i) => `--- Document ${i + 1} ---
${text}`,
  ).join(`

`);

  switch (operation) {
    case 'summarize':
      return `Based on the following documents, create a single, cohesive synthesis that identifies the key themes, any conflicting information, and the overall conclusion.

${joinedTexts}`;
    case 'translate':
      const targetLanguage = language || 'English';
      return `Translate each of the following documents to ${targetLanguage}, keeping them clearly separated.

${joinedTexts}`;
    default:
      return `Combine and present the following information in a clear, structured format:

${joinedTexts}`;
  }
}

function getTitleGenerationPrompt(texts: string[]): string {
  const joinedTexts = texts.map(
    (text, i) => `--- Document ${i + 1} ---
${text}`,
  ).join(`

`);
  return `Based on the following documents, generate a short, appropriate title (less than 10 words) that summarizes the main topic.

${joinedTexts}`;
}

// Update processText to handle the new 'generate-title' operation
export async function processText(
  operation: string,
  text: string | string[],
  language?: string,
): Promise<string> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new GeminiApiError(
      'API Key not found. Please set it in the settings.',
      401,
    );
  }

  let prompt: string;
  if (operation === 'generate-title' && Array.isArray(text)) {
    prompt = getTitleGenerationPrompt(text);
  } else if (Array.isArray(text)) {
    prompt = getSynthesisPrompt(operation, text, language);
  } else {
    prompt = getPromptForOperation(operation, text, language);
  }

  const response = await fetch(`${API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    const errorMessage =
      errorData.error?.message || 'An unknown API error occurred.';
    throw new GeminiApiError(errorMessage, response.status);
  }

  const data = await response.json();

  if (data.candidates && data.candidates.length > 0) {
    return data.candidates[0].content.parts[0].text;
  }

  throw new GeminiApiError('No content received from the API.', 500);
}
