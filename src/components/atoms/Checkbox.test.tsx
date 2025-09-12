// src/components/atoms/Checkbox.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Checkbox } from './Checkbox';

describe('Checkbox Component', () => {
  it('should render the checkbox with its label', () => {
    render(<Checkbox id="test-checkbox" label="Test Checkbox" />);

    const checkboxElement = screen.getByLabelText(/Test Checkbox/i);
    expect(checkboxElement).toBeInTheDocument();
  });

  it('should be checked when the checked prop is true', () => {
    render(
      <Checkbox
        id="test-checkbox"
        label="Test Checkbox"
        checked={true}
        onChange={() => {}}
      />,
    );

    const checkboxElement = screen.getByRole('checkbox');
    expect(checkboxElement).toBeChecked();
  });

  it('should call onChange when clicked', () => {
    const handleChange = vi.fn();
    render(
      <Checkbox
        id="test-checkbox"
        label="Test Checkbox"
        onChange={handleChange}
      />,
    );

    const checkboxElement = screen.getByRole('checkbox');
    fireEvent.click(checkboxElement);

    expect(handleChange).toHaveBeenCalled();
  });
});
