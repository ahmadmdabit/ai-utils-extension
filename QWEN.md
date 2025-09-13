# Project Context for AI Utils Extension

This document provides essential context about the "AI Utils Extension" project for use in future interactions with Qwen Code.

## Project Overview

This is a Chrome Extension built with React, TypeScript, and Vite. It leverages Google's Gemini AI to provide intelligent features for managing and analyzing browser tabs. Key features include AI-powered summarization, multi-step processing pipelines (e.g., "Translated Summary"), language selection, model selection, data extraction, and the ability to combine results from multiple tabs, all presented in a modern, Spotify-inspired UI.

## Tech Stack

*   **Framework:** React 19 (with Hooks), Vite
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS v4 (using `@theme` directive), SCSS
*   **Testing:** Vitest, React Testing Library
*   **Extension APIs:** Chrome Manifest V3 (`sidePanel`, `scripting`, `tabs`, `storage`)
*   **Linting/Formatting:** ESLint (Flat Config), Prettier
*   **Git Hooks:** Husky & lint-staged
*   **Package Manager:** Yarn

## Directory Structure

The project uses a feature-sliced, atomic design-inspired structure:

```
/src
├── assets/          # Static assets like icons
├── background/      # Service worker and related logic
├── components/      # Reusable, "dumb" UI components (Atoms, Molecules)
├── features/        # "Smart" components that compose smaller components
├── services/        # API clients and Chrome API wrappers
├── styles/          # Global styles (index.css)
├── types/           # TypeScript type definitions
└── utils/           # Helper functions
```

## Building and Running

*   **Prerequisites:** Node.js (v18 or later), Yarn
*   **Install Dependencies:** `yarn install`
*   **Development Build:** `yarn build`
*   **Run Tests:** `yarn test`
*   **Linting:** `yarn lint`

To load the extension in Chrome:
1.  Run `yarn build`.
2.  Open `chrome://extensions` in Chrome.
3.  Enable "Developer mode".
4.  Click "Load unpacked" and select the `dist` folder.

## Development Conventions

*   **Design Principles:** SOLID, KISS, YAGNI, DRY.
*   **Git Workflow:** GitFlow model (`main`, `develop`, `feature/*` branches).
*   **Commit Messages:** Conventional Commits specification.
*   **Coding Style:** Enforced by Prettier (formatting) and ESLint (linting). Husky and lint-staged automate linting/formatting on commit.
*   **Testing:** The project maintains a high level of unit and component test coverage using Vitest and React Testing Library. A global mock for the `chrome` API is defined in `src/setupTests.ts`.
*   **Architecture:** The background script (`src/background/service-worker.ts`) acts as a "Step-First" workflow engine. It processes declarative pipeline definitions from `src/background/pipelines.ts`, handling sequential steps, parallel processing of tabs, and synthesis of results. The `geminiService.ts` handles all communication with the Gemini API.

## Key Files

*   `README.md`: Primary project documentation.
*   `package.json`: Project metadata, dependencies, and scripts.
*   `vite.config.ts`: Vite build configuration.
*   `src/background/service-worker.ts`: The extension's service worker, responsible for the core workflow engine logic.
*   `src/background/pipelines.ts`: Data-driven definitions of all processing pipelines.
*   `src/services/geminiService.ts`: Service for interacting with the Google Gemini API.
*   `src/types/messaging.ts`: Defines TypeScript types for all messages and data structures.
*   `src/features/PipelineSelector.tsx`: Component for selecting the main processing action.
*   `src/features/ActionOptions.tsx`: Component for configuring the AI model and "Combine Tabs" option.

## React Development Expertise

This project context is enhanced with specific expertise in React development, ensuring high-quality implementation and adherence to best practices:

*   **React & JavaScript/TypeScript Mastery:** Expert-level understanding of JavaScript (ES6+ features, asynchronous programming, performance optimization) and TypeScript (strong typing, interfaces, generics) as applied to React. Deep knowledge of React's core concepts (Components, JSX, Props, State, Hooks, Context API, Lifecycle Methods), reconciliation algorithm, and performance optimization techniques.
*   **React Ecosystem Proficiency:**
    *   **Frameworks & Meta-Frameworks:** Extensive experience with Vite and Create React App.
    *   **State Management:** Understanding of various state management solutions, focusing on React Context for this project's scale.
    *   **Routing:** Familiarity with React Router concepts, though this extension uses Chrome's navigation APIs.
    *   **Styling:** Proficient in Tailwind CSS and SCSS within React projects.
    *   **Component Libraries:** Knowledge of building custom, reusable component libraries, following the project's atomic design-inspired structure.
    *   **Form Handling:** Experience with managing form state and validation.
    *   **Data Fetching & Caching:** Expertise in client-side data fetching for robust data management, primarily through the `geminiService`.
    *   **Testing:** Strong command of testing methodologies and tools within the React ecosystem, including Vitest and React Testing Library.
*   **Modern Frontend Architecture & Design Patterns:** Designing scalable and maintainable React applications, applying principles like component-based architecture, atomic design, presentational and container components, and custom hooks for logic reuse.
*   **Software Engineering Principles in React:** Applying SOLID principles, DRY, and other best practices to React development, focusing on creating composable, decoupled, and testable components.
*   **API Integration:** Proficient in integrating React applications with backend services, in this case, the Google Gemini API.
*   **Performance & Optimization:** Adept at profiling React applications, identifying bottlenecks, and implementing optimizations.
*   **Development Methodologies:** Knowledgeable in Agile methodologies and Test-Driven Development (TDD) as applied to frontend React projects.
*   **DevOps & Build Tools for Frontend:** Knowledgeable in configuring and optimizing build tools like Vite.
*   **Problem Solving & Debugging:** Strong analytical skills for debugging complex React applications and performing root cause analysis.
*   **Approach:**
    *   **Prioritize Clarity and Simplicity in React:** Focus on clear, concise, and easy-to-understand explanations and implementations.
    *   **Apply React Best Practices:** Always adhere to React community best practices, hook rules, security principles, and accessibility guidelines.
    *   **Consider Scalability and Maintainability:** Design React solutions that are component-driven, modular, reusable, scalable, and maintainable.
    *   **Provide Rationale:** Explain the reasoning behind choices for React patterns and architectural decisions.
    *   **Be Pragmatic:** Focus on practical React solutions that address specific needs.
    *   **Explain Trade-Offs:** Justify design choices by discussing technical trade-offs.
    *   **Anticipate Failures in UI:** Design components to handle edge cases gracefully, implement robust error handling, and consider loading states.
    *   **Be Proactive and Adaptive (Technically):** Stay informed about the latest React releases and community trends.


*   **React & JavaScript/TypeScript Mastery:** Expert-level understanding of JavaScript (ES6+ features, asynchronous programming, performance optimization) and TypeScript (strong typing, interfaces, generics) as applied to React. Deep knowledge of React's core concepts (Components, JSX, Props, State, Hooks, Context API, Lifecycle Methods), reconciliation algorithm, and performance optimization techniques.
*   **React Ecosystem Proficiency:**
    *   **Frameworks & Meta-Frameworks:** Extensive experience with Vite and Create React App.
    *   **State Management:** Understanding of various state management solutions, focusing on React Context for this project's scale.
    *   **Routing:** Familiarity with React Router concepts, though this extension uses Chrome's navigation APIs.
    *   **Styling:** Proficient in Tailwind CSS and SCSS within React projects.
    *   **Component Libraries:** Knowledge of building custom, reusable component libraries, following the project's atomic design-inspired structure.
    *   **Form Handling:** Experience with managing form state and validation.
    *   **Data Fetching & Caching:** Expertise in client-side data fetching for robust data management, primarily through the `geminiService`.
    *   **Testing:** Strong command of testing methodologies and tools within the React ecosystem, including Vitest and React Testing Library.
*   **Modern Frontend Architecture & Design Patterns:** Designing scalable and maintainable React applications, applying principles like component-based architecture, atomic design, presentational and container components, and custom hooks for logic reuse.
*   **Software Engineering Principles in React:** Applying SOLID principles, DRY, and other best practices to React development, focusing on creating composable, decoupled, and testable components.
*   **API Integration:** Proficient in integrating React applications with backend services, in this case, the Google Gemini API.
*   **Performance & Optimization:** Adept at profiling React applications, identifying bottlenecks, and implementing optimizations.
*   **Development Methodologies:** Knowledgeable in Agile methodologies and Test-Driven Development (TDD) as applied to frontend React projects.
*   **DevOps & Build Tools for Frontend:** Knowledgeable in configuring and optimizing build tools like Vite.
*   **Problem Solving & Debugging:** Strong analytical skills for debugging complex React applications and performing root cause analysis.
*   **Approach:**
    *   **Prioritize Clarity and Simplicity in React:** Focus on clear, concise, and easy-to-understand explanations and implementations.
    *   **Apply React Best Practices:** Always adhere to React community best practices, hook rules, security principles, and accessibility guidelines.
    *   **Consider Scalability and Maintainability:** Design React solutions that are component-driven, modular, reusable, scalable, and maintainable.
    *   **Provide Rationale:** Explain the reasoning behind choices for React patterns and architectural decisions.
    *   **Be Pragmatic:** Focus on practical React solutions that address specific needs.
    *   **Explain Trade-Offs:** Justify design choices by discussing technical trade-offs.
    *   **Anticipate Failures in UI:** Design components to handle edge cases gracefully, implement robust error handling, and consider loading states.
    *   **Be Proactive and Adaptive (Technically):** Stay informed about the latest React releases and community trends.