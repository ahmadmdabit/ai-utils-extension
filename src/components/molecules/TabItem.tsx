// src/components/molecules/TabItem.tsx
import type { Tab } from '../../types/chrome';
import { Checkbox } from '../atoms/Checkbox';

interface TabItemProps {
  tab: Tab;
  isSelected: boolean;
  onSelect: (tabId: number) => void;
}

export function TabItem({ tab, isSelected, onSelect }: TabItemProps) {
  return (
    <div className="flex items-center p-2 rounded-md bg-slate-800 hover:bg-slate-700 transition-colors">
      <img
        src={tab.favIconUrl || 'icons/icon512.png'}
        alt="favicon"
        className="w-4 h-4 mr-3"
      />
      <div className="flex-1 overflow-hidden">
        <p className="text-sm font-medium text-slate-200 truncate">
          {tab.title}
        </p>
      </div>
      <Checkbox
        id={`tab-${tab.id}`}
        label=""
        checked={isSelected}
        onChange={() => onSelect(tab.id)}
      />
    </div>
  );
}
