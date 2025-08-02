import { useCallback, useRef, useEffect } from 'react';
import useTimeout from './useTimeout';

export interface UseScrollOptions {
  behavior?: ScrollBehavior;
  offset?: number;
  centerElement?: boolean;
}

export interface UseScrollEffectsOptions {
  scrollOptions?: UseScrollOptions;
  performanceDelay?: number;
  remixScrollDelay?: number;
  socialPostsScrollDelay?: number;
  aiContentScrollDelay?: number;
  newColumnsScrollDelay?: number;
}

export interface UseScrollEffectsReturn {
  // Core scroll functions
  scrollToElement: (
    element: HTMLElement | null,
    options?: { center?: boolean; offset?: number },
  ) => void;
  scrollToLatest: (elements: { [key: number]: HTMLElement | null }) => void;
  scrollToIndex: (elements: { [key: number]: HTMLElement | null }, index: number) => void;
  scrollToTop: () => void;
  scrollToBottom: () => void;
  scrollContainerRef: React.RefObject<HTMLDivElement>;

  // Remix-specific functions
  remixResponseRefs: React.MutableRefObject<{ [key: number]: HTMLDivElement | null }>;
  scrollToLatestRemix: () => void;

  // Social posts refs
  socialPostsRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;

  // Column refs
  columnRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;

  // Performance optimization
  isScrolling: boolean;
}

export const useScrollEffects = (
  scrollContainer?: React.RefObject<HTMLDivElement>,
  options: UseScrollEffectsOptions = {},
): UseScrollEffectsReturn => {
  const defaultContainerRef = useRef<HTMLDivElement>(null);
  const containerRef = scrollContainer || defaultContainerRef;

  const {
    scrollOptions = {},
    performanceDelay = 150,
    remixScrollDelay = 100,
    socialPostsScrollDelay = 100,
    aiContentScrollDelay = 200,
    newColumnsScrollDelay = 100,
  } = options;

  const { behavior = 'smooth', offset = 20, centerElement = false } = scrollOptions;

  // Refs for different content types
  const remixResponseRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const socialPostsRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const columnRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Performance tracking
  const isScrollingRef = useRef(false);

  // Core scroll functions
  const scrollToElement = useCallback(
    (element: HTMLElement | null, elementOptions?: { center?: boolean; offset?: number }) => {
      if (element && containerRef.current) {
        const container = containerRef.current;
        const elementRect = element.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const scrollTop = container.scrollTop;
        const elementTop = element.offsetTop;
        const containerHeight = container.clientHeight;

        const shouldCenter = elementOptions?.center ?? centerElement;
        const elementOffset = elementOptions?.offset ?? offset;

        let targetScrollTop: number;

        if (shouldCenter) {
          targetScrollTop = elementTop - containerHeight / 2 + element.clientHeight / 2;
        } else {
          targetScrollTop = scrollTop + elementRect.top - containerRect.top - elementOffset;
        }

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

  // Remix-specific functions
  const scrollToLatestRemix = useCallback(() => {
    const keys = Object.keys(remixResponseRefs.current)
      .map(Number)
      .sort((a, b) => b - a);
    const latestIndex = keys[0];

    if (latestIndex !== undefined && remixResponseRefs.current[latestIndex]) {
      scrollToElement(remixResponseRefs.current[latestIndex], { center: true });
    }
  }, [scrollToElement]);

  // Performance optimization
  const removeScrollClass = useCallback(() => {
    const chatInputContainer = document.querySelector('.chat-input-container');
    if (chatInputContainer) {
      chatInputContainer.classList.remove('scrolling');
      isScrollingRef.current = false;
    }
  }, []);

  const scrollTimeoutRef = useTimeout(removeScrollClass, null);

  const handleScroll = useCallback(() => {
    const chatInputContainer = document.querySelector('.chat-input-container');
    if (chatInputContainer) {
      chatInputContainer.classList.add('scrolling');
      isScrollingRef.current = true;

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      scrollTimeoutRef.current = setTimeout(removeScrollClass, performanceDelay);
    }
  }, [removeScrollClass, performanceDelay, scrollTimeoutRef]);

  // Set up scroll performance listener
  useEffect(() => {
    const scrollContainer = containerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [containerRef, handleScroll, scrollTimeoutRef]);

  return {
    // Core scroll functions
    scrollToElement,
    scrollToLatest,
    scrollToIndex,
    scrollToTop,
    scrollToBottom,
    scrollContainerRef: containerRef,

    // Remix-specific functions
    remixResponseRefs,
    scrollToLatestRemix,

    // Social posts refs
    socialPostsRefs,

    // Column refs
    columnRefs,

    // Performance optimization
    get isScrolling() {
      return isScrollingRef.current;
    },
  };
};

// Helper hook for managing scroll effects with state tracking
export const useScrollEffectsWithState = (
  scrollContainer?: React.RefObject<HTMLDivElement>,
  options: UseScrollEffectsOptions = {},
) => {
  const scrollEffects = useScrollEffects(scrollContainer, options);

  // State tracking refs
  const prevShowRemixRef = useRef<boolean>(false);
  const prevShowSocialPostsRef = useRef<{ [key: string]: boolean }>({});
  const prevHasAIContentRef = useRef<boolean>(false);
  const prevColumnKeysRef = useRef<string[]>([]);

  // Timeout hooks for scroll effects
  const remixScrollTimeout = useTimeout(() => {
    if (scrollEffects.remixResponseRefs.current) {
      const keys = Object.keys(scrollEffects.remixResponseRefs.current)
        .map(Number)
        .sort((a, b) => b - a);
      const latestIndex = keys[0];
      if (latestIndex !== undefined && scrollEffects.remixResponseRefs.current[latestIndex]) {
        scrollEffects.scrollToElement(scrollEffects.remixResponseRefs.current[latestIndex], {
          center: true,
        });
      }
    }
  }, null);

  const aiContentScrollTimeout = useTimeout(() => {
    scrollEffects.scrollToTop();
  }, null);

  const newColumnsScrollTimeout = useTimeout(() => {
    // This will be handled by the component using the hook
  }, null);

  const socialPostsScrollTimeout = useTimeout(() => {
    // This will be handled by the component using the hook
  }, null);

  return {
    ...scrollEffects,
    // State tracking
    prevShowRemixRef,
    prevShowSocialPostsRef,
    prevHasAIContentRef,
    prevColumnKeysRef,

    // Timeout refs
    remixScrollTimeout,
    aiContentScrollTimeout,
    newColumnsScrollTimeout,
    socialPostsScrollTimeout,
  };
};
