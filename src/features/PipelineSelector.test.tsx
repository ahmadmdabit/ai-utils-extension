import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PipelineSelector } from './PipelineSelector';
import type { PipelineOperation } from '../types/messaging';

describe('PipelineSelector component', () => {
  const pipelines: { id: PipelineOperation; label: string }[] = [
    { id: 'summarize', label: 'Summarize' },
    { id: 'translate', label: 'Translate' },
    { id: 'scrape', label: 'Scrape Data' },
    { id: 'translated-summary', label: 'Translated Summary' },
    { id: 'dual-lang-summary', label: 'Dual-Language Summary' },
  ];

  const defaultProps = {
    selectedPipeline: 'summarize' as PipelineOperation,
    onPipelineChange: vi.fn(),
    isDisabled: false,
  };

  it('renders the select element with all pipeline options', () => {
    render(<PipelineSelector {...defaultProps} />);

    const selectElement = screen.getByRole('combobox');
    expect(selectElement).toBeInTheDocument();

    pipelines.forEach((pipeline) => {
      expect(
        screen.getByRole('option', { name: pipeline.label }),
      ).toBeInTheDocument();
    });
  });

  it('displays the correct selected pipeline', () => {
    render(<PipelineSelector {...defaultProps} selectedPipeline="translate" />);
    const selectElement = screen.getByRole('combobox') as HTMLSelectElement;
    expect(selectElement.value).toBe('translate');
  });

  it('calls onPipelineChange with the new value when an option is selected', () => {
    const onPipelineChangeMock = vi.fn();
    render(
      <PipelineSelector
        {...defaultProps}
        onPipelineChange={onPipelineChangeMock}
      />,
    );

    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: 'scrape' } });

    expect(onPipelineChangeMock).toHaveBeenCalledTimes(1);
    expect(onPipelineChangeMock).toHaveBeenCalledWith('scrape');
  });

  it('disables the fieldset when isDisabled is true', () => {
    render(<PipelineSelector {...defaultProps} isDisabled={true} />);
    const fieldset = screen.getByRole('group');
    expect(fieldset).toBeDisabled();
  });

  it('does not disable the fieldset when isDisabled is false', () => {
    render(<PipelineSelector {...defaultProps} isDisabled={false} />);
    const fieldset = screen.getByRole('group');
    expect(fieldset).not.toBeDisabled();
  });
});
