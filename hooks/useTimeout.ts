import React from 'react';

export default function useTimeout(callback: () => void, delay: number | null) {
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const savedCallback = React.useRef(callback);

  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  React.useEffect(() => {
    const tick = () => savedCallback.current();

    if (typeof delay === 'number') {
      timeoutRef.current = setTimeout(tick, delay);

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }
  }, [delay]);

  return timeoutRef;
}
