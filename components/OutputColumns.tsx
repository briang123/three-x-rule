'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SelectedSentence } from '@/app/page';
import { ModelInfo } from '@/lib/api-client';
import { TypingIndicator } from './TypingIndicator';
import ChatInputMessage from './ChatInputMessage';
import { ModelSelection } from './ModelGridSelector';
import RemixButtonCard from './RemixButtonCard';
import { useRemixScroll } from '@/hooks/useScroll';
import ContainerizedAIResponseContent from './ContainerizedAIResponseContent';
import CopyButton from './CopyButton';
import { SocialPlatformFactory, SocialPostConfig } from './social-platforms';

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
  remixResponses?: string[];
  remixModels?: string[];
  showRemix?: boolean;
  onCloseRemix?: () => void;
  remixModel?: string;
  // Social Posts props
  socialPostsResponses?: { [key: string]: string };
  isSocialPostsGenerating?: { [key: string]: boolean };
  showSocialPosts?: { [key: string]: boolean };
  onCloseSocialPosts?: (socialPostId: string) => void;
  socialPostsConfigs?: { [key: string]: SocialPostConfig };
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
  // Model selection callbacks
  onModelSelect?: (modelId: string) => void;
  onModelSelectionsUpdate?: (modelId: string) => void;
  onDirectSubmit?: (prompt: string, modelId: string) => void;
  onRestoreModelSelection?: () => void;
  showAISelection?: boolean;
  onToggleAISelection?: () => void;
  resetModelSelector?: boolean;
  // Close callback for AI selection
  onCloseAISelection?: () => void;
  // Model selection badge props
  onModelSelectionClick?: () => void;
  // Default model usage flag
  isUsingDefaultModel?: boolean;
  // Left navigation state
  isLeftNavCollapsed?: boolean;
}

// Note: Removed ColumnModelSelector component since we now use the 3x3 grid system

const OutputColumns = React.memo(function OutputColumns({
  onSentenceSelect,
  selectedSentences,
  onModelChange,
  columnResponses,
  originalResponses,
  isGenerating,
  onAddColumn,
  onDeleteColumn,
  remixResponses = [],
  remixModels = [],
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
  onModelSelect,
  onModelSelectionsUpdate,
  onDirectSubmit,
  onRestoreModelSelection,
  showAISelection = true,
  onToggleAISelection,
  resetModelSelector = false,
  onCloseAISelection,
  onModelSelectionClick,
  isUsingDefaultModel = false,
  isLeftNavCollapsed = true,
}: OutputColumnsProps) {
  // Orchestration state
  const [isModelSelectorCollapsed, setIsModelSelectorCollapsed] = useState(false);
  const [showModelBadges, setShowModelBadges] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Position tracking refs
  const modelSelectorRef = useRef<HTMLDivElement>(null);
  const toolsRowRef = useRef<HTMLDivElement>(null);
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

  // Orchestration handlers
  const handleSubmitWithOrchestration = useCallback(
    async (prompt: string, attachments?: File[]) => {
      if (!hasSubmitted) {
        setHasSubmitted(true);

        // Start orchestration
        onSubmit(prompt, attachments);
      }
    },
    [hasSubmitted, onSubmit],
  );

  const handleRestoreModelSelection = useCallback(() => {
    setShowModelBadges(false);
    setIsModelSelectorCollapsed(false);
    setHasSubmitted(false);
    if (onRestoreModelSelection) {
      onRestoreModelSelection();
    }
  }, [onRestoreModelSelection]);

  // Handle orchestration when models are confirmed from modal
  const handleModelConfirmedOrchestration = useCallback(() => {
    setHasSubmitted(true);

    // Start orchestration after model confirmation
    // The actual prompt and modelId will be handled by the pending orchestration mechanism
  }, []);

  const handleModelSelectorAnimationComplete = useCallback(() => {
    // This will be called when the ModelGridSelector animation completes
  }, []);

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
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Determine if we should show the 3x3 grid or output columns
  const hasAIContent = useMemo(() => {
    // Check if there's any AI-generated content
    const hasColumnContent = Object.values(originalResponses).some(
      (response) => response.trim() !== '',
    );
    const hasRemixContent = remixResponses.length > 0;
    const hasSocialContent = Object.values(socialPostsResponses).some(
      (response) => response.trim() !== '',
    );

    return hasColumnContent || hasRemixContent || hasSocialContent;
  }, [originalResponses, remixResponses, socialPostsResponses]);

  // Auto-hide AI selection when content is received
  useEffect(() => {
    if (hasAIContent && showAISelection && onToggleAISelection) {
      onToggleAISelection();
    }
  }, [hasAIContent, showAISelection, onToggleAISelection]);

  // Reset model selector state when resetModelSelector prop changes
  useEffect(() => {
    if (resetModelSelector) {
      setIsModelSelectorCollapsed(false);
      setShowModelBadges(false);
      setHasSubmitted(false);
    }
  }, [resetModelSelector]);

  // Reset model selector when showAISelection becomes true
  useEffect(() => {
    if (showAISelection) {
      setIsModelSelectorCollapsed(false);
      setShowModelBadges(false);
      setHasSubmitted(false);
    }
  }, [showAISelection]);

  // Show model badges when modelSelections are updated and AI selection is closed
  useEffect(() => {
    if (modelSelections.length > 0 && !showAISelection) {
      setShowModelBadges(true);
    }
  }, [modelSelections, showAISelection]);

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

  // Optimize scroll performance
  useEffect(() => {
    const handleScroll = () => {
      // Add a class to optimize animations during scroll
      const chatInputContainer = document.querySelector('.chat-input-container');
      if (chatInputContainer) {
        chatInputContainer.classList.add('scrolling');

        // Remove the class after scroll ends
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        scrollTimeoutRef.current = setTimeout(() => {
          chatInputContainer.classList.remove('scrolling');
        }, 150);
      }
    };

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
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchModels = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/chat');
        const data = await response.json();

        if (data.success && isMounted) {
          setModels(data.data.models);
          setInitialized(true);
        } else if (!data.success) {
          console.error('OutputColumns: Failed to fetch models:', data.error);
        }
      } catch (err) {
        console.error('Error fetching models:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchModels();

    return () => {
      isMounted = false;
    };
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

  // Use the remix scroll hook
  const { remixResponseRefs, scrollToLatestRemix } = useRemixScroll(
    remixResponses.length,
    isRemixGenerating,
    scrollContainerRef, // Pass the scroll container ref
    { offset: 40 }, // Add more offset to ensure entire card is visible
  );

  return (
    <div className="relative w-full h-full flex flex-col">
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto content-scroll-area smooth-scroll pb-96"
      >
        <div className="flex flex-col justify-start gap-6 pl-6 pr-6 w-1/2 mx-auto">
          {/* Show AI Selection when enabled */}
          {showAISelection && (
            <AnimatePresence mode="wait">
              {!isModelSelectorCollapsed && (
                <motion.div
                  ref={modelSelectorRef}
                  key="model-selector"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="w-full"
                >
                  {/* ModelGridSelector removed - now using modal approach */}
                </motion.div>
              )}
            </AnimatePresence>
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
                      <ContainerizedAIResponseContent
                        content={originalResponses[column] || columnResponses[column].join('\n\n')}
                        column={column}
                        onAddSelection={(text) => handleAddSelection(text, column)}
                      />
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

          {/* Remix Response Cards */}
          {remixResponses &&
            remixResponses.map((response, index) => (
              <motion.div
                key={`remix-response-${index}`}
                ref={(el) => {
                  remixResponseRefs.current[index] = el;
                }}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
                className="kitchen-card p-6 flex flex-col overflow-hidden w-full max-w-full flex-shrink-0 column-container"
              >
                <div className="flex items-center justify-between mb-4 flex-shrink-0 min-h-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500">
                      <svg
                        className={`w-5 h-5 ${isRemixGenerating && index === remixResponses.length - 1 ? 'animate-spin' : ''}`}
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
                        {isRemixGenerating && index === remixResponses.length - 1
                          ? 'Generating Remix...'
                          : `Remix Response ${index + 1}`}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full">
                      {remixModels[index] || remixModel || 'Model'}
                    </span>
                  </div>
                </div>

                {/* Remix Response Display */}
                <div className="column-content pr-2">
                  <div className="space-y-3">
                    {isRemixGenerating && index === remixResponses.length - 1 ? (
                      // Loading state for the last card
                      <div className="text-center text-blue-600 py-4">
                        <div className="flex items-center justify-center space-x-2 mb-3">
                          <TypingIndicator />
                          <span className="text-sm font-medium">Generating remix...</span>
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                          <p className="mb-2">
                            Synthesizing responses from all columns into a curated remix using{' '}
                            {remixModels[index] || remixModel || 'selected model'}.
                          </p>
                          <p>
                            This process combines the best insights from multiple AI perspectives to
                            create a comprehensive answer.
                          </p>
                        </div>
                      </div>
                    ) : (
                      // Completed response display
                      <ContainerizedAIResponseContent
                        content={response}
                        column="R"
                        onAddSelection={(text) => handleAddSelection(text, 'R')}
                      />
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

          {/* RemixButtonCard Component for Testing */}
          {hasAIContent && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
              className="w-full"
            >
              <RemixButtonCard
                onRemix={(modelId) => {
                  if (onRemix) {
                    onRemix(modelId);
                  }
                }}
                onRemixStart={() => {
                  scrollToLatestRemix();
                }}
                disabled={remixDisabled}
                isGenerating={isRemixGenerating}
                responseCount={Object.keys(columnResponses).length}
              />
            </motion.div>
          )}

          {/* Social Posts Columns */}
          {Object.entries(showSocialPosts).map(([socialPostId, isVisible]) => {
            if (!isVisible) return null;

            const config = socialPostsConfigs[socialPostId];
            const response = socialPostsResponses[socialPostId];
            const isGenerating = isSocialPostsGenerating[socialPostId];
            const isBorderFaded = socialPostsBorderStates[socialPostId];

            return (
              <div
                key={socialPostId}
                ref={(el) => {
                  socialPostsRefs.current[socialPostId] = el;
                }}
              >
                <SocialPlatformFactory
                  config={config}
                  response={response}
                  isGenerating={isGenerating}
                  isBorderFaded={isBorderFaded}
                  onClose={() => onCloseSocialPosts?.(socialPostId)}
                  onAddSelection={handleAddSelection}
                />
              </div>
            );
          })}

          {/* 3x3 Grid at the end when there's AI content and AI selection should be shown */}
          {hasAIContent && showAISelection && (
            <AnimatePresence mode="wait">
              {!isModelSelectorCollapsed && (
                <motion.div
                  ref={modelSelectorRef}
                  key="model-selector-end"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -50, scale: 0.95 }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className="w-full"
                >
                  {/* ModelGridSelector removed - now using modal approach */}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Additional spacer to ensure last content is fully visible */}
        <div className="h-32"></div>
      </div>

      {/* ChatInput as fixed footer outside the scrollable container */}
      <div
        className="fixed bottom-0 bg-transparent z-50 backdrop-blur-optimized chat-input-container transform-gpu will-change-transform transition-all duration-300 ease-out"
        style={{
          left: isLeftNavCollapsed ? '64px' : '256px',
          right: '0px',
        }}
      >
        <div className="flex justify-center">
          <div className="flex flex-col justify-start gap-6 pl-6 pr-6 w-1/2 transition-all duration-300">
            <ChatInputMessage
              onSubmit={(prompt, modelId, attachments) =>
                handleSubmitWithOrchestration(prompt, attachments)
              }
              currentMessage={currentMessage}
              isSubmitting={Object.values(isGenerating).some((generating) => generating)}
              onModelSelect={onModelSelect}
              onModelSelectionsUpdate={onModelSelectionsUpdate}
              onDirectSubmit={onDirectSubmit}
              modelSelections={modelSelections}
              showModelBadges={showModelBadges}
              onRestoreModelSelection={handleRestoreModelSelection}
              onModelConfirmedOrchestration={handleModelConfirmedOrchestration}
              availableModels={models}
              toolsRowRef={toolsRowRef}
              showAISelection={showAISelection}
              onToggleAISelection={onToggleAISelection}
              onModelSelectionClick={onModelSelectionClick}
              modelSelectionDisabled={false}
              isUsingDefaultModel={isUsingDefaultModel}
              isLeftNavCollapsed={isLeftNavCollapsed}
            />
          </div>
        </div>
      </div>
    </div>
  );
});

export default OutputColumns;
