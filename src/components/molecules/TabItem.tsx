import { Checkbox } from '../atoms/Checkbox';
import type { Tab } from '../../types/chrome';

interface TabItemProps {
  tab: Tab;
  isSelected: boolean;
  onSelect: (tabId: number) => void;
}

export function TabItem({ tab, isSelected, onSelect }: TabItemProps) {
  return (
    <div className="flex items-center p-3 rounded-lg bg-spotify-gray hover:bg-gray-700 transition-colors">
      <img
        src={tab.favIconUrl || 'icons/icon512.png'}
        alt="favicon"
        className="w-5 h-5 mr-4"
      />
      <div className="flex-1 overflow-hidden">
        <p className="text-sm font-semibold text-white truncate">{tab.title}</p>
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
