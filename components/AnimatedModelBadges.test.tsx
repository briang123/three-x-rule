import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnimatedModelBadges from './AnimatedModelBadges';

// Mock the models data
const mockModels = [
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet' },
  { id: 'gpt-4o', name: 'GPT-4o' },
];

const mockModelSelections = [
  { modelId: 'gemini-2.5-flash-lite', count: 1 },
  { modelId: 'claude-3-5-sonnet', count: 2 },
];

describe('AnimatedModelBadges', () => {
  const defaultProps = {
    modelSelections: [],
    models: mockModels,
    onRestore: jest.fn(),
    isVisible: false,
    isModelSelectorOpen: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when isVisible is false', () => {
    render(<AnimatedModelBadges {...defaultProps} />);
    expect(screen.queryByText('gemini-2.5-flash-lite')).not.toBeInTheDocument();
  });

  it('should render model badges when isVisible is true and models are selected', () => {
    render(
      <AnimatedModelBadges
        {...defaultProps}
        isVisible={true}
        modelSelections={mockModelSelections}
      />,
    );

    expect(screen.getByText('gemini-2.5-flash-lite')).toBeInTheDocument();
    expect(screen.getByText('claude-3-5-sonnet')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should show loading state when isVisible is true but no models selected', async () => {
    render(<AnimatedModelBadges {...defaultProps} isVisible={true} modelSelections={[]} />);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // After 1 second, loading should disappear
    await waitFor(
      () => {
        expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
      },
      { timeout: 1100 },
    );
  });

  it('should render change models button when models are selected', () => {
    render(
      <AnimatedModelBadges
        {...defaultProps}
        isVisible={true}
        modelSelections={mockModelSelections}
      />,
    );

    const changeButton = screen.getByTitle('Change Models');
    expect(changeButton).toBeInTheDocument();
  });

  it('should not render change models button when model selector is open', () => {
    render(
      <AnimatedModelBadges
        {...defaultProps}
        isVisible={true}
        modelSelections={mockModelSelections}
        isModelSelectorOpen={true}
      />,
    );

    expect(screen.queryByTitle('Change Models')).not.toBeInTheDocument();
  });

  it('should call onRestore when change models button is clicked', () => {
    const mockOnRestore = jest.fn();
    render(
      <AnimatedModelBadges
        {...defaultProps}
        isVisible={true}
        modelSelections={mockModelSelections}
        onRestore={mockOnRestore}
      />,
    );

    const changeButton = screen.getByTitle('Change Models');
    fireEvent.click(changeButton);

    expect(mockOnRestore).toHaveBeenCalledTimes(1);
  });

  it('should render multiple model badges with correct counts', () => {
    const multipleSelections = [
      { modelId: 'gemini-2.5-flash-lite', count: 1 },
      { modelId: 'claude-3-5-sonnet', count: 3 },
      { modelId: 'gpt-4o', count: 2 },
    ];

    render(
      <AnimatedModelBadges
        {...defaultProps}
        isVisible={true}
        modelSelections={multipleSelections}
      />,
    );

    expect(screen.getByText('gemini-2.5-flash-lite')).toBeInTheDocument();
    expect(screen.getByText('claude-3-5-sonnet')).toBeInTheDocument();
    expect(screen.getByText('gpt-4o')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should use model ID instead of model name', () => {
    render(
      <AnimatedModelBadges
        {...defaultProps}
        isVisible={true}
        modelSelections={mockModelSelections}
      />,
    );

    // Should show model ID, not model name
    expect(screen.getByText('gemini-2.5-flash-lite')).toBeInTheDocument();
    expect(screen.queryByText('Gemini 2.5 Flash Lite')).not.toBeInTheDocument();
  });

  it('should have compact styling with smaller padding', () => {
    render(
      <AnimatedModelBadges
        {...defaultProps}
        isVisible={true}
        modelSelections={mockModelSelections}
      />,
    );

    const badge = screen.getByText('gemini-2.5-flash-lite').closest('div');
    expect(badge).toHaveClass('px-1.5', 'py-0.5', 'text-xs');
  });
});
