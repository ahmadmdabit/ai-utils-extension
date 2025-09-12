import { describe, it, expect } from 'vitest';

// This is the function from the content script. We test it directly.
function scrapeTextContent(): string {
  // This function relies on the global `document` object.
  return document.body.innerText;
}

describe('scrapeTextContent function', () => {
  it('should return the innerText of the document body', () => {
    // Set up the mock document before calling the function
    const originalDocument = global.document;
    global.document = {
      body: {
        innerText: 'This is the test content of the page.',
      },
    } as Document;

    // Call the function
    const result = scrapeTextContent();

    // Assert the result
    expect(result).toBe('This is the test content of the page.');

    // Restore the original document
    global.document = originalDocument;
  });

  it('should return an empty string if the body has no text', () => {
    // Set up the mock document
    const originalDocument = global.document;
    global.document = {
      body: {
        innerText: '',
      },
    } as Document;

    const result = scrapeTextContent();

    expect(result).toBe('');

    // Restore
    global.document = originalDocument;
  });
});
