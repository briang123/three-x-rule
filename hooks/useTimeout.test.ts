import { renderHook, act } from '@testing-library/react';
import useTimeout from './useTimeout';

describe('useTimeout', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should create a timeout when delay is a number', () => {
    const callback = jest.fn();
    const delay = 1000;

    renderHook(() => useTimeout(callback, delay));

    expect(callback).not.toHaveBeenCalled();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should not create a timeout when delay is null', () => {
    const callback = jest.fn();
    const delay = null;

    renderHook(() => useTimeout(callback, delay));

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should not create a timeout when delay is null', () => {
    const callback = jest.fn();
    const delay = null;

    renderHook(() => useTimeout(callback, delay));

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should clear timeout on unmount', () => {
    const callback = jest.fn();
    const delay = 1000;

    const { unmount } = renderHook(() => useTimeout(callback, delay));

    unmount();

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('should clear previous timeout when delay changes', () => {
    const callback = jest.fn();
    let delay = 1000;

    const { rerender } = renderHook(() => useTimeout(callback, delay));

    // Advance time but not enough to trigger the timeout
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback).not.toHaveBeenCalled();

    // Change delay
    delay = 2000;
    rerender();

    // Advance time to where the original timeout would have fired
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(callback).not.toHaveBeenCalled();

    // Advance time to trigger the new timeout
    act(() => {
      jest.advanceTimersByTime(1500);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should update callback when callback changes', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const delay = 1000;

    const { rerender } = renderHook(({ callback, delay }) => useTimeout(callback, delay), {
      initialProps: { callback: callback1, delay },
    });

    // Change callback
    rerender({ callback: callback2, delay });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('should handle zero delay', () => {
    const callback = jest.fn();
    const delay = 0;

    renderHook(() => useTimeout(callback, delay));

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should handle negative delay', () => {
    const callback = jest.fn();
    const delay = -1000;

    renderHook(() => useTimeout(callback, delay));

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('should return a ref to the timeout', () => {
    const callback = jest.fn();
    const delay = 1000;

    const { result } = renderHook(() => useTimeout(callback, delay));

    expect(result.current).toBeDefined();
    expect(result.current.current).toBeDefined();
  });

  it('should handle multiple timeouts correctly', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const delay = 1000;

    const { result: result1 } = renderHook(() => useTimeout(callback1, delay));
    const { result: result2 } = renderHook(() => useTimeout(callback2, delay));

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(callback1).toHaveBeenCalledTimes(1);
    expect(callback2).toHaveBeenCalledTimes(1);
    // The refs should still contain the timeout IDs (they're not cleared after execution)
    expect(result1.current.current).toBeDefined();
    expect(result2.current.current).toBeDefined();
  });
});
