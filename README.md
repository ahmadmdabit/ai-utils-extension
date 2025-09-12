# AI Utils Extension

> A powerful Chrome extension that leverages Google's Gemini AI to intelligently manage and process browser tabs. Get AI-powered insights, organize tabs efficiently, and boost your productivity with a sleek, Spotify-inspired UI.

 <!-- Placeholder: Replace with an actual screenshot of your extension -->

---

## ✨ Features

### 🤖 AI-Powered Analysis
- **Smart Tab Summarization**: Get AI-generated summaries of your open tabs.
- **Advanced Data Scrape**: Extract specific information from pages using a variety of methods:
  - **Helpful Info (AI)**: Let Gemini find the most relevant information.
  - **Headings & Links**: Quickly pull all headings or hyperlinks.
  - **Tabular Data**: Extract data from HTML tables.
  - **Custom Prompts (AI)**: Ask the AI to find exactly what you need.
- **Smart Tab Translation**: Translate the content of any tab to your preferred language with language selection options including English, Turkish, Arabic, or any custom language.
- **Combine Results**: Synthesize information from multiple tabs into a single, cohesive output.

### 🎨 User Experience
- **Spotify-Inspired UI**: A clean, modern, and dark-themed interface.
- **Real-Time Feedback**: See the live status of each task (`Pending`, `Processing`, `Complete`, `Error`).
- **Secure API Key Management**: Your Gemini API key is stored securely in local browser storage.
- **Conditional UI**: The interface intelligently enables and disables options to guide you to a valid configuration.
- **Language Selection**: Choose from predefined languages or specify a custom language for translations.

## 🚀 Tech Stack

| Category              | Technology                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------------ |
| **Framework**         | [React 19](https://react.dev/) (with Hooks), [Vite](https://vitejs.dev/)                                 |
| **Language**          | [TypeScript](https://www.typescriptlang.org/)                                                          |
| **Styling**           | [Tailwind CSS v4](https://tailwindcss.com/) (using `@theme` directive), SCSS                           |
| **Extension APIs**    | Chrome Manifest V3 (`sidePanel`, `scripting`, `tabs`, `storage`)                                       |
| **Linting/Formatting**| [ESLint](https://eslint.org/) (Flat Config), [Prettier](https://prettier.io/)                            |
| **Git Hooks**         | [Husky](https://typicode.github.io/husky/) & [lint-staged](https://github.com/okonet/lint-staged)        |
| **Package Manager**   | [Yarn](https://yarnpkg.com/)                                                                           |

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
6.  Select one or more operations (e.g., "Summarize").
7.  For translation operations, select your target language from the language options (English, Turkish, Arabic, or custom).
8.  Click **"Start Processing"** and watch the results appear in real-time.

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
│   ├── atoms/
│   └── molecules/
├── features/        # "Smart" components that compose smaller components
├── hooks/           # Custom React hooks
├── services/        # API clients and Chrome API wrappers
├── styles/          # Global styles (index.css)
├── types/           # TypeScript type definitions
└── utils/           # Helper functions
```

### Git Workflow
- **Branching Model**: We follow the **GitFlow** model.
  - `main`: Contains production-ready, tagged releases.
  - `develop`: The primary development branch. All feature branches are merged here.
  - `feature/*`: Branches for new features (e.g., `feature/add-scrape-options`).
- **Pull Requests**: All code must be reviewed via a Pull Request before being merged into `develop`.

### ✍️ Commit Messages
- We follow the **[Conventional Commits](https://www.conventionalcommits.org/)** specification. This allows for automated changelog generation and a clear, readable commit history.
- **Examples**:
  - `feat(ui): add spotify-inspired theme`
  - `fix(service-worker): handle API rate limit errors`
  - `chore(deps): upgrade vite to latest version`
  - `docs(readme): update development conventions`

### 🎨 Coding Style
- **Formatting**: Enforced by **Prettier**.
- **Linting**: Enforced by **ESLint** with strict rules for TypeScript and React.
- **Automation**: **Husky** and **lint-staged** are configured to automatically lint and format all staged files on every `git commit`. This prevents style inconsistencies from ever entering the codebase.

### ✅ Testing
- **Unit & Component Tests**: Written with **[Vitest](https://vitest.dev/)** and **[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)**.
- **Goal**: To ensure critical logic (API services, utility functions) and UI components are reliable and behave as expected.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1.  Fork the repository.
2.  Create a new feature branch (`git checkout -b feature/your-amazing-feature`).
3.  Commit your changes following our commit message conventions.
4.  Push to your branch (`git push origin feature/your-amazing-feature`).
5.  Open a Pull Request against the `develop` branch.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.