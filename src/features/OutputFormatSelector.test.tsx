import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { OutputFormatSelector } from './OutputFormatSelector';

describe('OutputFormatSelector', () => {
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
      document.body.removeChild(container);
      container = null;
    }
    vi.clearAllMocks();
  });

  it('renders all radio options correctly', () => {
    act(() => {
      root!.render(
        <OutputFormatSelector
          selectedFormat="json"
          onFormatChange={() => {}}
        />,
      );
    });

    const jsonRadio = container!.querySelector('input[id="format-json"]');
    const htmlRadio = container!.querySelector('input[id="format-html"]');

    expect(jsonRadio).not.toBeNull();
    expect(htmlRadio).not.toBeNull();
    expect(container!.textContent).toContain('JSON (Machine-readable)');
    expect(container!.textContent).toContain('Rendered HTML (Human-readable)');
  });

  it('reflects the selected format correctly', () => {
    act(() => {
      root!.render(
        <OutputFormatSelector
          selectedFormat="html"
          onFormatChange={() => {}}
        />,
      );
    });

    const htmlRadio = container!.querySelector(
      'input[id="format-html"]',
    ) as HTMLInputElement;
    expect(htmlRadio.checked).toBe(true);

    const jsonRadio = container!.querySelector(
      'input[id="format-json"]',
    ) as HTMLInputElement;
    expect(jsonRadio.checked).toBe(false);
  });

  it('calls onFormatChange with the correct value when an option is clicked', () => {
    const handleFormatChange = vi.fn();
    act(() => {
      root!.render(
        <OutputFormatSelector
          selectedFormat="json"
          onFormatChange={handleFormatChange}
        />,
      );
    });

    const htmlRadio = container!.querySelector('input[id="format-html"]');
    act(() => {
      htmlRadio!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(handleFormatChange).toHaveBeenCalledWith('html');
  });
});
