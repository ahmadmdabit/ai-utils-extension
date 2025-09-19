import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import * as chromeService from './services/chromeService';
import type { TabSelectionListProps } from './features/TabSelectionList';
import type { PipelineSelectorProps } from './features/PipelineSelector';
import type { SettingsProps } from './features/Settings';
import type { Message, PipelineOperation } from './types/messaging';

// Mock child components to isolate the App component
vi.mock('./features/TabSelectionList', () => ({
  TabSelectionList: (props: TabSelectionListProps) => (
    <div
      data-testid="tab-selection-list"
      onClick={() => props.onTabSelect(1)}
    ></div>
  ),
}));
vi.mock('./features/PipelineSelector', () => ({
  PipelineSelector: (props: PipelineSelectorProps) => (
    <select
      title="pipeline-selector"
      data-testid="pipeline-selector"
      value={props.selectedPipeline}
      onChange={(e) =>
        props.onPipelineChange(e.target.value as PipelineOperation)
      }
    >
      <option value="summarize">Summarize</option>
      <option value="scrape">Scrape Data</option>
      <option value="translate">Translate</option>
    </select>
  ),
}));
vi.mock('./features/Settings', () => ({
  Settings: (props: SettingsProps) => (
    <div data-testid="settings-view" onClick={props.onClose}></div>
  ),
}));
vi.mock('./features/DataScrapeOptions', () => ({
  DataScrapeOptions: () => <div data-testid="data-scrape-options"></div>,
}));
vi.mock('./features/LanguageSelector', () => ({
  LanguageSelector: () => <div data-testid="language-selector"></div>,
}));
vi.mock('./features/ResultsDisplay', () => ({
  ResultsDisplay: ({ onClear }: { onClear: () => void }) => (
    <div data-testid="results-display" onClick={onClear}></div>
  ),
}));

describe('App', () => {
  let container: HTMLElement | null = null;
  let root: ReturnType<typeof createRoot> | null = null;
  let messageCallback: (message: Message) => void;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);

    vi.spyOn(chromeService, 'sendMessageToServiceWorker').mockImplementation(
      () => {},
    );
    vi.stubGlobal('chrome', {
      runtime: {
        onMessage: {
          addListener: vi.fn((cb) => {
            messageCallback = cb;
          }),
          removeListener: vi.fn(),
        },
      },
    });
  });

  afterEach(() => {
    act(() => {
      root!.unmount();
    });
    document.body.removeChild(container!);
    container = null;
    vi.clearAllMocks();
  });

  it('renders the main view correctly', async () => {
    await act(async () => {
      root!.render(<App />);
    });
    expect(container!.textContent).toContain('AI Utils');
  });

  it('switches to the settings view and back', async () => {
    await act(async () => {
      root!.render(<App />);
    });
    const settingsButton = container!.querySelector('[aria-label="Settings"]');
    await act(async () => {
      settingsButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(
      container!.querySelector('[data-testid="settings-view"]'),
    ).not.toBeNull();

    const settingsView = container!.querySelector(
      '[data-testid="settings-view"]',
    );
    await act(async () => {
      settingsView!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(
      container!.querySelector('[data-testid="settings-view"]'),
    ).toBeNull();
  });

  it('enables start button only when a tab is selected', async () => {
    await act(async () => {
      root!.render(<App />);
    });
    const startButton = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent === 'Start Processing',
    );
    expect(startButton!.hasAttribute('disabled')).toBe(true);

    const tabList = container!.querySelector(
      '[data-testid="tab-selection-list"]',
    );
    await act(async () => {
      tabList!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(startButton!.hasAttribute('disabled')).toBe(false);
  });

  it('calls sendMessageToServiceWorker on start', async () => {
    await act(async () => {
      root!.render(<App />);
    });
    const tabList = container!.querySelector(
      '[data-testid="tab-selection-list"]',
    );
    await act(async () => {
      tabList!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    const startButton = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent === 'Start Processing',
    );
    await act(async () => {
      startButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(chromeService.sendMessageToServiceWorker).toHaveBeenCalledWith({
      type: 'START_PROCESSING',
      payload: expect.any(Object),
    });
  });

  it('updates processing state based on chrome runtime messages', async () => {
    await act(async () => {
      root!.render(<App />);
    });

    await act(async () => {
      messageCallback({
        type: 'ALL_TASKS_QUEUED',
        payload: {
          tasks: [
            {
              taskId: '1',
              status: 'pending',
              tabId: 0,
              operation: 'summarize',
              tabTitle: '',
            },
          ],
        },
      });
    });

    const cancelButton = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent === 'Cancel',
    );
    expect(cancelButton).not.toBeNull();
  });

  it('correctly unregisters the message listener on unmount', async () => {
    await act(async () => {
      root!.render(<App />);
    });

    const removeListenerMock = chrome.runtime.onMessage.removeListener;

    act(() => {
      root!.unmount();
    });

    expect(removeListenerMock).toHaveBeenCalledTimes(1);
  });
});
