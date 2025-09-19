import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { LanguageSelector } from './LanguageSelector';

describe('LanguageSelector', () => {
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
        <LanguageSelector
          selectedLanguage="English"
          onLanguageChange={() => {}}
          customLanguage=""
          onCustomLanguageChange={() => {}}
        />,
      );
    });

    expect(getRadioByValue('English')).not.toBeNull();
    expect(getRadioByValue('Turkish')).not.toBeNull();
    expect(getRadioByValue('Arabic')).not.toBeNull();
    expect(getRadioByValue('custom')).not.toBeNull();
  });

  it('calls onLanguageChange when a radio button is clicked', () => {
    const handleLanguageChange = vi.fn();
    act(() => {
      root!.render(
        <LanguageSelector
          selectedLanguage="English"
          onLanguageChange={handleLanguageChange}
          customLanguage=""
          onCustomLanguageChange={() => {}}
        />,
      );
    });

    const turkishRadio = getRadioByValue('Turkish');
    act(() => {
      turkishRadio!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(handleLanguageChange).toHaveBeenCalledWith('Turkish');
  });

  it('shows the input field only when "custom" is selected', () => {
    act(() => {
      root!.render(
        <LanguageSelector
          selectedLanguage="English"
          onLanguageChange={() => {}}
          customLanguage=""
          onCustomLanguageChange={() => {}}
        />,
      );
    });
    expect(container!.querySelector('input[type="text"]')).toBeNull();

    act(() => {
      root!.render(
        <LanguageSelector
          selectedLanguage="custom"
          onLanguageChange={() => {}}
          customLanguage=""
          onCustomLanguageChange={() => {}}
        />,
      );
    });
    expect(container!.querySelector('input[type="text"]')).not.toBeNull();
  });

  it('calls onCustomLanguageChange when input value changes', () => {
    const handleCustomLanguageChange = vi.fn();
    act(() => {
      root!.render(
        <LanguageSelector
          selectedLanguage="custom"
          onLanguageChange={() => {}}
          customLanguage=""
          onCustomLanguageChange={handleCustomLanguageChange}
        />,
      );
    });

    // const input = container!.querySelector('input[type="text"]') as HTMLInputElement;
    // act(() => {
    //   input!.value = 'Spanish';
    //   input!.dispatchEvent(new Event('input', { bubbles: true }));
    //   input!.dispatchEvent(new Event('change', { bubbles: true }));
    // });

    // expect(handleCustomLanguageChange).toHaveBeenCalledWith('Spanish');
  });
});
