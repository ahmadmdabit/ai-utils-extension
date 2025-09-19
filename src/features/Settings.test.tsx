import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { Settings } from './Settings';
import * as chromeService from '../services/chromeService';

vi.mock('../services/chromeService');

describe('Settings', () => {
  let container: HTMLElement | null = null;
  let root: ReturnType<typeof createRoot> | null = null;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    vi.spyOn(chromeService, 'getApiKey').mockResolvedValue('existing-key');
    vi.spyOn(chromeService, 'getTimeoutSetting').mockResolvedValue(90);
    vi.spyOn(chromeService, 'setApiKey').mockResolvedValue(undefined);
    vi.spyOn(chromeService, 'setTimeoutSetting').mockResolvedValue(undefined);
    vi.useFakeTimers();
  });

  afterEach(() => {
    if (root && container) {
      act(() => {
        root!.unmount();
      });
      document.body.removeChild(container!);
      container = null;
    }
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('fetches and displays existing settings on mount', async () => {
    await act(async () => {
      root!.render(<Settings onClose={() => {}} />);
    });

    const apiKeyInput = container!.querySelector(
      'input[id="apiKey"]',
    ) as HTMLInputElement;
    const timeoutInput = container!.querySelector(
      'input[id="timeout"]',
    ) as HTMLInputElement;

    expect(apiKeyInput.value).toBe('existing-key');
    expect(timeoutInput.value).toBe('90');
  });

  it('updates input values as the user types', async () => {
    await act(async () => {
      root!.render(<Settings onClose={() => {}} />);
    });

    const apiKeyInput = container!.querySelector(
      'input[id="apiKey"]',
    ) as HTMLInputElement;
    const timeoutInput = container!.querySelector(
      'input[id="timeout"]',
    ) as HTMLInputElement;

    await act(async () => {
      apiKeyInput.value = 'new-api-key';
      apiKeyInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    await act(async () => {
      timeoutInput.value = '120';
      timeoutInput.dispatchEvent(new Event('change', { bubbles: true }));
    });

    expect(apiKeyInput.value).toBe('new-api-key');
    expect(timeoutInput.value).toBe('120');
  });

  it('calls save functions and shows a status message on save', async () => {
    await act(async () => {
      root!.render(<Settings onClose={() => {}} />);
    });

    const saveButton = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent === 'Save Settings',
    );

    await act(async () => {
      saveButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(chromeService.setApiKey).toHaveBeenCalledWith('existing-key');
    expect(chromeService.setTimeoutSetting).toHaveBeenCalledWith(90);
    expect(container!.textContent).toContain('Settings saved!');

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    expect(container!.textContent).not.toContain('Settings saved!');
  });

  it('calls the onClose prop when the "Back" button is clicked', async () => {
    const handleClose = vi.fn();
    await act(async () => {
      root!.render(<Settings onClose={handleClose} />);
    });

    const backButton = Array.from(container!.querySelectorAll('button')).find(
      (b) => b.textContent === 'Back',
    );

    await act(async () => {
      backButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
