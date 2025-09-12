import { render, screen, fireEvent } from '@testing-library/react';
import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from 'vitest';
import { TabSelectionList } from './TabSelectionList';
import type { Tab } from '../types/chrome';

const mockTabs: Tab[] = [
  { id: 1, title: 'Tab 1', url: 'https://example.com/1', favIconUrl: '' },
  { id: 2, title: 'Tab 2', url: 'https://example.com/2', favIconUrl: '' },
  { id: 3, title: 'Tab 3', url: 'https://example.com/3', favIconUrl: '' },
  { id: 4, title: 'Chrome Tab', url: 'chrome://extensions', favIconUrl: '' },
  { id: 5, title: 'Tab 4', url: 'https://example.com/4', favIconUrl: '' },
];

// Set up a mock for the global chrome object before all tests
vi.stubGlobal('chrome', {
  tabs: {
    query: vi.fn(),
  },
});

describe('TabSelectionList component', () => {
  const onTabSelectMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.warn as Mock).mockRestore();
  });

  it('shows a loading state initially', () => {
    (chrome.tabs.query as Mock).mockImplementation(() => {}); // Does not resolve
    render(
      <TabSelectionList selectedTabs={[]} onTabSelect={onTabSelectMock} />,
    );
    expect(screen.getByText('Loading tabs...')).toBeInTheDocument();
  });

  it('shows a "no tabs found" message if the tabs array is empty', async () => {
    (chrome.tabs.query as Mock).mockImplementation(
      (_query: chrome.tabs.QueryInfo, callback: (tabs: Tab[]) => void) =>
        callback([]),
    );
    render(
      <TabSelectionList selectedTabs={[]} onTabSelect={onTabSelectMock} />,
    );
    expect(await screen.findByText('No open tabs found.')).toBeInTheDocument();
  });

  it('renders a list of tabs, filtering out chrome:// URLs', async () => {
    (chrome.tabs.query as Mock).mockImplementation(
      (_query: chrome.tabs.QueryInfo, callback: (tabs: Tab[]) => void) =>
        callback(mockTabs),
    );
    render(
      <TabSelectionList selectedTabs={[]} onTabSelect={onTabSelectMock} />,
    );
    expect(await screen.findByText('Tab 1')).toBeInTheDocument();
    expect(screen.getByText('Tab 4')).toBeInTheDocument();
    expect(screen.queryByText('Chrome Tab')).not.toBeInTheDocument();
    expect(screen.getAllByRole('checkbox')).toHaveLength(4);
  });

  it('handles selection and reflects the selected state correctly', async () => {
    (chrome.tabs.query as Mock).mockImplementation(
      (_query: chrome.tabs.QueryInfo, callback: (tabs: Tab[]) => void) =>
        callback(mockTabs),
    );
    render(
      <TabSelectionList selectedTabs={[1]} onTabSelect={onTabSelectMock} />,
    );
    const tab1Checkbox = await screen.findByTestId('checkbox-tab-1');
    expect(tab1Checkbox).toBeChecked();
  });

  it('calls onTabSelect when a tab is clicked', async () => {
    (chrome.tabs.query as Mock).mockImplementation(
      (_query: chrome.tabs.QueryInfo, callback: (tabs: Tab[]) => void) =>
        callback(mockTabs),
    );
    render(
      <TabSelectionList selectedTabs={[]} onTabSelect={onTabSelectMock} />,
    );
    const tab2Checkbox = await screen.findByTestId('checkbox-tab-2');
    fireEvent.click(tab2Checkbox);
    expect(onTabSelectMock).toHaveBeenCalledWith(2);
  });

  it('prevents selecting more than MAX_TABS and logs a warning', async () => {
    (chrome.tabs.query as Mock).mockImplementation(
      (_query: chrome.tabs.QueryInfo, callback: (tabs: Tab[]) => void) =>
        callback(mockTabs),
    );
    render(
      <TabSelectionList
        selectedTabs={[1, 2, 3]}
        onTabSelect={onTabSelectMock}
      />,
    );
    const tab4Checkbox = await screen.findByTestId('checkbox-tab-5'); // Tab with id 5 is the 4th valid tab
    fireEvent.click(tab4Checkbox);
    expect(onTabSelectMock).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      'Cannot select more than 3 tabs.',
    );
  });

  it('allows deselecting a tab even when at MAX_TABS', async () => {
    (chrome.tabs.query as Mock).mockImplementation(
      (_query: chrome.tabs.QueryInfo, callback: (tabs: Tab[]) => void) =>
        callback(mockTabs),
    );
    render(
      <TabSelectionList
        selectedTabs={[1, 2, 3]}
        onTabSelect={onTabSelectMock}
      />,
    );
    const tab1Checkbox = await screen.findByTestId('checkbox-tab-1');
    fireEvent.click(tab1Checkbox);
    expect(onTabSelectMock).toHaveBeenCalledWith(1);
  });

  it('displays the correct selection count', async () => {
    (chrome.tabs.query as Mock).mockImplementation(
      (_query: chrome.tabs.QueryInfo, callback: (tabs: Tab[]) => void) =>
        callback(mockTabs),
    );
    render(
      <TabSelectionList selectedTabs={[1, 3]} onTabSelect={onTabSelectMock} />,
    );
    expect(await screen.findByText('2 / 3 selected')).toBeInTheDocument();
  });

  it('handles the case where chrome API is not available', async () => {
    const originalChrome = global.chrome;
    (global as unknown as { chrome?: typeof chrome }).chrome = undefined;

    render(
      <TabSelectionList selectedTabs={[]} onTabSelect={onTabSelectMock} />,
    );
    expect(await screen.findByText('No open tabs found.')).toBeInTheDocument();
    expect(console.warn).toHaveBeenCalledWith(
      'Chrome tabs API not available. Using mock data.',
    );

    global.chrome = originalChrome; // Restore
  });
});

// We need to update the Checkbox component to accept a data-testid
