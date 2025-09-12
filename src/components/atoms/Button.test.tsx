// src/components/atoms/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from './Button';

describe('Button Component', () => {
  it('should render the button with its children', () => {
    render(<Button>Click Me</Button>);
    
    const buttonElement = screen.getByText(/Click Me/i);
    expect(buttonElement).toBeInTheDocument();
  });

  it('should apply the primary variant styles by default', () => {
    render(<Button>Primary Button</Button>);
    
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toHaveClass('bg-spotify-green');
  });

  it('should be disabled when the disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    
    const buttonElement = screen.getByRole('button');
    expect(buttonElement).toBeDisabled();
  });
});