i want a text area with framer motion where i want the expected behavior, how would i do this?

User Experience:

1. by default, the height of text area is 1 row when user doesn't set focus in text area.
2. when user sets cursor in text area, the size of the text area increases from 1 row to 3 rows and animates smoothly
3. when user starts typing and adding new rows, the text area should resize with it until it reaches 8 rows; after which the text area will get a scrollbar when adding a 9th row
4. when clearing the text in text area and still have cursor focused in text area, the size should still be 3 rows.
5. when leaving focus of text area without text inside, the text area should animate resize to 1 row.

I want the text area to grow naturally and push down the other controls with it, when we reach 8th row, the text area doesn't grow anymore but shows the scrollbar in text area, all the other controls would be where they need to be. when removing lines, the text area would shrink to 3 rows, as described above.

I do not want the text that I'm typing to overlap the controls below the textarea. The size of the text area should be known at all times so the system knows how to adjust the different controls so that the UI looks correct

challenges:

1. we don't want animations to fire after typing first character
2. we want to maintain auto resize of text area to a max size without impacting animations
3. We're using a next.js app with tailwind css.

How can we achieve this functionality and desired user behavior?

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const AnimatedTextarea = () => {
  const [isFocused, setIsFocused] = useState(false);
  const [text, setText] = useState('');
  const [shouldAnimate, setShouldAnimate] = useState(true);
  const textareaRef = useRef(null);

  // Calculate the container height based on content and focus state
  const calculateContainerHeight = () => {
    const lineHeight = 24; // 1.5rem = 24px
    const bottomPadding = 8; // pb-8 = 2rem = 32px, but we account for line spacing

    // Calculate number of lines
    const lines = text ? text.split('\n').length : 0;
    const estimatedLines = Math.max(lines, text ? Math.ceil(text.length / 80) : 0);

    if (!isFocused && !text) {
      // Default: 1 row
      return lineHeight + bottomPadding;
    } else if (isFocused && !text) {
      // Focused but empty: 3 rows
      return lineHeight * 3 + bottomPadding;
    } else {
      // With content: grow up to 8 rows
      const contentLines = Math.max(estimatedLines, 3); // Minimum 3 when focused
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

  const handleChange = (e) => {
    const newText = e.target.value;
    setText(newText);

    // Disable animations when typing (after first character)
    if (text.length === 0 && newText.length === 1) {
      setShouldAnimate(false);
    }

    // Re-enable animations when text is cleared
    if (newText === '') {
      setShouldAnimate(true);
    }
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

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
        Animated Textarea Container
      </h2>

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
            placeholder="Ask anything..."
            maxLength={1000}
            className="w-full bg-transparent border-none outline-none resize-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 pr-15 pb-8"
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
            disabled
            className="w-8 h-8 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 rounded-full flex items-center justify-center text-white transition-colors duration-200 disabled:cursor-not-allowed"
          >
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
          </button>
        </div>
      </div>

      {/* Debug info */}
      <div className="mt-4 text-sm text-gray-500 dark:text-gray-400 space-y-1 font-mono">
        <div>Focused: {isFocused ? 'Yes' : 'No'}</div>
        <div>Text length: {text.length}</div>
        <div>Lines: {text.split('\n').length}</div>
        <div>Should animate: {shouldAnimate ? 'Yes' : 'No'}</div>
        <div>Container height: {containerHeight}px</div>
        <div>Textarea height: {textareaHeight}px</div>
      </div>

      {/* Test content button */}
      <div className="mt-4">
        <button
          onClick={() =>
            setText(
              'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8\nLine 9\nLine 10',
            )
          }
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors mr-2"
        >
          Add 10 Lines
        </button>
        <button
          onClick={() => setText('')}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          Clear Text
        </button>
      </div>
    </div>
  );
};

export default AnimatedTextarea;
```
