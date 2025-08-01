import { useCallback, useRef, useEffect } from 'react';

export interface UseScrollOptions {
  behavior?: ScrollBehavior;
  offset?: number;
  centerElement?: boolean; // New option to center elements
}

interface UseScrollReturn {
  scrollToElement: (
    element: HTMLElement | null,
    options?: { center?: boolean; offset?: number },
  ) => void;
  scrollToLatest: (elements: { [key: number]: HTMLElement | null }) => void;
  scrollToIndex: (elements: { [key: number]: HTMLElement | null }, index: number) => void;
  scrollToTop: () => void;
  scrollToBottom: () => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}

export const useScroll = (
  scrollContainer?: React.RefObject<HTMLDivElement>,
  options: UseScrollOptions = {},
): UseScrollReturn => {
  const defaultContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = scrollContainer || defaultContainerRef;

  const { behavior = 'smooth', offset = 20, centerElement = false } = options;

  const scrollToElement = useCallback(
    (element: HTMLElement | null, elementOptions?: { center?: boolean; offset?: number }) => {
      if (element && containerRef.current) {
        const container = containerRef.current;
        const elementRect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const scrollTop = container.scrollTop;
        const elementTop = element.offsetTop;
        const containerHeight = container.clientHeight;

        // Use element-specific options or fall back to hook options
        const shouldCenter = elementOptions?.center ?? centerElement;
        const elementOffset = elementOptions?.offset ?? offset;

        let targetScrollTop: number;

        if (shouldCenter) {
          // Center the element in the container
          targetScrollTop = elementTop - containerHeight / 2 + element.clientHeight / 2;
        } else {
          // Scroll to element with offset
          targetScrollTop = scrollTop + elementRect.top - containerRect.top - elementOffset;
        }

        // Scroll within the container
        container.scrollTo({
          top: targetScrollTop,
          behavior,
        });
      }
    },
    [behavior, offset, centerElement, containerRef],
  );

  const scrollToLatest = useCallback(
    (elements: { [key: number]: HTMLElement | null }) => {
      const keys = Object.keys(elements)
        .map(Number)
        .sort((a, b) => b - a);
      const latestIndex = keys[0];

      if (latestIndex !== undefined && elements[latestIndex]) {
        scrollToElement(elements[latestIndex]);
      }
    },
    [scrollToElement],
  );

  const scrollToIndex = useCallback(
    (elements: { [key: number]: HTMLElement | null }, index: number) => {
      if (elements[index]) {
        scrollToElement(elements[index]);
      }
    },
    [scrollToElement],
  );

  const scrollToTop = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior,
      });
    }
  }, [containerRef, behavior]);

  const scrollToBottom = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior,
      });
    }
  }, [containerRef, behavior]);

  return {
    scrollToElement,
    scrollToLatest,
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
    scrollContainerRef: containerRef,
  };
};
