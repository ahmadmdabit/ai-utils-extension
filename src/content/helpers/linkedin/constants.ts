/**
 * LinkedIn DOM selectors for consistent element targeting
 */
export const LINKEDIN_SELECTORS = {
  JOB_CONTAINER: 'li[data-occludable-job-id]',
  JOB_TITLE: 'a.job-card-container__link',
  COMPANY_NAME: '.artdeco-entity-lockup__subtitle span',
  JOB_LOCATION: '.artdeco-entity-lockup__caption li',
  JOB_INSIGHTS: '.job-card-container__job-insight-text',
  JOB_FOOTER_ITEMS: '.job-card-container__footer-item',
  JOB_RESULTS_CONTAINER: '.jobs-search__results-list',
  JOB_SEARCH_HEADER_COUNT: '.results-context-header__job-count',
} as const;

/**
 * LinkedIn URL patterns for content script matching
 */
export const LINKEDIN_URLS = {
  JOB_SEARCH: 'https://www.linkedin.com/jobs/search',
  JOB_COLLECTIONS: 'https://www.linkedin.com/jobs/collections',
} as const;

/**
 * IDs for filter configuration
 */
export const IDS = {
  FILTER_TITLE: 'filter-title',
  FILTER_STATUS_SELECT: 'statusSelect',
  RESULTS_COUNT: 'results-count',
  REFRESH_BUTTON: 'refresh-button',
  REFRESH_SPINNER: 'refresh-spinner',
  FILTER_CONTAINER: 'ai-utils-job-filter',
} as const;

/**
 * CSS class names for consistent styling
 */
export const CSS_CLASSES = {
  FILTER_CONTAINER: 'ai-utils-job-filter',
  FILTER_TITLE: 'filter-title',
  FILTER_GROUP: 'filter-group',
  FILTER_ROW: 'filter-row',
  FILTER_BUTTONS: 'filter-buttons',
  FILTER_CHECKBOX_GROUP: 'filter-checkbox-group',
  FILTER_INPUT: 'filter-input',
  FILTER_SELECT: 'filter-select',
  FILTER_CHECKBOX_LABEL: 'filter-checkbox-label',
  FILTER_BTN: 'filter-btn',
  FILTER_BTN_APPLY:
    'filter-btn artdeco-button artdeco-button--3 artdeco-button--primary apply hidden',
  FILTER_BTN_CLEAR:
    'filter-btn artdeco-button artdeco-button--3 artdeco-button--secondary clear',
  FILTER_BTN_REFRESH:
    'filter-btn artdeco-button artdeco-button--3 artdeco-button--secondary refresh',
  RESULTS_COUNT: 'results-count display-flex t-12 t-black--light t-normal pt1',
  REFRESH_SPINNER: 'refresh-spinner',
  REFRESH_LOADING: 'refresh-loading',
  REFRESH_SUCCESS: 'refresh-success',
  REFRESH_ERROR: 'refresh-error',
  // Drag-related classes
  DRAGGABLE: 'filter-draggable',
  DRAGGING: 'filter-dragging',
  DRAG_HANDLE: 'filter-drag-handle',
} as const;

/**
 * Filter configuration constants
 */
export const FILTER_CONSTANTS = {
  DEBOUNCE_DELAY: 300, // milliseconds
  REFRESH_DEBOUNCE_DELAY: 1000, // milliseconds - longer delay for refresh to prevent spam
  DRAG_THRESHOLD: 5, // pixels - minimum distance to start drag
  SNAP_THRESHOLD: 20, // pixels - snap to edge threshold
  DEFAULT_POSITION: { x: 16, y: 16 }, // default position in pixels from top-left
  STORAGE_KEY: 'linkedin-filter-position', // chrome.storage key for position persistence
} as const;

/**
 * Error messages for user feedback
 */
export const ERROR_MESSAGES = {
  PARSING_FAILED: 'Failed to parse job information',
  FILTERING_FAILED: 'Error applying filters',
  UI_CREATION_FAILED: 'Failed to create filter interface',
  MUTATION_OBSERVER_FAILED: 'Error setting up dynamic content monitoring',
  REFRESH_FAILED: 'Failed to refresh job data',
  REFRESH_TIMEOUT: 'Refresh operation timed out',
  DRAG_FAILED: 'Failed to initialize drag functionality',
  POSITION_SAVE_FAILED: 'Failed to save filter position',
  POSITION_LOAD_FAILED: 'Failed to load saved filter position',
} as const;
