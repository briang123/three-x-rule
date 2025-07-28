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
  return function MockAnimatedModelBadges({ isVisible }: any) {
    if (!isVisible) return null;
    return <div data-testid="animated-model-badges">Model Badges</div>;
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
    render(<ChatInputMessage onSubmit={mockOnSubmit} currentMessage="" />);

    const textarea = screen.getByPlaceholderText('Ask anything...') as HTMLTextAreaElement;
    const submitButtons = screen.getAllByRole('button');
    const submitButton = submitButtons.find((button) => button.getAttribute('type') === 'submit');

    // Type some text
    fireEvent.change(textarea, { target: { value: 'Test message' } });

    // Submit the form
    fireEvent.click(submitButton!);

    expect(mockOnSubmit).toHaveBeenCalledWith('Test message');
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

  it('should show "AI Selection" button when AI selection is closed and models are selected', () => {
    render(
      <ChatInputMessage
        onSubmit={mockOnSubmit}
        currentMessage=""
        modelSelections={[{ modelId: 'gemini-2.5-flash-lite', count: 1 }]}
        showAISelection={false}
        onToggleAISelection={mockOnToggleAISelection}
      />,
    );

    const aiSelectionButton = screen.getByText('AI Selection');
    expect(aiSelectionButton).toBeInTheDocument();
  });
});
