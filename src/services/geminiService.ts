import { getApiKey } from './chromeService';
import { GeminiApiError } from '../utils/errors';

const API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

function getPromptForOperation(operation: string, text: string): string {
  switch (operation) {
    case 'summarize':
      return `Please provide a concise summary of the following text:\n\n${text}`;
    case 'translate':
      return `Translate the following text to English:\n\n${text}`;
    case 'custom':
      // For custom prompts, the text is already the full prompt
      return text;
    // Add more scrape operations later
    default:
      // For scrape operations like 'helpful', the operation is the prompt itself
      if (operation.startsWith('Extract')) {
        return `${operation}:\n\n${text}`;
      }
      return text;
  }
}

export async function processText(
  operation: string,
  text: string,
): Promise<string> {
  const apiKey = await getApiKey();
  if (!apiKey) {
    throw new GeminiApiError(
      'API Key not found. Please set it in the settings.',
      401,
    );
  }

  const prompt = getPromptForOperation(operation, text);

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
