// src/App.tsx
import { useState } from 'react';
import { Button } from './components/atoms/Button';
import { TabSelectionList } from './features/TabSelectionList';
import { OperationSelector } from './features/OperationSelector';

function App() {
  const [selectedTabs, setSelectedTabs] = useState<number[]>([]);
  const [selectedOps, setSelectedOps] = useState<string[]>([]);

  const handleTabSelection = (tabId: number) => {
    setSelectedTabs((prev) =>
      prev.includes(tabId)
        ? prev.filter((id) => id !== tabId)
        : [...prev, tabId],
    );
  };

  const handleOperationSelection = (op: string) => {
    setSelectedOps((prev) =>
      prev.includes(op) ? prev.filter((item) => item !== op) : [...prev, op],
    );
  };

  const handleStart = () => {
    console.log('Starting process with:', {
      tabs: selectedTabs,
      operations: selectedOps,
    });
  };

  const areTabsSelected = selectedTabs.length > 0;
  const areOpsSelected = selectedOps.length > 0;
  const isStartDisabled = !areTabsSelected || !areOpsSelected;

  return (
    <div className="p-4 bg-slate-900 text-white min-h-screen font-sans flex flex-col space-y-6">
      <div>
        <h1 className="text-lg font-bold text-violet-400">AI Utils</h1>
        <p className="text-sm text-slate-400">
          Select tabs and operations to begin.
        </p>
      </div>

      <div>
        <h2 className="text-md font-semibold mb-2 text-slate-300">
          1. Choose Tabs (Max 3)
        </h2>
        <TabSelectionList
          selectedTabs={selectedTabs}
          onTabSelect={handleTabSelection}
        />
      </div>

      <div>
        <h2 className="text-md font-semibold mb-2 text-slate-300">
          2. Choose Operations
        </h2>
        <OperationSelector
          selectedOps={selectedOps}
          onOpSelect={handleOperationSelection}
          isDisabled={!areTabsSelected}
        />
      </div>

      <div className="flex-grow"></div>

      <Button onClick={handleStart} disabled={isStartDisabled}>
        Start Processing
      </Button>
    </div>
  );
}

export default App;
