import { useState, useEffect } from 'react';
import { Button } from './components/atoms/Button';
import { TabSelectionList } from './features/TabSelectionList';
import { OperationSelector } from './features/OperationSelector';
import { DataScrapeOptions } from './features/DataScrapeOptions';
import { sendMessageToServiceWorker } from './services/chromeService';
import { Settings } from './features/Settings';
import { ResultsDisplay } from './features/ResultsDisplay';
import type { Task, Message, ScrapeOption } from './types/messaging';

// A simple Gear Icon component
function GearIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.438.995s.145.755.438.995l1.003.827c.424.35.534.954.26 1.431l-1.296 2.247a1.125 1.125 0 01-1.37.49l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.063-.374-.313-.686-.645-.87a6.52 6.52 0 01-.22-.127c-.324-.196-.72-.257-1.075-.124l-1.217.456a1.125 1.125 0 01-1.37-.49l-1.296-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.437-.995s-.145-.755-.437-.995l-1.004-.827a1.125 1.125 0 01-.26-1.431l1.296-2.247a1.125 1.125 0 011.37-.49l1.217.456c.355.133.75.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}

type View = 'main' | 'settings';

function App() {
  const [selectedTabs, setSelectedTabs] = useState<number[]>([]);
  const [selectedOps, setSelectedOps] = useState<string[]>([]);
  const [view, setView] = useState<View>('main');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- NEW STATE FOR SCRAPE OPTIONS ---
  const [scrapeOption, setScrapeOption] = useState<ScrapeOption>('helpful');
  const [customPrompt, setCustomPrompt] = useState('');
  // ------------------------------------

  useEffect(() => {
    const handleMessage = (message: Message) => {
      switch (message.type) {
        case 'ALL_TASKS_QUEUED':
          setTasks(message.payload.tasks);
          setIsProcessing(true);
          break;
        case 'TASK_STARTED':
          setTasks((prev) =>
            prev.map((task) =>
              task.taskId === message.payload.taskId
                ? { ...task, status: 'processing' }
                : task,
            ),
          );
          break;
        case 'TASK_COMPLETE':
        case 'TASK_ERROR':
          setTasks((prev) =>
            prev.map((task) =>
              task.taskId === message.payload.taskId ? message.payload : task,
            ),
          );
          break;
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  useEffect(() => {
    if (
      tasks.length > 0 &&
      tasks.every((t) => t.status === 'complete' || t.status === 'error')
    ) {
      setIsProcessing(false);
    }
  }, [tasks]);

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
    setTasks([]);
    sendMessageToServiceWorker({
      type: 'START_PROCESSING',
      payload: {
        tabs: selectedTabs,
        operations: selectedOps,
        scrapeOption, // Pass new state
        customPrompt, // Pass new state
      },
    });
  };

  const handleClearResults = () => {
    setTasks([]);
    setIsProcessing(false);
  };

  const areTabsSelected = selectedTabs.length > 0;
  const isScrapeSelected = selectedOps.includes('scrape');
  const isCustomPromptRequired = scrapeOption === 'custom';
  const isStartDisabled =
    selectedTabs.length === 0 ||
    selectedOps.length === 0 ||
    (isScrapeSelected && isCustomPromptRequired && !customPrompt.trim()) ||
    isProcessing;

  if (view === 'settings') {
    return <Settings onClose={() => setView('main')} />;
  }

  return (
    <div className="p-4 bg-spotify-black text-white min-h-screen font-sans flex flex-col space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-white">AI Utils</h1>
          <p className="text-sm text-spotify-light-gray">Powered by Gemini</p>
        </div>
        <button
          aria-label="Settings"
          onClick={() => setView('settings')}
          className="text-spotify-light-gray hover:text-white transition-colors"
        >
          <GearIcon />
        </button>
      </div>

      <div className="space-y-2">
        <h2 className="text-base font-bold text-white">
          1. Choose Tabs (Max 3)
        </h2>
        <TabSelectionList
          selectedTabs={selectedTabs}
          onTabSelect={handleTabSelection}
        />
      </div>

      <div className="space-y-2">
        <h2 className="text-base font-bold text-white">2. Choose Operations</h2>
        <OperationSelector
          selectedOps={selectedOps}
          onOpSelect={handleOperationSelection}
          isDisabled={!areTabsSelected}
        />
      </div>

      {/* --- CONDITIONALLY RENDER NEW COMPONENT --- */}
      {isScrapeSelected && !isProcessing && (
        <DataScrapeOptions
          selectedOption={scrapeOption}
          onOptionChange={setScrapeOption}
          customPrompt={customPrompt}
          onCustomPromptChange={setCustomPrompt}
        />
      )}
      {/* ------------------------------------------ */}

      <ResultsDisplay tasks={tasks} onClear={handleClearResults} />

      <div className="flex-grow"></div>

      <Button onClick={handleStart} disabled={isStartDisabled}>
        {isProcessing ? 'Processing...' : 'Start Processing'}
      </Button>
    </div>
  );
}

export default App;
