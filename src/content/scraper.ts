// src/content/scraper.ts

// This function will be executed in the context of the target web page.
// It must be self-contained and not rely on any external scope.
export function scrapeTextContent(): string {
  // A simple way to get the visible text content of a page.
  // This can be improved later to be more sophisticated (e.g., using readability.js).
  return document.body.innerText;
}

// We need to respond with the result of the function execution.
scrapeTextContent();
