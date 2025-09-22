/**
 * Interface representing a job element on the LinkedIn page
 */
export interface JobElement {
  element: HTMLElement;
  title: string;
  company: string;
  location: string;
  status: string[];
  connections: number | null;
  isApplied: boolean;
  isViewed: boolean;
}

/**
 * Interface representing the filter criteria
 */
export interface FilterCriteria {
  searchTerm: string;
  status: string;
  hideApplied: boolean;
  hideViewed: boolean;
}

/**
 * Interface for filter UI state
 */
export interface FilterUIState {
  searchTerm: string;
  status: string;
  hideApplied: boolean;
  hideViewed: boolean;
}

/**
 * Interface for filter position coordinates
 */
export interface FilterPosition {
  x: number;
  y: number;
}
