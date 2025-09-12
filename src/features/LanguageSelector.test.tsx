// src/features/LanguageSelector.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LanguageSelector } from './LanguageSelector';

describe('LanguageSelector Component', () => {
  it('should render all radio options', () => {
    render(
      <LanguageSelector
        selectedLanguage="English"
        onLanguageChange={() => {}}
        customLanguage=""
        onCustomLanguageChange={() => {}}
      />
    );
    
    expect(screen.getByLabelText(/English/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Turkish/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Arabic/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Other.../i)).toBeInTheDocument();
  });

  it('should call onLanguageChange when a radio button is clicked', () => {
    const handleLanguageChange = vi.fn();
    render(
      <LanguageSelector
        selectedLanguage="English"
        onLanguageChange={handleLanguageChange}
        customLanguage=""
        onCustomLanguageChange={() => {}}
      />
    );

    const turkishRadio = screen.getByLabelText(/Turkish/i);
    fireEvent.click(turkishRadio);

    expect(handleLanguageChange).toHaveBeenCalledWith('Turkish');
  });

  it('should show the input field only when "custom" is selected', () => {
    const { rerender } = render(
      <LanguageSelector
        selectedLanguage="English"
        onLanguageChange={() => {}}
        customLanguage=""
        onCustomLanguageChange={() => {}}
      />
    );

    // Input should not be visible initially
    expect(screen.queryByPlaceholderText(/e.g., Spanish, French, Japanese/i)).not.toBeInTheDocument();

    // Rerender the component with the 'custom' option selected
    rerender(
      <LanguageSelector
        selectedLanguage="custom"
        onLanguageChange={() => {}}
        customLanguage=""
        onCustomLanguageChange={() => {}}
      />
    );

    // Now the input should be visible
    expect(screen.getByPlaceholderText(/e.g., Spanish, French, Japanese/i)).toBeInTheDocument();
  });
});