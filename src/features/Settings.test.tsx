import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Settings } from './Settings';
import * as chromeService from '../services/chromeService';

vi.mock('../services/chromeService');

describe('Settings component', () => {
  const getApiKeyMock = vi.spyOn(chromeService, 'getApiKey');
  const setApiKeyMock = vi.spyOn(chromeService, 'setApiKey');

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console for the timer warning
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders the settings form correctly', async () => {
    getApiKeyMock.mockResolvedValue('');
    render(<Settings onClose={() => {}} />);
    expect(await screen.findByText('Settings')).toBeInTheDocument();
    expect(await screen.findByLabelText('Gemini API Key')).toBeInTheDocument();
  });

  it('fetches and displays the existing API key on mount', async () => {
    getApiKeyMock.mockResolvedValue('existing-key');
    render(<Settings onClose={() => {}} />);
    expect(await screen.findByDisplayValue('existing-key')).toBeInTheDocument();
  });

  it('updates the input value as the user types', async () => {
    getApiKeyMock.mockResolvedValue('');
    render(<Settings onClose={() => {}} />);
    const input = await screen.findByLabelText('Gemini API Key');
    fireEvent.change(input, { target: { value: 'new-api-key' } });
    expect(input).toHaveValue('new-api-key');
  });

  it('calls setApiKey and shows a status message on save', async () => {
    getApiKeyMock.mockResolvedValue('');
    setApiKeyMock.mockResolvedValue(undefined);
    render(<Settings onClose={() => {}} />);

    const input = await screen.findByLabelText('Gemini API Key');
    fireEvent.change(input, { target: { value: 'saved-key' } });

    const saveButton = screen.getByRole('button', { name: 'Save Key' });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(setApiKeyMock).toHaveBeenCalledWith('saved-key');
    });

    const statusMessage = await screen.findByText('API Key saved!');
    expect(statusMessage).toBeInTheDocument();

    // Since we are not using fake timers, we just wait for the message to disappear
    await waitFor(
      () => {
        expect(screen.queryByText('API Key saved!')).not.toBeInTheDocument();
      },
      { timeout: 3000 },
    ); // Wait longer than the 2s timeout in the component
  });

  it('calls the onClose prop when the "Back" button is clicked', async () => {
    getApiKeyMock.mockResolvedValue('');
    const handleClose = vi.fn();
    render(<Settings onClose={handleClose} />);
    const backButton = await screen.findByRole('button', { name: 'Back' });
    fireEvent.click(backButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
