import { describe, it, expect } from 'vitest';
import { parseLinkedInPage } from './scrapers';

// Mock HTML content for a LinkedIn job search results page
const mockLinkedInHTML = `
  <html>
    <head>
      <title>('Software Engineer') | LinkedIn</title>
    </head>
    <body>
      <ul class="jobs-search__results-list">
        <li data-occludable-job-id="12345">
          <a class="job-card-container__link" href="/jobs/view/12345">Software Engineer</a>
          <div class="artdeco-entity-lockup__subtitle">
            <span>Tech Corp</span>
          </div>
          <ul class="artdeco-entity-lockup__caption">
            <li>San Francisco, CA</li>
          </ul>
          <div class="job-card-list__logo">
            <img src="/company-logo.png" alt="Tech Corp logo" />
          </div>
          <div class="job-card-container__footer-item">Easy Apply</div>
        </li>
        <li data-occludable-job-id="67890">
          <a class="job-card-container__link" href="/jobs/view/67890">Product Manager</a>
          <div class="artdeco-entity-lockup__subtitle">
            <span>Innovate LLC</span>
          </div>
          <ul class="artdeco-entity-lockup__caption">
            <li>New York, NY</li>
          </ul>
           <div class="job-card-container__job-insight-text">15 connections work here</div>
        </li>
      </ul>
      <div class="results-context-header__job-count">1,234 results</div>
    </body>
  </html>
`;

describe('LinkedIn Scrapers', () => {
  it('should parse the main search query and total results', () => {
    const result = parseLinkedInPage(mockLinkedInHTML);
    expect(result.searchQuery).toBe("('Software Engineer') | LinkedIn");
    expect(result.totalResults).toBe(1234);
  });

  it('should parse all job listings correctly', () => {
    const result = parseLinkedInPage(mockLinkedInHTML);
    expect(result.jobs).toHaveLength(2);

    // Check first job
    expect(result.jobs[0].id).toBe('12345');
    expect(result.jobs[0].title).toBe('Software Engineer');
    expect(result.jobs[0].company).toBe('Tech Corp');
    expect(result.jobs[0].location).toBe('San Francisco, CA');
    expect(result.jobs[0].link).toBe('/jobs/view/12345');
    expect(result.jobs[0].image).toBe('/company-logo.png');
    expect(result.jobs[0].statuses).toEqual(['Easy Apply']);

    // Check second job
    expect(result.jobs[1].title).toBe('Product Manager');
    expect(result.jobs[1].company).toBe('Innovate LLC');
    expect(result.jobs[1].connections).toBe(15);
  });

  it('should handle HTML with no job listings gracefully', () => {
    const emptyHTML =
      '<html><head><title>No Jobs | LinkedIn</title></head><body></body></html>';
    const result = parseLinkedInPage(emptyHTML);
    expect(result.jobs).toEqual([]);
    expect(result.totalResults).toBe(0);
    expect(result.searchQuery).toBe('No Jobs | LinkedIn');
  });
});
