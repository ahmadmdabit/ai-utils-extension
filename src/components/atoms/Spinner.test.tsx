// src/components/atoms/Spinner.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Spinner } from './Spinner';

describe('Spinner Component', () => {
  it('should render the spinner element', () => {
    render(<Spinner />);

    const spinnerElement = screen.getByTestId('spinner');
    expect(spinnerElement).toBeInTheDocument();
  });

  it('should have the correct CSS classes', () => {
    render(<Spinner />);

    const spinnerElement = screen.getByTestId('spinner');
    expect(spinnerElement).toHaveClass(
      'animate-spin',
      'h-5',
      'w-5',
      'text-spotify-green',
    );
  });
});
