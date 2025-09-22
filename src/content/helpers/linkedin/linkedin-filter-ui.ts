/* eslint-disable @typescript-eslint/no-explicit-any */
import { CSS_CLASSES, FILTER_CONSTANTS, IDS } from './constants';
import type { FilterPosition } from '../../../types/linkedin-filter';

/**
 * Create the filter UI panel with complete event handling
 * @param onFilterChange Callback function to handle filter changes
 * @param onClearFilters Callback function to handle clearing filters
 */
export function createFilterUI(
  onFilterChange: (
    searchTerm: string,
    status: string,
    hideApplied: boolean,
    hideViewed: boolean,
  ) => void,
  onClearFilters: () => void,
  onRefresh: () => Promise<{
    success: boolean;
    jobCount: number;
    error?: string;
  }>,
): void {
  try {
    // Check if filter already exists
    if (document.querySelector(`.${CSS_CLASSES.FILTER_CONTAINER}`)) {
      console.log('Filter UI already exists');
      return;
    }

    // Create main container
    const filterContainer = document.createElement('div');
    filterContainer.className = CSS_CLASSES.FILTER_CONTAINER;
    filterContainer.setAttribute('role', 'region');
    filterContainer.setAttribute('aria-label', 'Job Filter Panel');

    // Create title with drag handle
    const title = document.createElement('div');
    title.id = IDS.FILTER_TITLE;
    title.className = CSS_CLASSES.FILTER_TITLE;

    // Create drag handle
    const dragHandle = document.createElement('div');
    dragHandle.className = CSS_CLASSES.DRAG_HANDLE;
    dragHandle.textContent = '☰'; // Move handle: ☰ (Unicode U+2630, "Trigram for Heaven") for drag indicator
    dragHandle.setAttribute('aria-label', 'Drag to move filter panel');
    dragHandle.style.cssText = `
      cursor: move;
      user-select: none;
      font-size: 12px;
      color: #666;
      text-align: center;
      padding: 2px 0;
      margin-bottom: 4px;
    `;

    title.appendChild(dragHandle);
    title.insertAdjacentHTML('beforeend', '<span>AI Utils Job Filter</span>');
    filterContainer.appendChild(title);

    // Create search input
    const searchGroup = document.createElement('div');
    searchGroup.className = CSS_CLASSES.FILTER_GROUP;

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = CSS_CLASSES.FILTER_INPUT;
    searchInput.placeholder = 'Search jobs';
    searchInput.setAttribute(
      'aria-label',
      'Search jobs by title, company, or location',
    );
    searchInput.addEventListener(
      'input',
      debounce(() => {
        updateFilterState(onFilterChange);
      }, FILTER_CONSTANTS.DEBOUNCE_DELAY),
    );

    searchGroup.appendChild(searchInput);
    filterContainer.appendChild(searchGroup);

    // Create filter row with status dropdown
    const filterRow = document.createElement('div');
    filterRow.className = CSS_CLASSES.FILTER_ROW;

    // Status dropdown
    const statusGroup = document.createElement('div');
    statusGroup.className = CSS_CLASSES.FILTER_GROUP;

    const statusLabel = document.createElement('label');
    statusLabel.textContent = 'Status:';
    statusLabel.className = 'filter-label';
    statusLabel.setAttribute('for', IDS.FILTER_STATUS_SELECT);

    const statusSelect = document.createElement('select');
    statusSelect.className = CSS_CLASSES.FILTER_SELECT;
    statusSelect.id = IDS.FILTER_STATUS_SELECT;
    statusSelect.setAttribute('aria-label', 'Filter by job status');

    const statusOptions = [
      { value: '', text: 'All Statuses' },
      { value: 'Easy Apply', text: 'Easy Apply' },
      { value: 'Promoted', text: 'Promoted' },
      { value: 'Applied', text: 'Applied' },
      { value: 'Viewed', text: 'Viewed' },
    ];

    statusOptions.forEach((option) => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.text;
      statusSelect.appendChild(optionElement);
    });

    statusSelect.addEventListener('change', () =>
      updateFilterState(onFilterChange),
    );

    statusGroup.appendChild(statusLabel);
    statusGroup.appendChild(statusSelect);
    filterRow.appendChild(statusGroup);

    filterContainer.appendChild(filterRow);

    // Create checkbox group
    const checkboxGroup = document.createElement('div');
    checkboxGroup.className = CSS_CLASSES.FILTER_CHECKBOX_GROUP;

    // Hide applied checkbox
    const hideAppliedLabel = document.createElement('label');
    hideAppliedLabel.className = CSS_CLASSES.FILTER_CHECKBOX_LABEL;

    const hideAppliedCheckbox = document.createElement('input');
    hideAppliedCheckbox.type = 'checkbox';
    hideAppliedCheckbox.setAttribute('data-filter', 'applied');
    hideAppliedCheckbox.setAttribute('aria-label', 'Hide applied jobs');
    hideAppliedCheckbox.addEventListener('change', () =>
      updateFilterState(onFilterChange),
    );

    const hideAppliedSpan = document.createElement('span');
    hideAppliedSpan.textContent = 'Hide Applied Jobs';

    hideAppliedLabel.appendChild(hideAppliedCheckbox);
    hideAppliedLabel.appendChild(hideAppliedSpan);
    checkboxGroup.appendChild(hideAppliedLabel);

    // Hide viewed checkbox
    const hideViewedLabel = document.createElement('label');
    hideViewedLabel.className = CSS_CLASSES.FILTER_CHECKBOX_LABEL;

    const hideViewedCheckbox = document.createElement('input');
    hideViewedCheckbox.type = 'checkbox';
    hideViewedCheckbox.setAttribute('data-filter', 'viewed');
    hideViewedCheckbox.setAttribute('aria-label', 'Hide viewed jobs');
    hideViewedCheckbox.addEventListener('change', () =>
      updateFilterState(onFilterChange),
    );

    const hideViewedSpan = document.createElement('span');
    hideViewedSpan.textContent = 'Hide Viewed Jobs';

    hideViewedLabel.appendChild(hideViewedCheckbox);
    hideViewedLabel.appendChild(hideViewedSpan);
    checkboxGroup.appendChild(hideViewedLabel);

    filterContainer.appendChild(checkboxGroup);

    // Create buttons
    const buttonsContainer = document.createElement('div');
    buttonsContainer.className = CSS_CLASSES.FILTER_BUTTONS;

    const applyButton = document.createElement('button');
    applyButton.className = CSS_CLASSES.FILTER_BTN_APPLY;
    applyButton.textContent = 'Apply Filters';
    applyButton.setAttribute('aria-label', 'Apply current filter settings');
    applyButton.addEventListener('click', () =>
      updateFilterState(onFilterChange),
    );

    const clearButton = document.createElement('button');
    clearButton.className = CSS_CLASSES.FILTER_BTN_CLEAR;
    clearButton.textContent = 'Clear All';
    clearButton.setAttribute(
      'aria-label',
      'Clear all filters and show all jobs',
    );
    clearButton.addEventListener('click', onClearFilters);

    const refreshButton = document.createElement('button');
    refreshButton.id = IDS.REFRESH_BUTTON;
    refreshButton.className = CSS_CLASSES.FILTER_BTN_REFRESH;
    refreshButton.textContent = 'Refresh';
    refreshButton.setAttribute(
      'aria-label',
      'Refresh job data and re-apply filters',
    );
    refreshButton.addEventListener('click', () => handleRefresh(onRefresh));

    buttonsContainer.appendChild(applyButton);
    buttonsContainer.appendChild(clearButton);
    buttonsContainer.appendChild(refreshButton);
    filterContainer.appendChild(buttonsContainer);

    // Create results count
    const resultsCount = document.createElement('div');
    resultsCount.id = IDS.RESULTS_COUNT;
    resultsCount.className = CSS_CLASSES.RESULTS_COUNT;
    resultsCount.textContent = 'Loading';
    resultsCount.setAttribute('aria-live', 'polite');
    resultsCount.setAttribute('aria-label', 'Filter results count');
    filterContainer.appendChild(resultsCount);

    // Add to page
    document.body.appendChild(filterContainer);

    // Initialize drag functionality and position
    initializeFilterPosition(filterContainer);

    console.log('Filter UI created successfully');
  } catch (error) {
    console.error('Error creating filter UI:', error);
  }
}

/**
 * Update filter state from UI elements
 * @param onFilterChange Callback to trigger filter update
 */
function updateFilterState(
  onFilterChange: (
    searchTerm: string,
    status: string,
    hideApplied: boolean,
    hideViewed: boolean,
  ) => void,
): void {
  try {
    const searchInput = document.querySelector(
      `.${CSS_CLASSES.FILTER_INPUT}`,
    ) as HTMLInputElement;
    const statusSelect = document.getElementById(
      IDS.FILTER_STATUS_SELECT,
    ) as HTMLSelectElement;
    const hideAppliedCheckbox = document.querySelector(
      'input[data-filter="applied"]',
    ) as HTMLInputElement;
    const hideViewedCheckbox = document.querySelector(
      'input[data-filter="viewed"]',
    ) as HTMLInputElement;

    const searchTerm = searchInput?.value || '';
    const status = statusSelect?.value || '';
    const hideApplied = hideAppliedCheckbox?.checked || false;
    const hideViewed = hideViewedCheckbox?.checked || false;

    onFilterChange(searchTerm, status, hideApplied, hideViewed);
  } catch (error) {
    console.error('Error updating filter state:', error);
  }
}

/**
 * Update the results count display
 * @param filteredCount Number of jobs matching filters
 * @param totalCount Total number of jobs
 */
export function updateResultsCount(
  filteredCount: number,
  totalCount: number,
): void {
  try {
    const resultsCountElement = document.getElementById(
      `.${IDS.RESULTS_COUNT}`,
    );
    if (resultsCountElement) {
      resultsCountElement.textContent = `Showing ${filteredCount} of ${totalCount} jobs`;
    }
  } catch (error) {
    console.error('Error updating results count:', error);
  }
}

/**
 * Handle refresh button click with loading states and error handling
 * @param onRefresh Refresh function to call
 */
async function handleRefresh(
  onRefresh: () => Promise<{
    success: boolean;
    jobCount: number;
    error?: string;
  }>,
): Promise<void> {
  const refreshButton = document.getElementById(
    IDS.REFRESH_BUTTON,
  ) as HTMLButtonElement;

  if (!refreshButton) return;

  try {
    // Set loading state
    setRefreshLoading(true);

    // Call refresh function
    const result = await onRefresh();

    if (result.success) {
      // Set success state
      setRefreshSuccess(result.jobCount);
    } else {
      // Set error state
      setRefreshError(result.error || 'Refresh failed');
    }
  } catch (error) {
    console.error('Error during refresh:', error);
    setRefreshError(error instanceof Error ? error.message : 'Unknown error');
  }
}

/**
 * Set refresh button to loading state
 * @param loading Whether refresh is in progress
 */
function setRefreshLoading(loading: boolean): void {
  const refreshButton = document.getElementById(
    IDS.REFRESH_BUTTON,
  ) as HTMLButtonElement;

  if (!refreshButton) return;

  if (loading) {
    refreshButton.classList.add(CSS_CLASSES.REFRESH_LOADING);
    refreshButton.textContent = 'Refreshing';
    refreshButton.disabled = true;
  } else {
    refreshButton.classList.remove(CSS_CLASSES.REFRESH_LOADING);
    refreshButton.textContent = 'Refresh';
    refreshButton.disabled = false;
  }
}

/**
 * Set refresh button to success state
 * @param jobCount Number of jobs found
 */
function setRefreshSuccess(jobCount: number): void {
  const refreshButton = document.getElementById(
    IDS.REFRESH_BUTTON,
  ) as HTMLButtonElement;

  if (!refreshButton) return;

  refreshButton.classList.remove(CSS_CLASSES.REFRESH_LOADING);
  refreshButton.classList.add(CSS_CLASSES.REFRESH_SUCCESS);
  refreshButton.textContent = 'Refreshed';
  refreshButton.disabled = false;

  // Update results count
  const resultsCount = document.getElementById(IDS.RESULTS_COUNT);
  if (resultsCount) {
    resultsCount.textContent = `Showing ${jobCount} jobs (refreshed)`;
  }

  // Reset to normal state after 2 seconds
  setTimeout(() => {
    refreshButton.classList.remove(CSS_CLASSES.REFRESH_SUCCESS);
    refreshButton.textContent = 'Refresh';
  }, 2000);
}

/**
 * Set refresh button to error state
 * @param error Error message
 */
function setRefreshError(error: string): void {
  const refreshButton = document.getElementById(
    IDS.REFRESH_BUTTON,
  ) as HTMLButtonElement;

  if (!refreshButton) return;

  refreshButton.classList.remove(CSS_CLASSES.REFRESH_LOADING);
  refreshButton.classList.add(CSS_CLASSES.REFRESH_ERROR);
  refreshButton.textContent = 'Refresh Failed';
  refreshButton.disabled = false;

  // Log error for debugging
  console.error('Refresh error:', error);

  // Reset to normal state after 3 seconds
  setTimeout(() => {
    refreshButton.classList.remove(CSS_CLASSES.REFRESH_ERROR);
    refreshButton.textContent = 'Refresh';
  }, 3000);
}

/**
 * Debounce function to limit the rate of function calls
 * @param func Function to debounce
 * @param wait Milliseconds to wait
 * @returns Debounced function
 */
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: number | null = null;

  return ((...args: any[]) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = window.setTimeout(() => func(...args), wait);
  }) as T;
}

/**
 * Save filter position to chrome.storage
 * @param position Position to save
 */
async function saveFilterPosition(position: FilterPosition): Promise<void> {
  try {
    await chrome.storage.local.set({
      [FILTER_CONSTANTS.STORAGE_KEY]: position,
    });
  } catch (error) {
    console.error('Error saving filter position:', error);
  }
}

/**
 * Load filter position from chrome.storage
 * @returns Saved position or default position
 */
async function loadFilterPosition(): Promise<FilterPosition> {
  try {
    const result = await chrome.storage.local.get([
      FILTER_CONSTANTS.STORAGE_KEY,
    ]);
    return (
      result[FILTER_CONSTANTS.STORAGE_KEY] || FILTER_CONSTANTS.DEFAULT_POSITION
    );
  } catch (error) {
    console.error('Error loading filter position:', error);
    return FILTER_CONSTANTS.DEFAULT_POSITION;
  }
}

/**
 * Apply position to filter container
 * @param container Filter container element
 * @param position Position to apply
 */
function applyFilterPosition(
  container: HTMLElement,
  position: FilterPosition,
): void {
  container.style.left = `${position.x}px`;
  container.style.top = `${position.y}px`;
  container.style.right = 'auto';
  container.style.bottom = 'auto';
}

/**
 * Calculate new position based on drag
 * @param startPos Starting position
 * @param currentPos Current mouse position
 * @returns New position
 */
function calculateNewPosition(
  startPos: FilterPosition,
  currentPos: { x: number; y: number },
): FilterPosition {
  const deltaX = currentPos.x - startPos.x;
  const deltaY = currentPos.y - startPos.y;

  return {
    x: Math.max(0, startPos.x + deltaX),
    y: Math.max(0, startPos.y + deltaY),
  };
}

/**
 * Snap position to screen edges if within threshold
 * @param position Position to snap
 * @returns Snapped position
 */
function snapToEdges(position: FilterPosition): FilterPosition {
  const threshold = FILTER_CONSTANTS.SNAP_THRESHOLD;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const filterWidth = 300; // Approximate filter width
  const filterHeight = 400; // Approximate filter height

  let { x, y } = position;

  // Snap to left edge
  if (x <= threshold) {
    x = 0;
  }
  // Snap to right edge (ensure filter doesn't go off-screen)
  else if (x >= windowWidth - filterWidth - threshold) {
    x = Math.max(0, windowWidth - filterWidth);
  }

  // Snap to top edge
  if (y <= threshold) {
    y = 0;
  }
  // Snap to bottom edge (ensure filter doesn't go off-screen)
  else if (y >= windowHeight - filterHeight - threshold) {
    y = Math.max(0, windowHeight - filterHeight);
  }

  return { x, y };
}

/**
 * Setup drag functionality for the filter container
 * @param container Filter container element
 */
function setupDragFunctionality(container: HTMLElement): void {
  const dragHandle = container.querySelector(
    `.${CSS_CLASSES.DRAG_HANDLE}`,
  ) as HTMLElement;
  if (!dragHandle) return;

  let isDragging = false;
  let startPos = { x: 0, y: 0 };
  let filterStartPos = { x: 0, y: 0 };

  const handleMouseDown = (e: MouseEvent) => {
    isDragging = false;
    startPos = { x: e.clientX, y: e.clientY };

    // Get the current position from the element's computed style
    const computedStyle = window.getComputedStyle(container);
    const currentLeft = parseFloat(computedStyle.left) || 0;
    const currentTop = parseFloat(computedStyle.top) || 0;

    filterStartPos = { x: currentLeft, y: currentTop };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    e.preventDefault();
  };

  const handleMouseMove = async (e: MouseEvent) => {
    const deltaX = Math.abs(e.clientX - startPos.x);
    const deltaY = Math.abs(e.clientY - startPos.y);

    // Check if drag threshold is met
    if (
      !isDragging &&
      (deltaX > FILTER_CONSTANTS.DRAG_THRESHOLD ||
        deltaY > FILTER_CONSTANTS.DRAG_THRESHOLD)
    ) {
      isDragging = true;
      container.classList.add(CSS_CLASSES.DRAGGING);
    }

    if (isDragging) {
      const currentMousePos = { x: e.clientX, y: e.clientY };
      const newPos = calculateNewPosition(filterStartPos, currentMousePos);
      const snappedPos = snapToEdges(newPos);
      applyFilterPosition(container, snappedPos);
    }
  };

  const handleMouseUp = async () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);

    if (isDragging) {
      const rect = container.getBoundingClientRect();
      const finalPos = snapToEdges({ x: rect.left, y: rect.top });
      applyFilterPosition(container, finalPos);

      // Save position
      await saveFilterPosition(finalPos);

      container.classList.remove(CSS_CLASSES.DRAGGING);
    }

    isDragging = false;
  };

  dragHandle.addEventListener('mousedown', handleMouseDown);
}

/**
 * Initialize filter position and drag functionality
 * @param container Filter container element
 */
async function initializeFilterPosition(container: HTMLElement): Promise<void> {
  try {
    const savedPosition = await loadFilterPosition();
    applyFilterPosition(container, savedPosition);
    setupDragFunctionality(container);
  } catch (error) {
    console.error('Error initializing filter position:', error);
  }
}
