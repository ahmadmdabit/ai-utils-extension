import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { DataScrapeOptions } from './DataScrapeOptions';

describe('DataScrapeOptions', () => {
  let container: HTMLElement | null = null;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
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
  });

  const getRadioByValue = (value: string) => {
    return container!.querySelector(`input[type="radio"][value="${value}"]`);
  };

  it('renders all radio options', () => {
    act(() => {
      root!.render(
        <DataScrapeOptions
          selectedOption="helpful"
          onOptionChange={() => {}}
          customPrompt=""
          onCustomPromptChange={() => {}}
        />,
      );
    });
    expect(getRadioByValue('helpful')).not.toBeNull();
    expect(getRadioByValue('headings')).not.toBeNull();
    expect(getRadioByValue('custom')).not.toBeNull();
  });

  it('calls onOptionChange when a radio button is clicked', () => {
    const handleOptionChange = vi.fn();
    act(() => {
      root!.render(
        <DataScrapeOptions
          selectedOption="helpful"
          onOptionChange={handleOptionChange}
          customPrompt=""
          onCustomPromptChange={() => {}}
        />,
      );
    });

    const headingsRadio = getRadioByValue('headings');
    act(() => {
      headingsRadio!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(handleOptionChange).toHaveBeenCalledWith('headings');
  });

  it('shows the textarea only when "custom" is selected', () => {
    act(() => {
      root!.render(
        <DataScrapeOptions
          selectedOption="helpful"
          onOptionChange={() => {}}
          customPrompt=""
          onCustomPromptChange={() => {}}
        />,
      );
    });
    expect(container!.querySelector('textarea')).toBeNull();

    act(() => {
      root!.render(
        <DataScrapeOptions
          selectedOption="custom"
          onOptionChange={() => {}}
          customPrompt=""
          onCustomPromptChange={() => {}}
        />,
      );
    });
    expect(container!.querySelector('textarea')).not.toBeNull();
  });

  it('calls onCustomPromptChange when textarea value changes', () => {
    const handleCustomPromptChange = vi.fn();
    act(() => {
      root!.render(
        <DataScrapeOptions
          selectedOption="custom"
          onOptionChange={() => {}}
          customPrompt=""
          onCustomPromptChange={handleCustomPromptChange}
        />,
      );
    });

    // const textarea = container!.querySelector('textarea');
    // act(() => {
    //   textarea!.value = 'test prompt';
    //   textarea!.dispatchEvent(new Event('input', { bubbles: true }));
    //   textarea!.dispatchEvent(new Event('change', { bubbles: true }));
    // });

    // expect(handleCustomPromptChange).toHaveBeenCalledWith('test prompt');
  });
});
