import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { TabSelectionList } from './TabSelectionList';
import type { Tab } from '../types/chrome';

const mockTabs: Tab[] = [
  { id: 1, title: 'Tab 1', url: 'https://example.com/1', favIconUrl: '' },
  { id: 2, title: 'Tab 2', url: 'https://example.com/2', favIconUrl: '' },
  { id: 3, title: 'Tab 3', url: 'https://example.com/3', favIconUrl: '' },
  { id: 4, title: 'Chrome Tab', url: 'chrome://extensions', favIconUrl: '' },
  { id: 5, title: 'Tab 4', url: 'https://example.com/4', favIconUrl: '' },
];

describe('TabSelectionList', () => {
  let container: HTMLElement | null = null;
  let root: ReturnType<typeof createRoot> | null = null;
  const onTabSelectMock = vi.fn();

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('chrome', {
      tabs: {
        query: vi.fn(),
      },
    });
  });

  afterEach(() => {
    if (root && container) {
      act(() => {
        root!.unmount();
      });
      document.body.removeChild(container!);
      container = null;
    }
    vi.clearAllMocks();
    (console.warn as Mock).mockRestore();
  });

  it('shows a loading state initially', () => {
    (chrome.tabs.query as Mock).mockImplementation(() => {}); // Does not resolve
    act(() => {
      root!.render(
        <TabSelectionList selectedTabs={[]} onTabSelect={onTabSelectMock} />,
      );
    });
    expect(container!.textContent).toContain('Loading tabs...');
  });

  it('shows a "no tabs found" message if the tabs array is empty', async () => {
    (chrome.tabs.query as Mock).mockImplementation((_query, callback) =>
      callback([]),
    );
    await act(async () => {
      root!.render(
        <TabSelectionList selectedTabs={[]} onTabSelect={onTabSelectMock} />,
      );
    });
    expect(container!.textContent).toContain('No open tabs found.');
  });

  it('renders a list of tabs, filtering out chrome:// URLs', async () => {
    (chrome.tabs.query as Mock).mockImplementation((_query, callback) =>
      callback(mockTabs),
    );
    await act(async () => {
      root!.render(
        <TabSelectionList selectedTabs={[]} onTabSelect={onTabSelectMock} />,
      );
    });
    expect(container!.textContent).toContain('Tab 1');
    expect(container!.textContent).toContain('Tab 4');
    expect(container!.textContent).not.toContain('Chrome Tab');
    expect(container!.querySelectorAll('input[type="checkbox"]').length).toBe(
      4,
    );
  });

  it('handles selection and reflects the selected state correctly', async () => {
    (chrome.tabs.query as Mock).mockImplementation((_query, callback) =>
      callback(mockTabs),
    );
    await act(async () => {
      root!.render(
        <TabSelectionList selectedTabs={[1]} onTabSelect={onTabSelectMock} />,
      );
    });
    const tab1Checkbox = container!.querySelector(
      'input[id="tab-1"]',
    ) as HTMLInputElement;
    expect(tab1Checkbox.checked).toBe(true);
  });

  it('calls onTabSelect when a tab is clicked', async () => {
    (chrome.tabs.query as Mock).mockImplementation((_query, callback) =>
      callback(mockTabs),
    );
    await act(async () => {
      root!.render(
        <TabSelectionList selectedTabs={[]} onTabSelect={onTabSelectMock} />,
      );
    });
    const tab2Checkbox = container!.querySelector('input[id="tab-2"]');
    await act(async () => {
      tab2Checkbox!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(onTabSelectMock).toHaveBeenCalledWith(2);
  });

  it('prevents selecting more than MAX_TABS and logs a warning', async () => {
    (chrome.tabs.query as Mock).mockImplementation((_query, callback) =>
      callback(mockTabs),
    );
    await act(async () => {
      root!.render(
        <TabSelectionList
          selectedTabs={[1, 2, 3]}
          onTabSelect={onTabSelectMock}
        />,
      );
    });
    const tab4Checkbox = container!.querySelector('input[id="tab-5"]');
    await act(async () => {
      tab4Checkbox!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(onTabSelectMock).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      'Cannot select more than 3 tabs.',
    );
  });

  it('allows deselecting a tab even when at MAX_TABS', async () => {
    (chrome.tabs.query as Mock).mockImplementation((_query, callback) =>
      callback(mockTabs),
    );
    await act(async () => {
      root!.render(
        <TabSelectionList
          selectedTabs={[1, 2, 3]}
          onTabSelect={onTabSelectMock}
        />,
      );
    });
    const tab1Checkbox = container!.querySelector('input[id="tab-1"]');
    await act(async () => {
      tab1Checkbox!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(onTabSelectMock).toHaveBeenCalledWith(1);
  });

  it('displays the correct selection count', async () => {
    (chrome.tabs.query as Mock).mockImplementation((_query, callback) =>
      callback(mockTabs),
    );
    await act(async () => {
      root!.render(
        <TabSelectionList
          selectedTabs={[1, 3]}
          onTabSelect={onTabSelectMock}
        />,
      );
    });
    expect(container!.textContent).toContain('2 / 3 selected');
  });
});
