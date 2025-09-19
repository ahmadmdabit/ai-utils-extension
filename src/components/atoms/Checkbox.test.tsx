import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent } from '../../test-utils';
import { Checkbox } from './Checkbox';

describe('Checkbox', () => {
  let unmount: () => void;

  afterEach(() => {
    if (unmount) {
      unmount();
    }
  });

  it('renders the checkbox with its label', () => {
    const result = render(
      <Checkbox id="test-checkbox" label="Test Checkbox" />,
    );
    unmount = result.unmount;
    const checkbox = result.container.querySelector('input[type="checkbox"]');
    expect(checkbox).not.toBeNull();
    expect(result.container.textContent).toContain('Test Checkbox');
  });

  it('is checked when the checked prop is true', () => {
    const result = render(
      <Checkbox
        id="test-checkbox"
        label="Test Checkbox"
        checked={true}
        onChange={() => {}}
      />,
    );
    unmount = result.unmount;
    const checkbox = result.container.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('calls onChange when clicked', () => {
    const handleChange = vi.fn();
    const result = render(
      <Checkbox
        id="test-checkbox"
        label="Test Checkbox"
        onChange={handleChange}
      />,
    );
    unmount = result.unmount;
    const checkbox = result.container.querySelector('input[type="checkbox"]');
    if (checkbox) {
      fireEvent.click(checkbox);
    }
    expect(handleChange).toHaveBeenCalledTimes(1);
  });
});
