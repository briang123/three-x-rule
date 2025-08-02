import { renderHook, act } from '@testing-library/react';

// Mock the useTimeout hook
jest.mock('./useTimeout', () => {
  return jest.fn();
});

// Mock clearTimeout
const mockClearTimeout = jest.fn();
global.clearTimeout = mockClearTimeout;

const mockUseTimeout = require('./useTimeout') as jest.MockedFunction<
  typeof import('./useTimeout').default
>;

import { useScrollPerformance } from './useScrollPerformance';

describe('useScrollPerformance', () => {
  let mockScrollContainer: HTMLDivElement;
  let mockChatInputContainer: HTMLDivElement;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Create mock elements
    mockScrollContainer = document.createElement('div');
    mockChatInputContainer = document.createElement('div');
    mockChatInputContainer.className = 'chat-input-container';

    // Mock document.querySelector
    document.querySelector = jest.fn().mockReturnValue(mockChatInputContainer);

    // Mock useTimeout
    mockUseTimeout.mockReturnValue({
      current: null,
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should initialize without errors', () => {
    const scrollContainerRef = { current: mockScrollContainer };

    expect(() => {
      renderHook(() => useScrollPerformance(scrollContainerRef));
    }).not.toThrow();
  });

  it('should add scroll event listener to container', () => {
    const scrollContainerRef = { current: mockScrollContainer };
    const addEventListenerSpy = jest.spyOn(mockScrollContainer, 'addEventListener');

    renderHook(() => useScrollPerformance(scrollContainerRef));

    expect(addEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function), {
      passive: true,
    });
  });

  it('should add scrolling class when scroll event fires', () => {
    const scrollContainerRef = { current: mockScrollContainer };
    const mockTimeoutRef = { current: null };
    mockUseTimeout.mockReturnValue(mockTimeoutRef);

    renderHook(() => useScrollPerformance(scrollContainerRef));

    // Simulate scroll event
    act(() => {
      const scrollEvent = new Event('scroll');
      mockScrollContainer.dispatchEvent(scrollEvent);
    });

    expect(mockChatInputContainer.classList.contains('scrolling')).toBe(true);
  });

  it('should set timeout to remove scrolling class', () => {
    const scrollContainerRef = { current: mockScrollContainer };
    const mockTimeoutRef = { current: null };
    mockUseTimeout.mockReturnValue(mockTimeoutRef);

    renderHook(() => useScrollPerformance(scrollContainerRef));

    // Simulate scroll event
    act(() => {
      const scrollEvent = new Event('scroll');
      mockScrollContainer.dispatchEvent(scrollEvent);
    });

    expect(mockTimeoutRef.current).toBeDefined();
  });

  it('should remove scrolling class after delay', () => {
    const scrollContainerRef = { current: mockScrollContainer };
    const mockTimeoutRef = { current: null };
    mockUseTimeout.mockReturnValue(mockTimeoutRef);

    renderHook(() => useScrollPerformance(scrollContainerRef, 500));

    // Simulate scroll event
    act(() => {
      const scrollEvent = new Event('scroll');
      mockScrollContainer.dispatchEvent(scrollEvent);
    });

    expect(mockChatInputContainer.classList.contains('scrolling')).toBe(true);

    // Advance time to trigger timeout
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockChatInputContainer.classList.contains('scrolling')).toBe(false);
  });

  it('should use default delay when not provided', () => {
    const scrollContainerRef = { current: mockScrollContainer };
    const mockTimeoutRef = { current: null };
    mockUseTimeout.mockReturnValue(mockTimeoutRef);

    renderHook(() => useScrollPerformance(scrollContainerRef));

    // Simulate scroll event
    act(() => {
      const scrollEvent = new Event('scroll');
      mockScrollContainer.dispatchEvent(scrollEvent);
    });

    // Advance time but not enough for default delay (150ms)
    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockChatInputContainer.classList.contains('scrolling')).toBe(true);

    // Advance time to trigger default delay
    act(() => {
      jest.advanceTimersByTime(50);
    });

    expect(mockChatInputContainer.classList.contains('scrolling')).toBe(false);
  });

  it('should handle multiple scroll events correctly', () => {
    const scrollContainerRef = { current: mockScrollContainer };
    const mockTimeoutRef = { current: null };
    mockUseTimeout.mockReturnValue(mockTimeoutRef);

    renderHook(() => useScrollPerformance(scrollContainerRef, 500));

    // First scroll event
    act(() => {
      const scrollEvent1 = new Event('scroll');
      mockScrollContainer.dispatchEvent(scrollEvent1);
    });

    expect(mockChatInputContainer.classList.contains('scrolling')).toBe(true);

    // Second scroll event before timeout
    act(() => {
      jest.advanceTimersByTime(200);
      const scrollEvent2 = new Event('scroll');
      mockScrollContainer.dispatchEvent(scrollEvent2);
    });

    expect(mockChatInputContainer.classList.contains('scrolling')).toBe(true);

    // Advance time to trigger timeout
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockChatInputContainer.classList.contains('scrolling')).toBe(false);
  });

  it('should handle container not found', () => {
    const scrollContainerRef = { current: mockScrollContainer };
    document.querySelector = jest.fn().mockReturnValue(null);

    expect(() => {
      renderHook(() => useScrollPerformance(scrollContainerRef));
    }).not.toThrow();

    // Simulate scroll event
    act(() => {
      const scrollEvent = new Event('scroll');
      mockScrollContainer.dispatchEvent(scrollEvent);
    });

    // Should not throw error when container is not found
    expect(() => {
      jest.advanceTimersByTime(150);
    }).not.toThrow();
  });

  it('should clean up event listener on unmount', () => {
    const scrollContainerRef = { current: mockScrollContainer };
    const removeEventListenerSpy = jest.spyOn(mockScrollContainer, 'removeEventListener');

    const { unmount } = renderHook(() => useScrollPerformance(scrollContainerRef));

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
  });

  it('should clean up timeout on unmount', () => {
    const scrollContainerRef = { current: mockScrollContainer };
    const mockTimeoutRef = { current: 12345 as any }; // Use a simple number instead of setTimeout
    mockUseTimeout.mockReturnValue(mockTimeoutRef);

    const { unmount } = renderHook(() => useScrollPerformance(scrollContainerRef));

    unmount();

    expect(mockClearTimeout).toHaveBeenCalledWith(mockTimeoutRef.current);
  });

  it('should handle scroll container ref changes', () => {
    const scrollContainerRef1 = { current: mockScrollContainer };
    const scrollContainerRef2 = { current: document.createElement('div') };

    const { rerender } = renderHook(
      ({ scrollContainerRef }) => useScrollPerformance(scrollContainerRef),
      { initialProps: { scrollContainerRef: scrollContainerRef1 } },
    );

    // Clear the initial calls
    jest.clearAllMocks();

    const addEventListenerSpy2 = jest.spyOn(scrollContainerRef2.current, 'addEventListener');

    // Change container
    rerender({ scrollContainerRef: scrollContainerRef2 });

    expect(addEventListenerSpy2).toHaveBeenCalled();
  });

  it('should handle delay changes', () => {
    const scrollContainerRef = { current: mockScrollContainer };
    const mockTimeoutRef = { current: null };
    mockUseTimeout.mockReturnValue(mockTimeoutRef);

    const { rerender } = renderHook(
      ({ delay }) => useScrollPerformance(scrollContainerRef, delay),
      { initialProps: { delay: 500 } },
    );

    // Simulate scroll event with first delay
    act(() => {
      const scrollEvent = new Event('scroll');
      mockScrollContainer.dispatchEvent(scrollEvent);
    });

    expect(mockChatInputContainer.classList.contains('scrolling')).toBe(true);

    // Change delay
    rerender({ delay: 1000 });

    // Simulate scroll event with new delay
    act(() => {
      const scrollEvent = new Event('scroll');
      mockScrollContainer.dispatchEvent(scrollEvent);
    });

    // Advance time but not enough for new delay
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockChatInputContainer.classList.contains('scrolling')).toBe(true);

    // Advance time to trigger new delay
    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(mockChatInputContainer.classList.contains('scrolling')).toBe(false);
  });

  it('should handle null scroll container ref', () => {
    const scrollContainerRef = { current: null };

    expect(() => {
      renderHook(() => useScrollPerformance(scrollContainerRef));
    }).not.toThrow();
  });

  it('should handle undefined scroll container ref', () => {
    const scrollContainerRef = { current: undefined as any };

    expect(() => {
      renderHook(() => useScrollPerformance(scrollContainerRef));
    }).not.toThrow();
  });

  it('should return timeout ref', () => {
    const scrollContainerRef = { current: mockScrollContainer };
    const mockTimeoutRef = { current: null };
    mockUseTimeout.mockReturnValue(mockTimeoutRef);

    const { result } = renderHook(() => useScrollPerformance(scrollContainerRef));

    expect(result.current).toBe(mockTimeoutRef);
  });
});
