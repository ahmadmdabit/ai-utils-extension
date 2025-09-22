import type {
  JobElement,
  FilterCriteria,
} from '../../../types/linkedin-filter';
import { ERROR_MESSAGES } from './constants';

/**
 * Apply filters to job elements with performance optimization
 * @param jobElements Array of job elements to filter
 * @param filterCriteria Criteria to apply for filtering
 * @returns Number of jobs that match the filters
 */
export function applyFilters(
  jobElements: JobElement[],
  filterCriteria: FilterCriteria,
): void {
  try {
    if (!jobElements || jobElements.length === 0) {
      return;
    }

    const searchTerm = filterCriteria.searchTerm.toLowerCase().trim();

    jobElements.forEach((job) => {
      try {
        let showJob = true;

        // Search term filter (most computationally expensive, check first)
        if (searchTerm) {
          const title = job.title.toLowerCase();
          const company = job.company.toLowerCase();
          const location = job.location.toLowerCase();

          if (
            !title.includes(searchTerm) &&
            !company.includes(searchTerm) &&
            !location.includes(searchTerm)
          ) {
            showJob = false;
          }
        }

        // Status filter
        if (
          showJob &&
          filterCriteria.status &&
          !job.status.includes(filterCriteria.status)
        ) {
          showJob = false;
        }

        // Hide applied jobs
        if (showJob && filterCriteria.hideApplied && job.isApplied) {
          showJob = false;
        }

        // Hide viewed jobs
        if (showJob && filterCriteria.hideViewed && job.isViewed) {
          showJob = false;
        }

        // Apply display style (CSS-based for performance)
        job.element.style.display = showJob ? '' : 'none';
      } catch (error) {
        console.error('Error applying filter to individual job:', error);
        // Continue with other jobs
      }
    });
  } catch (error) {
    console.error(ERROR_MESSAGES.FILTERING_FAILED, error);
  }
}

/**
 * Clear all filters by showing all jobs
 * @param jobElements Array of job elements to show
 */
export function clearFilters(jobElements: JobElement[]): void {
  try {
    if (!jobElements || jobElements.length === 0) {
      return;
    }

    jobElements.forEach((job) => {
      try {
        job.element.style.display = '';
      } catch (error) {
        console.error('Error clearing filter on individual job:', error);
      }
    });

    console.log(`Cleared filters for ${jobElements.length} jobs`);
  } catch (error) {
    console.error('Error clearing filters:', error);
  }
}
