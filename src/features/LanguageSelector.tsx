import type { LanguageOption } from '../types/messaging';

export interface LanguageSelectorProps {
  selectedLanguage: LanguageOption;
  onLanguageChange: (option: LanguageOption) => void;
  customLanguage: string;
  onCustomLanguageChange: (language: string) => void;
}

const options: { id: LanguageOption; label: string }[] = [
  { id: 'English', label: 'English' },
  { id: 'Turkish', label: 'Turkish' },
  { id: 'Arabic', label: 'Arabic' },
  { id: 'custom', label: 'Other...' },
];

export function LanguageSelector({
  selectedLanguage,
  onLanguageChange,
  customLanguage,
  onCustomLanguageChange,
}: LanguageSelectorProps) {
  return (
    <div className="p-4 rounded-lg bg-spotify-gray space-y-3">
      <h3 className="text-sm font-bold text-white">Translate To</h3>
      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {options.map(({ id, label }) => (
          <div key={id} className="flex items-center">
            <input
              type="radio"
              id={`lang-${id}`}
              name="lang-option"
              value={id}
              checked={selectedLanguage === id}
              onChange={() => onLanguageChange(id)}
              className="h-4 w-4 border-spotify-light-gray bg-spotify-gray text-spotify-green focus:ring-spotify-green"
            />
            <label
              htmlFor={`lang-${id}`}
              className="ml-2 block text-sm text-spotify-light-gray"
            >
              {label}
            </label>
          </div>
        ))}
      </div>
      {selectedLanguage === 'custom' && (
        <input
          type="text"
          value={customLanguage}
          onChange={(e) => onCustomLanguageChange(e.target.value)}
          placeholder="e.g., Spanish, French, Japanese"
          className="mt-2 w-full p-2 rounded-md bg-spotify-black border border-spotify-gray focus:ring-spotify-green focus:border-spotify-green text-sm"
        />
      )}
    </div>
  );
}
