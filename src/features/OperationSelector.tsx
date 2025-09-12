import { Checkbox } from '../components/atoms/Checkbox';

interface OperationSelectorProps {
  selectedOps: string[];
  onOpSelect: (op: string) => void;
  isDisabled: boolean;
  isCombineChecked: boolean;
  onCombineChange: (isChecked: boolean) => void;
  selectedTabCount: number; // <-- ADD
}

export function OperationSelector({
  selectedOps,
  onOpSelect,
  isDisabled,
  isCombineChecked,
  onCombineChange,
  selectedTabCount, // <-- DESTRUCTURE
}: OperationSelectorProps) {
  // --- FIX: Logic now correctly depends on tab count ---
  const canCombine = selectedTabCount > 1;

  return (
    <fieldset
      disabled={isDisabled}
      className="p-4 rounded-lg bg-spotify-gray space-y-4 disabled:opacity-50 transition-opacity"
    >
      <div className="grid grid-cols-2 gap-4">
        <Checkbox
          id="op-summarize"
          label="Summarize"
          checked={selectedOps.includes('summarize')}
          onChange={() => onOpSelect('summarize')}
        />
        <Checkbox
          id="op-scrape"
          label="Scrape Data"
          checked={selectedOps.includes('scrape')}
          onChange={() => onOpSelect('scrape')}
        />
        <Checkbox
          id="op-translate"
          label="Translate"
          checked={selectedOps.includes('translate')}
          onChange={() => onOpSelect('translate')}
        />
      </div>
      <hr className="border-gray-700" />
      <Checkbox
        id="op-combine"
        label="Combine results"
        disabled={!canCombine}
        checked={isCombineChecked && canCombine}
        onChange={(e) => onCombineChange(e.target.checked)}
      />
    </fieldset>
  );
}
