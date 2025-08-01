import { useRef, useCallback, useEffect } from 'react';
import { useScroll, UseScrollOptions } from './useScroll';

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
