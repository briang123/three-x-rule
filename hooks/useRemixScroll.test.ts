import { renderHook, act } from '@testing-library/react';
import { useRemixScroll } from './useRemixScroll';

// Mock the useScroll hook
jest.mock('./useScroll', () => ({
  useScroll: jest.fn(),
}));

const mockUseScroll = require('./useScroll').useScroll;

// Mock timers
jest.useFakeTimers();

describe('useRemixScroll', () => {
  const mockScrollToIndex = jest.fn();
  const mockScrollToLatest = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseScroll.mockReturnValue({
      scrollToLatest: mockScrollToLatest,
      scrollToIndex: mockScrollToIndex,
    });
  });

  it('should initialize with empty refs and scroll functions', () => {
    const { result } = renderHook(() => useRemixScroll(0, false));

    expect(result.current.remixResponseRefs.current).toEqual({});
    expect(typeof result.current.scrollToLatestRemix).toBe('function');
  });

  it('should call useScroll with provided parameters', () => {
    const mockScrollContainer = { current: document.createElement('div') };
    const mockOptions = { behavior: 'smooth' as ScrollBehavior };

    renderHook(() => useRemixScroll(0, false, mockScrollContainer, mockOptions));

    expect(mockUseScroll).toHaveBeenCalledWith(mockScrollContainer, mockOptions);
  });

  it('should scroll to latest remix response when called', () => {
    const { result } = renderHook(() => useRemixScroll(3, false));

    // Set up some refs
    result.current.remixResponseRefs.current = {
      0: document.createElement('div'),
      1: document.createElement('div'),
      2: document.createElement('div'),
    };

    act(() => {
      result.current.scrollToLatestRemix();
    });

    expect(mockScrollToIndex).toHaveBeenCalledWith(
      result.current.remixResponseRefs.current,
      2, // latest index (3 - 1)
    );
  });

  it('should not scroll when no remix responses exist', () => {
    const { result } = renderHook(() => useRemixScroll(0, false));

    act(() => {
      result.current.scrollToLatestRemix();
    });

    expect(mockScrollToIndex).not.toHaveBeenCalled();
  });

  it('should not scroll when remix responses length is negative', () => {
    const { result } = renderHook(() => useRemixScroll(-1, false));

    act(() => {
      result.current.scrollToLatestRemix();
    });

    expect(mockScrollToIndex).not.toHaveBeenCalled();
  });

  it('should auto-scroll when new remix response is added and generating', () => {
    const { result } = renderHook(() => useRemixScroll(1, true));

    // Set up a ref
    result.current.remixResponseRefs.current = {
      0: document.createElement('div'),
    };

    // The effect should trigger auto-scroll
    act(() => {
      // Simulate the effect running
      jest.advanceTimersByTime(100);
    });

    expect(mockScrollToIndex).toHaveBeenCalledWith(result.current.remixResponseRefs.current, 0);
  });

  it('should not auto-scroll when not generating', () => {
    renderHook(() => useRemixScroll(1, false));

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockScrollToIndex).not.toHaveBeenCalled();
  });

  it('should not auto-scroll when no remix responses exist', () => {
    renderHook(() => useRemixScroll(0, true));

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockScrollToIndex).not.toHaveBeenCalled();
  });

  it('should handle multiple remix responses correctly', () => {
    const { result } = renderHook(() => useRemixScroll(5, true));

    // Set up refs
    result.current.remixResponseRefs.current = {
      0: document.createElement('div'),
      1: document.createElement('div'),
      2: document.createElement('div'),
      3: document.createElement('div'),
      4: document.createElement('div'),
    };

    act(() => {
      result.current.scrollToLatestRemix();
    });

    expect(mockScrollToIndex).toHaveBeenCalledWith(
      result.current.remixResponseRefs.current,
      4, // latest index (5 - 1)
    );
  });

  it('should update scroll target when remix responses length changes', () => {
    const { result, rerender } = renderHook(
      ({ length, isGenerating }) => useRemixScroll(length, isGenerating),
      { initialProps: { length: 1, isGenerating: true } },
    );

    // Set up refs
    result.current.remixResponseRefs.current = {
      0: document.createElement('div'),
    };

    // Initial auto-scroll
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockScrollToIndex).toHaveBeenCalledWith(result.current.remixResponseRefs.current, 0);

    // Clear mock calls
    mockScrollToIndex.mockClear();

    // Increase length
    rerender({ length: 3, isGenerating: true });

    // Set up new refs
    result.current.remixResponseRefs.current = {
      0: document.createElement('div'),
      1: document.createElement('div'),
      2: document.createElement('div'),
    };

    // New auto-scroll should target latest
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockScrollToIndex).toHaveBeenCalledWith(
      result.current.remixResponseRefs.current,
      2, // latest index (3 - 1)
    );
  });

  it('should handle refs with missing indices', () => {
    const { result } = renderHook(() => useRemixScroll(3, false));

    // Set up refs with missing index 1
    result.current.remixResponseRefs.current = {
      0: document.createElement('div'),
      2: document.createElement('div'),
    };

    act(() => {
      result.current.scrollToLatestRemix();
    });

    // Should still call scrollToIndex with the refs object and latest index
    expect(mockScrollToIndex).toHaveBeenCalledWith(result.current.remixResponseRefs.current, 2);
  });

  it('should use default options when not provided', () => {
    renderHook(() => useRemixScroll(0, false));

    expect(mockUseScroll).toHaveBeenCalledWith(undefined, {});
  });

  it('should handle scroll container changes', () => {
    const mockContainer1 = { current: document.createElement('div') };
    const mockContainer2 = { current: document.createElement('div') };

    const { rerender } = renderHook(
      ({ scrollContainer }) => useRemixScroll(0, false, scrollContainer),
      { initialProps: { scrollContainer: mockContainer1 } },
    );

    expect(mockUseScroll).toHaveBeenCalledWith(mockContainer1, {});

    // Change container
    rerender({ scrollContainer: mockContainer2 });

    expect(mockUseScroll).toHaveBeenCalledWith(mockContainer2, {});
  });

  it('should handle options changes', () => {
    const options1 = { behavior: 'smooth' as ScrollBehavior };
    const options2 = { behavior: 'auto' as ScrollBehavior };

    const { rerender } = renderHook(({ options }) => useRemixScroll(0, false, undefined, options), {
      initialProps: { options: options1 },
    });

    expect(mockUseScroll).toHaveBeenCalledWith(undefined, options1);

    // Change options
    rerender({ options: options2 });

    expect(mockUseScroll).toHaveBeenCalledWith(undefined, options2);
  });

  it('should maintain refs across re-renders', () => {
    const { result, rerender } = renderHook(({ length }) => useRemixScroll(length, false), {
      initialProps: { length: 1 },
    });

    // Set up refs
    const mockElement = document.createElement('div');
    result.current.remixResponseRefs.current[0] = mockElement;

    // Re-render
    rerender({ length: 2 });

    // Refs should persist
    expect(result.current.remixResponseRefs.current[0]).toBe(mockElement);
  });

  it('should handle edge case with single remix response', () => {
    const { result } = renderHook(() => useRemixScroll(1, true));

    // Set up single ref
    result.current.remixResponseRefs.current = {
      0: document.createElement('div'),
    };

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockScrollToIndex).toHaveBeenCalledWith(result.current.remixResponseRefs.current, 0);
  });
});
