// Note: This is plain JS, not TypeScript, as it will be injected directly.

// The rawData object will be injected into the HTML before this script runs.
let filteredJobs = [...window.rawData.jobs];

function renderFilteredJobs(jobsList) {
  const container = document.getElementById('jobsContainer');
  if (!container) return;

  const jobsHtml = jobsList
    .map((job) => {
      const imageHtml = job.image
        ? `<img src="${job.image}" alt="${job.company} logo">`
        : '<div style="width:50px; height:50px; background:#121212; border-radius:4px;"></div>';
      const link = `https://www.linkedin.com/jobs/view/${job.id}`;
      const statusBadges = job.statuses
        .map((j) => `<span class="job-status">${j}</span>`)
        .join('');
      const connectionsHtml = job.connections
        ? `<p class="insights">Connections: ${job.connections}</p>`
        : '';
      const insightsHtml = job.insights
        ? `<p class="insights">${job.insights}</p>`
        : '';

      return `<div class="job-card">${imageHtml}<div class="job-details"><a href="${link}" target="_blank" class="job-title">${job.title}</a><p class="job-company">${job.company}</p><p class="job-location">${job.location}</p><div>${statusBadges}</div>${connectionsHtml}${insightsHtml}</div></div>`;
    })
    .join('');

  container.innerHTML = `<h2>Jobs (${jobsList.length} shown)</h2>` + jobsHtml;
}

function populateSelect(selectId, items) {
  const select = document.getElementById(selectId);
  if (!select) return;
  const uniqueItems = [...new Set(items)].sort();
  uniqueItems.forEach((item) => {
    if (item) {
      const option = document.createElement('option');
      option.value = item;
      option.textContent = item;
      select.appendChild(option);
    }
  });
}

function applyFilters() {
  const search = document.getElementById('searchInput').value.toLowerCase();
  const status = document.getElementById('statusSelect').value;
  const title = document.getElementById('titleSelect').value;
  const company = document.getElementById('companySelect').value;
  const location = document.getElementById('locationSelect').value;
  const minConn =
    parseInt(document.getElementById('minConnections').value, 10) || 0;
  const hideApplied = document.getElementById('hideApplied').checked;
  const hideViewed = document.getElementById('hideViewed').checked;

  filteredJobs = window.rawData.jobs.filter((job) => {
    const hasApplied =
      job.statuses.includes('Applied') ||
      job.insights.toLowerCase().includes('applied');
    const hasViewed =
      job.statuses.includes('Viewed') ||
      job.insights.toLowerCase().includes('viewed');

    return (
      (!hideApplied || !hasApplied) &&
      (!hideViewed || !hasViewed) &&
      (job.title.toLowerCase().includes(search) ||
        job.company.toLowerCase().includes(search) ||
        job.location.toLowerCase().includes(search)) &&
      (!status || job.statuses.includes(status)) &&
      (!title || job.title === title) &&
      (!company || job.company === company) &&
      (!location || job.location === location) &&
      (minConn === 0 || (job.connections && job.connections >= minConn))
    );
  });

  renderFilteredJobs(filteredJobs);
  document.getElementById('resultsCount').textContent =
    `Showing ${filteredJobs.length} of ${window.rawData.jobs.length} jobs`;
}

function applySort() {
  const sortBy = document.getElementById('sortSelect').value;
  if (!sortBy) return;

  filteredJobs.sort((a, b) => {
    if (sortBy === 'connections') {
      return (b.connections || 0) - (a.connections || 0); // Descending
    }
    // Ascending for string properties
    const valA = a[sortBy]?.toLowerCase() || '';
    const valB = b[sortBy]?.toLowerCase() || '';
    if (valA < valB) return -1;
    if (valA > valB) return 1;
    return 0;
  });

  renderFilteredJobs(filteredJobs);
}

function clearFilters() {
  const searchInput = document.getElementById('searchInput');
  const statusSelect = document.getElementById('statusSelect');
  const selects = ['titleSelect', 'companySelect', 'locationSelect'];
  const minConnections = document.getElementById('minConnections');
  const hideAppliedCheckbox = document.getElementById('hideApplied');
  const hideViewedCheckbox = document.getElementById('hideViewed');

  if (searchInput) searchInput.value = '';
  if (statusSelect) statusSelect.value = '';
  selects.forEach((id) => {
    const select = document.getElementById(id);
    if (select) select.value = '';
  });
  if (minConnections) minConnections.value = '';
  if (hideAppliedCheckbox) hideAppliedCheckbox.checked = false;
  if (hideViewedCheckbox) hideViewedCheckbox.checked = false;

  filteredJobs = [...rawData.jobs];
  renderFilteredJobs(filteredJobs);
  const resultsCount = document.getElementById('resultsCount');
  if (resultsCount) {
    resultsCount.textContent =
      'Showing ' + filteredJobs.length + ' of ' + rawData.jobs.length + ' jobs';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Attach all event listeners
  document
    .getElementById('applyFilterBtn')
    .addEventListener('click', applyFilters);
  document
    .getElementById('clearFilterBtn')
    .addEventListener('click', clearFilters);

  document
    .getElementById('searchInput')
    .addEventListener('input', applyFilters);
  document
    .getElementById('statusSelect')
    .addEventListener('change', applyFilters);
  document
    .getElementById('titleSelect')
    .addEventListener('change', applyFilters);
  document
    .getElementById('companySelect')
    .addEventListener('change', applyFilters);
  document
    .getElementById('locationSelect')
    .addEventListener('change', applyFilters);
  document
    .getElementById('minConnections')
    .addEventListener('input', applyFilters);
  document
    .getElementById('hideApplied')
    .addEventListener('change', applyFilters);
  document
    .getElementById('hideViewed')
    .addEventListener('change', applyFilters);
  document.getElementById('sortSelect').addEventListener('change', applySort);

  // Initial render
  populateSelect(
    'titleSelect',
    window.rawData.jobs.map((j) => j.title),
  );
  populateSelect(
    'companySelect',
    window.rawData.jobs.map((j) => j.company),
  );
  populateSelect(
    'locationSelect',
    window.rawData.jobs.map((j) => j.location),
  );
  renderFilteredJobs(window.rawData.jobs);
  document.getElementById('resultsCount').textContent =
    `Showing ${window.rawData.jobs.length} of ${window.rawData.jobs.length} jobs`;
});
