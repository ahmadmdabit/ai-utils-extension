import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { OperationSelector } from './OperationSelector';

describe('OperationSelector component', () => {
  const defaultProps = {
    selectedOps: [],
    onOpSelect: vi.fn(),
    isDisabled: false,
    isCombineChecked: false,
    onCombineChange: vi.fn(),
    selectedTabCount: 0,
  };

  it('renders all operation checkboxes correctly', () => {
    render(<OperationSelector {...defaultProps} />);
    expect(screen.getByLabelText('Summarize')).toBeInTheDocument();
    expect(screen.getByLabelText('Scrape Data')).toBeInTheDocument();
    expect(screen.getByLabelText('Translate')).toBeInTheDocument();
    expect(screen.getByLabelText('Combine results')).toBeInTheDocument();
  });

  it('disables the entire fieldset when isDisabled is true', () => {
    render(<OperationSelector {...defaultProps} isDisabled={true} />);
    const fieldset = screen.getByRole('group');
    expect(fieldset).toBeDisabled();
  });

  it('reflects the selectedOps prop in checkbox states', () => {
    render(
      <OperationSelector
        {...defaultProps}
        selectedOps={['summarize', 'translate']}
      />,
    );
    expect(screen.getByLabelText('Summarize')).toBeChecked();
    expect(screen.getByLabelText('Translate')).toBeChecked();
    expect(screen.getByLabelText('Scrape Data')).not.toBeChecked();
  });

  it('calls onOpSelect with the correct operation when a checkbox is clicked', () => {
    const onOpSelectMock = vi.fn();
    render(<OperationSelector {...defaultProps} onOpSelect={onOpSelectMock} />);

    fireEvent.click(screen.getByLabelText('Scrape Data'));
    expect(onOpSelectMock).toHaveBeenCalledTimes(1);
    expect(onOpSelectMock).toHaveBeenCalledWith('scrape');
  });

  it('disables the "Combine results" checkbox when selectedTabCount is 1 or less', () => {
    const { rerender } = render(
      <OperationSelector {...defaultProps} selectedTabCount={1} />,
    );
    expect(screen.getByLabelText('Combine results')).toBeDisabled();

    rerender(<OperationSelector {...defaultProps} selectedTabCount={0} />);
    expect(screen.getByLabelText('Combine results')).toBeDisabled();
  });

  it('enables the "Combine results" checkbox when selectedTabCount is greater than 1', () => {
    render(<OperationSelector {...defaultProps} selectedTabCount={2} />);
    expect(screen.getByLabelText('Combine results')).not.toBeDisabled();
  });

  it('reflects the isCombineChecked prop when combining is possible', () => {
    render(
      <OperationSelector
        {...defaultProps}
        selectedTabCount={2}
        isCombineChecked={true}
      />,
    );
    expect(screen.getByLabelText('Combine results')).toBeChecked();
  });

  it('does not check "Combine results" even if isCombineChecked is true, if combining is not possible', () => {
    render(
      <OperationSelector
        {...defaultProps}
        selectedTabCount={1}
        isCombineChecked={true}
      />,
    );
    const combineCheckbox = screen.getByLabelText('Combine results');
    expect(combineCheckbox).toBeDisabled();
    expect(combineCheckbox).not.toBeChecked();
  });

  it('calls onCombineChange with the correct value when the "Combine results" checkbox is clicked', () => {
    const onCombineChangeMock = vi.fn();
    render(
      <OperationSelector
        {...defaultProps}
        selectedTabCount={2}
        onCombineChange={onCombineChangeMock}
      />,
    );

    fireEvent.click(screen.getByLabelText('Combine results'));
    expect(onCombineChangeMock).toHaveBeenCalledTimes(1);
    expect(onCombineChangeMock).toHaveBeenCalledWith(true);
  });
});
