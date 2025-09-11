import type { TaskResult, TaskError } from '../types/messaging';

interface ResultsDisplayProps {
  results: (TaskResult | TaskError)[];
}

export function ResultsDisplay({ results }: ResultsDisplayProps) {
  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-md font-semibold text-slate-300">Results</h2>
      <div className="p-3 rounded-md bg-slate-800 space-y-4 max-h-96 overflow-y-auto">
        {results.map((item, index) => (
          <div
            key={index}
            className="border-b border-slate-700 pb-2 last:border-b-0"
          >
            <p className="text-sm font-medium text-violet-400 truncate">
              {item.tabTitle}
            </p>
            <p className="text-xs text-slate-400 capitalize">
              {item.operation}
            </p>
            {'result' in item ? (
              <p className="text-sm text-slate-200 whitespace-pre-wrap mt-1">
                {item.result}
              </p>
            ) : (
              <p className="text-sm text-red-400 mt-1">Error: {item.error}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
