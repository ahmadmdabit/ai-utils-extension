import type { Task } from '../types/messaging';
import { Spinner } from '../components/atoms/Spinner';

interface ResultsDisplayProps {
  tasks: Task[];
  onClear: () => void;
}

export function ResultsDisplay({ tasks, onClear }: ResultsDisplayProps) {
  if (tasks.length === 0) {
    return (
      <div className="text-center p-6 border-2 border-dashed border-gray-700 rounded-lg">
        <p className="text-sm text-spotify-light-gray">
          Your results will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-base font-bold text-white">Results</h2>
        <button
          onClick={onClear}
          className="text-sm text-spotify-light-gray hover:text-white font-semibold"
        >
          Clear
        </button>
      </div>
      <div className="p-2 rounded-lg bg-spotify-gray space-y-4 max-h-96 overflow-y-auto">
        {tasks.map((task) => (
          <div key={task.taskId} className="p-2">
            <div className="flex justify-between items-center">
              <div className="w-full">
                <p className="text-sm font-bold text-white truncate">
                  {task.tabTitle}
                </p>
                <p className="text-xs text-spotify-light-gray capitalize">
                  {task.operation}
                </p>
              </div>
              {task.status === 'processing' && <Spinner />}
              {task.status === 'pending' && (
                <span className="text-xs text-spotify-light-gray">
                  Pending...
                </span>
              )}
            </div>
            {task.status === 'complete' && (
              <p className="text-sm text-spotify-light-gray whitespace-pre-wrap mt-2">
                {task.result}
              </p>
            )}
            {task.status === 'error' && (
              <p className="text-sm text-red-400 mt-2">Error: {task.error}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
