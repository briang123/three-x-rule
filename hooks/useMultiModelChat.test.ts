import { renderHook } from '@testing-library/react';
import { useMultiModelChat } from './useMultiModelChat';
import { ModelSelection } from '@/components/ModelGridSelector';

describe('useMultiModelChat', () => {
  const mockModelSelections: ModelSelection[] = [
    { modelId: 'gemini-2.0-flash', count: 2 },
    { modelId: 'gemini-2.5-pro', count: 1 },
  ];

  it('should return the expected interface', () => {
    const { result } = renderHook(() =>
      useMultiModelChat({
        modelSelections: mockModelSelections,
      }),
    );

    // Check that the hook returns the expected properties
    expect(result.current).toHaveProperty('chatInstances');
    expect(result.current).toHaveProperty('handleSubmit');
    expect(result.current).toHaveProperty('isLoading');
    expect(result.current).toHaveProperty('messages');
    expect(result.current).toHaveProperty('originalResponses');
    expect(result.current).toHaveProperty('isGenerating');
    expect(result.current).toHaveProperty('resetAll');

    // Check that handleSubmit is a function
    expect(typeof result.current.handleSubmit).toBe('function');
    expect(typeof result.current.resetAll).toBe('function');
  });

  it('should handle empty model selections', () => {
    const { result } = renderHook(() =>
      useMultiModelChat({
        modelSelections: [],
      }),
    );

    expect(result.current.chatInstances).toHaveLength(0);
    expect(result.current.isLoading).toBe(false);
  });

  it('should accept optional callbacks', () => {
    const onModelFinish = jest.fn();
    const onModelError = jest.fn();

    const { result } = renderHook(() =>
      useMultiModelChat({
        modelSelections: mockModelSelections,
        onModelFinish,
        onModelError,
      }),
    );

    // Should not throw when callbacks are provided
    expect(result.current).toBeDefined();
  });
});
