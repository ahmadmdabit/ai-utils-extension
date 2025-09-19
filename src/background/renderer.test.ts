import { describe, it, expect } from 'vitest';
import { renderLinkedInDataToHtml } from './renderer';
import type { LinkedInPageData } from '../types/messaging';

const mockData: LinkedInPageData = {
  searchQuery: 'Software Engineer | LinkedIn',
  totalResults: 1,
  jobs: [
    {
      id: '123',
      title: 'Frontend Developer',
      company: 'Tech Solutions',
      location: 'Remote',
      link: '/jobs/view/123',
      image: 'logo.png',
      statuses: ['Easy Apply'],
      insights: '10 connections work here',
      connections: 10,
    },
  ],
  insights: { totalApplicants: 50, applicantsPastDay: 5, competitors: [] },
  company: {
    name: 'Tech Solutions',
    description: 'A great place to work',
    headcountGrowth: '10%',
  },
};

describe('renderLinkedInDataToHtml', () => {
  it('should generate a valid HTML report from LinkedIn data', () => {
    const html = renderLinkedInDataToHtml(mockData);

    // Basic checks for structure and content
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain(
      '<title>LinkedIn Job Search Results: Software Engineer - LinkedIn</title>',
    );
    expect(html).toContain('<h1>Software Engineer - LinkedIn</h1>');
    expect(html).toContain('<p>1 results found.</p>');
    expect(html).toContain('class="job-card"');
    expect(html).toContain('Frontend Developer');
    expect(html).toContain('Tech Solutions');
    expect(html).toContain('window.rawData');
  });

  // it('should correctly sanitize HTML-sensitive characters in the data', () => {
  //   const maliciousData: LinkedInPageData = {
  //     ...mockData,
  //     searchQuery: '<script>alert("XSS")</script>',
  //     jobs: [
  //       {
  //         ...mockData.jobs[0],
  //         title: '<h1>Evil Corp</h1>',
  //       },
  //     ],
  //   };

  //   const html = renderLinkedInDataToHtml(maliciousData);

  //   // Check that malicious tags are escaped and not rendered as HTML
  //   expect(html).not.toContain('<script>alert("XSS")</script>');
  //   expect(html).toContain('&lt;script&gt;alert("XSS")&lt;/script&gt;');
  //   expect(html).not.toContain('<h1>Evil Corp</h1>');
  //   expect(html).toContain('&lt;h1&gt;Evil Corp&lt;/h1&gt;');
  // });
});
