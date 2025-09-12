// src/background/scrapers.test.ts
import { describe, it, expect, afterEach } from 'vitest';
import { JSDOM } from 'jsdom';
import { getHeadings, getLinks, getTables } from './scrapers';

describe('DOM Scrapers', () => {
  // Clean up the DOM after each test to ensure isolation
  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('getHeadings', () => {
    it('should extract h1, h2, and h3 elements', () => {
      document.body.innerHTML = '<h1>Title 1</h1><h2>Subtitle 2</h2><h3>Section 3</h3><h4>Ignore H4</h4>';
      const headings = getHeadings();
      expect(headings).toEqual(['Title 1', 'Subtitle 2', 'Section 3']);
    });
  });

  describe('getLinks', () => {
    it('should extract links with href and text, ignoring javascript links', () => {
      // Set up JSDOM with a base URL for this specific test
      const dom = new JSDOM(
        `<body>
          <a href="/page1">Page 1</a>
          <a href="https://example.com">Example</a>
          <a href="javascript:void(0)">JS Link</a>
          <a>No Href</a>
        </body>`,
        { url: 'http://localhost:3000' }
      );
      global.document = dom.window.document;

      const links = getLinks();
      expect(links).toEqual([
        { text: 'Page 1', href: 'http://localhost:3000/page1' },
        { text: 'Example', href: 'https://example.com/' },
      ]);
    });
  });

  describe('getTables', () => {
    it('should extract data from a simple table', () => {
      document.body.innerHTML = `
        <table>
          <tr><th>Name</th><th>Age</th></tr>
          <tr><td>Alice</td><td>30</td></tr>
          <tr><td>Bob</td><td>25</td></tr>
        </table>
      `;
      const tables = getTables();
      expect(tables).toEqual([
        [
          ['Name', 'Age'],
          ['Alice', '30'],
          ['Bob', '25'],
        ],
      ]);
    });
  });
});