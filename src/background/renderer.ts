import sanitizeHtml from 'sanitize-html';
import type { LinkedInPageData, Job } from '../types/messaging';

// Import the static template files as raw strings
import reportCss from './../templates/report.css?raw';
import reportJs from './../templates/report.js?raw';

function renderJob(job: Job): string {
  // Sanitize dynamic content to prevent XSS
  const safeId = sanitizeHtml(job.id);
  const safeTitle = sanitizeHtml(job.title);
  const safeCompany = sanitizeHtml(job.company);
  const safeLocation = sanitizeHtml(job.location);
  const safeInsights = sanitizeHtml(job.insights);
  const safeImage = sanitizeHtml(job.image || '');
  // const safeLink = sanitizeHtml(job.link);
  const imageHtml = safeImage
    ? `<img src="${safeImage}" alt="${safeCompany} logo">`
    : '<div style="width:50px; height:50px; background:#121212; border-radius:4px;"></div>';
  const linkHtml = `https://www.linkedin.com/jobs/view/${safeId}`;
  const statusBadgesHtml = job.statuses
    .map((s) => `<span class="job-status">${sanitizeHtml(s)}</span>`)
    .join('');

  return `
    <div class="job-card">
      ${imageHtml}
      <div class="job-details">
        <a href="${linkHtml}" target="_blank" class="job-title">${safeTitle}</a>
        <p class="job-company">${safeCompany}</p>
        <p class="job-location">${safeLocation}</p>
        ${job.connections ? `<p class="insights">Connections: ${job.connections}</p>` : ''}
        ${safeInsights ? `<p class="insights">${safeInsights}</p>` : ''}
      </div>
      <div class="job-status-wrapper">${statusBadgesHtml}</div>
    </div>
  `;
}

export function renderLinkedInDataToHtml(data: LinkedInPageData): string {
  // Sanitize the top-level data
  const safeQuery = sanitizeHtml(data.searchQuery)?.replaceAll(/\|/g, '-');
  const safeTotal = sanitizeHtml(data.totalResults.toString());

  // Create the initial HTML for the jobs list
  const initialJobsHtml = data.jobs.map(renderJob).join('');

  // Inject the dynamic data into the static template
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>LinkedIn Job Search Results: ${safeQuery}</title>
      <style>${reportCss}</style>
    </head>
    <body>
      <div class="container">
        <h1>${safeQuery}</h1>
        <p>${safeTotal} results found.</p>
        
        <!-- Filter Panel -->
        <div class="filters">
          <input type="text" id="searchInput" placeholder="Search titles, companies or location" />
          <select id="statusSelect">
            <option value="">All Statuses</option>
            <option value="Easy Apply">Easy Apply</option>
            <option value="Promoted">Promoted</option>
            <option value="Applied">Applied</option>
            <option value="Viewed">Viewed</option>
          </select>
          <select id="titleSelect">
            <option value="">All Titles</option>
          </select>
          <select id="companySelect">
            <option value="">All Companies</option>
          </select>
          <select id="locationSelect">
            <option value="">All Locations</option>
          </select>
          <input type="number" id="minConnections" placeholder="Min Connections" min="0" />
          <label class="checkbox-label"><input type="checkbox" id="hideApplied" /> Hide Applied</label>
          <label class="checkbox-label"><input type="checkbox" id="hideViewed" /> Hide Viewed</label>
          <select id="sortSelect">
            <option value="">Sort By</option>
            <option value="title">Title (A-Z)</option>
            <option value="company">Company (A-Z)</option>
            <option value="location">Location (A-Z)</option>
            <option value="connections">Connections (High-Low)</option>
          </select>
          <button id="applyFilterBtn">Apply Filters</button>
          <button id="clearFilterBtn">Clear Filters</button>
          <span id="resultsCount"></span>
        </div>
        
        <!-- Jobs Container -->
        <div class="jobs-container" id="jobsContainer">
          <h2>Jobs</h2>
          ${initialJobsHtml}
        </div>
      </div>

      <script>
        // Inject the raw data for the client-side script to use
        window.rawData = ${JSON.stringify(data)};
      </script>
      <script>${reportJs}</script>
    </body>
    </html>
  `;
}
