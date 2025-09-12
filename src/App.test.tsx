import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import App from './App';
import * as chromeService from './services/chromeService';
import { act } from 'react';
import type { TabSelectionListProps } from './features/TabSelectionList';
import type { PipelineSelectorProps } from './features/PipelineSelector';
import type { SettingsProps } from './features/Settings';
import type { ButtonProps } from './components/atoms/Button';
import type { ResultsDisplayProps } from './features/ResultsDisplay';
import type { Message, PipelineOperation } from './types/messaging';

// Mock child components
vi.mock('./features/TabSelectionList', () => ({
  TabSelectionList: (props: TabSelectionListProps) => (
    <div
      data-testid="tab-selection-list"
      onClick={() => act(() => props.onTabSelect(1))}
    ></div>
  ),
}));
vi.mock('./features/PipelineSelector', () => ({
  PipelineSelector: (props: PipelineSelectorProps) => (
    <select
      data-testid="pipeline-selector"
      value={props.selectedPipeline}
      onChange={(e) =>
        act(() => props.onPipelineChange(e.target.value as PipelineOperation))
      }
      title="PipelineSelector"
    >
      {/* Add options for testing changes */}
      <option value="summarize">Summarize</option>
      <option value="scrape">Scrape Data</option>
      <option value="translate">Translate</option>
    </select>
  ),
}));
vi.mock('./features/DataScrapeOptions', () => ({
  DataScrapeOptions: () => <div data-testid="data-scrape-options"></div>,
}));
vi.mock('./features/LanguageSelector', () => ({
  LanguageSelector: () => <div data-testid="language-selector"></div>,
}));
vi.mock('./features/Settings', () => ({
  Settings: (props: SettingsProps) => (
    <div
      data-testid="settings-view"
      onClick={() => act(() => props.onClose())}
    ></div>
  ),
}));
vi.mock('./features/ResultsDisplay', () => ({
  ResultsDisplay: (props: ResultsDisplayProps) => (
    <div
      data-testid="results-display"
      onClick={() => act(() => props.onClear())}
    ></div>
  ),
}));
vi.mock('./components/atoms/Button', () => ({
  Button: (props: ButtonProps) => (
    <button disabled={props.disabled} onClick={props.onClick}>
      {props.children}
    </button>
  ),
}));

// Mock chrome service and global API
vi.mock('./services/chromeService');
vi.stubGlobal('chrome', {
  runtime: {
    onMessage: {
      addListener: vi.fn(),
      removeListener: vi.fn(),
    },
  },
});

describe('App component', () => {
  const sendMessageMock = vi.spyOn(chromeService, 'sendMessageToServiceWorker');

  beforeEach(() => {
    vi.clearAllMocks();
    (chrome.runtime.onMessage.addListener as Mock).mockClear();
    (chrome.runtime.onMessage.removeListener as Mock).mockClear();
  });

  it('renders the main view correctly', () => {
    render(<App />);
    expect(screen.getByText('AI Utils')).toBeInTheDocument();
  });

  it('switches to the settings view and back', () => {
    render(<App />);
    fireEvent.click(screen.getByLabelText('Settings'));
    expect(screen.getByTestId('settings-view')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('settings-view'));
    expect(screen.queryByTestId('settings-view')).not.toBeInTheDocument();
  });

  it('enables start button only when a tab is selected', () => {
    render(<App />);
    const startButton = screen.getByRole('button', {
      name: 'Start Processing',
    });
    expect(startButton).toBeDisabled();
    fireEvent.click(screen.getByTestId('tab-selection-list'));
    expect(startButton).not.toBeDisabled();
  });

  it('conditionally renders scrape and translate options', async () => {
    render(<App />);
    const pipelineSelector = screen.getByTestId('pipeline-selector');

    expect(screen.queryByTestId('data-scrape-options')).not.toBeInTheDocument();

    fireEvent.change(pipelineSelector, { target: { value: 'scrape' } });
    expect(
      await screen.findByTestId('data-scrape-options'),
    ).toBeInTheDocument();

    fireEvent.change(pipelineSelector, { target: { value: 'translate' } });
    expect(await screen.findByTestId('language-selector')).toBeInTheDocument();
    expect(screen.queryByTestId('data-scrape-options')).not.toBeInTheDocument();
  });

  it('calls sendMessageToServiceWorker on start', () => {
    render(<App />);
    fireEvent.click(screen.getByTestId('tab-selection-list'));
    fireEvent.click(screen.getByRole('button', { name: 'Start Processing' }));
    expect(sendMessageMock).toHaveBeenCalledWith({
      type: 'START_PROCESSING',
      payload: expect.any(Object),
    });
  });

  it('updates tasks and processing state based on chrome runtime messages', async () => {
    let messageCallback: (
      message: Message,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: unknown) => void,
    ) => void;
    (chrome.runtime.onMessage.addListener as Mock).mockImplementation((cb) => {
      messageCallback = cb;
    });
    render(<App />);

    act(() => {
      messageCallback(
        {
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
        },
        undefined as unknown as chrome.runtime.MessageSender,
        undefined as unknown as (response?: unknown) => void,
      );
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Processing...' }),
      ).toBeInTheDocument();
    });
  });

  it('clears results when clear button is clicked', async () => {
    let messageCallback: (
      message: Message,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: unknown) => void,
    ) => void;
    (chrome.runtime.onMessage.addListener as Mock).mockImplementation((cb) => {
      messageCallback = cb;
    });
    render(<App />);

    act(() => {
      messageCallback(
        {
          type: 'ALL_TASKS_QUEUED',
          payload: {
            tasks: [
              {
                taskId: '1',
                status: 'complete',
                tabId: 0,
                operation: 'summarize',
                tabTitle: '',
              },
            ],
          },
        },
        undefined as unknown as chrome.runtime.MessageSender,
        undefined as unknown as (response?: unknown) => void,
      );
    });

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Start Processing' }),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('results-display'));

    expect(
      screen.getByRole('button', { name: 'Start Processing' }),
    ).toBeInTheDocument();
  });

  it('correctly unregisters the message listener on unmount', () => {
    const removeListenerMock = vi.spyOn(
      chrome.runtime.onMessage,
      'removeListener',
    );
    const { unmount } = render(<App />);
    unmount();
    expect(removeListenerMock).toHaveBeenCalledTimes(1);
  });
});
