import type { JobElement } from '../../../types/linkedin-filter';
import { LINKEDIN_SELECTORS, ERROR_MESSAGES } from './constants';

/**
 * Parse job elements from the LinkedIn page with comprehensive error handling
 * @returns Array of parsed job elements
 */
export function parseJobElements(): JobElement[] {
  try {
    const jobElements: JobElement[] = [];
    const elements = document.querySelectorAll(
      LINKEDIN_SELECTORS.JOB_CONTAINER,
    );

    if (elements.length === 0) {
      console.log('No job elements found on the page');
      return jobElements;
    }

    elements.forEach((element, index) => {
      try {
        const jobElement = element as HTMLElement;

        // Extract job information with null checks
        const titleElement = jobElement.querySelector(
          LINKEDIN_SELECTORS.JOB_TITLE,
        );
        const title = titleElement?.textContent?.trim() || '';

        const companyElement = jobElement.querySelector(
          LINKEDIN_SELECTORS.COMPANY_NAME,
        );
        const company = companyElement?.textContent?.trim() || '';

        const locationElement = jobElement.querySelector(
          LINKEDIN_SELECTORS.JOB_LOCATION,
        );
        const location = locationElement?.textContent?.trim() || '';

        const connectionsElement = jobElement.querySelector(
          LINKEDIN_SELECTORS.JOB_INSIGHTS,
        );
        const connectionsText = connectionsElement?.textContent?.trim() || '';
        const connectionsMatch = connectionsText.match(/(\d+)\sconnections?/);
        const connections = connectionsMatch
          ? parseInt(connectionsMatch[1], 10)
          : null;

        // Extract status badges
        const statusElements = jobElement.querySelectorAll(
          LINKEDIN_SELECTORS.JOB_FOOTER_ITEMS,
        );
        const status: string[] = [];
        let isApplied = false;
        let isViewed = false;

        statusElements.forEach((statusElement) => {
          const statusText = statusElement.textContent?.trim() || '';
          if (statusText) {
            status.push(statusText);

            if (statusText.includes('Applied')) {
              isApplied = true;
            }

            if (statusText.includes('Viewed')) {
              isViewed = true;
            }
          }
        });

        // Only add jobs with essential information
        if (title && company) {
          jobElements.push({
            element: jobElement,
            title,
            company,
            location,
            status,
            connections,
            isApplied,
            isViewed,
          });
        }
      } catch (error) {
        console.error(`Error parsing job element at index ${index}:`, error);
        // Continue with other elements
      }
    });

    return jobElements;
  } catch (error) {
    console.error(ERROR_MESSAGES.PARSING_FAILED, error);
    return [];
  }
}

/**
 * Validate parsed job data
 * @param jobElement Job element to validate
 * @returns True if valid, false otherwise
 */
export function validateJobElement(jobElement: JobElement): boolean {
  return !!(
    jobElement &&
    jobElement.element &&
    jobElement.title &&
    jobElement.company &&
    typeof jobElement.isApplied === 'boolean' &&
    typeof jobElement.isViewed === 'boolean'
  );
}
