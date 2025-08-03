import { renderHook, act } from '@testing-library/react';
import { useToggleHandlers } from './useToggleHandlers';

describe('useToggleHandlers', () => {
  const mockSetShowAISelection = jest.fn();
  const mockSetMessageModels = jest.fn();
  const mockSetMessageResponses = jest.fn();
  const mockSetOriginalResponses = jest.fn();
  const mockSetIsGenerating = jest.fn();

  const defaultProps = {
    setShowAISelection: mockSetShowAISelection,
    setMessageModels: mockSetMessageModels,
    setMessageResponses: mockSetMessageResponses,
    setOriginalResponses: mockSetOriginalResponses,
    setIsGenerating: mockSetIsGenerating,
    modelSelections: [{ modelId: 'gpt-4', count: 1 }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleToggleAISelection', () => {
    it('should toggle AI selection from false to true', () => {
      mockSetShowAISelection.mockImplementation((callback) => {
        const result = callback(false);
        return result;
      });

      const { result } = renderHook(() => useToggleHandlers(defaultProps));

      act(() => {
        result.current.handleToggleAISelection();
      });

      expect(mockSetShowAISelection).toHaveBeenCalledWith(expect.any(Function));
      const callback = mockSetShowAISelection.mock.calls[0][0];
      expect(callback(false)).toBe(true);
    });

    it('should toggle AI selection from true to false', () => {
      mockSetShowAISelection.mockImplementation((callback) => {
        const result = callback(true);
        return result;
      });

      const { result } = renderHook(() => useToggleHandlers(defaultProps));

      act(() => {
        result.current.handleToggleAISelection();
      });

      expect(mockSetShowAISelection).toHaveBeenCalledWith(expect.any(Function));
      const callback = mockSetShowAISelection.mock.calls[0][0];
      expect(callback(true)).toBe(false);
    });

    it('should clear state when toggling from true to false with no model selections', () => {
      const propsWithNoModels = {
        ...defaultProps,
        modelSelections: [],
      };

      mockSetShowAISelection.mockImplementation((callback) => {
        const result = callback(true);
        return result;
      });

      const { result } = renderHook(() => useToggleHandlers(propsWithNoModels));

      act(() => {
        result.current.handleToggleAISelection();
      });

      expect(mockSetMessageModels).toHaveBeenCalledWith({});
      expect(mockSetMessageResponses).toHaveBeenCalledWith({});
      expect(mockSetOriginalResponses).toHaveBeenCalledWith({});
      expect(mockSetIsGenerating).toHaveBeenCalledWith({});
    });

    it('should not clear state when toggling from false to true', () => {
      mockSetShowAISelection.mockImplementation((callback) => {
        const result = callback(false);
        return result;
      });

      const { result } = renderHook(() => useToggleHandlers(defaultProps));

      act(() => {
        result.current.handleToggleAISelection();
      });

      expect(mockSetMessageModels).not.toHaveBeenCalled();
      expect(mockSetMessageResponses).not.toHaveBeenCalled();
      expect(mockSetOriginalResponses).not.toHaveBeenCalled();
      expect(mockSetIsGenerating).not.toHaveBeenCalled();
    });

    it('should not clear state when toggling from true to false with model selections', () => {
      mockSetShowAISelection.mockImplementation((callback) => {
        const result = callback(true);
        return result;
      });

      const { result } = renderHook(() => useToggleHandlers(defaultProps));

      act(() => {
        result.current.handleToggleAISelection();
      });

      expect(mockSetMessageModels).not.toHaveBeenCalled();
      expect(mockSetMessageResponses).not.toHaveBeenCalled();
      expect(mockSetOriginalResponses).not.toHaveBeenCalled();
      expect(mockSetIsGenerating).not.toHaveBeenCalled();
    });
  });

  describe('dependencies', () => {
    it('should maintain stable reference when modelSelections do not change', () => {
      const { result, rerender } = renderHook(({ props }) => useToggleHandlers(props), {
        initialProps: { props: defaultProps },
      });

      const firstReference = result.current.handleToggleAISelection;

      rerender({ props: defaultProps });

      const secondReference = result.current.handleToggleAISelection;

      expect(firstReference).toBe(secondReference);
    });

    it('should update function when setter functions change', () => {
      const { result, rerender } = renderHook(({ props }) => useToggleHandlers(props), {
        initialProps: { props: defaultProps },
      });

      const firstReference = result.current.handleToggleAISelection;

      const newSetShowAISelection = jest.fn();
      const newProps = {
        ...defaultProps,
        setShowAISelection: newSetShowAISelection,
      };

      rerender({ props: newProps });

      const secondReference = result.current.handleToggleAISelection;

      expect(firstReference).not.toBe(secondReference);
    });
  });

  describe('edge cases', () => {
    it('should handle empty model selections array', () => {
      const propsWithEmptyModels = {
        ...defaultProps,
        modelSelections: [],
      };

      mockSetShowAISelection.mockImplementation((callback) => {
        const result = callback(true);
        return result;
      });

      const { result } = renderHook(() => useToggleHandlers(propsWithEmptyModels));

      act(() => {
        result.current.handleToggleAISelection();
      });

      expect(mockSetMessageModels).toHaveBeenCalledWith({});
      expect(mockSetMessageResponses).toHaveBeenCalledWith({});
      expect(mockSetOriginalResponses).toHaveBeenCalledWith({});
      expect(mockSetIsGenerating).toHaveBeenCalledWith({});
    });

    it('should handle undefined model selections', () => {
      const propsWithUndefinedModels = {
        ...defaultProps,
        modelSelections: undefined as any,
      };

      mockSetShowAISelection.mockImplementation((callback) => {
        const result = callback(true);
        return result;
      });

      const { result } = renderHook(() => useToggleHandlers(propsWithUndefinedModels));

      act(() => {
        result.current.handleToggleAISelection();
      });

      expect(mockSetMessageModels).toHaveBeenCalledWith({});
      expect(mockSetMessageResponses).toHaveBeenCalledWith({});
      expect(mockSetOriginalResponses).toHaveBeenCalledWith({});
      expect(mockSetIsGenerating).toHaveBeenCalledWith({});
    });

    it('should handle null model selections', () => {
      const propsWithNullModels = {
        ...defaultProps,
        modelSelections: null as any,
      };

      mockSetShowAISelection.mockImplementation((callback) => {
        const result = callback(true);
        return result;
      });

      const { result } = renderHook(() => useToggleHandlers(propsWithNullModels));

      act(() => {
        result.current.handleToggleAISelection();
      });

      expect(mockSetMessageModels).toHaveBeenCalledWith({});
      expect(mockSetMessageResponses).toHaveBeenCalledWith({});
      expect(mockSetOriginalResponses).toHaveBeenCalledWith({});
      expect(mockSetIsGenerating).toHaveBeenCalledWith({});
    });

    it('should handle setter functions that throw errors', () => {
      const throwingSetShowAISelection = jest.fn().mockImplementation(() => {
        throw new Error('Toggle failed');
      });

      const propsWithThrowing = {
        ...defaultProps,
        setShowAISelection: throwingSetShowAISelection,
      };

      const { result } = renderHook(() => useToggleHandlers(propsWithThrowing));

      expect(() => {
        act(() => {
          result.current.handleToggleAISelection();
        });
      }).toThrow('Toggle failed');
    });
  });

  describe('return value structure', () => {
    it('should return an object with handleToggleAISelection function', () => {
      const { result } = renderHook(() => useToggleHandlers(defaultProps));

      expect(result.current).toHaveProperty('handleToggleAISelection');
      expect(typeof result.current.handleToggleAISelection).toBe('function');
    });

    it('should not return any other properties', () => {
      const { result } = renderHook(() => useToggleHandlers(defaultProps));

      const keys = Object.keys(result.current);
      expect(keys).toEqual(['handleToggleAISelection']);
    });
  });

  describe('function behavior', () => {
    it('should not return any value from handleToggleAISelection', () => {
      mockSetShowAISelection.mockImplementation((callback) => {
        const result = callback(false);
        return result;
      });

      const { result } = renderHook(() => useToggleHandlers(defaultProps));

      let returnValue: any;
      act(() => {
        returnValue = result.current.handleToggleAISelection();
      });

      expect(returnValue).toBeUndefined();
    });

    it('should call setShowAISelection with a function that returns the opposite value', () => {
      mockSetShowAISelection.mockImplementation((callback) => {
        const result = callback(false);
        return result;
      });

      const { result } = renderHook(() => useToggleHandlers(defaultProps));

      act(() => {
        result.current.handleToggleAISelection();
      });

      expect(mockSetShowAISelection).toHaveBeenCalledWith(expect.any(Function));
      const callback = mockSetShowAISelection.mock.calls[0][0];

      // Test the callback function
      expect(callback(false)).toBe(true);
      expect(callback(true)).toBe(false);
    });
  });

  describe('integration scenarios', () => {
    it('should work with actual setter function implementations', () => {
      let currentValue = false;
      const actualSetShowAISelection = jest.fn().mockImplementation((callback) => {
        currentValue = callback(currentValue);
        return currentValue;
      });

      const props = {
        ...defaultProps,
        setShowAISelection: actualSetShowAISelection,
      };

      const { result } = renderHook(() => useToggleHandlers(props));

      act(() => {
        result.current.handleToggleAISelection();
      });

      expect(actualSetShowAISelection).toHaveBeenCalledTimes(1);
      expect(currentValue).toBe(true);
    });

    it('should handle multiple toggles correctly', () => {
      let currentValue = false;
      const actualSetShowAISelection = jest.fn().mockImplementation((callback) => {
        currentValue = callback(currentValue);
        return currentValue;
      });

      const props = {
        ...defaultProps,
        setShowAISelection: actualSetShowAISelection,
      };

      const { result } = renderHook(() => useToggleHandlers(props));

      act(() => {
        result.current.handleToggleAISelection(); // false -> true
        result.current.handleToggleAISelection(); // true -> false
        result.current.handleToggleAISelection(); // false -> true
      });

      expect(actualSetShowAISelection).toHaveBeenCalledTimes(3);
      expect(currentValue).toBe(true);
    });

    it('should handle state clearing when toggling off with no models', () => {
      let currentValue = true;
      const actualSetShowAISelection = jest.fn().mockImplementation((callback) => {
        currentValue = callback(currentValue);
        return currentValue;
      });

      const propsWithNoModels = {
        ...defaultProps,
        modelSelections: [],
        setShowAISelection: actualSetShowAISelection,
      };

      const { result } = renderHook(() => useToggleHandlers(propsWithNoModels));

      act(() => {
        result.current.handleToggleAISelection(); // true -> false
      });

      expect(actualSetShowAISelection).toHaveBeenCalledTimes(1);
      expect(currentValue).toBe(false);
      expect(mockSetMessageModels).toHaveBeenCalledWith({});
      expect(mockSetMessageResponses).toHaveBeenCalledWith({});
      expect(mockSetOriginalResponses).toHaveBeenCalledWith({});
      expect(mockSetIsGenerating).toHaveBeenCalledWith({});
    });
  });
});
