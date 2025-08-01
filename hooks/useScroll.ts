import { useCallback, useRef, useEffect } from 'react';

interface UseScrollOptions {
  behavior?: ScrollBehavior;
  offset?: number;
}

interface UseScrollReturn {
  scrollToElement: (element: HTMLElement | null) => void;
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

  const { behavior = 'smooth', offset = 20 } = options;

  const scrollToElement = useCallback(
    (element: HTMLElement | null) => {
      if (element && containerRef.current) {
        // Calculate position relative to the scroll container
        const containerRect = containerRef.current.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();
        const scrollTop = containerRef.current.scrollTop;

        // Calculate the position to scroll to
        const elementTop = scrollTop + elementRect.top - containerRect.top - offset;

        // Scroll within the container
        containerRef.current.scrollTo({
          top: elementTop,
          behavior,
        });
      }
    },
    [behavior, offset, containerRef],
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

// Specialized hook for remix responses
export const useRemixScroll = (
  remixResponsesLength: number,
  isRemixGenerating: boolean,
  scrollContainer?: React.RefObject<HTMLDivElement>,
  options: UseScrollOptions = {},
) => {
  const remixResponseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const { scrollToLatest, scrollToIndex } = useScroll(scrollContainer, options);

  const scrollToLatestRemix = useCallback(() => {
    const latestIndex = remixResponsesLength - 1;
    if (latestIndex >= 0) {
      scrollToIndex(remixResponseRefs.current, latestIndex);
    }
  }, [remixResponsesLength, scrollToIndex]);

  // Auto-scroll when new remix response is added
  useEffect(() => {
    if (remixResponsesLength > 0 && isRemixGenerating) {
      const timer = setTimeout(() => {
        scrollToLatestRemix();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [remixResponsesLength, isRemixGenerating, scrollToLatestRemix]);

  return {
    remixResponseRefs,
    scrollToLatestRemix,
  };
};
