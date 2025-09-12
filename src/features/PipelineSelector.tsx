import type { PipelineOperation } from '../types/messaging';

export interface PipelineSelectorProps {
  selectedPipeline: PipelineOperation;
  onPipelineChange: (pipeline: PipelineOperation) => void;
  isDisabled: boolean;
}

// Define our available pipelines
const pipelines: { id: PipelineOperation; label: string }[] = [
  { id: 'summarize', label: 'Summarize' },
  { id: 'translate', label: 'Translate' },
  { id: 'scrape', label: 'Scrape Data' },
  { id: 'translated-summary', label: 'Translated Summary' },
  { id: 'dual-lang-summary', label: 'Dual-Language Summary' },
];

export function PipelineSelector({
  selectedPipeline,
  onPipelineChange,
  isDisabled,
}: PipelineSelectorProps) {
  return (
    <fieldset
      disabled={isDisabled}
      className="p-4 rounded-lg bg-spotify-gray disabled:opacity-50 transition-opacity"
    >
      <label
        htmlFor="pipeline-select"
        className="block text-sm font-bold text-white mb-2"
      >
        Select an Action
      </label>
      <select
        id="pipeline-select"
        value={selectedPipeline}
        onChange={(e) => onPipelineChange(e.target.value as PipelineOperation)}
        className="w-full p-3 rounded-md bg-spotify-black border border-gray-700 focus:ring-spotify-green focus:border-spotify-green text-white"
      >
        {pipelines.map(({ id, label }) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
    </fieldset>
  );
}
