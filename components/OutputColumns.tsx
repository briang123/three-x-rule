'use client';

import { motion } from 'framer-motion';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SelectedSentence } from '@/app/page';
import { ModelInfo } from '@/lib/api-client';
import ReactMarkdown from 'react-markdown';
import TextHighlighter, { useTextHighlighter, Highlight } from './TextHighlighter';
import { TypingIndicator } from './TypingIndicator';
import ChatInput from './ChatInput';
import ModelGridSelector, { ModelSelection } from './ModelGridSelector';
import './TextHighlighter.css';

// Copy to Clipboard Component
function CopyButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 text-kitchen-text-light hover:text-kitchen-text transition-colors"
      title="Copy to clipboard"
    >
      {copied ? (
        <svg
          className="w-4 h-4 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      )}
    </button>
  );
}

// Highlightable Text Component using the modular TextHighlighter
function HighlightableText({
  content,
  onAddSelection,
  column,
}: {
  content: string;
  onAddSelection: (text: string) => void;
  column: string;
}) {
  const { highlights, addHighlight, removeHighlight } = useTextHighlighter();

  const columnColors = {
    A: 'rgba(59, 130, 246, 0.3)', // blue
    B: 'rgba(34, 197, 94, 0.3)', // green
    C: 'rgba(168, 85, 247, 0.3)', // purple
    D: 'rgba(239, 68, 68, 0.3)', // red
    E: 'rgba(245, 158, 11, 0.3)', // orange
    F: 'rgba(16, 185, 129, 0.3)', // emerald
    R: 'rgba(168, 85, 247, 0.3)', // purple for remix
    S: 'rgba(34, 197, 94, 0.3)', // green for social posts
  };

  const handleHighlightAdd = (highlight: Highlight) => {
    // Add to local highlights - extract the data without id and timestamp
    const { id, timestamp, ...highlightData } = highlight;
    addHighlight(highlightData);

    // Add to selections for the parent component
    onAddSelection(highlight.text);
  };

  const handleHighlightRemove = (highlightId: string) => {
    removeHighlight(highlightId);
  };

  return (
    <div className="relative">
      <TextHighlighter
        highlights={highlights}
        onHighlightAdd={handleHighlightAdd}
        onHighlightRemove={handleHighlightRemove}
        highlightColor={
          columnColors[column as keyof typeof columnColors] || 'rgba(156, 163, 175, 0.3)'
        }
        className={`bg-gray-50 dark:bg-kitchen-dark-surface rounded-lg p-4 border border-gray-200 dark:border-kitchen-dark-border select-text highlightable-text-${column.toLowerCase()}`}
      >
        <div className="text-sm text-gray-800 dark:text-kitchen-dark-text markdown-content">
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
              h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
              h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
              h3: ({ children }) => <h3 className="text-sm font-bold mb-1">{children}</h3>,
              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
              code: ({ children }) => (
                <code className="bg-gray-200 px-1 py-0.5 rounded text-xs">{children}</code>
              ),
              pre: ({ children }) => (
                <pre className="bg-gray-200 p-2 rounded text-xs overflow-x-auto">{children}</pre>
              ),
              ul: ({ children }) => <ul className="mb-2 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="mb-2 space-y-1">{children}</ol>,
              li: ({ children }) => <li className="text-sm">{children}</li>,
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-gray-300 pl-4 italic">
                  {children}
                </blockquote>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      </TextHighlighter>
    </div>
  );
}

interface OutputColumnsProps {
  onSentenceSelect: (sentence: SelectedSentence) => void;
  selectedSentences: SelectedSentence[];
  onModelChange?: (column: string, modelId: string) => void;
  columnResponses: {
    [key: string]: string[];
  };
  originalResponses: {
    [key: string]: string;
  };
  isGenerating: {
    [key: string]: boolean;
  };
  onAddColumn?: () => void;
  onDeleteColumn?: (column: string) => void;
  // Remix props
  remixResponse?: string;
  showRemix?: boolean;
  onCloseRemix?: () => void;
  remixModel?: string;
  // Social Posts props
  socialPostsResponses?: { [key: string]: string };
  isSocialPostsGenerating?: { [key: string]: boolean };
  showSocialPosts?: { [key: string]: boolean };
  onCloseSocialPosts?: (socialPostId: string) => void;
  socialPostsConfigs?: { [key: string]: any };
  // ChatInput props
  onSubmit: (prompt: string, attachments?: File[]) => void;
  currentMessage?: string;
  onRemix?: (modelId: string) => void;
  remixDisabled?: boolean;
  isRemixGenerating?: boolean;
  // New 3x3 grid props
  onModelSelectionsChange?: (selections: ModelSelection[]) => void;
  modelSelections?: ModelSelection[];
  // Column models from parent component
  columnModels?: { [key: string]: string };
}

// Note: Removed ColumnModelSelector component since we now use the 3x3 grid system

export default function OutputColumns({
  onSentenceSelect,
  selectedSentences,
  onModelChange,
  columnResponses,
  originalResponses,
  isGenerating,
  onAddColumn,
  onDeleteColumn,
  remixResponse = '',
  showRemix = false,
  onCloseRemix,
  remixModel = '',
  socialPostsResponses = {},
  isSocialPostsGenerating = {},
  showSocialPosts = {},
  onCloseSocialPosts,
  socialPostsConfigs = {},
  onSubmit,
  currentMessage = '',
  onRemix,
  remixDisabled = false,
  isRemixGenerating = false,
  onModelSelectionsChange,
  modelSelections = [],
  columnModels = {},
}: OutputColumnsProps) {
  const handleAddSelection = useCallback(
    (text: string, source: string) => {
      const selectionId = `${source}-${Date.now()}`;
      onSentenceSelect({
        id: selectionId,
        text: text,
        source: source,
      });
    },
    [onSentenceSelect],
  );

  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [socialPostsBorderStates, setSocialPostsBorderStates] = useState<{
    [key: string]: boolean;
  }>({});

  // Refs for smooth scrolling
  const remixRef = useRef<HTMLDivElement>(null);
  const socialPostsRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Determine if we should show the 3x3 grid or output columns
  const hasAIContent = useMemo(() => {
    // Check if there's any AI-generated content
    const hasColumnContent = Object.values(originalResponses).some(
      (response) => response.trim() !== '',
    );
    const hasRemixContent = remixResponse.trim() !== '';
    const hasSocialContent = Object.values(socialPostsResponses).some(
      (response) => response.trim() !== '',
    );

    return hasColumnContent || hasRemixContent || hasSocialContent;
  }, [originalResponses, remixResponse, socialPostsResponses]);

  // Get all column keys from columnResponses prop
  const columnKeys = Object.keys(columnResponses);

  // Use ref to track previous columnModels to avoid infinite re-renders
  const prevColumnModelsRef = useRef<{ [key: string]: string }>({});
  // Use ref to track column keys to prevent infinite re-renders
  const prevColumnKeysRef = useRef<string[]>([]);
  const columnRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  // Track previous states for scroll triggers
  const prevShowRemixRef = useRef<boolean>(false);
  const prevShowSocialPostsRef = useRef<{ [key: string]: boolean }>({});
  const prevHasAIContentRef = useRef<boolean>(false);

  // Effect to handle social posts border fade-out after content is received
  useEffect(() => {
    Object.entries(socialPostsResponses).forEach(([socialPostId, response]) => {
      // Only start fade-out timer if:
      // 1. The social post is visible
      // 2. There's actual content (not empty)
      // 3. It's not currently generating
      // 4. The border hasn't already faded
      if (
        showSocialPosts[socialPostId] &&
        response &&
        response.trim() !== '' &&
        !isSocialPostsGenerating[socialPostId] &&
        !socialPostsBorderStates[socialPostId]
      ) {
        // Start the fade-out timer after content is received
        const timer = setTimeout(() => {
          setSocialPostsBorderStates((prev) => ({
            ...prev,
            [socialPostId]: true, // true means faded out
          }));
        }, 10000); // 10 seconds

        return () => clearTimeout(timer);
      }
    });
  }, [socialPostsResponses, showSocialPosts, isSocialPostsGenerating, socialPostsBorderStates]);

  // Clean up border states when social posts are removed
  useEffect(() => {
    const currentSocialPostIds = Object.keys(showSocialPosts);
    setSocialPostsBorderStates((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((id) => {
        if (!currentSocialPostIds.includes(id)) {
          delete newState[id];
        }
      });
      return newState;
    });
  }, [showSocialPosts]);

  // Smooth scroll function
  const smoothScrollToElement = useCallback((element: HTMLElement | null) => {
    if (!element || !scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const elementRect = element.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    const scrollTop = container.scrollTop;
    const elementTop = element.offsetTop;
    const containerHeight = container.clientHeight;

    // Calculate the target scroll position to center the element
    const targetScrollTop = elementTop - containerHeight / 2 + element.clientHeight / 2;

    // Smooth scroll to the target position
    container.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth',
    });
  }, []);

  // Effect to scroll to remix when it appears
  useEffect(() => {
    if (showRemix && !prevShowRemixRef.current && remixRef.current) {
      // Small delay to ensure the element is rendered
      setTimeout(() => {
        smoothScrollToElement(remixRef.current);
      }, 100);
    }
    prevShowRemixRef.current = showRemix;
  }, [showRemix, smoothScrollToElement]);

  // Effect to scroll to new social posts when they appear
  useEffect(() => {
    Object.entries(showSocialPosts).forEach(([socialPostId, isVisible]) => {
      if (isVisible && !prevShowSocialPostsRef.current[socialPostId]) {
        const socialPostRef = socialPostsRefs.current[socialPostId];
        if (socialPostRef) {
          // Small delay to ensure the element is rendered
          setTimeout(() => {
            smoothScrollToElement(socialPostRef);
          }, 100);
        }
      }
    });
    prevShowSocialPostsRef.current = { ...showSocialPosts };
  }, [showSocialPosts, smoothScrollToElement]);

  // Effect to scroll to new AI content when it first appears
  useEffect(() => {
    if (hasAIContent && !prevHasAIContentRef.current) {
      // Small delay to ensure the content is rendered
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: 0,
            behavior: 'smooth',
          });
        }
      }, 200);
    }
    prevHasAIContentRef.current = hasAIContent;
  }, [hasAIContent]);

  // Effect to scroll to new columns when they are added
  useEffect(() => {
    const newColumns = columnKeys.filter((column) => !prevColumnKeysRef.current.includes(column));
    if (newColumns.length > 0 && hasAIContent) {
      // Scroll to the last new column
      const lastNewColumn = newColumns[newColumns.length - 1];
      const columnRef = columnRefs.current[lastNewColumn];
      if (columnRef) {
        setTimeout(() => {
          smoothScrollToElement(columnRef);
        }, 100);
      }
    }
    prevColumnKeysRef.current = columnKeys;
  }, [columnKeys, hasAIContent, smoothScrollToElement]);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        setLoading(true);
        console.log('OutputColumns: Fetching models from /api/chat');
        const response = await fetch('/api/chat');
        console.log('OutputColumns: Response status:', response.status);
        const data = await response.json();
        console.log('OutputColumns: Models data:', data);

        if (data.success) {
          setModels(data.data.models);
          console.log('OutputColumns: Set models:', data.data.models);
          setInitialized(true);
        } else {
          console.error('OutputColumns: Failed to fetch models:', data.error);
        }
      } catch (err) {
        console.error('Error fetching models:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchModels();
  }, []); // Only run once on mount

  // Note: Removed old column model handling since we now use the 3x3 grid system

  // Note: Removed handleModelChange since we now use the 3x3 grid system

  const isSelected = (sentenceId: string) => {
    return selectedSentences.some((s) => s.id === sentenceId);
  };

  const getColumnColor = (column: string) => {
    const colors = {
      A: 'bg-blue-500',
      B: 'bg-green-500',
      C: 'bg-purple-500',
      D: 'bg-red-500',
      E: 'bg-orange-500',
      F: 'bg-emerald-500',
      R: 'bg-gradient-to-r from-purple-500 to-pink-500',
      S: 'bg-gradient-to-r from-green-500 to-emerald-500',
    };
    return colors[column as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto content-scroll-area">
        <div className="flex flex-col justify-start gap-6 pl-6 pr-6 w-1/2 mx-auto pb-32">
          {/* Show 3x3 grid when no AI content exists */}
          {!hasAIContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-full"
            >
              <ModelGridSelector
                onModelSelectionsChange={onModelSelectionsChange || (() => {})}
                disabled={Object.values(isGenerating).some((generating) => generating)}
                initialSelections={modelSelections}
              />
            </motion.div>
          )}

          {/* Show output columns when AI content exists */}
          {hasAIContent &&
            columnKeys.map((column, index) => (
              <motion.div
                key={column}
                ref={(el) => {
                  columnRefs.current[column] = el;
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index, ease: 'easeOut' }}
                className="kitchen-card p-6 flex flex-col overflow-hidden w-full max-w-full flex-shrink-0 column-container"
              >
                <div className="flex items-center justify-between mb-4 flex-shrink-0 min-h-0">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-lg font-semibold ${getColumnColor(column)} bg-kitchen-accent-blue dark:bg-kitchen-dark-accent-blue`}
                    >
                      {column}
                    </div>
                    {loading ? (
                      <div className="px-3 py-1 bg-kitchen-light-gray border border-kitchen-light-gray rounded-lg text-sm text-kitchen-text-light flex items-center space-x-2">
                        <div className="w-3 h-3 border border-kitchen-text-light border-t-transparent rounded-full animate-spin"></div>
                        <span>Loading models...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        {/* Show model badge instead of dropdown when there's AI content */}
                        {hasAIContent ? (
                          <span className="text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-1 rounded-full">
                            {columnModels[column] || 'Model'}
                          </span>
                        ) : (
                          <span className="text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-1 rounded-full">
                            {columnModels[column] || 'Unknown Model'}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {/* Delete Button: Only show if more than one column */}
                  {onDeleteColumn && columnKeys.length > 1 && (
                    <button
                      onClick={() => onDeleteColumn(column)}
                      className="ml-2 p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors text-red-500 dark:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-600"
                      title="Delete column"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Responses Display */}
                <div className="column-content pr-2">
                  <div className="space-y-3">
                    {isGenerating[column] && (
                      <div className="text-center text-blue-600 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <TypingIndicator />
                          <span className="text-sm font-medium">Generating response...</span>
                        </div>
                      </div>
                    )}

                    {columnResponses[column].length === 0 && !isGenerating[column] ? (
                      <div className="text-center text-gray-500 py-8">
                        <svg
                          className="w-12 h-12 mx-auto mb-4 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                        <p>No responses yet. Enter a prompt above to generate content.</p>
                      </div>
                    ) : (
                      // Markdown View
                      <div className="relative">
                        <div className="absolute top-2 right-2 z-10">
                          <CopyButton
                            content={
                              originalResponses[column] || columnResponses[column].join('\n\n')
                            }
                          />
                        </div>
                        <HighlightableText
                          content={
                            originalResponses[column] || columnResponses[column].join('\n\n')
                          }
                          onAddSelection={(text) => handleAddSelection(text, column)}
                          column={column}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

          {/* Add Column Button - only show when there's AI content */}
          {/* {hasAIContent && onAddColumn && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * columnKeys.length, ease: 'easeOut' }}
              className="kitchen-card p-6 flex flex-col items-center justify-center w-full max-w-full flex-shrink-0 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer column-container"
              onClick={onAddColumn}
            >
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">Add Column</p>
              <p className="text-gray-400 text-sm text-center mt-2">
                Click to add another AI model comparison
              </p>
            </motion.div>
          )} */}

          {/* Remix Column */}
          {showRemix && (
            <motion.div
              ref={remixRef}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="kitchen-card p-6 flex flex-col overflow-hidden w-full max-w-full flex-shrink-0 column-container"
            >
              <div className="flex items-center justify-between mb-4 flex-shrink-0 min-h-0">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500">
                    <svg
                      className={`w-5 h-5 ${isRemixGenerating ? 'animate-spin' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-semibold text-kitchen-text dark:text-kitchen-dark-text">
                      Remix
                    </span>
                    <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full">
                      {remixModel || 'Model'}
                    </span>
                  </div>
                </div>
                {onCloseRemix && (
                  <button
                    onClick={onCloseRemix}
                    className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors text-red-500 dark:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-600"
                    title="Close remix"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Remix Response Display */}
              <div className="column-content pr-2">
                <div className="space-y-3">
                  {isRemixGenerating && (
                    <div className="text-center text-blue-600 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <TypingIndicator />
                        <span className="text-sm font-medium">Generating remix...</span>
                      </div>
                    </div>
                  )}

                  {!remixResponse && !isRemixGenerating ? (
                    <div className="text-center text-gray-500 py-8">
                      <svg
                        className="w-12 h-12 mx-auto mb-4 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      <p>Remix response will appear here.</p>
                    </div>
                  ) : (
                    // Markdown View for Remix
                    <div className="relative">
                      <div className="absolute top-2 right-2 z-10">
                        <CopyButton content={remixResponse} />
                      </div>
                      <HighlightableText
                        content={remixResponse}
                        onAddSelection={(text) => handleAddSelection(text, 'R')}
                        column="R"
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Social Posts Columns */}
          {Object.entries(showSocialPosts).map(([socialPostId, isVisible]) => {
            if (!isVisible) return null;

            const config = socialPostsConfigs[socialPostId];
            const response = socialPostsResponses[socialPostId];
            const isGenerating = isSocialPostsGenerating[socialPostId];
            const isBorderFaded = socialPostsBorderStates[socialPostId];

            // Get platform-specific colors
            const getPlatformColors = (platform: string) => {
              const colors = {
                twitter: 'from-blue-400 to-blue-600',
                linkedin: 'from-blue-600 to-blue-800',
                instagram: 'from-pink-400 to-purple-600',
                facebook: 'from-blue-500 to-blue-700',
                tiktok: 'from-pink-500 to-red-500',
              };
              return colors[platform as keyof typeof colors] || 'from-green-500 to-emerald-500';
            };

            return (
              <motion.div
                key={socialPostId}
                ref={(el) => {
                  socialPostsRefs.current[socialPostId] = el;
                }}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={`kitchen-card p-6 flex flex-col overflow-hidden flex-shrink-0 column-container w-full max-w-full transition-all duration-1000 ease-in-out ${
                  isBorderFaded
                    ? 'border border-gray-200 dark:border-kitchen-dark-border'
                    : 'border-2 border-green-500 dark:border-green-400'
                }`}
              >
                <div className="flex items-center justify-between mb-4 flex-shrink-0 min-h-0">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-lg font-semibold bg-gradient-to-r ${getPlatformColors(config?.platform)}`}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                        />
                      </svg>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold text-kitchen-text dark:text-kitchen-dark-text">
                        Social Posts
                      </span>
                      <span
                        className={`text-xs bg-gradient-to-r ${getPlatformColors(config?.platform)} text-white px-2 py-1 rounded-full`}
                      >
                        {config?.platform || 'Platform'}
                      </span>
                      {config?.postType === 'article' && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                          Double-wide
                        </span>
                      )}
                    </div>
                  </div>
                  {onCloseSocialPosts && (
                    <button
                      onClick={() => onCloseSocialPosts(socialPostId)}
                      className="p-2 rounded-full hover:bg-red-100 dark:hover:bg-red-900 transition-colors text-red-500 dark:text-red-400 focus:outline-none focus:ring-2 focus:ring-red-300 dark:focus:ring-red-600"
                      title="Close social posts"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Social Posts Response Display */}
                <div className="output-column-scroll pr-2 column-content">
                  <div className="space-y-3">
                    {isGenerating && (
                      <div className="text-center text-blue-600 py-4">
                        <div className="flex items-center justify-center space-x-2">
                          <TypingIndicator />
                          <span className="text-sm font-medium">Generating social posts...</span>
                        </div>
                      </div>
                    )}

                    {!response && !isGenerating ? (
                      <div className="text-center text-gray-500 py-8">
                        <svg
                          className="w-12 h-12 mx-auto mb-4 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                          />
                        </svg>
                        <p>Social posts will appear here.</p>
                      </div>
                    ) : (
                      // Markdown View for Social Posts
                      <div className="relative">
                        <div className="absolute top-2 right-2 z-10">
                          <CopyButton content={response} />
                        </div>
                        <HighlightableText
                          content={response}
                          onAddSelection={(text) => handleAddSelection(text, 'S')}
                          column="S"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}

          {/* 3x3 Grid at the end when there's AI content */}
          {hasAIContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="w-full"
            >
              <ModelGridSelector
                onModelSelectionsChange={onModelSelectionsChange || (() => {})}
                disabled={Object.values(isGenerating).some((generating) => generating)}
                initialSelections={modelSelections}
              />
            </motion.div>
          )}

          {/* ChatInput as sticky footer within the scrollable container */}
          <div className="sticky bottom-0 bg-gray-50/80 dark:bg-kitchen-dark-bg/80 border-gray-200 dark:border-kitchen-dark-border z-10 w-full left-0 right-0 backdrop-blur-md">
            {/* Gradient fade overlay for softer edge */}
            <div className="absolute inset-x-0 -top-8 h-8 bg-gradient-to-b from-transparent to-gray-50/80 dark:to-kitchen-dark-bg/80 pointer-events-none"></div>
            <ChatInput
              onSubmit={onSubmit}
              currentMessage={currentMessage}
              onRemix={onRemix}
              remixDisabled={remixDisabled}
              isRemixGenerating={isRemixGenerating}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
