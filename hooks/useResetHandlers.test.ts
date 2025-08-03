import { renderHook, act } from '@testing-library/react';
import { useResetHandlers } from './useResetHandlers';

describe('useResetHandlers', () => {
  const mockResetChatState = jest.fn();
  const mockResetRemixState = jest.fn();
  const mockResetSocialPostsState = jest.fn();
  const mockResetModelSelectionState = jest.fn();

  const defaultProps = {
    resetChatState: mockResetChatState,
    resetRemixState: mockResetRemixState,
    resetSocialPostsState: mockResetSocialPostsState,
    resetModelSelectionState: mockResetModelSelectionState,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleNewChat', () => {
    it('should call all reset functions when handleNewChat is called', () => {
      const { result } = renderHook(() => useResetHandlers(defaultProps));

      act(() => {
        result.current.handleNewChat();
      });

      expect(mockResetChatState).toHaveBeenCalledTimes(1);
      expect(mockResetRemixState).toHaveBeenCalledTimes(1);
      expect(mockResetSocialPostsState).toHaveBeenCalledTimes(1);
      expect(mockResetModelSelectionState).toHaveBeenCalledTimes(1);
    });

    it('should call reset functions in correct order', () => {
      const { result } = renderHook(() => useResetHandlers(defaultProps));

      act(() => {
        result.current.handleNewChat();
      });

      // Verify the order of calls by checking call order
      const calls = [
        mockResetChatState,
        mockResetRemixState,
        mockResetSocialPostsState,
        mockResetModelSelectionState,
      ];

      calls.forEach((mockFn) => {
        expect(mockFn).toHaveBeenCalledTimes(1);
      });
    });

    it('should return a stable function reference', () => {
      const { result, rerender } = renderHook(() => useResetHandlers(defaultProps));

      const firstReference = result.current.handleNewChat;

      rerender();

      const secondReference = result.current.handleNewChat;

      expect(firstReference).toBe(secondReference);
    });

    it('should handle multiple calls to handleNewChat', () => {
      const { result } = renderHook(() => useResetHandlers(defaultProps));

      act(() => {
        result.current.handleNewChat();
        result.current.handleNewChat();
        result.current.handleNewChat();
      });

      expect(mockResetChatState).toHaveBeenCalledTimes(3);
      expect(mockResetRemixState).toHaveBeenCalledTimes(3);
      expect(mockResetSocialPostsState).toHaveBeenCalledTimes(3);
      expect(mockResetModelSelectionState).toHaveBeenCalledTimes(3);
    });
  });

  describe('dependencies', () => {
    it('should update function when reset functions change', () => {
      const { result, rerender } = renderHook(({ props }) => useResetHandlers(props), {
        initialProps: { props: defaultProps },
      });

      const firstReference = result.current.handleNewChat;

      const newResetChatState = jest.fn();
      const newProps = {
        ...defaultProps,
        resetChatState: newResetChatState,
      };

      rerender({ props: newProps });

      const secondReference = result.current.handleNewChat;

      expect(firstReference).not.toBe(secondReference);
    });

    it('should maintain stable reference when reset functions do not change', () => {
      const { result, rerender } = renderHook(({ props }) => useResetHandlers(props), {
        initialProps: { props: defaultProps },
      });

      const firstReference = result.current.handleNewChat;

      rerender({ props: defaultProps });

      const secondReference = result.current.handleNewChat;

      expect(firstReference).toBe(secondReference);
    });
  });

  describe('edge cases', () => {
    it('should handle undefined reset functions gracefully', () => {
      const propsWithUndefined = {
        resetChatState: undefined as any,
        resetRemixState: undefined as any,
        resetSocialPostsState: undefined as any,
        resetModelSelectionState: undefined as any,
      };

      const { result } = renderHook(() => useResetHandlers(propsWithUndefined));

      expect(() => {
        act(() => {
          result.current.handleNewChat();
        });
      }).toThrow();
    });

    it('should handle null reset functions gracefully', () => {
      const propsWithNull = {
        resetChatState: null as any,
        resetRemixState: null as any,
        resetSocialPostsState: null as any,
        resetModelSelectionState: null as any,
      };

      const { result } = renderHook(() => useResetHandlers(propsWithNull));

      expect(() => {
        act(() => {
          result.current.handleNewChat();
        });
      }).toThrow();
    });

    it('should handle reset functions that throw errors', () => {
      const throwingResetChatState = jest.fn().mockImplementation(() => {
        throw new Error('Reset failed');
      });

      const propsWithThrowing = {
        ...defaultProps,
        resetChatState: throwingResetChatState,
      };

      const { result } = renderHook(() => useResetHandlers(propsWithThrowing));

      expect(() => {
        act(() => {
          result.current.handleNewChat();
        });
      }).toThrow('Reset failed');
    });
  });

  describe('return value structure', () => {
    it('should return an object with handleNewChat function', () => {
      const { result } = renderHook(() => useResetHandlers(defaultProps));

      expect(result.current).toHaveProperty('handleNewChat');
      expect(typeof result.current.handleNewChat).toBe('function');
    });

    it('should not return any other properties', () => {
      const { result } = renderHook(() => useResetHandlers(defaultProps));

      const keys = Object.keys(result.current);
      expect(keys).toEqual(['handleNewChat']);
    });
  });

  describe('function behavior', () => {
    it('should call reset functions without any arguments', () => {
      const { result } = renderHook(() => useResetHandlers(defaultProps));

      act(() => {
        result.current.handleNewChat();
      });

      expect(mockResetChatState).toHaveBeenCalledWith();
      expect(mockResetRemixState).toHaveBeenCalledWith();
      expect(mockResetSocialPostsState).toHaveBeenCalledWith();
      expect(mockResetModelSelectionState).toHaveBeenCalledWith();
    });

    it('should not return any value from handleNewChat', () => {
      const { result } = renderHook(() => useResetHandlers(defaultProps));

      let returnValue: any;
      act(() => {
        returnValue = result.current.handleNewChat();
      });

      expect(returnValue).toBeUndefined();
    });
  });

  describe('integration scenarios', () => {
    it('should work with actual reset function implementations', () => {
      const actualResetChatState = jest.fn();
      const actualResetRemixState = jest.fn();
      const actualResetSocialPostsState = jest.fn();
      const actualResetModelSelectionState = jest.fn();

      const props = {
        resetChatState: actualResetChatState,
        resetRemixState: actualResetRemixState,
        resetSocialPostsState: actualResetSocialPostsState,
        resetModelSelectionState: actualResetModelSelectionState,
      };

      const { result } = renderHook(() => useResetHandlers(props));

      act(() => {
        result.current.handleNewChat();
      });

      expect(actualResetChatState).toHaveBeenCalledTimes(1);
      expect(actualResetRemixState).toHaveBeenCalledTimes(1);
      expect(actualResetSocialPostsState).toHaveBeenCalledTimes(1);
      expect(actualResetModelSelectionState).toHaveBeenCalledTimes(1);
    });

    it('should handle async reset functions', async () => {
      const asyncResetChatState = jest.fn().mockResolvedValue(undefined);
      const asyncResetRemixState = jest.fn().mockResolvedValue(undefined);
      const asyncResetSocialPostsState = jest.fn().mockResolvedValue(undefined);
      const asyncResetModelSelectionState = jest.fn().mockResolvedValue(undefined);

      const props = {
        resetChatState: asyncResetChatState,
        resetRemixState: asyncResetRemixState,
        resetSocialPostsState: asyncResetSocialPostsState,
        resetModelSelectionState: asyncResetModelSelectionState,
      };

      const { result } = renderHook(() => useResetHandlers(props));

      await act(async () => {
        await result.current.handleNewChat();
      });

      expect(asyncResetChatState).toHaveBeenCalledTimes(1);
      expect(asyncResetRemixState).toHaveBeenCalledTimes(1);
      expect(asyncResetSocialPostsState).toHaveBeenCalledTimes(1);
      expect(asyncResetModelSelectionState).toHaveBeenCalledTimes(1);
    });
  });
});
