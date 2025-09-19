import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent } from '../test-utils';
import { ActionOptions } from './ActionOptions';
import type { GeminiModel } from '../types/messaging';

describe('ActionOptions', () => {
  let unmount: () => void;

  afterEach(() => {
    if (unmount) {
      unmount();
    }
  });

  const defaultProps = {
    selectedModel: 'gemini-2.5-flash-lite' as GeminiModel,
    onModelChange: vi.fn(),
    isCombineChecked: false,
    onCombineChange: vi.fn(),
    isDisabled: false,
    selectedTabCount: 2,
  };

  it('renders the ModelSelector and Combine Tabs checkbox', () => {
    const result = render(<ActionOptions {...defaultProps} />);
    unmount = result.unmount;
    expect(result.container.textContent).toContain('Select AI Model');
    expect(result.container.textContent).toContain(
      'Combine results from all selected tabs',
    );
  });

  it('calls onModelChange when ModelSelector value changes', () => {
    const onModelChange = vi.fn();
    const result = render(
      <ActionOptions {...defaultProps} onModelChange={onModelChange} />,
    );
    unmount = result.unmount;
    const modelSelect = result.container.querySelector('select');
    if (modelSelect) {
      fireEvent.change(modelSelect, { target: { value: 'gemini-2.5-pro' } });
    }
    expect(onModelChange).toHaveBeenCalledWith('gemini-2.5-pro');
  });

  it('calls onCombineChange when Combine Tabs checkbox is clicked', () => {
    const onCombineChange = vi.fn();
    const result = render(
      <ActionOptions {...defaultProps} onCombineChange={onCombineChange} />,
    );
    unmount = result.unmount;
    const combineCheckbox = result.container.querySelector(
      'input[type="checkbox"]',
    );
    if (combineCheckbox) {
      fireEvent.click(combineCheckbox);
    }
    expect(onCombineChange).toHaveBeenCalledWith(true);
  });

  it('disables the ModelSelector when isDisabled is true', () => {
    const result = render(
      <ActionOptions {...defaultProps} isDisabled={true} />,
    );
    unmount = result.unmount;
    const fieldset = result.container.querySelector('fieldset');
    expect(fieldset?.hasAttribute('disabled')).toBe(true);
  });

  it('disables the Combine Tabs checkbox when isDisabled is true', () => {
    const result = render(
      <ActionOptions {...defaultProps} isDisabled={true} />,
    );
    unmount = result.unmount;
    const combineCheckbox = result.container.querySelector(
      'input[type="checkbox"]',
    );
    expect(combineCheckbox?.hasAttribute('disabled')).toBe(true);
  });

  it('disables the Combine Tabs checkbox when selectedTabCount is 1', () => {
    const result = render(
      <ActionOptions {...defaultProps} selectedTabCount={1} />,
    );
    unmount = result.unmount;
    const combineCheckbox = result.container.querySelector(
      'input[type="checkbox"]',
    );
    expect(combineCheckbox?.hasAttribute('disabled')).toBe(true);
  });

  it('checks the Combine Tabs checkbox when isCombineChecked is true and canCombine is true', () => {
    const result = render(
      <ActionOptions {...defaultProps} isCombineChecked={true} />,
    );
    unmount = result.unmount;
    const combineCheckbox = result.container.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    expect(combineCheckbox.checked).toBe(true);
  });

  it('unchecks the Combine Tabs checkbox when isCombineChecked is false', () => {
    const result = render(
      <ActionOptions {...defaultProps} isCombineChecked={false} />,
    );
    unmount = result.unmount;
    const combineCheckbox = result.container.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    expect(combineCheckbox.checked).toBe(false);
  });

  it('does not check the Combine Tabs checkbox when isCombineChecked is true but selectedTabCount is 1', () => {
    const result = render(
      <ActionOptions
        {...defaultProps}
        isCombineChecked={true}
        selectedTabCount={1}
      />,
    );
    unmount = result.unmount;
    const combineCheckbox = result.container.querySelector(
      'input[type="checkbox"]',
    ) as HTMLInputElement;
    expect(combineCheckbox.checked).toBe(false);
  });
});
