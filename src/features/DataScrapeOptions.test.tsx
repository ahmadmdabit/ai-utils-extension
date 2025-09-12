// src/features/DataScrapeOptions.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DataScrapeOptions } from './DataScrapeOptions';

describe('DataScrapeOptions Component', () => {
  it('should render all radio options', () => {
    render(
      <DataScrapeOptions
        selectedOption="helpful"
        onOptionChange={() => {}}
        customPrompt=""
        onCustomPromptChange={() => {}}
      />
    );
    
    expect(screen.getByLabelText(/Extract helpful info/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Extract all headings/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Use custom prompt/i)).toBeInTheDocument();
  });

  it('should call onOptionChange when a radio button is clicked', () => {
    const handleOptionChange = vi.fn();
    render(
      <DataScrapeOptions
        selectedOption="helpful"
        onOptionChange={handleOptionChange}
        customPrompt=""
        onCustomPromptChange={() => {}}
      />
    );

    const headingsRadio = screen.getByLabelText(/Extract all headings/i);
    fireEvent.click(headingsRadio);

    expect(handleOptionChange).toHaveBeenCalledWith('headings');
  });

  it('should show the textarea only when "custom" is selected', () => {
    const { rerender } = render(
      <DataScrapeOptions
        selectedOption="helpful"
        onOptionChange={() => {}}
        customPrompt=""
        onCustomPromptChange={() => {}}
      />
    );

    // Textarea should not be visible initially
    expect(screen.queryByPlaceholderText(/e.g., Extract the names/i)).not.toBeInTheDocument();

    // Rerender the component with the 'custom' option selected
    rerender(
      <DataScrapeOptions
        selectedOption="custom"
        onOptionChange={() => {}}
        customPrompt=""
        onCustomPromptChange={() => {}}
      />
    );

    // Now the textarea should be visible
    expect(screen.getByPlaceholderText(/e.g., Extract the names/i)).toBeInTheDocument();
  });
});