import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent } from '../test-utils';
import { OperationSelector } from './OperationSelector';

describe('OperationSelector', () => {
  let unmount: () => void;

  afterEach(() => {
    if (unmount) {
      unmount();
    }
  });

  const defaultProps = {
    selectedOps: [],
    onOpSelect: vi.fn(),
    isDisabled: false,
    isCombineChecked: false,
    onCombineChange: vi.fn(),
    selectedTabCount: 0,
  };

  const getCheckboxByLabel = (container: HTMLElement, text: string) => {
    const label = Array.from(container.querySelectorAll('label')).find(
      (l) => l.textContent === text,
    );
    const inputId = label?.getAttribute('for');
    return container.querySelector(`input#${inputId}`);
  };

  it('renders all operation checkboxes correctly', () => {
    const result = render(<OperationSelector {...defaultProps} />);
    unmount = result.unmount;
    expect(getCheckboxByLabel(result.container, 'Summarize')).not.toBeNull();
    expect(getCheckboxByLabel(result.container, 'Scrape Data')).not.toBeNull();
    expect(getCheckboxByLabel(result.container, 'Translate')).not.toBeNull();
    expect(
      getCheckboxByLabel(result.container, 'Combine results'),
    ).not.toBeNull();
  });

  it('disables the entire fieldset when isDisabled is true', () => {
    const result = render(
      <OperationSelector {...defaultProps} isDisabled={true} />,
    );
    unmount = result.unmount;
    const fieldset = result.container.querySelector('fieldset');
    expect(fieldset?.hasAttribute('disabled')).toBe(true);
  });

  it('reflects the selectedOps prop in checkbox states', () => {
    const result = render(
      <OperationSelector
        {...defaultProps}
        selectedOps={['summarize', 'translate']}
      />,
    );
    unmount = result.unmount;
    expect(
      (getCheckboxByLabel(result.container, 'Summarize') as HTMLInputElement)
        ?.checked,
    ).toBe(true);
    expect(
      (getCheckboxByLabel(result.container, 'Translate') as HTMLInputElement)
        ?.checked,
    ).toBe(true);
    expect(
      (getCheckboxByLabel(result.container, 'Scrape Data') as HTMLInputElement)
        ?.checked,
    ).toBe(false);
  });

  it('calls onOpSelect with the correct operation when a checkbox is clicked', () => {
    const onOpSelectMock = vi.fn();
    const result = render(
      <OperationSelector {...defaultProps} onOpSelect={onOpSelectMock} />,
    );
    unmount = result.unmount;

    const scrapeCheckbox = getCheckboxByLabel(result.container, 'Scrape Data');
    if (scrapeCheckbox) {
      fireEvent.click(scrapeCheckbox);
    }
    expect(onOpSelectMock).toHaveBeenCalledTimes(1);
    expect(onOpSelectMock).toHaveBeenCalledWith('scrape');
  });

  it('disables the "Combine results" checkbox when selectedTabCount is 1 or less', () => {
    let result = render(
      <OperationSelector {...defaultProps} selectedTabCount={1} />,
    );
    unmount = result.unmount;
    expect(
      getCheckboxByLabel(result.container, 'Combine results')?.hasAttribute(
        'disabled',
      ),
    ).toBe(true);

    unmount();
    result = render(
      <OperationSelector {...defaultProps} selectedTabCount={0} />,
    );
    unmount = result.unmount;
    expect(
      getCheckboxByLabel(result.container, 'Combine results')?.hasAttribute(
        'disabled',
      ),
    ).toBe(true);
  });

  it('enables the "Combine results" checkbox when selectedTabCount is greater than 1', () => {
    const result = render(
      <OperationSelector {...defaultProps} selectedTabCount={2} />,
    );
    unmount = result.unmount;
    expect(
      getCheckboxByLabel(result.container, 'Combine results')?.hasAttribute(
        'disabled',
      ),
    ).toBe(false);
  });

  it('reflects the isCombineChecked prop when combining is possible', () => {
    const result = render(
      <OperationSelector
        {...defaultProps}
        selectedTabCount={2}
        isCombineChecked={true}
      />,
    );
    unmount = result.unmount;
    expect(
      (
        getCheckboxByLabel(
          result.container,
          'Combine results',
        ) as HTMLInputElement
      )?.checked,
    ).toBe(true);
  });

  it('does not check "Combine results" even if isCombineChecked is true, if combining is not possible', () => {
    const result = render(
      <OperationSelector
        {...defaultProps}
        selectedTabCount={1}
        isCombineChecked={true}
      />,
    );
    unmount = result.unmount;
    const combineCheckbox = getCheckboxByLabel(
      result.container,
      'Combine results',
    ) as HTMLInputElement;
    expect(combineCheckbox.hasAttribute('disabled')).toBe(true);
    expect(combineCheckbox.checked).toBe(false);
  });

  it('calls onCombineChange with the correct value when the "Combine results" checkbox is clicked', () => {
    const onCombineChangeMock = vi.fn();
    const result = render(
      <OperationSelector
        {...defaultProps}
        selectedTabCount={2}
        onCombineChange={onCombineChangeMock}
      />,
    );
    unmount = result.unmount;

    const combineCheckbox = getCheckboxByLabel(
      result.container,
      'Combine results',
    );
    if (combineCheckbox) {
      fireEvent.click(combineCheckbox);
    }
    expect(onCombineChangeMock).toHaveBeenCalledTimes(1);
    expect(onCombineChangeMock).toHaveBeenCalledWith(true);
  });
});
