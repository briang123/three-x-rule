'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ChatInputMessageProps {
  onSubmit: (prompt: string) => void;
  currentMessage?: string;
  isSubmitting?: boolean;
}

const ChatInputMessage = ({
  onSubmit,
  currentMessage = '',
  isSubmitting = false,
}: ChatInputMessageProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [text, setText] = useState(currentMessage);
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Calculate the container height based on content and focus state
  const calculateContainerHeight = () => {
    const lineHeight = 24; // 1.5rem = 24px
    const bottomPadding = 8; // pb-8 = 2rem = 32px, but we account for line spacing

    // Calculate number of lines
    const lines = text ? text.split('\n').length : 0;
    const estimatedLines = Math.max(lines, text ? Math.ceil(text.length / 80) : 0);

    if (!text) {
      // Default: 1 row when empty
      return lineHeight + bottomPadding;
    } else {
      // With content: grow up to 8 rows
      const contentLines = Math.max(estimatedLines, 1); // Minimum 1 row
      const maxLines = Math.min(contentLines, 8);
      return lineHeight * maxLines + bottomPadding;
    }
  };

  // Calculate textarea height (should fill the container minus bottom padding)
  const calculateTextareaHeight = () => {
    const containerHeight = calculateContainerHeight();
    return containerHeight - 8; // Account for bottom padding
  };

  const containerHeight = calculateContainerHeight();
  const textareaHeight = calculateTextareaHeight();

  const handleFocus = () => {
    setIsFocused(true);
    setShouldAnimate(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (!text) {
      setShouldAnimate(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);

    // Always keep animations enabled
    setShouldAnimate(true);
  };

  // Auto-resize textarea when not animating
  useEffect(() => {
    if (!shouldAnimate && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 24 * 8; // 8 rows max
      textareaRef.current.style.height = Math.min(scrollHeight, maxHeight) + 'px';
    }
  }, [text, shouldAnimate]);

  const animationProps = shouldAnimate
    ? {
        animate: { height: containerHeight },
        transition: {
          duration: 0.2,
          ease: 'easeInOut',
        },
      }
    : {};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSubmitting) return;
    onSubmit(text.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto p-4 transition-all duration-300 ease-out transform-gpu will-change-transform"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        duration: 0.4,
        ease: [0.25, 0.46, 0.45, 0.94],
        type: 'spring',
        stiffness: 100,
        damping: 20,
      }}
    >
      <form onSubmit={handleSubmit}>
        <div
          className="relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
          style={{ padding: '2rem 2rem 3.5rem' }}
        >
          <motion.div
            className="relative"
            style={shouldAnimate ? {} : { height: `${containerHeight}px` }}
            {...animationProps}
          >
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything..."
              maxLength={1000}
              className="w-full bg-transparent border-none outline-none resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 pr-15"
              style={{
                height: shouldAnimate ? `${textareaHeight}px` : 'auto',
                lineHeight: '1.5rem',
                overflowY: containerHeight >= 24 * 8 + 8 ? 'auto' : 'hidden',
                maxHeight: '12rem',
              }}
            />
          </motion.div>

          {/* Bottom Left Controls */}
          <div className="absolute bottom-3 left-3 flex items-center space-x-2">
            <div className="relative">
              <button
                type="button"
                className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors duration-200 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  ></path>
                </svg>
              </button>
            </div>
          </div>

          {/* Bottom Right Controls */}
          <div className="absolute bottom-3 right-3 flex items-center space-x-2">
            <div className="relative">
              <button
                disabled
                className="px-3 py-1.5 text-xs rounded-lg font-medium transition-all duration-200 opacity-50 cursor-not-allowed bg-gray-200 text-gray-500"
                type="button"
              >
                <div className="flex items-center space-x-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    ></path>
                  </svg>
                  <span>Remix</span>
                  <svg
                    className="w-3 h-3 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </button>
            </div>
            <button
              type="submit"
              disabled={!text.trim() || isSubmitting}
              className="w-8 h-8 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 rounded-full flex items-center justify-center text-white transition-colors duration-200 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              ) : (
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 19V5M5 12l7-7 7 7"></path>
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Character count and help text */}
        <div className="flex justify-between items-center mt-2 px-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {text.length}/1000 characters
          </span>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Press Enter to submit, Shift+Enter for new line
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default ChatInputMessage;
