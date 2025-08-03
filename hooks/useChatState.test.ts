import { renderHook, act } from '@testing-library/react';
import { useChatState, type SelectedSentence } from './useChatState';

describe('useChatState', () => {
  beforeEach(() => {
    // Clear any localStorage or other side effects
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useChatState());

    expect(result.current.selectedSentences).toEqual([]);
    expect(result.current.messageModels).toEqual({});
    expect(result.current.messageResponses).toEqual({});
    expect(result.current.originalResponses).toEqual({});
    expect(result.current.isGenerating).toEqual({});
    expect(result.current.currentMessage).toBe('');
    expect(result.current.chatKey).toBe(0);
  });

  it('should update selectedSentences correctly', () => {
    const { result } = renderHook(() => useChatState());

    const sentence: SelectedSentence = {
      id: '1',
      text: 'Test sentence',
      source: 'A',
    };

    act(() => {
      result.current.setSelectedSentences([sentence]);
    });

    expect(result.current.selectedSentences).toEqual([sentence]);
  });

  it('should update messageModels correctly', () => {
    const { result } = renderHook(() => useChatState());

    const messageModels = { '1': 'gpt-4', '2': 'claude-3' };

    act(() => {
      result.current.setMessageModels(messageModels);
    });

    expect(result.current.messageModels).toEqual(messageModels);
  });

  it('should update messageResponses correctly', () => {
    const { result } = renderHook(() => useChatState());

    const messageResponses = {
      '1': ['Response 1', 'Response 2'],
      '2': ['Response 3'],
    };

    act(() => {
      result.current.setMessageResponses(messageResponses);
    });

    expect(result.current.messageResponses).toEqual(messageResponses);
  });

  it('should update originalResponses correctly', () => {
    const { result } = renderHook(() => useChatState());

    const originalResponses = {
      '1': 'Full response 1',
      '2': 'Full response 2',
    };

    act(() => {
      result.current.setOriginalResponses(originalResponses);
    });

    expect(result.current.originalResponses).toEqual(originalResponses);
  });

  it('should update isGenerating correctly', () => {
    const { result } = renderHook(() => useChatState());

    const isGenerating = { '1': true, '2': false };

    act(() => {
      result.current.setIsGenerating(isGenerating);
    });

    expect(result.current.isGenerating).toEqual(isGenerating);
  });

  it('should update currentMessage correctly', () => {
    const { result } = renderHook(() => useChatState());

    const message = 'Test prompt message';

    act(() => {
      result.current.setCurrentMessage(message);
    });

    expect(result.current.currentMessage).toBe(message);
  });

  it('should increment chatKey when resetChatState is called', () => {
    const { result } = renderHook(() => useChatState());

    const initialChatKey = result.current.chatKey;

    act(() => {
      result.current.resetChatState();
    });

    expect(result.current.chatKey).toBe(initialChatKey + 1);
  });

  it('should reset all state when resetChatState is called', () => {
    const { result } = renderHook(() => useChatState());

    // Set some initial state
    act(() => {
      result.current.setSelectedSentences([{ id: '1', text: 'Test', source: 'A' }]);
      result.current.setMessageModels({ '1': 'gpt-4' });
      result.current.setMessageResponses({ '1': ['Response'] });
      result.current.setOriginalResponses({ '1': 'Full response' });
      result.current.setIsGenerating({ '1': true });
      result.current.setCurrentMessage('Test message');
    });

    // Verify state is set
    expect(result.current.selectedSentences).toHaveLength(1);
    expect(Object.keys(result.current.messageModels)).toHaveLength(1);
    expect(Object.keys(result.current.messageResponses)).toHaveLength(1);
    expect(Object.keys(result.current.originalResponses)).toHaveLength(1);
    expect(Object.keys(result.current.isGenerating)).toHaveLength(1);
    expect(result.current.currentMessage).toBe('Test message');

    // Reset state
    act(() => {
      result.current.resetChatState();
    });

    // Verify state is reset
    expect(result.current.selectedSentences).toEqual([]);
    expect(result.current.messageModels).toEqual({});
    expect(result.current.messageResponses).toEqual({});
    expect(result.current.originalResponses).toEqual({});
    expect(result.current.isGenerating).toEqual({});
    expect(result.current.currentMessage).toBe('');
  });

  it('should preserve existing state when updating individual properties', () => {
    const { result } = renderHook(() => useChatState());

    // Set initial state
    act(() => {
      result.current.setMessageModels({ '1': 'gpt-4' });
      result.current.setMessageResponses({ '1': ['Response 1'] });
      result.current.setOriginalResponses({ '1': 'Full response 1' });
      result.current.setIsGenerating({ '1': false });
    });

    // Update one property
    act(() => {
      result.current.setMessageModels({ '1': 'gpt-4', '2': 'claude-3' });
    });

    // Verify other properties are preserved
    expect(result.current.messageResponses).toEqual({ '1': ['Response 1'] });
    expect(result.current.originalResponses).toEqual({ '1': 'Full response 1' });
    expect(result.current.isGenerating).toEqual({ '1': false });
  });

  it('should handle multiple state updates correctly', () => {
    const { result } = renderHook(() => useChatState());

    act(() => {
      result.current.setSelectedSentences([
        { id: '1', text: 'First', source: 'A' },
        { id: '2', text: 'Second', source: 'B' },
      ]);
      result.current.setCurrentMessage('Multiple updates test');
      result.current.setMessageModels({ '1': 'gpt-4', '2': 'claude-3' });
    });

    expect(result.current.selectedSentences).toHaveLength(2);
    expect(result.current.currentMessage).toBe('Multiple updates test');
    expect(result.current.messageModels).toEqual({
      '1': 'gpt-4',
      '2': 'claude-3',
    });
  });

  it('should handle empty arrays and objects correctly', () => {
    const { result } = renderHook(() => useChatState());

    act(() => {
      result.current.setSelectedSentences([]);
      result.current.setMessageModels({});
      result.current.setMessageResponses({});
      result.current.setOriginalResponses({});
      result.current.setIsGenerating({});
      result.current.setCurrentMessage('');
    });

    expect(result.current.selectedSentences).toEqual([]);
    expect(result.current.messageModels).toEqual({});
    expect(result.current.messageResponses).toEqual({});
    expect(result.current.originalResponses).toEqual({});
    expect(result.current.isGenerating).toEqual({});
    expect(result.current.currentMessage).toBe('');
  });
});
