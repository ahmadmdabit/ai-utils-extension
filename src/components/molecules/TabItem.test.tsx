import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent } from '../../test-utils';
import { TabItem } from './TabItem';
import type { Tab } from '../../types/chrome';

const mockTab: Tab = {
  id: 1,
  title: 'Test Tab Title',
  url: 'https://example.com',
  favIconUrl: 'https://example.com/favicon.ico',
};

const mockTabWithoutFavicon: Tab = {
  id: 2,
  title: 'Another Test Tab',
  url: 'https://anotherexample.com',
};

describe('TabItem', () => {
  let unmount: () => void;

  afterEach(() => {
    if (unmount) {
      unmount();
    }
  });

  it('renders the tab title and favicon correctly', () => {
    const result = render(
      <TabItem tab={mockTab} isSelected={false} onSelect={() => {}} />,
    );
    unmount = result.unmount;
    expect(result.container.textContent).toContain('Test Tab Title');
    const favicon = result.container.querySelector('img[alt="favicon"]');
    expect(favicon).not.toBeNull();
    expect(favicon?.getAttribute('src')).toBe(
      'https://example.com/favicon.ico',
    );
  });

  it('falls back to the default icon when favIconUrl is not provided', () => {
    const result = render(
      <TabItem
        tab={mockTabWithoutFavicon}
        isSelected={false}
        onSelect={() => {}}
      />,
    );
    unmount = result.unmount;
    expect(result.container.textContent).toContain('Another Test Tab');
    const favicon = result.container.querySelector('img[alt="favicon"]');
    expect(favicon).not.toBeNull();
    expect(favicon?.getAttribute('src')).toBe('icons/icon512.png');
  });

  it('displays the checkbox as checked when isSelected is true', () => {
    const result = render(
      <TabItem tab={mockTab} isSelected={true} onSelect={() => {}} />,
    );
    unmount = result.unmount;
    const checkbox = result.container.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    expect(checkbox).not.toBeNull();
    expect(checkbox.checked).toBe(true);
  });

  it('displays the checkbox as unchecked when isSelected is false', () => {
    const result = render(
      <TabItem tab={mockTab} isSelected={false} onSelect={() => {}} />,
    );
    unmount = result.unmount;
    const checkbox = result.container.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    expect(checkbox).not.toBeNull();
    expect(checkbox.checked).toBe(false);
  });

  it('calls the onSelect callback with the correct tab id when the checkbox is clicked', () => {
    const handleSelect = vi.fn();
    const result = render(
      <TabItem tab={mockTab} isSelected={false} onSelect={handleSelect} />,
    );
    unmount = result.unmount;
    const checkbox = result.container.querySelector('input[type="checkbox"]');
    if (checkbox) {
      fireEvent.click(checkbox);
    }
    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(1);
  });
});
