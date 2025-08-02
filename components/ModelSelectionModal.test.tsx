import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ModelSelectionModal from './ModelSelectionModal';
import { ModelSelection } from './ModelGridSelector';
import { useModels } from '@/hooks';

// Mock the useModels hook
jest.mock('@/hooks', () => ({
  useModels: jest.fn(),
}));

const mockUseModels = useModels as jest.MockedFunction<typeof useModels>;

describe('ModelSelectionModal', () => {
  const mockOnClose = jest.fn();
  const mockOnModelSelectionsChange = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
    mockOnModelSelectionsChange.mockClear();
    mockUseModels.mockClear();

    // Default mock for useModels
    mockUseModels.mockReturnValue({
      models: [],
      loading: false,
      error: null,
      initialized: true,
      refetch: jest.fn(),
    });
  });

  it('renders modal when isOpen is true', () => {
    render(
      <ModelSelectionModal
        isOpen={true}
        onClose={mockOnClose}
        onModelSelectionsChange={mockOnModelSelectionsChange}
      />,
    );

    expect(screen.getByText('Select AI Models')).toBeInTheDocument();
    expect(screen.getByText('Choose models and set response variations')).toBeInTheDocument();
  });

  it('does not render when isOpen is false', () => {
    render(
      <ModelSelectionModal
        isOpen={false}
        onClose={mockOnClose}
        onModelSelectionsChange={mockOnModelSelectionsChange}
      />,
    );

    expect(screen.queryByText('Select AI Models')).not.toBeInTheDocument();
  });

  it('calls onClose when close button is clicked', () => {
    render(
      <ModelSelectionModal
        isOpen={true}
        onClose={mockOnClose}
        onModelSelectionsChange={mockOnModelSelectionsChange}
      />,
    );

    const closeButton = screen.getByTitle('Close modal');
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when Cancel button is clicked', () => {
    render(
      <ModelSelectionModal
        isOpen={true}
        onClose={mockOnClose}
        onModelSelectionsChange={mockOnModelSelectionsChange}
      />,
    );

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('shows loading state initially', () => {
    mockUseModels.mockReturnValue({
      models: [],
      loading: true,
      error: null,
      initialized: false,
      refetch: jest.fn(),
    });

    render(
      <ModelSelectionModal
        isOpen={true}
        onClose={mockOnClose}
        onModelSelectionsChange={mockOnModelSelectionsChange}
      />,
    );

    expect(screen.getByText('Loading models...')).toBeInTheDocument();
  });

  it('shows error state when API call fails', async () => {
    mockUseModels.mockReturnValue({
      models: [],
      loading: false,
      error: 'Network error',
      initialized: false,
      refetch: jest.fn(),
    });

    render(
      <ModelSelectionModal
        isOpen={true}
        onClose={mockOnClose}
        onModelSelectionsChange={mockOnModelSelectionsChange}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Error Loading Models')).toBeInTheDocument();
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('displays models when API call succeeds', async () => {
    const mockModels = [
      {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        description: 'Fast and efficient model',
        maxInputTokens: 1000000,
        maxOutputTokens: 8192,
        supportsImages: true,
        supportsVideo: true,
        supportsAudio: true,
      },
    ];

    mockUseModels.mockReturnValue({
      models: mockModels,
      loading: false,
      error: null,
      initialized: true,
      refetch: jest.fn(),
    });

    render(
      <ModelSelectionModal
        isOpen={true}
        onClose={mockOnClose}
        onModelSelectionsChange={mockOnModelSelectionsChange}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Gemini 2.0 Flash')).toBeInTheDocument();
      expect(screen.getByText('Fast and efficient model')).toBeInTheDocument();
    });
  });

  it('shows initial selections when provided', async () => {
    const mockModels = [
      {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        description: 'Fast and efficient model',
        maxInputTokens: 1000000,
        maxOutputTokens: 8192,
        supportsImages: true,
        supportsVideo: true,
        supportsAudio: true,
      },
    ];

    const initialSelections: ModelSelection[] = [{ modelId: 'gemini-2.0-flash', count: 2 }];

    mockUseModels.mockReturnValue({
      models: mockModels,
      loading: false,
      error: null,
      initialized: true,
      refetch: jest.fn(),
    });

    render(
      <ModelSelectionModal
        isOpen={true}
        onClose={mockOnClose}
        onModelSelectionsChange={mockOnModelSelectionsChange}
        initialSelections={initialSelections}
      />,
    );

    await waitFor(() => {
      expect(screen.getByText('Selected Models (2 total responses)')).toBeInTheDocument();
    });
  });

  it('should not trigger onModelSelectionsChange when opening with same initial selections', async () => {
    const mockModels = [
      {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash',
        description: 'Fast and efficient model',
        maxInputTokens: 1000000,
        maxOutputTokens: 8192,
        supportsImages: true,
        supportsVideo: true,
        supportsAudio: true,
      },
    ];

    const initialSelections: ModelSelection[] = [{ modelId: 'gemini-2.0-flash', count: 1 }];

    mockUseModels.mockReturnValue({
      models: mockModels,
      loading: false,
      error: null,
      initialized: true,
      refetch: jest.fn(),
    });

    // Clear any previous calls
    mockOnModelSelectionsChange.mockClear();

    render(
      <ModelSelectionModal
        isOpen={true}
        onClose={mockOnClose}
        onModelSelectionsChange={mockOnModelSelectionsChange}
        initialSelections={initialSelections}
      />,
    );

    // Wait for the modal to load
    await waitFor(() => {
      expect(screen.getByText('Selected Models (1 total responses)')).toBeInTheDocument();
    });

    // The modal should not trigger onModelSelectionsChange when opening with the same selections
    // This prevents unnecessary state updates that could clear responses
    expect(mockOnModelSelectionsChange).not.toHaveBeenCalled();
  });
});
