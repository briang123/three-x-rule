import { renderHook, act } from '@testing-library/react';
import { useScroll, useRemixScroll } from './useScroll';

// Mock scrollTo
const mockScrollTo = jest.fn();

// Mock window.scrollTo
Object.defineProperty(window, 'scrollTo', {
  value: mockScrollTo,
  writable: true,
});

// Mock HTMLElement
const createMockElement = () => ({
  offsetTop: 500,
  scrollTo: mockScrollTo,
  scrollHeight: 1000,
});

describe('useScroll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('scrollToElement', () => {
    it('should call scrollTo with correct position and offset', () => {
      const { result } = renderHook(() => useScroll());
      const mockElement = createMockElement() as any;

      act(() => {
        result.current.scrollToElement(mockElement);
      });

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 480, // 500 - 20 (default offset)
        behavior: 'smooth',
      });
    });

    it('should not call scrollTo if element is null', () => {
      const { result } = renderHook(() => useScroll());

      act(() => {
        result.current.scrollToElement(null);
      });

      expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it('should use custom offset when provided', () => {
      const { result } = renderHook(() => useScroll(undefined, { offset: 50 }));
      const mockElement = createMockElement() as any;

      act(() => {
        result.current.scrollToElement(mockElement);
      });

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 450, // 500 - 50 (custom offset)
        behavior: 'smooth',
      });
    });
  });

  describe('scrollToLatest', () => {
    it('should scroll to the latest element', () => {
      const { result } = renderHook(() => useScroll());
      const elements = {
        0: createMockElement() as any,
        1: createMockElement() as any,
        2: createMockElement() as any,
      };

      act(() => {
        result.current.scrollToLatest(elements);
      });

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 480,
        behavior: 'smooth',
      });
    });
  });

  describe('scrollToIndex', () => {
    it('should scroll to the specified index', () => {
      const { result } = renderHook(() => useScroll());
      const elements = {
        0: createMockElement() as any,
        1: createMockElement() as any,
        2: createMockElement() as any,
      };

      act(() => {
        result.current.scrollToIndex(elements, 1);
      });

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 480,
        behavior: 'smooth',
      });
    });
  });
});

describe('useRemixScroll', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return remixResponseRefs and scrollToLatestRemix', () => {
    const { result } = renderHook(() => useRemixScroll(3, false, undefined));

    expect(result.current.remixResponseRefs).toBeDefined();
    expect(result.current.scrollToLatestRemix).toBeDefined();
  });

  it('should scroll to latest remix when called', () => {
    const { result } = renderHook(() => useRemixScroll(3, false, undefined));
    const mockElement = createMockElement() as any;

    // Mock the refs
    result.current.remixResponseRefs.current = {
      0: mockElement,
      1: mockElement,
      2: mockElement,
    };

    act(() => {
      result.current.scrollToLatestRemix();
    });

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: 460, // 500 - 40 (custom offset from useRemixScroll)
      behavior: 'smooth',
    });
  });
});
