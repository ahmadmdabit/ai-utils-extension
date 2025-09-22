import type {
  JobElement,
  FilterCriteria,
} from '../../../types/linkedin-filter';
import { parseJobElements, validateJobElement } from './linkedin-job-parser';
import { applyFilters, clearFilters } from './linkedin-filter-engine';
import { createFilterUI, updateResultsCount } from './linkedin-filter-ui';
import { CSS_CLASSES } from './constants';

/**
 * Main class for LinkedIn job filtering functionality with comprehensive state management
 */
export class LinkedInJobFilter {
  private jobElements: JobElement[] = [];
  private filterCriteria: FilterCriteria = {
    searchTerm: '',
    status: '',
    hideApplied: false,
    hideViewed: false,
  };
  private refreshTimer: number | null = null;
  private isInitialized = false;
  private isRefreshing = false;

  /**
   * Initialize the LinkedIn job filter
   */
  public init(): void {
    try {
      if (this.isInitialized) {
        console.log('LinkedIn job filter already initialized');
        return;
      }

      console.log('Initializing LinkedIn job filter...');

      // Validate we're on a LinkedIn job page
      if (!this.isLinkedInJobPage()) {
        console.log('Not on a LinkedIn job page, skipping initialization');
        return;
      }

      // Create the filter UI
      this.createFilterUI();

      // Parse initial job elements
      this.parseJobElements();

      // Update results count
      this.updateResultsCount();

      this.isInitialized = true;
      console.log('LinkedIn job filter initialized successfully');
    } catch (error) {
      console.error('Error initializing LinkedIn job filter:', error);
    }
  }

  /**
   * Check if current page is a LinkedIn job page
   */
  private isLinkedInJobPage(): boolean {
    return (
      window.location.hostname === 'www.linkedin.com' &&
      (window.location.pathname.startsWith('/jobs/search') ||
        window.location.pathname.startsWith('/jobs/collections'))
    );
  }

  /**
   * Create the filter UI panel
   */
  private createFilterUI(): void {
    try {
      createFilterUI(
        (searchTerm, status, hideApplied, hideViewed) => {
          this.filterCriteria.searchTerm = searchTerm;
          this.filterCriteria.status = status;
          this.filterCriteria.hideApplied = hideApplied;
          this.filterCriteria.hideViewed = hideViewed;
          this.applyFilters();
        },
        () => this.clearFilters(),
        () => this.refreshJobs(),
      );
    } catch (error) {
      console.error('Error creating filter UI:', error);
    }
  }

  /**
   * Parse job elements from the page
   */
  private parseJobElements(): void {
    try {
      this.jobElements = parseJobElements();

      // Validate parsed elements
      const validElements = this.jobElements.filter(validateJobElement);
      if (validElements.length !== this.jobElements.length) {
        console.warn(
          `Filtered out ${this.jobElements.length - validElements.length} invalid job elements`,
        );
        this.jobElements = validElements;
      }

      console.log(`Parsed ${this.jobElements.length} valid job elements`);
    } catch (error) {
      console.error('Error parsing job elements:', error);
    }
  }

  /**
   * Apply filters to job elements
   */
  public applyFilters(): void {
    try {
      // Reparse job elements in case new ones have loaded
      this.parseJobElements();

      // Apply filters
      applyFilters(this.jobElements, this.filterCriteria);

      // Update results count
      this.updateResultsCount();
    } catch (error) {
      console.error('Error applying filters:', error);
    }
  }

  /**
   * Clear all filters
   */
  public clearFilters(): void {
    try {
      // Reset filter criteria
      this.filterCriteria = {
        searchTerm: '',
        status: '',
        hideApplied: false,
        hideViewed: false,
      };

      // Clear filters in UI
      const searchInput = document.querySelector(
        `.${CSS_CLASSES.FILTER_INPUT}`,
      ) as HTMLInputElement;
      if (searchInput) {
        searchInput.value = '';
      }

      const statusSelect = document.getElementById(
        'statusSelect',
      ) as HTMLSelectElement;
      if (statusSelect) {
        statusSelect.value = '';
      }

      const checkboxes = document.querySelectorAll(
        '.filter-checkbox-group input[type="checkbox"]',
      ) as NodeListOf<HTMLInputElement>;
      checkboxes.forEach((checkbox) => {
        checkbox.checked = false;
      });

      // Clear filters on job elements
      clearFilters(this.jobElements);

      // Update results count
      this.updateResultsCount();

      console.log('All filters cleared');
    } catch (error) {
      console.error('Error clearing filters:', error);
    }
  }

  /**
   * Update the results count display
   */
  private updateResultsCount(): void {
    try {
      updateResultsCount(this.jobElements.length, this.jobElements.length);
    } catch (error) {
      console.error('Error updating results count:', error);
    }
  }

  /**
   * Refresh job data by re-parsing and re-applying filters
   */
  public async refreshJobs(): Promise<{
    success: boolean;
    jobCount: number;
    error?: string;
  }> {
    try {
      if (this.isRefreshing) {
        console.log('Refresh already in progress, skipping...');
        return {
          success: false,
          jobCount: this.jobElements.length,
          error: 'Refresh already in progress',
        };
      }

      this.isRefreshing = true;
      console.log('Starting job refresh...');

      // Re-parse job elements
      this.parseJobElements();

      // Re-apply filters
      this.applyFilters();

      this.isRefreshing = false;
      console.log(
        `Job refresh completed successfully. Found ${this.jobElements.length} jobs.`,
      );

      return { success: true, jobCount: this.jobElements.length };
    } catch (error) {
      this.isRefreshing = false;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error during refresh';
      console.error('Error refreshing jobs:', error);

      return {
        success: false,
        jobCount: this.jobElements.length,
        error: errorMessage,
      };
    }
  }

  /**
   * Destroy the filter and clean up
   */
  public destroy(): void {
    try {
      console.log('Destroying LinkedIn job filter...');

      // Remove filter UI
      const filterContainer = document.querySelector(
        `.${CSS_CLASSES.FILTER_CONTAINER}`,
      );
      if (filterContainer) {
        filterContainer.remove();
      }

      // Show all hidden jobs
      clearFilters(this.jobElements);

      // Clear timers
      if (this.refreshTimer) {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = null;
      }

      this.isInitialized = false;
      console.log('LinkedIn job filter destroyed successfully');
    } catch (error) {
      console.error('Error destroying filter:', error);
    }
  }
}
