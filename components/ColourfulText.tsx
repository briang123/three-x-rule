'use client';
import React from 'react';
import { motion } from 'framer-motion';

interface ColourfulTextProps {
  text: string;
  highlightedWords?: string[];
  useGradient?: boolean;
}

export function ColourfulText({
  text,
  highlightedWords = [],
  useGradient = true,
}: ColourfulTextProps) {
  const gradients = [
    'linear-gradient(45deg, #8b5cf6, #ec4899)', // purple-500 to pink-500 (main remix gradient)
    'linear-gradient(45deg, #3b82f6, #60a5fa)', // kitchen-accent-blue to kitchen-dark-accent-blue
    'linear-gradient(45deg, #8b5cf6, #3b82f6)', // purple-500 to kitchen-accent-blue
    'linear-gradient(45deg, #ec4899, #3b82f6)', // pink-500 to kitchen-accent-blue
    'linear-gradient(45deg, #6366f1, #ec4899)', // indigo-500 to pink-500
    'linear-gradient(45deg, #3b82f6, #8b5cf6)', // kitchen-accent-blue to purple-500
    'linear-gradient(45deg, #ec4899, #8b5cf6)', // pink-500 to purple-500
    'linear-gradient(45deg, #60a5fa, #ec4899)', // kitchen-dark-accent-blue to pink-500
    'linear-gradient(45deg, #8b5cf6, #60a5fa)', // purple-500 to kitchen-dark-accent-blue
    'linear-gradient(45deg, #3b82f6, #ec4899)', // kitchen-accent-blue to pink-500
  ];

  const colors = [
    '#8b5cf6', // purple-500 (main brand color)
    '#3b82f6', // kitchen-accent-blue
    '#ec4899', // pink-500 (main brand color)
    '#60a5fa', // kitchen-dark-accent-blue
    '#6366f1', // indigo-500
    '#8b5cf6', // purple-500
    '#3b82f6', // kitchen-accent-blue
    '#ec4899', // pink-500
    '#60a5fa', // kitchen-dark-accent-blue
    '#6366f1', // indigo-500
  ];

  const [currentGradients, setCurrentGradients] = React.useState(gradients);
  const [currentColors, setCurrentColors] = React.useState(colors);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      const shuffledGradients = [...gradients].sort(() => Math.random() - 0.5);
      const shuffledColors = [...colors].sort(() => Math.random() - 0.5);
      setCurrentGradients(shuffledGradients);
      setCurrentColors(shuffledColors);
      setCount((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Function to check if a word should be highlighted
  const isHighlighted = (word: string) => {
    return highlightedWords.some((highlighted) =>
      word.toLowerCase().includes(highlighted.toLowerCase()),
    );
  };

  // Split text into words and characters
  const words = text.split(' ');

  return (
    <>
      {words.map((word, wordIndex) => {
        const shouldHighlight = isHighlighted(word);
        const gradientIndex = wordIndex % currentGradients.length;
        const colorIndex = wordIndex % currentColors.length;

        return (
          <React.Fragment key={`word-${wordIndex}-${count}`}>
            {word.split('').map((char, charIndex) => (
              <motion.span
                key={`${char}-${count}-${wordIndex}-${charIndex}`}
                initial={{
                  y: 0,
                }}
                animate={{
                  y: [0, -3, 0],
                  scale: [1, 1.01, 1],
                  filter: ['blur(0px)', `blur(5px)`, 'blur(0px)'],
                  opacity: [1, 0.8, 1],
                }}
                transition={{
                  duration: 0.5,
                  delay: wordIndex * 0.1 + charIndex * 0.05,
                }}
                className="inline-block whitespace-pre font-sans tracking-tighter leading-relaxed"
                style={{
                  background:
                    shouldHighlight && useGradient
                      ? currentGradients[gradientIndex]
                      : shouldHighlight
                        ? currentColors[colorIndex]
                        : 'inherit',
                  backgroundClip: shouldHighlight ? 'text' : 'unset',
                  WebkitBackgroundClip: shouldHighlight ? 'text' : 'unset',
                  WebkitTextFillColor: shouldHighlight ? 'transparent' : 'inherit',
                  color: shouldHighlight && !useGradient ? currentColors[colorIndex] : 'inherit',
                }}
              >
                {char}
              </motion.span>
            ))}
            {wordIndex < words.length - 1 && <span> </span>}
          </React.Fragment>
        );
      })}
    </>
  );
}
