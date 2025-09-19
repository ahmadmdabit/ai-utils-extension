import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent } from '../test-utils';
import { PipelineSelector } from './PipelineSelector';
import type { PipelineOperation } from '../types/messaging';

describe('PipelineSelector', () => {
  let unmount: () => void;

  afterEach(() => {
    if (unmount) {
      unmount();
    }
  });

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
    const result = render(<PipelineSelector {...defaultProps} />);
    unmount = result.unmount;

    const selectElement = result.container.querySelector('select');
    expect(selectElement).not.toBeNull();

    pipelines.forEach((pipeline) => {
      const option = result.container.querySelector(
        `option[value="${pipeline.id}"]`,
      );
      expect(option).not.toBeNull();
      expect(option?.textContent).toBe(pipeline.label);
    });
  });

  it('displays the correct selected pipeline', () => {
    const result = render(
      <PipelineSelector {...defaultProps} selectedPipeline="translate" />,
    );
    unmount = result.unmount;
    const selectElement = result.container.querySelector(
      'select',
    ) as HTMLSelectElement;
    expect(selectElement.value).toBe('translate');
  });

  it('calls onPipelineChange with the new value when an option is selected', () => {
    const onPipelineChangeMock = vi.fn();
    const result = render(
      <PipelineSelector
        {...defaultProps}
        onPipelineChange={onPipelineChangeMock}
      />,
    );
    unmount = result.unmount;

    const selectElement = result.container.querySelector('select');
    if (selectElement) {
      fireEvent.change(selectElement, { target: { value: 'scrape' } });
    }

    expect(onPipelineChangeMock).toHaveBeenCalledTimes(1);
    expect(onPipelineChangeMock).toHaveBeenCalledWith('scrape');
  });

  it('disables the fieldset when isDisabled is true', () => {
    const result = render(
      <PipelineSelector {...defaultProps} isDisabled={true} />,
    );
    unmount = result.unmount;
    const fieldset = result.container.querySelector('fieldset');
    expect(fieldset?.hasAttribute('disabled')).toBe(true);
  });

  it('does not disable the fieldset when isDisabled is false', () => {
    const result = render(
      <PipelineSelector {...defaultProps} isDisabled={false} />,
    );
    unmount = result.unmount;
    const fieldset = result.container.querySelector('fieldset');
    expect(fieldset?.hasAttribute('disabled')).toBe(false);
  });
});
