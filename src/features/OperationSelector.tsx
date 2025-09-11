// src/features/OperationSelector.tsx
import { useState } from 'react';
import { Checkbox } from '../components/atoms/Checkbox';

interface OperationSelectorProps {
  selectedOps: string[];
  onOpSelect: (op: string) => void;
  isDisabled: boolean;
}

export function OperationSelector({
  selectedOps,
  onOpSelect,
  isDisabled,
}: OperationSelectorProps) {
  const [isCombineChecked, setCombineChecked] = useState(false);

  const canCombine = selectedOps.length > 1;

  return (
    <fieldset
      disabled={isDisabled}
      className="p-3 rounded-md bg-slate-800 space-y-4 disabled:opacity-50 transition-opacity"
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
      <hr className="border-slate-700" />
      <Checkbox
        id="op-combine"
        label="Combine results"
        disabled={!canCombine}
        checked={isCombineChecked && canCombine}
        onChange={() => setCombineChecked((prev) => !prev)}
      />
    </fieldset>
  );
}
