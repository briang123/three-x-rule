import { useEffect, useCallback } from 'react';
import useTimeout from './useTimeout';

export const useScrollPerformance = (
  scrollContainerRef: React.RefObject<HTMLDivElement>,
  delay: number = 150,
) => {
  const removeScrollClass = useCallback(() => {
    const chatInputContainer = document.querySelector('.chat-input-container');
    if (chatInputContainer) {
      chatInputContainer.classList.remove('scrolling');
    }
  }, []);

  const scrollTimeoutRef = useTimeout(removeScrollClass, null);

  const handleScroll = useCallback(() => {
    // Add a class to optimize animations during scroll
    const chatInputContainer = document.querySelector('.chat-input-container');
    if (chatInputContainer) {
      chatInputContainer.classList.add('scrolling');

      // Use useTimeout to remove the class after scroll ends
      scrollTimeoutRef.current = setTimeout(removeScrollClass, delay);
    }
  }, [removeScrollClass, delay, scrollTimeoutRef]);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
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
  }, [scrollContainerRef, handleScroll, scrollTimeoutRef]);

  return scrollTimeoutRef;
};
