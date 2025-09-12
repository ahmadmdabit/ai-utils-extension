import type { GeminiModel } from '../types/messaging';

export interface ModelSelectorProps {
  selectedModel: GeminiModel;
  onModelChange: (model: GeminiModel) => void;
  isDisabled: boolean;
}

// Define our available models with user-friendly labels
const models: { id: GeminiModel; label: string }[] = [
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { id: 'gemini-2.5-flash-lite', label: 'Gemini 2.5 Flash Lite' },
];

export function ModelSelector({
  selectedModel,
  onModelChange,
  isDisabled,
}: ModelSelectorProps) {
  return (
    <fieldset
      disabled={isDisabled}
      className="p-4 rounded-lg bg-spotify-gray disabled:opacity-50 transition-opacity"
    >
      <label
        htmlFor="model-select"
        className="block text-sm font-bold text-white mb-2"
      >
        Select AI Model
      </label>
      <select
        id="model-select"
        value={selectedModel}
        onChange={(e) => onModelChange(e.target.value as GeminiModel)}
        className="w-full p-3 rounded-md bg-spotify-black border border-gray-700 focus:ring-spotify-green focus:border-spotify-green text-white"
      >
        {models.map(({ id, label }) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>
    </fieldset>
  );
}
