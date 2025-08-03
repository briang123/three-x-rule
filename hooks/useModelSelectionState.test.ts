import { renderHook, act } from '@testing-library/react';
import { useModelSelectionState } from './useModelSelectionState';
import { ModelSelection } from '@/components/ModelGridSelector';

describe('useModelSelectionState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useModelSelectionState());

    expect(result.current.modelSelections).toEqual([]);
    expect(result.current.showAISelection).toBe(true);
    expect(result.current.resetModelSelector).toBe(false);
    expect(result.current.showModelSelectionModal).toBe(false);
    expect(result.current.isUsingDefaultModel).toBe(false);
  });

  it('should update modelSelections correctly', () => {
    const { result } = renderHook(() => useModelSelectionState());

    const selections: ModelSelection[] = [
      { modelId: 'gpt-4', count: 2 },
      { modelId: 'claude-3', count: 1 },
    ];

    act(() => {
      result.current.setModelSelections(selections);
    });

    expect(result.current.modelSelections).toEqual(selections);
  });

  it('should update showAISelection correctly', () => {
    const { result } = renderHook(() => useModelSelectionState());

    act(() => {
      result.current.setShowAISelection(false);
    });

    expect(result.current.showAISelection).toBe(false);

    act(() => {
      result.current.setShowAISelection(true);
    });

    expect(result.current.showAISelection).toBe(true);
  });

  it('should update resetModelSelector correctly', () => {
    const { result } = renderHook(() => useModelSelectionState());

    act(() => {
      result.current.setResetModelSelector(true);
    });

    expect(result.current.resetModelSelector).toBe(true);

    act(() => {
      result.current.setResetModelSelector(false);
    });

    expect(result.current.resetModelSelector).toBe(false);
  });

  it('should update showModelSelectionModal correctly', () => {
    const { result } = renderHook(() => useModelSelectionState());

    act(() => {
      result.current.setShowModelSelectionModal(true);
    });

    expect(result.current.showModelSelectionModal).toBe(true);

    act(() => {
      result.current.setShowModelSelectionModal(false);
    });

    expect(result.current.showModelSelectionModal).toBe(false);
  });

  it('should update isUsingDefaultModel correctly', () => {
    const { result } = renderHook(() => useModelSelectionState());

    act(() => {
      result.current.setIsUsingDefaultModel(true);
    });

    expect(result.current.isUsingDefaultModel).toBe(true);

    act(() => {
      result.current.setIsUsingDefaultModel(false);
    });

    expect(result.current.isUsingDefaultModel).toBe(false);
  });

  it('should reset all state when resetModelSelectionState is called', () => {
    const { result } = renderHook(() => useModelSelectionState());

    // Set some initial state
    const selections: ModelSelection[] = [
      { modelId: 'gpt-4', count: 2 },
      { modelId: 'claude-3', count: 1 },
    ];

    act(() => {
      result.current.setModelSelections(selections);
      result.current.setShowAISelection(false);
      result.current.setResetModelSelector(true);
      result.current.setShowModelSelectionModal(false);
      result.current.setIsUsingDefaultModel(true);
    });

    // Verify state is set
    expect(result.current.modelSelections).toHaveLength(2);
    expect(result.current.showAISelection).toBe(false);
    expect(result.current.resetModelSelector).toBe(true);
    expect(result.current.showModelSelectionModal).toBe(false);
    expect(result.current.isUsingDefaultModel).toBe(true);

    // Reset state
    act(() => {
      result.current.resetModelSelectionState();
    });

    // Verify state is reset
    expect(result.current.modelSelections).toEqual([]);
    expect(result.current.showModelSelectionModal).toBe(true);
    expect(result.current.isUsingDefaultModel).toBe(false);
    expect(result.current.resetModelSelector).toBe(true);

    // Wait for the timeout to complete
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current.resetModelSelector).toBe(false);
  });

  it('should handle multiple state updates correctly', () => {
    const { result } = renderHook(() => useModelSelectionState());

    const selections: ModelSelection[] = [
      { modelId: 'gpt-4', count: 3 },
      { modelId: 'claude-3', count: 2 },
      { modelId: 'gemini-pro', count: 1 },
    ];

    act(() => {
      result.current.setModelSelections(selections);
      result.current.setShowAISelection(false);
      result.current.setShowModelSelectionModal(true);
      result.current.setIsUsingDefaultModel(true);
    });

    expect(result.current.modelSelections).toHaveLength(3);
    expect(result.current.showAISelection).toBe(false);
    expect(result.current.showModelSelectionModal).toBe(true);
    expect(result.current.isUsingDefaultModel).toBe(true);
  });

  it('should preserve existing state when updating individual properties', () => {
    const { result } = renderHook(() => useModelSelectionState());

    // Set initial state
    act(() => {
      result.current.setModelSelections([{ modelId: 'gpt-4', count: 1 }]);
      result.current.setShowAISelection(false);
      result.current.setShowModelSelectionModal(false);
      result.current.setIsUsingDefaultModel(true);
    });

    // Update one property
    act(() => {
      result.current.setModelSelections([
        { modelId: 'gpt-4', count: 1 },
        { modelId: 'claude-3', count: 2 },
      ]);
    });

    // Verify other properties are preserved
    expect(result.current.showAISelection).toBe(false);
    expect(result.current.showModelSelectionModal).toBe(false);
    expect(result.current.isUsingDefaultModel).toBe(true);
  });

  it('should handle empty arrays correctly', () => {
    const { result } = renderHook(() => useModelSelectionState());

    act(() => {
      result.current.setModelSelections([]);
    });

    expect(result.current.modelSelections).toEqual([]);
  });

  it('should handle boolean state changes correctly', () => {
    const { result } = renderHook(() => useModelSelectionState());

    // Test showAISelection
    act(() => {
      result.current.setShowAISelection(true);
    });
    expect(result.current.showAISelection).toBe(true);

    act(() => {
      result.current.setShowAISelection(false);
    });
    expect(result.current.showAISelection).toBe(false);

    // Test resetModelSelector
    act(() => {
      result.current.setResetModelSelector(true);
    });
    expect(result.current.resetModelSelector).toBe(true);

    act(() => {
      result.current.setResetModelSelector(false);
    });
    expect(result.current.resetModelSelector).toBe(false);

    // Test showModelSelectionModal
    act(() => {
      result.current.setShowModelSelectionModal(true);
    });
    expect(result.current.showModelSelectionModal).toBe(true);

    act(() => {
      result.current.setShowModelSelectionModal(false);
    });
    expect(result.current.showModelSelectionModal).toBe(false);

    // Test isUsingDefaultModel
    act(() => {
      result.current.setIsUsingDefaultModel(true);
    });
    expect(result.current.isUsingDefaultModel).toBe(true);

    act(() => {
      result.current.setIsUsingDefaultModel(false);
    });
    expect(result.current.isUsingDefaultModel).toBe(false);
  });

  it('should handle array state changes correctly', () => {
    const { result } = renderHook(() => useModelSelectionState());

    act(() => {
      result.current.setModelSelections([{ modelId: 'gpt-4', count: 1 }]);
    });
    expect(result.current.modelSelections).toEqual([{ modelId: 'gpt-4', count: 1 }]);

    act(() => {
      result.current.setModelSelections([
        { modelId: 'gpt-4', count: 2 },
        { modelId: 'claude-3', count: 3 },
        { modelId: 'gemini-pro', count: 1 },
      ]);
    });
    expect(result.current.modelSelections).toEqual([
      { modelId: 'gpt-4', count: 2 },
      { modelId: 'claude-3', count: 3 },
      { modelId: 'gemini-pro', count: 1 },
    ]);
  });

  it('should handle complex ModelSelection objects correctly', () => {
    const { result } = renderHook(() => useModelSelectionState());

    const complexSelections: ModelSelection[] = [
      { modelId: 'gpt-4-turbo', count: 5 },
      { modelId: 'claude-3-sonnet', count: 3 },
      { modelId: 'gemini-pro-1.5', count: 2 },
    ];

    act(() => {
      result.current.setModelSelections(complexSelections);
    });

    expect(result.current.modelSelections).toEqual(complexSelections);
  });

  it('should handle timeout in resetModelSelectionState correctly', () => {
    const { result } = renderHook(() => useModelSelectionState());

    act(() => {
      result.current.resetModelSelectionState();
    });

    // Should be true immediately after reset
    expect(result.current.resetModelSelector).toBe(true);

    // Should be false after 100ms
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(result.current.resetModelSelector).toBe(false);
  });
});
