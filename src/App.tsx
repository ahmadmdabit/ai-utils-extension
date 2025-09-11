import { useState, useEffect } from 'react';
import { Button } from './components/atoms/Button';
import { TabSelectionList } from './features/TabSelectionList';
import { OperationSelector } from './features/OperationSelector';
import { sendMessageToServiceWorker } from './services/chromeService';
import { Settings } from './features/Settings';
import { ResultsDisplay } from './features/ResultsDisplay';
import type { TaskResult, TaskError, Message } from './types/messaging';

type View = 'main' | 'settings';
type ResultItem = TaskResult | TaskError;

function App() {
  const [selectedTabs, setSelectedTabs] = useState<number[]>([]);
  const [selectedOps, setSelectedOps] = useState<string[]>([]);
  const [view, setView] = useState<View>('main');
  const [results, setResults] = useState<ResultItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleMessage = (message: Message) => {
      if (message.type === 'TASK_COMPLETE' || message.type === 'TASK_ERROR') {
        setResults((prev) => [...prev, message.payload]);
      }
    };
    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  // --- MISSING FUNCTION DEFINITIONS ARE NOW ADDED ---
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
  // ----------------------------------------------------

  const handleStart = () => {
    setResults([]); // Clear previous results
    setIsProcessing(true);
    sendMessageToServiceWorker({
      type: 'START_PROCESSING',
      payload: {
        tabs: selectedTabs,
        operations: selectedOps,
      },
    });
    // A simple way to know when processing is likely done
    const totalTasks = selectedTabs.length * selectedOps.length;
    setTimeout(() => setIsProcessing(false), totalTasks * 1500);
  };

  const areTabsSelected = selectedTabs.length > 0;
  const areOpsSelected = selectedOps.length > 0;
  const isStartDisabled = !areTabsSelected || !areOpsSelected || isProcessing;

  if (view === 'settings') {
    return <Settings onClose={() => setView('main')} />;
  }

  return (
    <div className="p-4 bg-slate-900 text-white min-h-screen font-sans flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-bold text-violet-400">AI Utils</h1>
          <p className="text-sm text-slate-400">
            Select tabs and operations to begin.
          </p>
        </div>
        <button
          onClick={() => setView('settings')}
          className="text-slate-400 hover:text-white"
        >
          &#9881; {/* Gear icon */}
        </button>
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

      <ResultsDisplay results={results} />

      <div className="flex-grow"></div>

      <Button onClick={handleStart} disabled={isStartDisabled}>
        {isProcessing ? 'Processing...' : 'Start Processing'}
      </Button>
    </div>
  );
}

export default App;
