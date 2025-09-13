import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ActionOptions } from './ActionOptions';
import type { GeminiModel } from '../types/messaging';

describe('ActionOptions Component', () => {
  const defaultProps = {
    selectedModel: 'gemini-2.5-flash-lite' as GeminiModel,
    onModelChange: vi.fn(),
    isCombineChecked: false,
    onCombineChange: vi.fn(),
    isDisabled: false,
    selectedTabCount: 2,
  };

  it('should render the ModelSelector and Combine Tabs checkbox', () => {
    render(<ActionOptions {...defaultProps} />);

    // Check if ModelSelector is rendered (by checking for its label)
    expect(screen.getByText('Select AI Model')).toBeInTheDocument();
    
    // Check if Combine Tabs checkbox is rendered
    expect(screen.getByLabelText('Combine results from all selected tabs')).toBeInTheDocument();
  });

  it('should call onModelChange when ModelSelector value changes', () => {
    render(<ActionOptions {...defaultProps} />);
    
    const modelSelect = screen.getByRole('combobox') as HTMLSelectElement;
    fireEvent.change(modelSelect, { target: { value: 'gemini-2.5-pro' } });
    
    expect(defaultProps.onModelChange).toHaveBeenCalledWith('gemini-2.5-pro');
  });

  it('should call onCombineChange when Combine Tabs checkbox is clicked', () => {
    render(<ActionOptions {...defaultProps} />);
    
    const combineCheckbox = screen.getByLabelText('Combine results from all selected tabs');
    fireEvent.click(combineCheckbox);
    
    expect(defaultProps.onCombineChange).toHaveBeenCalledWith(true);
  });

  it('should disable the ModelSelector when isDisabled is true', () => {
    render(<ActionOptions {...defaultProps} isDisabled={true} />);
    
    const modelSelect = screen.getByRole('combobox') as HTMLSelectElement;
    expect(modelSelect).toBeDisabled();
  });

  it('should disable the Combine Tabs checkbox when isDisabled is true', () => {
    render(<ActionOptions {...defaultProps} isDisabled={true} />);
    
    const combineCheckbox = screen.getByLabelText('Combine results from all selected tabs') as HTMLInputElement;
    expect(combineCheckbox.disabled).toBe(true);
  });

  it('should disable the Combine Tabs checkbox when selectedTabCount is 1', () => {
    render(<ActionOptions {...defaultProps} selectedTabCount={1} />);
    
    const combineCheckbox = screen.getByLabelText('Combine results from all selected tabs') as HTMLInputElement;
    expect(combineCheckbox.disabled).toBe(true);
  });

  it('should check the Combine Tabs checkbox when isCombineChecked is true and canCombine is true', () => {
    render(<ActionOptions {...defaultProps} isCombineChecked={true} />);
    
    const combineCheckbox = screen.getByLabelText('Combine results from all selected tabs') as HTMLInputElement;
    expect(combineCheckbox.checked).toBe(true);
  });

  it('should uncheck the Combine Tabs checkbox when isCombineChecked is false', () => {
    render(<ActionOptions {...defaultProps} isCombineChecked={false} />);
    
    const combineCheckbox = screen.getByLabelText('Combine results from all selected tabs') as HTMLInputElement;
    expect(combineCheckbox.checked).toBe(false);
  });

  it('should not check the Combine Tabs checkbox when isCombineChecked is true but selectedTabCount is 1', () => {
    render(<ActionOptions {...defaultProps} isCombineChecked={true} selectedTabCount={1} />);
    
    const combineCheckbox = screen.getByLabelText('Combine results from all selected tabs') as HTMLInputElement;
    expect(combineCheckbox.checked).toBe(false);
  });
});