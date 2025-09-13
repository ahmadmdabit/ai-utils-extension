# AI Utils Extension - Final Project Summary & Technical Overview

### **Project Vision**

The AI Utils Extension was developed to be a powerful, AI-assisted productivity tool for the modern web user. Built with a modern React/Vite stack and a robust, pipeline-driven service worker backend, it transforms raw web content into structured, actionable insights using Google's Gemini AI.

---

## 1. Final Feature Set

This section details all user-facing features implemented in the final version of the extension.

#### Core AI Capabilities (Pipelines)
The extension's primary feature is a selection of multi-step processing pipelines that execute sequential operations on tab content:
- **Summarize:** Generates a concise summary of a webpage.
- **Translate:** Translates webpage content into a user-selected language.
- **Scrape Data:** Extracts specific information from a webpage (see below).
- **Translated Summary:** A two-step pipeline that first summarizes a page and then translates the summary.
- **Dual-Language Summary:** A three-step pipeline that generates a summary, translates it, and then presents both versions side-by-side.

#### Advanced Data Scraping
When the "Scrape Data" pipeline is selected, users can choose from several methods:
- **Helpful Info (AI):** A general-purpose extraction powered by a Gemini prompt.
- **Headings:** A fast, deterministic extraction of all `<h1>`, `<h2>`, and `<h3>` tags.
- **Links:** Extracts all hyperlinks with their text and URLs.
- **Tabular Data:** Parses and extracts content from HTML `<table>` elements.
- **Custom Prompt (AI):** Allows the user to provide a custom prompt for targeted data extraction.

#### User Configuration & Experience
- **Spotify-Inspired UI:** A modern, dark-themed interface designed for clarity and aesthetic appeal, implemented with Tailwind CSS v4's `@theme` directive.
- **Real-Time Feedback:** The UI provides live status updates for each task (`Pending`, `Processing`, `Complete`, `Error`) and displays a final, AI-generated title for combined results.
- **Gemini Model Selection:** Users can choose between different Gemini models (`2.5 Pro`, `2.5 Flash`, `2.5 Flash-Lite`) to balance performance, cost, and capability.
- **Language Selection:** A dedicated UI for selecting a target translation language, with presets and a custom input option.
- **Secure API Key Management:** A settings page allows users to securely save their Gemini API key to `chrome.storage.local`.
- **Combine Tabs Results:** A powerful option to synthesize the results from multiple selected tabs into a single, cohesive output. The system processes all selected tabs at each step of a pipeline before combining them, enabling complex, multi-stage analysis.
- **Process Cancellation:** Users can cancel long-running processes with the Cancel button.
- **Configurable Timeouts:** Users can set processing timeouts in the Settings panel to prevent indefinite processing.
- **Tab Refresh:** Users can refresh the tab list with the reload button to see their latest open tabs.

---

## 2. Architectural Overview

The extension is built on a clean, decoupled architecture separating the user interface from the background processing logic.

#### Frontend (Sidepanel)
- **Framework:** Built with **React 19** and bootstrapped with **Vite** for a fast development experience and optimized production builds.
- **Component Design:** Follows an **Atomic Design** philosophy, with simple, reusable "atom" components (`Button`, `Checkbox`) composed into more complex "molecule" and "feature" components.
- **State Management:** Utilizes React Hooks (`useState`, `useEffect`). All critical application state is "lifted up" and managed within the main `App.tsx` component, which passes state and callbacks down to controlled child components.

#### Backend (Service Worker)
- **Core Logic:** The service worker acts as the "brain" of the extension. It is architected as a **"Step-First" Workflow Engine**.
- **Workflow:**
  1.  The UI sends a `START_PROCESSING` message with the user's complete configuration (tabs, pipeline, model, combine flag, etc.).
  2.  The service worker's `runWorkflow` function takes control.
  3.  It loops through the **steps** of the selected pipeline (e.g., 1. Summarize, 2. Translate).
  4.  For each step, it processes all selected tabs (either in parallel for local operations or sequentially for API calls).
  5.  If "Combine Tabs" is enabled, it performs a final synthesis step after a pipeline step is complete for all tabs.
  6.  The output of each step is stored and used as the input for the next, enabling complex, dependent "Matrix" combinations.
- **Cancellation & Timeout Support:** The service worker now supports process cancellation via AbortController and configurable timeouts.

#### Communication Layer
- A strongly-typed messaging system (defined in `src/types/messaging.ts`) is used for all communication between the sidepanel UI and the service worker.

---

## 3. Key Technical Implementations

- **`geminiService.ts`:** A dedicated, isolated service responsible for all communication with the Google Gemini API. It handles dynamic URL construction (based on the selected model), prompt generation (including synthesis and title generation), and API error handling. Now supports cancellation via AbortSignal.
- **`pipelines.ts`:** A declarative, data-driven definition of all available processing pipelines. This makes the workflow engine flexible and easy to extend.
- **`scrapers.ts`:** A collection of self-contained, pure functions designed to be injected into web pages with `chrome.scripting.executeScript` for fast, deterministic DOM scraping.
- **Conditional UI Components:** The UI is composed of several feature components (`PipelineSelector`, `ActionOptions`, `DataScrapeOptions`, `LanguageSelector`) that are conditionally rendered based on the application's state.
- **Cancellation Support:** The UI now includes a Cancel button that sends a `CANCEL_PROCESSING` message to the service worker.

---

## 4. Development Standards & Developer Experience

The project was built with a strong emphasis on quality, consistency, and maintainability.

#### Git & Version Control
- **Workflow:** Follows the **GitFlow** model (`main`, `develop`, `feature/*` branches).
- **Commits:** Adheres to the **[Conventional Commits](https://www.conventionalcommits.org/)** specification.

#### Code Quality & Automation
- **Linting & Formatting:** **ESLint** (with Flat Config) and **Prettier** are used to enforce a consistent coding style.
- **Pre-commit Hooks:** **Husky** and **lint-staged** are configured to automatically lint and format all staged files before every commit.

#### Testing Strategy
- **Frameworks:** **Vitest** is used as the test runner, with **React Testing Library** for component testing.
- **Coverage:** The project maintains a high level of test coverage, ensuring all critical logic is validated.
- **Mocking:** The `chrome` global API is mocked using a manual, type-safe mock defined in `src/setupTests.ts`. This was a key architectural decision that enables robust, isolated unit tests.
- **Cancellation Testing:** Added tests for cancellation and timeout functionality in the service worker.

---

## 5. Project Evolution (Key Milestones)

1.  **Phase 0: Foundation:** Established the Vite + React + TypeScript project, configured all tooling, and set up the Manifest V3 structure.
2.  **Phase 1: UI Development:** Built the complete static UI and refactored to use "lifted state" for interactivity.
3.  **Phase 2: Communication:** Implemented the message passing bridge and core content extraction logic.
4.  **Phase 3: API Integration:** Integrated the Gemini API, added secure API key management, and built the initial results display.
5.  **Phase 4: Refinement, Features & Quality:**
    -   **UX Overhaul:** Implemented the Spotify-inspired theme and added real-time progress feedback.
    -   **Feature Expansion:** Added advanced scrape options, language selection, and model selection.
    -   **Architectural Refactor:** Evolved the backend from a simple queue to a "Vertical" pipeline processor, and finally to the "Matrix" workflow engine capable of combining both tabs and operations.
    -   **Quality Assurance:** Wrote a comprehensive suite of unit and component tests, achieving high code coverage and ensuring the application's stability.
6.  **Phase 5: Robustness & Usability:**
    -   **Cancellation Support:** Added process cancellation and timeout functionality.
    -   **UI Improvements:** Added tab refresh capability and improved the settings panel.
    -   **Enhanced Testing:** Added tests for cancellation and timeout scenarios.