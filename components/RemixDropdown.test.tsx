import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import RemixDropdown from './RemixDropdown';

// Mock fetch for the API call
global.fetch = jest.fn();

describe('RemixDropdown', () => {
  const mockOnRemix = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          models: [
            {
              id: 'gemini-2.0-flash',
              name: 'Gemini 2.0 Flash',
              description: 'Fast and efficient model',
            },
            {
              id: 'gemini-2.0-flash-lite',
              name: 'Gemini 2.0 Flash Lite',
              description: 'Lightweight model',
            },
          ],
        },
      }),
    });
  });

  it('should render loading state initially', () => {
    render(<RemixDropdown onRemix={mockOnRemix} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should render error state when API fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

    render(<RemixDropdown onRemix={mockOnRemix} />);

    // Wait for error state
    await screen.findByText('Remix');
    expect(screen.getByTitle(/Error/)).toBeInTheDocument();
  });

  it('should render enabled button when not disabled', async () => {
    render(<RemixDropdown onRemix={mockOnRemix} disabled={false} />);

    // Wait for models to load
    await screen.findByText('Remix');
    
    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();
    expect(button).toHaveClass('bg-gradient-to-r');
  });

  it('should render disabled button when disabled prop is true', async () => {
    render(<RemixDropdown onRemix={mockOnRemix} disabled={true} />);

    // Wait for models to load
    await screen.findByText('Remix');
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed', 'bg-gray-200');
  });

  it('should render disabled button when isGenerating is true', async () => {
    render(<RemixDropdown onRemix={mockOnRemix} isGenerating={true} />);

    // Wait for models to load
    await screen.findByText('Generating...');
    
    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
  });

  it('should open dropdown when clicked', async () => {
    render(<RemixDropdown onRemix={mockOnRemix} disabled={false} />);

    // Wait for models to load
    await screen.findByText('Remix');
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText('Select model for remix')).toBeInTheDocument();
    expect(screen.getByText('Gemini 2.0 Flash')).toBeInTheDocument();
    expect(screen.getByText('Gemini 2.0 Flash Lite')).toBeInTheDocument();
  });

  it('should call onRemix when a model is selected', async () => {
    render(<RemixDropdown onRemix={mockOnRemix} disabled={false} />);

    // Wait for models to load
    await screen.findByText('Remix');
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    const modelButton = screen.getByText('Gemini 2.0 Flash');
    fireEvent.click(modelButton);

    expect(mockOnRemix).toHaveBeenCalledWith('gemini-2.0-flash');
  });

  it('should close dropdown when clicking outside', async () => {
    render(<RemixDropdown onRemix={mockOnRemix} disabled={false} />);

    // Wait for models to load
    await screen.findByText('Remix');
    
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText('Select model for remix')).toBeInTheDocument();

    // Click outside
    fireEvent.mouseDown(document.body);

    expect(screen.queryByText('Select model for remix')).not.toBeInTheDocument();
  });
});