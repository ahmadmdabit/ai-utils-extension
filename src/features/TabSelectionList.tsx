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
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    setIsLoading(true);
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
  }, [refreshTrigger]);

  const handleSelection = (tabId: number) => {
    if (!selectedTabs.includes(tabId) && selectedTabs.length >= MAX_TABS) {
      console.warn(`Cannot select more than ${MAX_TABS} tabs.`);
      return;
    }
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
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-base font-bold text-white">
          1. Choose Tabs (Max 3)
        </h2>
        <button
          aria-label="Reload tabs"
          onClick={() => setRefreshTrigger((t) => t + 1)}
          className="text-spotify-light-gray hover:text-white transition-colors"
          disabled={isLoading}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
            className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`}
          >
            <path d="M5.05028 14.9497C4.65975 14.5592 4.65975 13.9261 5.05028 13.5355C5.4408 13.145 6.07397 13.145 6.46449 13.5355C7.39677 14.4678 8.655 15 10 15C12.7614 15 15 12.7614 15 10C15 9.44772 15.4477 9 16 9C16.5523 9 17 9.44772 17 10C17 13.866 13.866 17 10 17C8.11912 17 6.35391 16.2534 5.05028 14.9497Z"></path>
            <path d="M13.5585 12.832C13.099 13.1384 12.4781 13.0141 12.1718 12.5546C11.8655 12.0951 11.9897 11.4742 12.4492 11.1679L15.4496 9.16787C15.9091 8.86154 16.53 8.98575 16.8363 9.4453C17.1426 9.90484 17.0184 10.5257 16.5589 10.832L13.5585 12.832Z"></path>
            <path d="M18.8321 12.4452C19.1384 12.9048 19.0143 13.5256 18.5547 13.832C18.0952 14.1383 17.4743 14.0142 17.168 13.5546L15.168 10.5546C14.8616 10.0951 14.9858 9.47424 15.4453 9.16789C15.9049 8.86153 16.5257 8.98571 16.8321 9.44524L18.8321 12.4452Z"></path>
            <path d="M14.8571 4.85116C15.2477 5.24168 15.2477 5.87485 14.8571 6.26537C14.4666 6.65589 13.8334 6.65589 13.4429 6.26537C12.5106 5.33309 11.2524 4.8009 9.90738 4.8009C7.14596 4.8009 4.90738 7.03948 4.90738 9.8009C4.90738 10.3532 4.45967 10.8009 3.90738 10.8009C3.3551 10.8009 2.90738 10.3532 2.90738 9.8009C2.90738 5.93491 6.04139 2.8009 9.90738 2.8009C11.7883 2.8009 13.5535 3.54752 14.8571 4.85116Z"></path>
            <path d="M6.34889 6.96887C6.80844 6.66255 7.4293 6.78676 7.73563 7.2463C8.04195 7.70585 7.91775 8.32671 7.4582 8.63304L4.45782 10.633C3.99828 10.9394 3.37741 10.8152 3.07109 10.3556C2.76476 9.89606 2.88897 9.2752 3.34852 8.96887L6.34889 6.96887Z"></path>
            <path d="M1.07533 7.35567C0.768977 6.89614 0.893151 6.27527 1.35268 5.96892C1.81221 5.66256 2.43308 5.78674 2.73943 6.24627L4.73943 9.24627C5.04578 9.7058 4.92161 10.3267 4.46208 10.633C4.00255 10.9394 3.38168 10.8152 3.07533 10.3557L1.07533 7.35567Z"></path>
          </svg>
        </button>
      </div>
      {tabs.map((tab) => (
        <TabItem
          key={tab.id}
          tab={tab}
          isSelected={selectedTabs.includes(tab.id)}
          onSelect={handleSelection}
        />
      ))}
      <p className="text-xs text-right text-spotify-light-gray">
        {selectedTabs.length} / {MAX_TABS} selected
      </p>
    </div>
  );
}
