import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Counter } from './Counter';

describe('Counter Component', () => {
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
  });

  it('should render with an initial count of 0', async () => {
    await act(async () => {
      root!.render(<Counter />);
    });

    const countElement = container!.querySelector(
      '[data-testid="count"]',
    ) as HTMLSpanElement;
    expect(countElement).not.toBeNull();
    expect(countElement.textContent).toBe('0');
  });

  it('should render with a provided initial count', async () => {
    await act(async () => {
      root!.render(<Counter initialCount={5} />);
    });

    const countElement = container!.querySelector(
      '[data-testid="count"]',
    ) as HTMLSpanElement;
    expect(countElement.textContent).toBe('5');
  });

  it('should increment the count when the button is clicked', async () => {
    await act(async () => {
      root!.render(<Counter />);
    });

    const buttonElement = container!.querySelector(
      'button',
    ) as HTMLButtonElement;
    const countElement = container!.querySelector(
      '[data-testid="count"]',
    ) as HTMLSpanElement;

    expect(countElement.textContent).toBe('0');

    await act(async () => {
      buttonElement.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(countElement.textContent).toBe('1');
  });
});
