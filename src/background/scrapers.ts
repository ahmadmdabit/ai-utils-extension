import { parse } from 'node-html-parser';
import type { HTMLElement } from 'node-html-parser';
import type {
  Job,
  Insights,
  Company,
  LinkedInPageData,
} from '../types/messaging';

// These functions are designed to be injected into a webpage,
// so they must be self-contained.

export function getHeadings() {
  const headings = Array.from(document.querySelectorAll('h1, h2, h3'));
  return headings.map((h) => (h.textContent || '').trim()).filter(Boolean);
}

export function getLinks() {
  const links = Array.from(document.querySelectorAll('a[href]'));
  return links
    .map((a) => ({
      text: (a.textContent || '').trim(),
      href: (a as HTMLAnchorElement).href,
    }))
    .filter(
      (item) => item.text && item.href && !item.href.startsWith('javascript:'),
    );
}

export function getTables() {
  const tables = Array.from(document.querySelectorAll('table'));
  return tables.map((table) => {
    const rows = Array.from(table.querySelectorAll('tr'));
    return rows.map((row) => {
      const cells = Array.from(row.querySelectorAll('td, th'));
      return cells.map((cell) => (cell.textContent || '').trim());
    });
  });
}

// --- LINKEDIN PARSING LOGIC (REFACTORED FOR node-html-parser) ---

// Note: These functions now accept an HTMLElement object from the library.
function parseJobs(root: HTMLElement): Job[] {
  const jobs: Job[] = [];
  const jobElements = root.querySelectorAll('li[data-occludable-job-id]');
  jobElements.forEach((elem) => {
    const id = elem.getAttribute('data-occludable-job-id') || '';
    const aElem = elem.querySelector('a.job-card-container__link');
    const title = aElem?.textContent?.trim() || ''; // removeDuplicatePhrases
    const link = aElem?.getAttribute('href') || '';
    const company =
      elem
        .querySelector('.artdeco-entity-lockup__subtitle span')
        ?.textContent?.trim() || '';
    const location =
      elem
        .querySelector('.artdeco-entity-lockup__caption li')
        ?.textContent?.trim() || '';
    const image =
      elem.querySelector('.job-card-list__logo img')?.getAttribute('src') || '';
    const insightsText =
      elem
        .querySelector('.job-card-container__job-insight-text')
        ?.textContent?.trim() || '';
    const connectionsMatch = insightsText.match(/(\d+)\sconnections?/);
    const connections = connectionsMatch
      ? parseInt(connectionsMatch[1], 10)
      : null;
    const statuses: string[] = [];
    elem
      .querySelectorAll('.job-card-container__footer-item')
      .forEach((statusElem) => {
        const statusText = statusElem.textContent?.trim();
        if (
          statusText?.includes('Viewed') ||
          statusText?.includes('Applied') ||
          statusText?.includes('Promoted') ||
          statusText?.includes('Easy Apply')
        ) {
          statuses.push(statusText);
        }
      });

    if (id && title && company) {
      jobs.push({
        id,
        image,
        title,
        company,
        location,
        statuses,
        link,
        insights: insightsText,
        connections,
      });
    }
  });
  return jobs;
}

function parseInsights(root: HTMLElement): Insights {
  const insightsNodes = root.querySelectorAll(
    '.jobs-premium-applicant-insights__list-num',
  );
  const totalApplicants = parseInt(
    insightsNodes[0]?.textContent?.trim() || '0',
    10,
  );
  const applicantsPastDay = parseInt(
    insightsNodes[1]?.textContent?.trim() || '0',
    10,
  );
  const competitors: string[] = [];
  root
    .querySelectorAll('.aiq-jobs-premium-company-insights__competitor-item a')
    .forEach((elem) => {
      const href = elem.getAttribute('href');
      if (href) competitors.push(href);
    });
  return { totalApplicants, applicantsPastDay, competitors };
}

function parseCompany(root: HTMLElement): Company {
  const name =
    root.querySelector('.jobs-company__box h2')?.textContent?.trim() || '';
  const description =
    root
      .querySelector('.jobs-company__company-description')
      ?.textContent?.trim() || '';
  const headcountGrowth =
    root
      .querySelector('.jobs-premium-company-growth__stat-item p')
      ?.textContent?.trim() || '';
  return { name, description, headcountGrowth };
}

// This is the main exported function that the service worker will call.
export function parseLinkedInPage(html: string): LinkedInPageData {
  // --- THIS IS THE FIX: Use the library's parse function ---
  const root = parse(html);
  // -------------------------------------------------------

  const jobs = parseJobs(root);
  const insights = parseInsights(root);
  const company = parseCompany(root);

  const totalResultsMatch = html.match(/(\d+,?_?\d*)\sresults/);
  const totalResults = totalResultsMatch
    ? parseInt(totalResultsMatch[1].replace(/[,_]/g, ''), 10)
    : 0;
  const searchQuery =
    root.querySelector('title')?.textContent || 'LinkedIn Job Search';

  return { searchQuery, totalResults, jobs, insights, company };
}
