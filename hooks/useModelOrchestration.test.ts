import { renderHook, act } from '@testing-library/react';
import { useModelOrchestration } from './useModelOrchestration';
import { ModelSelection } from '@/components/ModelGridSelector';

describe('useModelOrchestration', () => {
  const mockOnToggleAISelection = jest.fn();
  const mockOnRestoreModelSelection = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() =>
      useModelOrchestration({
        onToggleAISelection: mockOnToggleAISelection,
        onRestoreModelSelection: mockOnRestoreModelSelection,
        onSubmit: mockOnSubmit,
      }),
    );

    expect(result.current.showModelBadges).toBe(false);
    expect(result.current.hasSubmitted).toBe(false);
  });

  it('should handle submit orchestration', async () => {
    const { result } = renderHook(() =>
      useModelOrchestration({
        onSubmit: mockOnSubmit,
      }),
    );

    await act(async () => {
      await result.current.handleSubmitWithOrchestration('test prompt');
    });

    expect(result.current.hasSubmitted).toBe(true);
    expect(mockOnSubmit).toHaveBeenCalledWith('test prompt', undefined);
  });

  it('should not submit twice if already submitted', async () => {
    const { result } = renderHook(() =>
      useModelOrchestration({
        onSubmit: mockOnSubmit,
      }),
    );

    // First submission
    await act(async () => {
      await result.current.handleSubmitWithOrchestration('test prompt 1');
    });

    // Second submission should not trigger
    await act(async () => {
      await result.current.handleSubmitWithOrchestration('test prompt 2');
    });

    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    expect(mockOnSubmit).toHaveBeenCalledWith('test prompt 1', undefined);
  });

  it('should handle restore model selection', () => {
    const { result } = renderHook(() =>
      useModelOrchestration({
        onRestoreModelSelection: mockOnRestoreModelSelection,
      }),
    );

    act(() => {
      result.current.handleRestoreModelSelection();
    });

    expect(result.current.showModelBadges).toBe(false);
    expect(result.current.hasSubmitted).toBe(false);
    expect(mockOnRestoreModelSelection).toHaveBeenCalled();
  });

  it('should handle model confirmed orchestration', () => {
    const { result } = renderHook(() =>
      useModelOrchestration({
        onSubmit: mockOnSubmit,
      }),
    );

    act(() => {
      result.current.handleModelConfirmedOrchestration();
    });

    expect(result.current.hasSubmitted).toBe(true);
  });

  it('should auto-hide AI selection when content is received', () => {
    const { result } = renderHook(() =>
      useModelOrchestration({
        showAISelection: true,
        hasAIContent: true,
        onToggleAISelection: mockOnToggleAISelection,
      }),
    );

    expect(mockOnToggleAISelection).toHaveBeenCalled();
  });

  it('should show model badges when model selections are updated and AI selection is closed', () => {
    const modelSelections: ModelSelection[] = [{ modelId: 'model1', count: 1 }];

    const { result } = renderHook(() =>
      useModelOrchestration({
        showAISelection: false,
        modelSelections,
      }),
    );

    expect(result.current.showModelBadges).toBe(true);
  });

  it('should reset state when resetModelSelector is true', () => {
    const { result, rerender } = renderHook(
      ({ resetModelSelector }) =>
        useModelOrchestration({
          resetModelSelector,
        }),
      { initialProps: { resetModelSelector: false } },
    );

    // Set some state
    act(() => {
      result.current.handleModelConfirmedOrchestration();
    });

    expect(result.current.hasSubmitted).toBe(true);

    // Reset
    rerender({ resetModelSelector: true });

    expect(result.current.showModelBadges).toBe(false);
    expect(result.current.hasSubmitted).toBe(false);
  });

  it('should reset state when showAISelection becomes true', () => {
    const { result, rerender } = renderHook(
      ({ showAISelection }) =>
        useModelOrchestration({
          showAISelection,
        }),
      { initialProps: { showAISelection: false } },
    );

    // Set some state
    act(() => {
      result.current.handleModelConfirmedOrchestration();
    });

    expect(result.current.hasSubmitted).toBe(true);

    // Show AI selection
    rerender({ showAISelection: true });

    expect(result.current.showModelBadges).toBe(false);
    expect(result.current.hasSubmitted).toBe(false);
  });
});
