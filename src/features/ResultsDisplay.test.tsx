import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
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

describe('ResultsDisplay component', () => {
  it('displays a placeholder message when there are no tasks', () => {
    render(<ResultsDisplay tasks={[]} onClear={() => {}} />);
    expect(
      screen.getByText('Your results will appear here.'),
    ).toBeInTheDocument();
  });

  it('renders a list of tasks with their titles and operations', () => {
    render(<ResultsDisplay tasks={mockTasks} onClear={() => {}} />);
    expect(screen.getByText('Pending Task')).toBeInTheDocument();
    expect(screen.getByText('Processing Task')).toBeInTheDocument();
    expect(screen.getByText('Completed Task')).toBeInTheDocument();
    expect(screen.getByText('Error Task')).toBeInTheDocument();
    expect(screen.getByText('Combined Result Task')).toBeInTheDocument();
  });

  it('displays a "Pending..." message for pending tasks', () => {
    render(<ResultsDisplay tasks={[mockTasks[0]]} onClear={() => {}} />);
    expect(screen.getByText('Pending...')).toBeInTheDocument();
  });

  it('displays a spinner for processing tasks', () => {
    render(<ResultsDisplay tasks={[mockTasks[1]]} onClear={() => {}} />);
    expect(screen.getByRole('status')).toBeInTheDocument(); // Spinner has role="status"
  });

  it('displays the result for completed tasks', () => {
    render(<ResultsDisplay tasks={[mockTasks[2]]} onClear={() => {}} />);
    expect(screen.getByText('This is the result.')).toBeInTheDocument();
  });

  it('displays an error message for error tasks', () => {
    render(<ResultsDisplay tasks={[mockTasks[3]]} onClear={() => {}} />);
    expect(
      screen.getByText('Error: Something went wrong.'),
    ).toBeInTheDocument();
  });

  it('applies special styling for combined results', () => {
    render(<ResultsDisplay tasks={[mockTasks[4]]} onClear={() => {}} />);
    const titleElement = screen.getByText('Combined Result Task');
    expect(titleElement).toHaveClass('text-spotify-green');
  });

  it('applies default styling for non-combined results', () => {
    render(<ResultsDisplay tasks={[mockTasks[2]]} onClear={() => {}} />);
    const titleElement = screen.getByText('Completed Task');
    expect(titleElement).toHaveClass('text-white');
  });

  it('calls the onClear function when the "Clear" button is clicked', () => {
    const handleClear = vi.fn();
    render(<ResultsDisplay tasks={mockTasks} onClear={handleClear} />);

    const clearButton = screen.getByText('Clear');
    fireEvent.click(clearButton);

    expect(handleClear).toHaveBeenCalledTimes(1);
  });
});
