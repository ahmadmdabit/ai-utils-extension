import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Settings } from './Settings';
import * as chromeService from '../services/chromeService';

vi.mock('../services/chromeService');

describe('Settings component', () => {
  const getApiKeyMock = vi.spyOn(chromeService, 'getApiKey');
  const setApiKeyMock = vi.spyOn(chromeService, 'setApiKey');
  const getTimeoutSettingMock = vi.spyOn(chromeService, 'getTimeoutSetting');
  const setTimeoutSettingMock = vi.spyOn(chromeService, 'setTimeoutSetting');

  beforeEach(() => {
    vi.clearAllMocks();
    getApiKeyMock.mockResolvedValue('existing-key');
    getTimeoutSettingMock.mockResolvedValue(90);
    setApiKeyMock.mockResolvedValue(undefined);
    setTimeoutSettingMock.mockResolvedValue(undefined);
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders the settings form correctly', async () => {
    render(<Settings onClose={() => {}} />);
    expect(await screen.findByText('Settings')).toBeInTheDocument();
    expect(await screen.findByLabelText('Gemini API Key')).toBeInTheDocument();
    expect(
      await screen.findByLabelText('Processing Timeout (seconds)'),
    ).toBeInTheDocument();
  });

  it('fetches and displays existing settings on mount', async () => {
    render(<Settings onClose={() => {}} />);
    expect(await screen.findByDisplayValue('existing-key')).toBeInTheDocument();
    expect(await screen.findByDisplayValue('90')).toBeInTheDocument();
  });

  it('updates input values as the user types', async () => {
    render(<Settings onClose={() => {}} />);
    const apiKeyInput = await screen.findByLabelText('Gemini API Key');
    const timeoutInput = await screen.findByLabelText(
      'Processing Timeout (seconds)',
    );

    fireEvent.change(apiKeyInput, { target: { value: 'new-api-key' } });
    fireEvent.change(timeoutInput, { target: { value: '120' } });

    expect(apiKeyInput).toHaveValue('new-api-key');
    expect(timeoutInput).toHaveValue(120);
  });

  it('calls save functions and shows a status message on save', async () => {
    render(<Settings onClose={() => {}} />);

    const apiKeyInput = await screen.findByLabelText('Gemini API Key');
    fireEvent.change(apiKeyInput, { target: { value: 'saved-key' } });

    const timeoutInput = await screen.findByLabelText(
      'Processing Timeout (seconds)',
    );
    fireEvent.change(timeoutInput, { target: { value: '60' } });

    const saveButton = screen.getByRole('button', { name: 'Save Settings' });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(setApiKeyMock).toHaveBeenCalledWith('saved-key');
      expect(setTimeoutSettingMock).toHaveBeenCalledWith(60);
    });

    const statusMessage = await screen.findByText('Settings saved!');
    expect(statusMessage).toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.queryByText('Settings saved!')).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });

  it('calls the onClose prop when the "Back" button is clicked', async () => {
    const handleClose = vi.fn();
    render(<Settings onClose={handleClose} />);
    const backButton = await screen.findByRole('button', { name: 'Back' });
    fireEvent.click(backButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
