import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatInputMessage from './ChatInputMessage';

// Mock the ConfirmationModal component
jest.mock('./ConfirmationModal', () => {
  return function MockConfirmationModal({ isOpen, onConfirm, onCancel, title, message }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="confirmation-modal">
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onConfirm} data-testid="confirm-button">
          Confirm
        </button>
        <button onClick={onCancel} data-testid="cancel-button">
          Cancel
        </button>
      </div>
    );
  };
});

// Mock the AnimatedModelBadges component
jest.mock('./AnimatedModelBadges', () => {
  return function MockAnimatedModelBadges({ isVisible, modelSelections, onRestore }: any) {
    if (!isVisible) return null;
    return (
      <div data-testid="animated-model-badges">
        {modelSelections.map((selection: any) => (
          <span key={selection.modelId} data-testid={`model-badge-${selection.modelId}`}>
            {selection.modelId} {selection.count}
          </span>
        ))}
        <button onClick={onRestore} data-testid="change-models-button">
          Change Models
        </button>
      </div>
    );
  };
});

describe('ChatInputMessage', () => {
  const mockOnSubmit = jest.fn();
  const mockOnModelSelect = jest.fn();
  const mockOnModelSelectionsUpdate = jest.fn();
  const mockOnDirectSubmit = jest.fn();
  const mockOnToggleAISelection = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with empty text initially', () => {
    render(<ChatInputMessage onSubmit={mockOnSubmit} currentMessage="" />);

    const textarea = screen.getByPlaceholderText('Ask anything...') as HTMLTextAreaElement;
    expect(textarea.value).toBe('');
  });

  it('should update text when currentMessage prop changes', () => {
    const { rerender } = render(<ChatInputMessage onSubmit={mockOnSubmit} currentMessage="" />);

    const textarea = screen.getByPlaceholderText('Ask anything...') as HTMLTextAreaElement;
    expect(textarea.value).toBe('');

    // Update the currentMessage prop
    rerender(<ChatInputMessage onSubmit={mockOnSubmit} currentMessage="Hello world" />);

    expect(textarea.value).toBe('Hello world');
  });

  it('should reset text when currentMessage becomes empty (New Chat scenario)', async () => {
    const { rerender } = render(
      <ChatInputMessage onSubmit={mockOnSubmit} currentMessage="Some existing text" />,
    );

    const textarea = screen.getByPlaceholderText('Ask anything...') as HTMLTextAreaElement;
    expect(textarea.value).toBe('Some existing text');

    // Simulate user typing additional text
    fireEvent.change(textarea, { target: { value: 'Some existing text + user input' } });
    expect(textarea.value).toBe('Some existing text + user input');

    // Simulate New Chat being clicked (currentMessage becomes empty)
    rerender(<ChatInputMessage onSubmit={mockOnSubmit} currentMessage="" />);

    // The textarea should be reset to empty
    await waitFor(() => {
      expect(textarea.value).toBe('');
    });
  });

  it('should handle form submission', () => {
    render(
      <ChatInputMessage
        onSubmit={mockOnSubmit}
        currentMessage=""
        modelSelections={[{ modelId: 'gemini-2.5-flash-lite', count: 1 }]}
      />,
    );

    const textarea = screen.getByPlaceholderText('Ask anything...') as HTMLTextAreaElement;
    const submitButtons = screen.getAllByRole('button');
    const submitButton = submitButtons.find((button) => button.getAttribute('type') === 'submit');

    // Type some text
    fireEvent.change(textarea, { target: { value: 'Test message' } });

    // Submit the form
    fireEvent.click(submitButton!);

    expect(mockOnSubmit).toHaveBeenCalledWith('Test message', undefined, []);
  });

  it('should show confirmation modal when no model is selected', () => {
    render(
      <ChatInputMessage
        onSubmit={mockOnSubmit}
        currentMessage=""
        modelSelections={[]}
        onModelSelectionsUpdate={mockOnModelSelectionsUpdate}
        onModelSelect={mockOnModelSelect}
        onDirectSubmit={mockOnDirectSubmit}
      />,
    );

    const textarea = screen.getByPlaceholderText('Ask anything...') as HTMLTextAreaElement;
    const submitButtons = screen.getAllByRole('button');
    const submitButton = submitButtons.find((button) => button.getAttribute('type') === 'submit');

    // Type some text
    fireEvent.change(textarea, { target: { value: 'Test message' } });

    // Submit the form
    fireEvent.click(submitButton!);

    // Should show confirmation modal
    expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
    expect(screen.getByText('Use Default Model?')).toBeInTheDocument();
  });

  it('should handle model confirmation', () => {
    render(
      <ChatInputMessage
        onSubmit={mockOnSubmit}
        currentMessage=""
        modelSelections={[]}
        onModelSelectionsUpdate={mockOnModelSelectionsUpdate}
        onModelSelect={mockOnModelSelect}
        onDirectSubmit={mockOnDirectSubmit}
      />,
    );

    const textarea = screen.getByPlaceholderText('Ask anything...') as HTMLTextAreaElement;
    const submitButtons = screen.getAllByRole('button');
    const submitButton = submitButtons.find((button) => button.getAttribute('type') === 'submit');

    // Type some text and submit
    fireEvent.change(textarea, { target: { value: 'Test message' } });
    fireEvent.click(submitButton!);

    // Confirm the model selection
    const confirmButton = screen.getByTestId('confirm-button');
    fireEvent.click(confirmButton);

    expect(mockOnModelSelectionsUpdate).toHaveBeenCalledWith('gemini-2.5-flash-lite');
    expect(mockOnModelSelect).toHaveBeenCalledWith('gemini-2.5-flash-lite');
    expect(mockOnDirectSubmit).toHaveBeenCalledWith('Test message', 'gemini-2.5-flash-lite');
  });

  it('should show "Select Models" button when AI selection is closed and no models selected', () => {
    render(
      <ChatInputMessage
        onSubmit={mockOnSubmit}
        currentMessage=""
        modelSelections={[]}
        showAISelection={false}
        onToggleAISelection={mockOnToggleAISelection}
      />,
    );

    const selectModelsButton = screen.getByText('Select Models');
    expect(selectModelsButton).toBeInTheDocument();
  });

  it('should show model badges when AI selection is closed and models are selected', () => {
    render(
      <ChatInputMessage
        onSubmit={mockOnSubmit}
        currentMessage=""
        modelSelections={[{ modelId: 'gemini-2.5-flash-lite', count: 1 }]}
        showAISelection={false}
        showModelBadges={true}
        onToggleAISelection={mockOnToggleAISelection}
      />,
    );

    expect(screen.getByTestId('animated-model-badges')).toBeInTheDocument();
    expect(screen.getByTestId('model-badge-gemini-2.5-flash-lite')).toBeInTheDocument();
  });
});

describe('ChatInputMessage - Model Badges Integration', () => {
  const defaultProps = {
    currentMessage: '',
    onSubmit: jest.fn(),
    onModelSelectionsChange: jest.fn(),
    modelSelections: [],
    models: [],
    showModelBadges: false,
    showAISelection: false,
    onToggleAISelection: jest.fn(),
    onModelConfirmedOrchestration: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show model badges when showModelBadges is true and showAISelection is false', () => {
    const mockModelSelections = [{ modelId: 'gemini-2.5-flash-lite', count: 1 }];

    render(
      <ChatInputMessage
        {...defaultProps}
        showModelBadges={true}
        showAISelection={false}
        modelSelections={mockModelSelections}
      />,
    );

    expect(screen.getByTestId('animated-model-badges')).toBeInTheDocument();
    expect(screen.getByTestId('model-badge-gemini-2.5-flash-lite')).toBeInTheDocument();
  });

  it('should not show model badges when showAISelection is true', () => {
    const mockModelSelections = [{ modelId: 'gemini-2.5-flash-lite', count: 1 }];

    render(
      <ChatInputMessage
        {...defaultProps}
        showModelBadges={true}
        showAISelection={true}
        modelSelections={mockModelSelections}
      />,
    );

    expect(screen.queryByTestId('animated-model-badges')).not.toBeInTheDocument();
  });

  it('should not show model badges when showModelBadges is false', () => {
    const mockModelSelections = [{ modelId: 'gemini-2.5-flash-lite', count: 1 }];

    render(
      <ChatInputMessage
        {...defaultProps}
        showModelBadges={false}
        showAISelection={false}
        modelSelections={mockModelSelections}
      />,
    );

    expect(screen.queryByTestId('animated-model-badges')).not.toBeInTheDocument();
  });

  it('should show "Select Models" button when no models selected and AI selection is closed', () => {
    render(
      <ChatInputMessage
        {...defaultProps}
        showModelBadges={false}
        showAISelection={false}
        modelSelections={[]}
        onToggleAISelection={jest.fn()}
      />,
    );

    expect(screen.getByText('Select Models')).toBeInTheDocument();
  });

  it('should not show "Select Models" button when models are selected', () => {
    const mockModelSelections = [{ modelId: 'gemini-2.5-flash-lite', count: 1 }];

    render(
      <ChatInputMessage
        {...defaultProps}
        showModelBadges={true}
        showAISelection={false}
        modelSelections={mockModelSelections}
        onToggleAISelection={jest.fn()}
      />,
    );

    expect(screen.queryByText('Select Models')).not.toBeInTheDocument();
  });

  it('should not show "Select Models" button when AI selection is open', () => {
    render(
      <ChatInputMessage
        {...defaultProps}
        showModelBadges={false}
        showAISelection={true}
        modelSelections={[]}
        onToggleAISelection={jest.fn()}
      />,
    );

    expect(screen.queryByText('Select Models')).not.toBeInTheDocument();
  });

  it('should call onToggleAISelection when "Select Models" button is clicked', () => {
    const mockOnToggleAISelection = jest.fn();
    render(
      <ChatInputMessage
        {...defaultProps}
        showModelBadges={false}
        showAISelection={false}
        modelSelections={[]}
        onToggleAISelection={mockOnToggleAISelection}
      />,
    );

    const selectButton = screen.getByText('Select Models');
    fireEvent.click(selectButton);

    expect(mockOnToggleAISelection).toHaveBeenCalledTimes(1);
  });

  it('should pass correct props to AnimatedModelBadges', () => {
    const mockModelSelections = [
      { modelId: 'gemini-2.5-flash-lite', count: 1 },
      { modelId: 'claude-3-5-sonnet', count: 2 },
    ];
    const mockAvailableModels = [
      {
        id: 'gemini-2.5-flash-lite',
        name: 'Gemini 2.5 Flash Lite',
        description: 'Fast and efficient model',
        maxInputTokens: 1000000,
        maxOutputTokens: 8192,
        supportsImages: true,
        supportsVideo: false,
        supportsAudio: false,
      },
      {
        id: 'claude-3-5-sonnet',
        name: 'Claude 3.5 Sonnet',
        description: 'Advanced reasoning model',
        maxInputTokens: 200000,
        maxOutputTokens: 4096,
        supportsImages: true,
        supportsVideo: false,
        supportsAudio: false,
      },
    ];
    const mockOnRestore = jest.fn();

    render(
      <ChatInputMessage
        {...defaultProps}
        showModelBadges={true}
        showAISelection={false}
        modelSelections={mockModelSelections}
        availableModels={mockAvailableModels}
        onRestoreModelSelection={mockOnRestore}
      />,
    );

    expect(screen.getByTestId('animated-model-badges')).toBeInTheDocument();
    expect(screen.getByTestId('model-badge-gemini-2.5-flash-lite')).toBeInTheDocument();
    expect(screen.getByTestId('model-badge-claude-3-5-sonnet')).toBeInTheDocument();
  });
});
