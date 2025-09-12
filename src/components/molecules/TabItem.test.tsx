import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
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

describe('TabItem component', () => {
  it('renders the tab title and favicon correctly', () => {
    render(<TabItem tab={mockTab} isSelected={false} onSelect={() => {}} />);

    expect(screen.getByText('Test Tab Title')).toBeInTheDocument();
    const favicon = screen.getByAltText('favicon');
    expect(favicon).toBeInTheDocument();
    expect(favicon).toHaveAttribute('src', 'https://example.com/favicon.ico');
  });

  it('falls back to the default icon when favIconUrl is not provided', () => {
    render(
      <TabItem
        tab={mockTabWithoutFavicon}
        isSelected={false}
        onSelect={() => {}}
      />,
    );

    expect(screen.getByText('Another Test Tab')).toBeInTheDocument();
    const favicon = screen.getByAltText('favicon');
    expect(favicon).toBeInTheDocument();
    expect(favicon).toHaveAttribute('src', 'icons/icon512.png');
  });

  it('displays the checkbox as checked when isSelected is true', () => {
    render(<TabItem tab={mockTab} isSelected={true} onSelect={() => {}} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('displays the checkbox as unchecked when isSelected is false', () => {
    render(<TabItem tab={mockTab} isSelected={false} onSelect={() => {}} />);

    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('calls the onSelect callback with the correct tab id when the checkbox is clicked', () => {
    const handleSelect = vi.fn();
    render(
      <TabItem tab={mockTab} isSelected={false} onSelect={handleSelect} />,
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(1);
  });
});
