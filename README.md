# AI Utils Extension

> A powerful Chrome extension that leverages Google's Gemini AI to intelligently manage and process browser tabs. Get AI-powered insights, organize tabs efficiently, and boost your productivity with a sleek, Spotify-inspired UI.

---

## ✨ Features

### 🤖 AI-Powered Analysis
- **Multi-Step Pipelines**: Execute complex, sequential operations on tab content.
  - **Smart Summarization**: Get AI-generated summaries of your open tabs.
  - **Translated Summary**: Summarize a page and then translate the summary into your chosen language.
  - **Dual-Language Summary**: Get a summary in both its original language and a translated version.
- **Advanced Data Scrape**: Extract specific information from pages using a variety of methods:
  - **Helpful Info (AI)**: Let Gemini find the most relevant information.
  - **Headings & Links**: Quickly pull all headings or hyperlinks.
  - **Tabular Data**: Extract data from HTML tables.
  - **Custom Prompts (AI)**: Ask the AI to find exactly what you need.
- **Direct Translation**: Translate the content of any tab to your preferred language.

### ⚙️ User Experience & Configuration
- **Spotify-Inspired UI**: A clean, modern, and dark-themed interface.
- **Real-Time Feedback**: See the live status of each task (`Pending`, `Processing`, `Complete`, `Error`).
- **Combine Tabs**: Synthesize the results from multiple tabs into a single, cohesive output with an AI-generated title. This powerful feature processes all selected tabs at each step of a pipeline before combining them, enabling complex analysis.
- **Secure API Key Management**: Your Gemini API key is stored securely using `chrome.storage.local`.
- **Model Selection**: Choose the Gemini model that fits your needs, from the fast `2.5 Flash-Lite` to the powerful `2.5 Pro`.
- **Language Selection**: Choose from predefined languages or specify any custom language for translations.
- **Process Cancellation**: Cancel long-running processes with the Cancel button.
- **Configurable Timeouts**: Set processing timeouts in the Settings panel to prevent indefinite processing.
- **Tab Refresh**: Refresh the tab list with the reload button to see your latest open tabs.

## 🚀 Tech Stack

| Category | Technology |
| :--- | :--- |
| **Framework** | [React 19](https://react.dev/) (with Hooks), [Vite](https://vitejs.dev/) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) (using `@theme` directive), SCSS |
| **Testing** | [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/) |
| **Extension APIs** | Chrome Manifest V3 (`sidePanel`, `scripting`, `tabs`, `storage`) |
| **Linting/Formatting**| [ESLint](https://eslint.org/) (Flat Config), [Prettier](https://prettier.io/) |
| **Git Hooks** | [Husky](https://typicode.github.io/husky/) & [lint-staged](https://github.com/okonet/lint-staged) |
| **Package Manager** | [Yarn](https://yarnpkg.com/) |

## 🛠️ Getting Started

Follow these instructions to set up the development environment on your local machine.

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later)
- [Yarn](https://yarnpkg.com/getting-started/install)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/ai-utils-extension.git
    cd ai-utils-extension
    ```

2.  **Install dependencies:**
    ```bash
    yarn install
    ```

3.  **Build the extension:**
    This command compiles the TypeScript/React code and packages it into the `dist/` directory.
    ```bash
    yarn build
    ```

### Loading the Extension in Chrome

1.  Open Google Chrome and navigate to `chrome://extensions`.
2.  Enable **"Developer mode"** using the toggle in the top-right corner.
3.  Click the **"Load unpacked"** button.
4.  Select the `dist` folder from this project directory.
5.  The "AI Utils Extension" should now appear in your extensions list and in the browser toolbar.

## 💻 Usage

1.  Click the extension icon in your Chrome toolbar to open the sidepanel.
2.  Click the **gear icon (⚙️)** to navigate to the Settings page.
3.  Enter your [Google Gemini API Key](https://ai.google.dev/) and click **"Save Key"**.
4.  Click **"Back"** to return to the main view.
5.  Select up to 3 open tabs you wish to process.
6.  Select an **Action** from the dropdown (e.g., "Summarize", "Translated Summary").
7.  Configure your action by selecting an **AI Model** and checking **"Combine results..."** if desired.
8.  If your chosen action involves translation, select a target language.
9.  Click **"Start Processing"** and watch the results appear in real-time.

## 📜 Development Conventions

This project adheres to a strict set of conventions to ensure code quality, consistency, and maintainability.

### Software Design Principles
- **SOLID**: Components and services are designed with the Single Responsibility Principle in mind.
- **KISS (Keep It Simple, Stupid)**: We aim for the simplest effective solution.
- **YAGNI (You Ain't Gonna Need It)**: We avoid implementing features until they are actually required.
- **DRY (Don't Repeat Yourself)**: Logic is abstracted into reusable hooks, services, and components.

### 📁 Directory Structure
The project uses a feature-sliced, atomic design-inspired structure to keep the codebase organized and scalable.

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

### Git Workflow
- **Branching Model**: We follow the **GitFlow** model.
  - `main`: Contains production-ready, tagged releases.
  - `develop`: The primary development branch. All feature branches are merged here.
  - `feature/*`: Branches for new features.
- **Pull Requests**: All code must be reviewed via a Pull Request before being merged into `develop`.

### ✍️ Commit Messages
- We follow the **[Conventional Commits](https://www.conventionalcommits.org/)** specification. This allows for automated changelog generation and a clear, readable commit history.

### 🎨 Coding Style
- **Formatting**: Enforced by **Prettier**.
- **Linting**: Enforced by **ESLint** with strict rules for TypeScript and React.
- **Automation**: **Husky** and **lint-staged** are configured to automatically lint and format all staged files on every `git commit`.

### ✅ Testing
- **Frameworks**: **[Vitest](https://vitest.dev/)** for test running and **[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)** for component testing.
- **Coverage**: The project maintains a high level of test coverage across all components and services.
- **Mocks**: The `chrome` API and other external dependencies are mocked using Vitest's global mocks (`src/setupTests.ts`) to ensure reliable and fast unit tests.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the repository.
2.  Create a new feature branch (`git checkout -b feature/your-amazing-feature`).
3.  Commit your changes following our commit message conventions.
4.  Push to your branch (`git push origin feature/your-amazing-feature`).
5.  Open a Pull Request against the `develop` branch.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.