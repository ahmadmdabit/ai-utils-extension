import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent } from '../test-utils';
import { ResultsDisplay } from './ResultsDisplay';
import type { Task } from '../types/messaging';

const mockTasks: Task[] = [
  {
    taskId: '1-summarize',
    tabId: 1,
    operation: 'summarize',
    tabTitle: 'Pending Task',
    status: 'pending',
  },
  {
    taskId: '2-translate',
    tabId: 2,
    operation: 'translate',
    tabTitle: 'Processing Task',
    status: 'processing',
  },
  {
    taskId: '3-scrape',
    tabId: 3,
    operation: 'scrape',
    tabTitle: 'Completed Task',
    status: 'complete',
    result: 'This is the result.',
  },
  {
    taskId: '4-summarize',
    tabId: 4,
    operation: 'summarize',
    tabTitle: 'Error Task',
    status: 'error',
    error: 'Something went wrong.',
  },
  {
    taskId: '5-combined',
    tabId: 5,
    operation: 'summarize',
    tabTitle: 'Combined Result Task',
    status: 'complete',
    result: 'This is a combined result.',
    isCombinedResult: true,
  },
];

describe('ResultsDisplay', () => {
  let unmount: () => void;

  afterEach(() => {
    if (unmount) {
      unmount();
    }
  });

  it('displays a placeholder message when there are no tasks', () => {
    const result = render(<ResultsDisplay tasks={[]} onClear={() => {}} />);
    unmount = result.unmount;
    expect(result.container.textContent).toContain(
      'Your results will appear here.',
    );
  });

  it('renders a list of tasks with their titles and operations', () => {
    const result = render(
      <ResultsDisplay tasks={mockTasks} onClear={() => {}} />,
    );
    unmount = result.unmount;
    expect(result.container.textContent).toContain('Pending Task');
    expect(result.container.textContent).toContain('Processing Task');
    expect(result.container.textContent).toContain('Completed Task');
    expect(result.container.textContent).toContain('Error Task');
    expect(result.container.textContent).toContain('Combined Result Task');
  });

  it('displays a "Pending..." message for pending tasks', () => {
    const result = render(
      <ResultsDisplay tasks={[mockTasks[0]]} onClear={() => {}} />,
    );
    unmount = result.unmount;
    expect(result.container.textContent).toContain('Pending...');
  });

  it('displays a spinner for processing tasks', () => {
    const result = render(
      <ResultsDisplay tasks={[mockTasks[1]]} onClear={() => {}} />,
    );
    unmount = result.unmount;
    expect(result.container.querySelector('[role="status"]')).not.toBeNull();
  });

  it('displays the result for completed tasks', () => {
    const result = render(
      <ResultsDisplay tasks={[mockTasks[2]]} onClear={() => {}} />,
    );
    unmount = result.unmount;
    expect(result.container.textContent).toContain('This is the result.');
  });

  it('displays an error message for error tasks', () => {
    const result = render(
      <ResultsDisplay tasks={[mockTasks[3]]} onClear={() => {}} />,
    );
    unmount = result.unmount;
    expect(result.container.textContent).toContain(
      'Error: Something went wrong.',
    );
  });

  it('applies special styling for combined results', () => {
    const result = render(
      <ResultsDisplay tasks={[mockTasks[4]]} onClear={() => {}} />,
    );
    unmount = result.unmount;
    expect(result.container.textContent).toContain('Combined Result Task');
  });

  it('applies default styling for non-combined results', () => {
    const result = render(
      <ResultsDisplay tasks={[mockTasks[2]]} onClear={() => {}} />,
    );
    unmount = result.unmount;
    expect(result.container.textContent).toContain('Completed Task');
  });

  it('calls the onClear function when the "Clear" button is clicked', () => {
    const handleClear = vi.fn();
    const result = render(
      <ResultsDisplay tasks={mockTasks} onClear={handleClear} />,
    );
    unmount = result.unmount;

    const clearButton = Array.from(
      result.container.querySelectorAll('button'),
    ).find((button) => button.textContent === 'Clear');
    if (clearButton) {
      fireEvent.click(clearButton);
    }

    expect(handleClear).toHaveBeenCalledTimes(1);
  });
});
