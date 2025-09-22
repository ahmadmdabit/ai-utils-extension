import { LinkedInJobFilter } from './helpers/linkedin/linkedin-filter';

/**
 * Content script entry point for LinkedIn job filter
 * Handles initialization, page navigation, and cleanup
 */

// Global filter instance
let filterInstance: LinkedInJobFilter | null = null;

/**
 * Initialize the filter when toggled by user
 */
function initializeFilter(): void {
  try {
    // Check if we're on a LinkedIn job page
    if (!isLinkedInJobPage()) {
      return;
    }

    // Clean up existing instance if any
    if (filterInstance) {
      filterInstance.destroy();
      filterInstance = null;
    }

    // Create new filter instance
    filterInstance = new LinkedInJobFilter();
    filterInstance.init();

    console.log('LinkedIn job filter initialized');
  } catch (error) {
    console.error('Error initializing LinkedIn job filter:', error);
  }
}

/**
 * Destroy the filter when toggled off
 */
function destroyFilter(): void {
  try {
    if (filterInstance) {
      filterInstance.destroy();
      filterInstance = null;
      console.log('LinkedIn job filter destroyed');
    }
  } catch (error) {
    console.error('Error destroying LinkedIn job filter:', error);
  }
}

/**
 * Check if current page is a LinkedIn job page
 */
function isLinkedInJobPage(): boolean {
  return (
    window.location.hostname === 'www.linkedin.com' &&
    (window.location.pathname.startsWith('/jobs/search') ||
      window.location.pathname.startsWith('/jobs/collections'))
  );
}

/**
 * Handle messages from background script or popup
 */
function setupMessageListener(): void {
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    try {
      switch (message.type) {
        case 'LINKEDIN_FILTER_RESET':
          if (filterInstance) {
            filterInstance.clearFilters();
            sendResponse({ success: true });
          } else {
            sendResponse({
              success: false,
              error: 'Filter not initialized',
            });
          }
          break;

        case 'LINKEDIN_FILTER_DESTROY':
          if (filterInstance) {
            filterInstance.destroy();
            filterInstance = null;
            sendResponse({ success: true });
          } else {
            sendResponse({
              success: false,
              error: 'Filter not initialized',
            });
          }
          break;

        case 'LINKEDIN_FILTER_TOGGLE':
          if (filterInstance) {
            // Filter exists, destroy it
            destroyFilter();
            sendResponse({ success: true, isVisible: false });
          } else {
            // Filter doesn't exist, create it
            initializeFilter();
            sendResponse({ success: true, isVisible: true });
          }
          break;

        case 'LINKEDIN_FILTER_STATE':
          sendResponse({
            success: true,
            isVisible: !!filterInstance,
          });
          break;

        default:
          sendResponse({
            success: false,
            error: 'Unknown message type',
          });
      }
    } catch (error) {
      console.error('Error handling message:', error);
      sendResponse({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }

    return true; // Keep message channel open for async response
  });
}

/**
 * Handle visibility change events (tab switching)
 */
function setupVisibilityListener(): void {
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && filterInstance) {
      // Pause any heavy operations when tab is not visible
      console.log('Tab hidden, pausing filter operations');
    } else if (!document.hidden && filterInstance) {
      // Resume operations when tab becomes visible
      console.log('Tab visible, resuming filter operations');
      filterInstance.applyFilters();
    }
  });
}

/**
 * Initialize message listener when DOM is ready
 */
console.log('document.readyState is ', document.readyState);
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('* document.readyState is ', document.readyState);
    setupMessageListener();
    setupVisibilityListener();
  });
} else {
  setupMessageListener();
  setupVisibilityListener();
}

// Handle page unload
window.addEventListener('beforeunload', () => {
  if (filterInstance) {
    filterInstance.destroy();
    filterInstance = null;
  }
});

console.log('LinkedIn job filter content script loaded');
