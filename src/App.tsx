import { useState, useEffect } from 'react';
import { sendMessageToServiceWorker } from './services/chromeService';
import { Button } from './components/atoms/Button';
import { TabSelectionList } from './features/TabSelectionList';
import { PipelineSelector } from './features/PipelineSelector';
import { DataScrapeOptions } from './features/DataScrapeOptions';
import { LanguageSelector } from './features/LanguageSelector';
import { Settings } from './features/Settings';
import { ResultsDisplay } from './features/ResultsDisplay';
import { ActionOptions } from './features/ActionOptions';
import { OutputFormatSelector } from './features/OutputFormatSelector';
import type {
  Task,
  Message,
  ScrapeOption,
  LanguageOption,
  PipelineOperation,
  GeminiModel,
  OutputFormat,
} from './types/messaging';
import { GearIcon } from './components/atoms/icons/GearIcon';
import { LinkedinIcon } from './components/atoms/icons/LinkedinIcon';
import { MenuIcon } from './components/atoms/icons/MenuIcon';

type View = 'main' | 'settings';

function App() {
  const [selectedTabs, setSelectedTabs] = useState<number[]>([]);
  const [selectedPipeline, setSelectedPipeline] =
    useState<PipelineOperation>('scrape');
  const [selectedModel, setSelectedModel] = useState<GeminiModel>(
    'gemini-2.5-flash-lite',
  );
  const [view, setView] = useState<View>('main');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scrapeOption, setScrapeOption] =
    useState<ScrapeOption>('linkedin-jobs');
  const [customPrompt, setCustomPrompt] = useState('');
  const [languageOption, setLanguageOption] =
    useState<LanguageOption>('English');
  const [customLanguage, setCustomLanguage] = useState('');
  const [isCombineChecked, setIsCombineChecked] = useState(false);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('html');
  const [showLinkedInDropdown, setShowLinkedInDropdown] = useState(false);

  useEffect(() => {
    const handleMessage = (message: Message) => {
      switch (message.type) {
        case 'ALL_TASKS_QUEUED':
          setTasks(message.payload.tasks);
          setIsProcessing(true);
          break;

        // This case is now redundant because the final messages handle all states
        // case 'TASK_STARTED':
        //   break;

        case 'TASK_COMPLETE':
        case 'TASK_ERROR':
          // --- THIS IS THE FIX ---
          // This simplified logic correctly handles all scenarios, including the final combined result.
          setTasks((prevTasks) => {
            // If the incoming task is a final combined result, it should be the ONLY task displayed.
            if (message.payload.isCombinedResult) {
              return [message.payload];
            }
            // Otherwise, find and update the specific task in the list.
            return prevTasks.map((task) =>
              task.taskId === message.payload.taskId ? message.payload : task,
            );
          });
          // -----------------------
          break;
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  useEffect(() => {
    if (tasks.length === 0) {
      setIsProcessing(false);
      return;
    }
    // Processing is finished only when all displayed tasks are no longer in a pending/processing state.
    const isStillProcessing = tasks.some(
      (t) => t.status === 'pending' || t.status === 'processing',
    );
    setIsProcessing(isStillProcessing);
  }, [tasks]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showLinkedInDropdown) {
        const target = event.target as Element;
        const dropdownContainer = target.closest('.relative');
        if (!dropdownContainer) {
          setShowLinkedInDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLinkedInDropdown]);

  const handleTabSelection = (tabId: number) => {
    setSelectedTabs((prev) =>
      prev.includes(tabId)
        ? prev.filter((id) => id !== tabId)
        : [...prev, tabId],
    );
  };

  const handleStart = () => {
    setTasks([]);
    sendMessageToServiceWorker({
      type: 'START_PROCESSING',
      payload: {
        tabs: selectedTabs,
        pipeline: selectedPipeline,
        scrapeOption,
        customPrompt,
        languageOption,
        customLanguage,
        combineResults: isCombineChecked && selectedTabs.length > 1,
        selectedModel,
        outputFormat,
      },
    });
  };

  const handleClearResults = () => {
    setTasks([]);
    setIsProcessing(false);
  };

  const handleCancel = () => {
    console.log('Sending CANCEL_PROCESSING message...');
    sendMessageToServiceWorker({ type: 'CANCEL_PROCESSING' });
    // Immediately provide feedback to the user
    setTasks((prev) =>
      prev.map((t) =>
        t.status === 'pending' || t.status === 'processing'
          ? { ...t, status: 'error', error: 'Cancelled by user.' }
          : t,
      ),
    );
    setIsProcessing(false);
  };

  const areTabsSelected = selectedTabs.length > 0;
  const isScrapeSelected = selectedPipeline === 'scrape';
  const isTranslateSelected =
    selectedPipeline.includes('translate') || selectedPipeline.includes('lang');

  const isStartDisabled =
    !areTabsSelected ||
    (isScrapeSelected && scrapeOption === 'custom' && !customPrompt.trim()) ||
    (isTranslateSelected &&
      languageOption === 'custom' &&
      !customLanguage.trim()) ||
    isProcessing;

  const isLinkedInScrape =
    selectedPipeline === 'scrape' && scrapeOption === 'linkedin-jobs';

  const handleLinkedInFilterToggle = async () => {
    try {
      const tabs = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tabs[0]?.id) {
        await chrome.tabs.sendMessage(tabs[0].id, {
          type: 'LINKEDIN_FILTER_TOGGLE',
        });
      }
    } catch (error) {
      console.error('Error toggling LinkedIn filter:', error);
    }
  };

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
        <div className="relative flex flex-col items-end space-y-1">
          <button
            aria-label="Menu"
            onClick={(e) => {
              e.stopPropagation();
              setShowLinkedInDropdown(!showLinkedInDropdown);
            }}
            className="text-spotify-light-gray hover:text-white transition-colors p-1"
          >
            <MenuIcon />
          </button>
          {showLinkedInDropdown && (
            <div className="absolute top-full right-0 mt-1 flex flex-col items-end space-y-1 bg-spotify-gray rounded-md p-1 shadow-lg z-10 min-w-32">
              <button
                aria-label="Settings"
                onClick={(e) => {
                  e.stopPropagation();
                  setView('settings');
                  setShowLinkedInDropdown(false);
                }}
                className="w-full text-left text-spotify-light-gray hover:text-white bg-spotify-gray hover:bg-spotify-gray/80 transition-colors p-2 flex items-center space-x-2 rounded"
              >
                <GearIcon />
                <span className="text-xs">Settings</span>
              </button>
              {isLinkedInScrape && (
                <button
                  aria-label="LinkedIn Filter"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLinkedInFilterToggle();
                    setShowLinkedInDropdown(false);
                  }}
                  className="w-full text-left text-spotify-light-gray hover:text-white bg-spotify-gray hover:bg-spotify-gray/80 transition-colors p-2 flex items-center space-x-2 rounded"
                >
                  <LinkedinIcon />
                  <span className="text-xs">LinkedIn</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <TabSelectionList
          selectedTabs={selectedTabs}
          onTabSelect={handleTabSelection}
        />
      </div>

      <div className="space-y-2">
        <h2 className="text-base font-bold text-white">2. Configure</h2>
        <ActionOptions
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          isCombineChecked={isCombineChecked}
          onCombineChange={setIsCombineChecked}
          isDisabled={!areTabsSelected}
          selectedTabCount={selectedTabs.length}
        />
      </div>

      <div className="space-y-2">
        <h2 className="text-base font-bold text-white">3. Choose an Action</h2>
        <PipelineSelector
          selectedPipeline={selectedPipeline}
          onPipelineChange={setSelectedPipeline}
          isDisabled={!areTabsSelected}
        />
      </div>

      {isScrapeSelected && !isProcessing && (
        <DataScrapeOptions
          selectedOption={scrapeOption}
          onOptionChange={setScrapeOption}
          customPrompt={customPrompt}
          onCustomPromptChange={setCustomPrompt}
        />
      )}
      {isTranslateSelected && !isProcessing && (
        <LanguageSelector
          selectedLanguage={languageOption}
          onLanguageChange={setLanguageOption}
          customLanguage={customLanguage}
          onCustomLanguageChange={setCustomLanguage}
        />
      )}

      {isLinkedInScrape && !isProcessing && (
        <OutputFormatSelector
          selectedFormat={outputFormat}
          onFormatChange={setOutputFormat}
        />
      )}

      {isProcessing ? (
        <Button onClick={handleCancel} variant="secondary">
          Cancel
        </Button>
      ) : (
        <Button onClick={handleStart} disabled={isStartDisabled}>
          Start Processing
        </Button>
      )}

      <div className="flex-grow"></div>

      <ResultsDisplay tasks={tasks} onClear={handleClearResults} />
    </div>
  );
}

export default App;
