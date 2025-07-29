'use client';

import { motion } from 'framer-motion';
import { ColourfulText } from './ColourfulText';
import { useMemo } from 'react';

interface HeaderTextProps {
  isVisible: boolean;
}

// Array of intro messages with highlighted words (copied from ModelGridSelector)
const introMessages = [
  { text: 'Ready when you are.', highlights: ['Ready'] },
  { text: "What's your plan for today?", highlights: ['plan'] },
  { text: "Let's create something amazing together.", highlights: ['create', 'amazing'] },
  { text: 'Your AI companions are waiting.', highlights: ['AI', 'companions'] },
  { text: 'Time to explore the possibilities.', highlights: ['explore', 'possibilities'] },
  { text: 'What shall we build today?', highlights: ['build'] },
  { text: 'Ready to dive into AI magic?', highlights: ['dive', 'magic'] },
  { text: 'Your creative journey starts here.', highlights: ['creative', 'journey'] },
  { text: "Let's make something extraordinary.", highlights: ['make', 'extraordinary'] },
  { text: "What's on your mind?", highlights: ['mind'] },
  { text: 'Ready to unlock new insights?', highlights: ['unlock', 'insights'] },
  { text: 'Your ideas deserve the best AI.', highlights: ['ideas', 'best'] },
  { text: "Let's turn imagination into reality.", highlights: ['imagination', 'reality'] },
  { text: 'What story will you tell today?', highlights: ['story'] },
  { text: 'Ready to explore the future?', highlights: ['explore', 'future'] },
  { text: 'Your next breakthrough awaits.', highlights: ['breakthrough'] },
  { text: "Let's discover what's possible.", highlights: ['discover', 'possible'] },
  { text: 'What challenge shall we tackle?', highlights: ['challenge', 'tackle'] },
  { text: 'Ready to push the boundaries?', highlights: ['push', 'boundaries'] },
  { text: 'Your creativity has no limits.', highlights: ['creativity', 'limits'] },
];

export default function HeaderText({ isVisible }: HeaderTextProps) {
  // Use a deterministic message selection to avoid hydration errors
  // Use the current date as a seed to change the message daily
  const selectedMessage = useMemo(() => {
    const today = new Date();
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24),
    );
    const index = dayOfYear % introMessages.length;
    return introMessages[index];
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <motion.div
      className="flex items-center justify-center h-full -mt-20"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="text-center max-w-2xl mx-auto px-6">
        <h1 className="text-4xl font-bold mb-4">
          <ColourfulText
            text={selectedMessage.text}
            highlightedWords={selectedMessage.highlights}
            useGradient={true}
          />
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
          Select your AI models and start generating content with multiple AI assistants
        </p>
        <div className="flex items-center justify-center space-x-4 text-sm text-gray-500 dark:text-gray-500">
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <span>Multiple AI Models</span>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>Compare Responses</span>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span>Lightning Fast</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
