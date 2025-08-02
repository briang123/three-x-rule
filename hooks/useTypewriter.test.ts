import { renderHook, act } from '@testing-library/react';
import { useTypewriter } from './useTypewriter';

describe('useTypewriter', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should show text immediately when isNewContent is false', () => {
    const { result } = renderHook(() =>
      useTypewriter({
        text: 'Hello World',
        isNewContent: false,
      }),
    );

    expect(result.current.displayed).toBe('Hello World');
    expect(result.current.done).toBe(true);
  });

  it('should handle empty text', () => {
    const { result } = renderHook(() => useTypewriter({ text: '' }));

    expect(result.current.displayed).toBe('');
    expect(result.current.done).toBe(true);
  });

  it('should clean up timeouts on unmount', () => {
    const { unmount } = renderHook(() => useTypewriter({ text: 'Hello World' }));

    // Start animation
    act(() => {
      jest.advanceTimersByTime(100);
    });

    // Unmount before completion
    unmount();

    // No errors should occur
    expect(() => {
      jest.runOnlyPendingTimers();
    }).not.toThrow();
  });

  it('should show text immediately for same content on re-render', () => {
    const { result, rerender } = renderHook(({ text }) => useTypewriter({ text }), {
      initialProps: { text: 'Hello World' },
    });

    // Let animation complete
    act(() => {
      jest.advanceTimersByTime(1200); // 11 characters * 100ms + some buffer
    });

    expect(result.current.displayed).toBe('Hello World');
    expect(result.current.done).toBe(true);

    // Re-render with same text
    rerender({ text: 'Hello World' });

    expect(result.current.displayed).toBe('Hello World');
    expect(result.current.done).toBe(true);
  });

  it('should restart animation when text changes', () => {
    const { result, rerender } = renderHook(({ text }) => useTypewriter({ text }), {
      initialProps: { text: 'Hello' },
    });

    // Let first animation complete
    act(() => {
      jest.advanceTimersByTime(600); // 5 characters * 100ms + buffer
    });

    expect(result.current.displayed).toBe('Hello');
    expect(result.current.done).toBe(true);

    // Change text
    rerender({ text: 'World' });

    // The animation starts immediately, so the first character appears right away
    expect(result.current.displayed).toBe('W');
    expect(result.current.done).toBe(false);

    // Let new animation complete
    act(() => {
      jest.advanceTimersByTime(600); // 5 characters * 100ms + buffer
    });

    expect(result.current.displayed).toBe('World');
    expect(result.current.done).toBe(true);
  });

  it('should handle speed changes', () => {
    const { result, rerender } = renderHook(({ speed }) => useTypewriter({ text: 'Hi', speed }), {
      initialProps: { speed: 100 },
    });

    // Change speed
    rerender({ speed: 50 });

    // Advance time for faster speed
    act(() => {
      jest.advanceTimersByTime(100); // Should show both characters with 50ms speed
    });

    expect(result.current.displayed).toBe('Hi');
    expect(result.current.done).toBe(true);
  });

  it('should handle pauseAfterPunctuation changes', () => {
    const { result, rerender } = renderHook(
      ({ pauseAfterPunctuation }) =>
        useTypewriter({
          text: 'Hi!',
          speed: 100,
          pauseAfterPunctuation,
        }),
      { initialProps: { pauseAfterPunctuation: 200 } },
    );

    // Change pause duration
    rerender({ pauseAfterPunctuation: 100 });

    // Advance time for shorter pause
    act(() => {
      jest.advanceTimersByTime(400); // 2 chars * 100ms + 100ms pause + buffer
    });

    expect(result.current.displayed).toBe('Hi!');
    expect(result.current.done).toBe(true);
  });

  it('should handle multiple punctuation marks', () => {
    const { result } = renderHook(() =>
      useTypewriter({
        text: 'Hello, world!',
        speed: 50,
        pauseAfterPunctuation: 100,
      }),
    );

    // Let animation complete
    act(() => {
      jest.advanceTimersByTime(2000); // Enough time for all characters and pauses
    });

    expect(result.current.displayed).toBe('Hello, world!');
    expect(result.current.done).toBe(true);
  });

  it('should handle text with only punctuation', () => {
    const { result } = renderHook(() =>
      useTypewriter({
        text: '!!!',
        speed: 100,
        pauseAfterPunctuation: 200,
      }),
    );

    // Let animation complete
    act(() => {
      jest.advanceTimersByTime(900); // 3 * (100ms + 200ms pause)
    });

    expect(result.current.displayed).toBe('!!!');
    expect(result.current.done).toBe(true);
  });
});
