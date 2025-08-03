import { renderHook, act } from '@testing-library/react';
import { useRemixState } from './useRemixState';

describe('useRemixState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useRemixState());

    expect(result.current.remixResponses).toEqual([]);
    expect(result.current.remixModels).toEqual([]);
    expect(result.current.isRemixGenerating).toBe(false);
    expect(result.current.showRemix).toBe(false);
    expect(result.current.remixModel).toBe('');
  });

  it('should update remixResponses correctly', () => {
    const { result } = renderHook(() => useRemixState());

    const responses = ['Response 1', 'Response 2', 'Response 3'];

    act(() => {
      result.current.setRemixResponses(responses);
    });

    expect(result.current.remixResponses).toEqual(responses);
  });

  it('should update remixModels correctly', () => {
    const { result } = renderHook(() => useRemixState());

    const models = ['gpt-4', 'claude-3', 'gemini-pro'];

    act(() => {
      result.current.setRemixModels(models);
    });

    expect(result.current.remixModels).toEqual(models);
  });

  it('should update isRemixGenerating correctly', () => {
    const { result } = renderHook(() => useRemixState());

    act(() => {
      result.current.setIsRemixGenerating(true);
    });

    expect(result.current.isRemixGenerating).toBe(true);

    act(() => {
      result.current.setIsRemixGenerating(false);
    });

    expect(result.current.isRemixGenerating).toBe(false);
  });

  it('should update showRemix correctly', () => {
    const { result } = renderHook(() => useRemixState());

    act(() => {
      result.current.setShowRemix(true);
    });

    expect(result.current.showRemix).toBe(true);

    act(() => {
      result.current.setShowRemix(false);
    });

    expect(result.current.showRemix).toBe(false);
  });

  it('should update remixModel correctly', () => {
    const { result } = renderHook(() => useRemixState());

    const model = 'gpt-4';

    act(() => {
      result.current.setRemixModel(model);
    });

    expect(result.current.remixModel).toBe(model);
  });

  it('should reset all state when resetRemixState is called', () => {
    const { result } = renderHook(() => useRemixState());

    // Set some initial state
    act(() => {
      result.current.setRemixResponses(['Response 1', 'Response 2']);
      result.current.setRemixModels(['gpt-4', 'claude-3']);
      result.current.setIsRemixGenerating(true);
      result.current.setShowRemix(true);
      result.current.setRemixModel('gpt-4');
    });

    // Verify state is set
    expect(result.current.remixResponses).toHaveLength(2);
    expect(result.current.remixModels).toHaveLength(2);
    expect(result.current.isRemixGenerating).toBe(true);
    expect(result.current.showRemix).toBe(true);
    expect(result.current.remixModel).toBe('gpt-4');

    // Reset state
    act(() => {
      result.current.resetRemixState();
    });

    // Verify state is reset
    expect(result.current.remixResponses).toEqual([]);
    expect(result.current.remixModels).toEqual([]);
    expect(result.current.isRemixGenerating).toBe(false);
    expect(result.current.showRemix).toBe(false);
    expect(result.current.remixModel).toBe('');
  });

  it('should handle multiple state updates correctly', () => {
    const { result } = renderHook(() => useRemixState());

    act(() => {
      result.current.setRemixResponses(['Response 1']);
      result.current.setRemixModels(['gpt-4']);
      result.current.setIsRemixGenerating(true);
      result.current.setShowRemix(true);
      result.current.setRemixModel('gpt-4');
    });

    expect(result.current.remixResponses).toEqual(['Response 1']);
    expect(result.current.remixModels).toEqual(['gpt-4']);
    expect(result.current.isRemixGenerating).toBe(true);
    expect(result.current.showRemix).toBe(true);
    expect(result.current.remixModel).toBe('gpt-4');
  });

  it('should handle empty arrays correctly', () => {
    const { result } = renderHook(() => useRemixState());

    act(() => {
      result.current.setRemixResponses([]);
      result.current.setRemixModels([]);
    });

    expect(result.current.remixResponses).toEqual([]);
    expect(result.current.remixModels).toEqual([]);
  });

  it('should preserve existing state when updating individual properties', () => {
    const { result } = renderHook(() => useRemixState());

    // Set initial state
    act(() => {
      result.current.setRemixResponses(['Response 1']);
      result.current.setRemixModels(['gpt-4']);
      result.current.setIsRemixGenerating(true);
      result.current.setShowRemix(true);
      result.current.setRemixModel('gpt-4');
    });

    // Update one property
    act(() => {
      result.current.setRemixResponses(['Response 1', 'Response 2']);
    });

    // Verify other properties are preserved
    expect(result.current.remixModels).toEqual(['gpt-4']);
    expect(result.current.isRemixGenerating).toBe(true);
    expect(result.current.showRemix).toBe(true);
    expect(result.current.remixModel).toBe('gpt-4');
  });

  it('should handle boolean state changes correctly', () => {
    const { result } = renderHook(() => useRemixState());

    // Test isRemixGenerating
    act(() => {
      result.current.setIsRemixGenerating(true);
    });
    expect(result.current.isRemixGenerating).toBe(true);

    act(() => {
      result.current.setIsRemixGenerating(false);
    });
    expect(result.current.isRemixGenerating).toBe(false);

    // Test showRemix
    act(() => {
      result.current.setShowRemix(true);
    });
    expect(result.current.showRemix).toBe(true);

    act(() => {
      result.current.setShowRemix(false);
    });
    expect(result.current.showRemix).toBe(false);
  });

  it('should handle string state changes correctly', () => {
    const { result } = renderHook(() => useRemixState());

    act(() => {
      result.current.setRemixModel('gpt-4');
    });
    expect(result.current.remixModel).toBe('gpt-4');

    act(() => {
      result.current.setRemixModel('claude-3');
    });
    expect(result.current.remixModel).toBe('claude-3');

    act(() => {
      result.current.setRemixModel('');
    });
    expect(result.current.remixModel).toBe('');
  });

  it('should handle array state changes correctly', () => {
    const { result } = renderHook(() => useRemixState());

    // Test remixResponses
    act(() => {
      result.current.setRemixResponses(['Response 1']);
    });
    expect(result.current.remixResponses).toEqual(['Response 1']);

    act(() => {
      result.current.setRemixResponses(['Response 1', 'Response 2', 'Response 3']);
    });
    expect(result.current.remixResponses).toEqual(['Response 1', 'Response 2', 'Response 3']);

    // Test remixModels
    act(() => {
      result.current.setRemixModels(['gpt-4']);
    });
    expect(result.current.remixModels).toEqual(['gpt-4']);

    act(() => {
      result.current.setRemixModels(['gpt-4', 'claude-3', 'gemini-pro']);
    });
    expect(result.current.remixModels).toEqual(['gpt-4', 'claude-3', 'gemini-pro']);
  });
});
