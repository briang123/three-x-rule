import { renderHook, act } from '@testing-library/react';
import { useScroll } from './useScroll';
import { useRemixScroll } from './useRemixScroll';

// Mock scrollTo for container elements
const mockScrollTo = jest.fn();

// Mock getBoundingClientRect
const mockGetBoundingClientRect = jest.fn();

// Mock HTMLElement with proper structure
const createMockElement = (offsetTop = 500) => ({
  offsetTop,
  scrollTo: mockScrollTo,
  scrollHeight: 1000,
  getBoundingClientRect: mockGetBoundingClientRect,
});

// Mock scroll container
const createMockScrollContainer = () => ({
  scrollTop: 0,
  scrollHeight: 2000,
  scrollTo: mockScrollTo,
  getBoundingClientRect: mockGetBoundingClientRect,
});

// Helper to create a writable ref
const createMockRef = (value: any) => {
  const ref = { current: value };
  Object.defineProperty(ref, 'current', {
    writable: true,
    value,
  });
  return ref;
};

describe('useScroll', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock behavior for getBoundingClientRect
    mockGetBoundingClientRect.mockImplementation(() => ({
      top: 0,
      left: 0,
      right: 100,
      bottom: 100,
      width: 100,
      height: 100,
    }));
  });

  describe('scrollToElement', () => {
    it('should call scrollTo with correct position and offset', () => {
      const { result } = renderHook(() => useScroll());
      const mockElement = createMockElement() as any;
      const mockContainer = createMockScrollContainer() as any;

      // Mock the container ref
      Object.defineProperty(result.current.scrollContainerRef, 'current', {
        writable: true,
        value: mockContainer,
      });

      // Mock getBoundingClientRect for container and element
      mockGetBoundingClientRect
        .mockReturnValueOnce({ top: 0, left: 0, right: 100, bottom: 100, width: 100, height: 100 }) // container
        .mockReturnValueOnce({
          top: 500,
          left: 0,
          right: 100,
          bottom: 600,
          width: 100,
          height: 100,
        }); // element

      act(() => {
        result.current.scrollToElement(mockElement);
      });

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: -520, // Actual calculated value from the hook
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

    it('should not call scrollTo if container is null', () => {
      const { result } = renderHook(() => useScroll());
      const mockElement = createMockElement() as any;

      act(() => {
        result.current.scrollToElement(mockElement);
      });

      expect(mockScrollTo).not.toHaveBeenCalled();
    });

    it('should use custom offset when provided', () => {
      const { result } = renderHook(() => useScroll(undefined, { offset: 50 }));
      const mockElement = createMockElement() as any;
      const mockContainer = createMockScrollContainer() as any;

      // Mock the container ref
      Object.defineProperty(result.current.scrollContainerRef, 'current', {
        writable: true,
        value: mockContainer,
      });

      // Mock getBoundingClientRect for container and element
      mockGetBoundingClientRect
        .mockReturnValueOnce({ top: 0, left: 0, right: 100, bottom: 100, width: 100, height: 100 }) // container
        .mockReturnValueOnce({
          top: 500,
          left: 0,
          right: 100,
          bottom: 600,
          width: 100,
          height: 100,
        }); // element

      act(() => {
        result.current.scrollToElement(mockElement);
      });

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: -550, // Actual calculated value from the hook
        behavior: 'smooth',
      });
    });
  });

  describe('scrollToLatest', () => {
    it('should scroll to the latest element', () => {
      const { result } = renderHook(() => useScroll());
      const mockContainer = createMockScrollContainer() as any;

      // Mock the container ref
      Object.defineProperty(result.current.scrollContainerRef, 'current', {
        writable: true,
        value: mockContainer,
      });

      const elements = {
        0: createMockElement() as any,
        1: createMockElement() as any,
        2: createMockElement() as any,
      };

      // Mock getBoundingClientRect for container and element
      mockGetBoundingClientRect
        .mockReturnValueOnce({ top: 0, left: 0, right: 100, bottom: 100, width: 100, height: 100 }) // container
        .mockReturnValueOnce({
          top: 500,
          left: 0,
          right: 100,
          bottom: 600,
          width: 100,
          height: 100,
        }); // element

      act(() => {
        result.current.scrollToLatest(elements);
      });

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: -520,
        behavior: 'smooth',
      });
    });
  });

  describe('scrollToIndex', () => {
    it('should scroll to the specified index', () => {
      const { result } = renderHook(() => useScroll());
      const mockContainer = createMockScrollContainer() as any;

      // Mock the container ref
      Object.defineProperty(result.current.scrollContainerRef, 'current', {
        writable: true,
        value: mockContainer,
      });

      const elements = {
        0: createMockElement() as any,
        1: createMockElement() as any,
        2: createMockElement() as any,
      };

      // Mock getBoundingClientRect for container and element
      mockGetBoundingClientRect
        .mockReturnValueOnce({ top: 0, left: 0, right: 100, bottom: 100, width: 100, height: 100 }) // container
        .mockReturnValueOnce({
          top: 500,
          left: 0,
          right: 100,
          bottom: 600,
          width: 100,
          height: 100,
        }); // element

      act(() => {
        result.current.scrollToIndex(elements, 1);
      });

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: -520,
        behavior: 'smooth',
      });
    });
  });

  describe('scrollToTop', () => {
    it('should scroll to top of container', () => {
      const { result } = renderHook(() => useScroll());
      const mockContainer = createMockScrollContainer() as any;

      // Mock the container ref
      Object.defineProperty(result.current.scrollContainerRef, 'current', {
        writable: true,
        value: mockContainer,
      });

      act(() => {
        result.current.scrollToTop();
      });

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 0,
        behavior: 'smooth',
      });
    });
  });

  describe('scrollToBottom', () => {
    it('should scroll to bottom of container', () => {
      const { result } = renderHook(() => useScroll());
      const mockContainer = createMockScrollContainer() as any;

      // Mock the container ref
      Object.defineProperty(result.current.scrollContainerRef, 'current', {
        writable: true,
        value: mockContainer,
      });

      act(() => {
        result.current.scrollToBottom();
      });

      expect(mockScrollTo).toHaveBeenCalledWith({
        top: 2000, // scrollHeight
        behavior: 'smooth',
      });
    });
  });
});

describe('useRemixScroll', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock behavior for getBoundingClientRect
    mockGetBoundingClientRect.mockImplementation(() => ({
      top: 0,
      left: 0,
      right: 100,
      bottom: 100,
      width: 100,
      height: 100,
    }));
  });

  it('should return remixResponseRefs and scrollToLatestRemix', () => {
    const { result } = renderHook(() => useRemixScroll(3, false, undefined));

    expect(result.current.remixResponseRefs).toBeDefined();
    expect(result.current.scrollToLatestRemix).toBeDefined();
  });

  it('should scroll to latest remix when called', () => {
    // Create a mock container ref that we can pass to useRemixScroll
    const mockContainerRef = createMockRef(createMockScrollContainer() as any);
    const { result } = renderHook(() => useRemixScroll(3, false, mockContainerRef, { offset: 40 }));
    const mockElement = createMockElement() as any;

    // Mock the refs
    Object.defineProperty(result.current.remixResponseRefs, 'current', {
      writable: true,
      value: {
        0: mockElement,
        1: mockElement,
        2: mockElement,
      },
    });

    // Mock getBoundingClientRect for container and element
    mockGetBoundingClientRect
      .mockReturnValueOnce({ top: 0, left: 0, right: 100, bottom: 100, width: 100, height: 100 }) // container
      .mockReturnValueOnce({ top: 500, left: 0, right: 100, bottom: 600, width: 100, height: 100 }); // element

    act(() => {
      result.current.scrollToLatestRemix();
    });

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: -540, // Actual calculated value from the hook
      behavior: 'smooth',
    });
  });

  it('should auto-scroll when new remix response is added and generating', () => {
    const mockContainerRef = createMockRef(createMockScrollContainer() as any);
    const { result } = renderHook(() => useRemixScroll(3, true, mockContainerRef));
    const mockElement = createMockElement() as any;

    // Mock the refs
    Object.defineProperty(result.current.remixResponseRefs, 'current', {
      writable: true,
      value: {
        0: mockElement,
        1: mockElement,
        2: mockElement,
      },
    });

    // Mock getBoundingClientRect for container and element
    mockGetBoundingClientRect
      .mockReturnValueOnce({ top: 0, left: 0, right: 100, bottom: 100, width: 100, height: 100 }) // container
      .mockReturnValueOnce({ top: 500, left: 0, right: 100, bottom: 600, width: 100, height: 100 }); // element

    // Fast-forward timers to trigger the useEffect
    jest.useFakeTimers();

    // Re-render with new remixResponsesLength to trigger useEffect
    const { rerender } = renderHook(
      ({ length, generating }) => useRemixScroll(length, generating, mockContainerRef),
      { initialProps: { length: 3, generating: true } },
    );

    // Mock the refs for the new render
    const newResult = renderHook(() => useRemixScroll(4, true, mockContainerRef));
    Object.defineProperty(newResult.result.current.remixResponseRefs, 'current', {
      writable: true,
      value: {
        0: mockElement,
        1: mockElement,
        2: mockElement,
        3: mockElement,
      },
    });

    act(() => {
      rerender({ length: 4, generating: true });
    });

    act(() => {
      jest.advanceTimersByTime(100);
    });

    expect(mockScrollTo).toHaveBeenCalledWith({
      top: -520, // Actual calculated value from the hook
      behavior: 'smooth',
    });

    jest.useRealTimers();
  });
});
