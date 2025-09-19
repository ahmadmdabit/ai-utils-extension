import type { ScrapeOption } from '../types/messaging';

export interface DataScrapeOptionsProps {
  selectedOption: ScrapeOption;
  onOptionChange: (option: ScrapeOption) => void;
  customPrompt: string;
  onCustomPromptChange: (prompt: string) => void;
}

const options: { id: ScrapeOption; label: string }[] = [
  { id: 'helpful', label: 'Extract helpful info (AI)' },
  { id: 'headings', label: 'Extract all headings' },
  { id: 'links', label: 'Extract all links' },
  { id: 'tables', label: 'Extract tabular data' },
  { id: 'linkedin-jobs', label: 'Parse LinkedIn Jobs Page' },
  { id: 'custom', label: 'Use custom prompt (AI)' },
];

export function DataScrapeOptions({
  selectedOption,
  onOptionChange,
  customPrompt,
  onCustomPromptChange,
}: DataScrapeOptionsProps) {
  return (
    <div className="p-4 rounded-lg bg-spotify-gray space-y-3">
      <h3 className="text-sm font-bold text-white">Scrape Options</h3>
      {options.map(({ id, label }) => (
        <div key={id} className="flex items-center">
          <input
            type="radio"
            id={`scrape-${id}`}
            name="scrape-option"
            value={id}
            checked={selectedOption === id}
            onChange={() => onOptionChange(id)}
            className="h-4 w-4 border-spotify-light-gray bg-spotify-gray text-spotify-green focus:ring-spotify-green"
          />
          <label
            htmlFor={`scrape-${id}`}
            className="ml-3 block text-sm text-spotify-light-gray"
          >
            {label}
          </label>
        </div>
      ))}
      {selectedOption === 'custom' && (
        <textarea
          value={customPrompt}
          onChange={(e) => onCustomPromptChange(e.target.value)}
          placeholder="e.g., Extract the names of all speakers from this page"
          className="mt-2 w-full p-2 rounded-md bg-spotify-black border border-spotify-gray focus:ring-spotify-green focus:border-spotify-green text-sm"
          rows={3}
        />
      )}
    </div>
  );
}
