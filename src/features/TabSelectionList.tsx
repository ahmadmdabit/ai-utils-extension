import { useState, useEffect } from 'react';
import { TabItem } from '../components/molecules/TabItem';
import type { Tab } from '../types/chrome';

const MAX_TABS = 3;

export interface TabSelectionListProps {
  selectedTabs: number[];
  onTabSelect: (tabId: number) => void;
}

export function TabSelectionList({
  selectedTabs,
  onTabSelect,
}: TabSelectionListProps) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (chrome && chrome.tabs) {
      chrome.tabs.query({}, (result) => {
        const formattedTabs = result
          .filter(
            (tab) => tab.id && tab.url && !tab.url.startsWith('chrome://'),
          )
          .map((tab) => ({
            id: tab.id!,
            title: tab.title || 'Untitled Tab',
            url: tab.url!,
            favIconUrl: tab.favIconUrl,
          }));
        setTabs(formattedTabs);
        setIsLoading(false);
      });
    } else {
      console.warn('Chrome tabs API not available. Using mock data.');
      setIsLoading(false);
    }
  }, []);

  const handleSelection = (tabId: number) => {
    if (!selectedTabs.includes(tabId) && selectedTabs.length >= MAX_TABS) {
      console.warn(`Cannot select more than ${MAX_TABS} tabs.`);
      return;
    }
    // Just call the prop function
    onTabSelect(tabId);
  };

  if (isLoading) {
    return <p className="text-sm text-slate-400">Loading tabs...</p>;
  }

  if (tabs.length === 0) {
    return <p className="text-sm text-slate-400">No open tabs found.</p>;
  }

  return (
    <div className="space-y-2">
      {tabs.map((tab) => (
        <TabItem
          key={tab.id}
          tab={tab}
          isSelected={selectedTabs.includes(tab.id)}
          onSelect={handleSelection}
        />
      ))}
      <p className="text-xs text-right text-slate-500">
        {selectedTabs.length} / {MAX_TABS} selected
      </p>
    </div>
  );
}
