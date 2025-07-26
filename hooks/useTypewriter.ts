import { useEffect, useState, useRef } from 'react';

export function useTypewriter({
  text,
  speed = 30,
  pauseAfterPunctuation = 300,
  isNewContent = true,
}: {
  text: string;
  speed?: number;
  pauseAfterPunctuation?: number;
  isNewContent?: boolean;
}) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const previousTextRef = useRef('');
  const animationRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear any existing animation
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }

    // Only trigger typewriter effect if this is new content
    if (isNewContent && text !== previousTextRef.current) {
      setDisplayed('');
      setDone(false);

      let i = 0;
      const type = () => {
        if (i < text.length) {
          setDisplayed((prev) => prev + text[i]);

          let delay = speed;
          if (['.', ',', '?', '!'].includes(text[i])) {
            delay += pauseAfterPunctuation;
          }

          i++;
          animationRef.current = setTimeout(type, delay);
        } else {
          setDone(true);
          // Only update previousTextRef after animation is completely done
          previousTextRef.current = text;
        }
      };

      type();
    } else {
      // For re-renders or same content, show immediately
      setDisplayed(text);
      setDone(true);
      // Don't update previousTextRef here to avoid race conditions
    }

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [text, speed, pauseAfterPunctuation, isNewContent]);

  return { displayed, done };
}
