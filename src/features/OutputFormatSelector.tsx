import { type OutputFormat } from '../types/messaging';

interface OutputFormatSelectorProps {
  selectedFormat: OutputFormat;
  onFormatChange: (format: OutputFormat) => void;
}

const options: { id: OutputFormat; label: string }[] = [
  { id: 'json', label: 'JSON (Machine-readable)' },
  { id: 'html', label: 'Rendered HTML (Human-readable)' },
];

export function OutputFormatSelector({
  selectedFormat,
  onFormatChange,
}: OutputFormatSelectorProps) {
  return (
    <div className="p-4 rounded-lg bg-spotify-gray space-y-3">
      <h3 className="text-sm font-bold text-white">Output Format</h3>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {options.map(({ id, label }) => (
          <div key={id} className="flex items-center">
            <input
              type="radio"
              id={`format-${id}`}
              name="format-option"
              value={id}
              checked={selectedFormat === id}
              onChange={() => onFormatChange(id)}
              className="h-4 w-4 border-spotify-light-gray bg-spotify-gray text-spotify-green focus:ring-spotify-green"
            />
            <label
              htmlFor={`format-${id}`}
              className="ml-2 block text-sm text-spotify-light-gray"
            >
              {label}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
}
