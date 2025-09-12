import { useState, useEffect } from 'react';
import { Button } from '../components/atoms/Button';
import { getApiKey, setApiKey } from '../services/chromeService';

export interface SettingsProps {
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
    <div className="p-4 bg-spotify-black text-white min-h-screen font-sans flex flex-col space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="text-sm text-spotify-light-gray">
          Manage your Gemini API Key.
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="apiKey" className="text-base font-semibold text-white">
          Gemini API Key
        </label>
        <input
          id="apiKey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKeyInput(e.target.value)}
          className="w-full p-3 rounded-md bg-spotify-gray border border-gray-700 focus:ring-spotify-green focus:border-spotify-green"
          placeholder="Enter your API key"
        />
        {status && <p className="text-sm text-spotify-green mt-2">{status}</p>}
      </div>

      <div className="flex-grow"></div>

      <div className="flex justify-between">
        <Button onClick={onClose} variant="secondary">
          Back
        </Button>
        <Button onClick={handleSave}>Save Key</Button>
      </div>
    </div>
  );
}
