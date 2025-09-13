import { useState } from 'react';
import type { GeminiModel } from '../types/messaging';
import { ModelSelector } from './ModelSelector';
import { Checkbox } from '../components/atoms/Checkbox';

interface ActionOptionsProps {
  selectedModel: GeminiModel;
  onModelChange: (model: GeminiModel) => void;
  isCombineChecked: boolean;
  onCombineChange: (isChecked: boolean) => void;
  isDisabled: boolean;
  selectedTabCount: number;
}

export function ActionOptions({
  selectedModel,
  onModelChange,
  isCombineChecked,
  onCombineChange,
  isDisabled,
  selectedTabCount,
}: ActionOptionsProps) {
  const [localCombineChecked, setLocalCombineChecked] = useState(isCombineChecked);
  
  const canCombine = selectedTabCount > 1;
  const isCombineDisabled = !canCombine || isDisabled;

  const handleCombineChange = (checked: boolean) => {
    setLocalCombineChecked(checked);
    onCombineChange(checked);
  };

  return (
    <div className="space-y-4">
      <ModelSelector
        selectedModel={selectedModel}
        onModelChange={onModelChange}
        isDisabled={isDisabled}
      />
      <div className="p-4 rounded-lg bg-spotify-gray disabled:opacity-50 transition-opacity">
        <Checkbox
          id="combine-tabs"
          label="Combine results from all selected tabs"
          disabled={isCombineDisabled}
          checked={localCombineChecked && canCombine}
          onChange={(e) => handleCombineChange(e.target.checked)}
        />
      </div>
    </div>
  );
}