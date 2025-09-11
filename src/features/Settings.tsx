import { useState, useEffect } from 'react';
import { Button } from '../components/atoms/Button';
import { getApiKey, setApiKey } from '../services/chromeService';

interface SettingsProps {
  onClose: () => void;
}

export function Settings({ onClose }: SettingsProps) {
  const [apiKey, setApiKeyInput] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    getApiKey().then((key) => {
      if (key) setApiKeyInput(key);
    });
  }, []);

  const handleSave = async () => {
    await setApiKey(apiKey);
    setStatus('API Key saved!');
    setTimeout(() => setStatus(''), 2000);
  };

  return (
    <div className="p-4 bg-slate-900 text-white min-h-screen font-sans flex flex-col space-y-6">
      <div>
        <h1 className="text-lg font-bold text-violet-400">Settings</h1>
        <p className="text-sm text-slate-400">Manage your Gemini API Key.</p>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="apiKey"
          className="text-md font-semibold text-slate-300"
        >
          Gemini API Key
        </label>
        <input
          id="apiKey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKeyInput(e.target.value)}
          className="w-full p-2 rounded-md bg-slate-800 border border-slate-700 focus:ring-violet-500 focus:border-violet-500"
          placeholder="Enter your API key"
        />
        {status && <p className="text-sm text-green-400">{status}</p>}
      </div>

      <div className="flex-grow"></div>

      <div className="flex justify-between">
        <Button onClick={onClose} className="bg-slate-600 hover:bg-slate-700">
          Back
        </Button>
        <Button onClick={handleSave}>Save Key</Button>
      </div>
    </div>
  );
}
