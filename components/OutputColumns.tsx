'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SelectedSentence } from '@/app/page';
import { ModelInfo } from '@/lib/api-client';
import ReactMarkdown from 'react-markdown';
import TextHighlighter, { useTextHighlighter, Highlight } from './TextHighlighter';
import { TypingIndicator } from './TypingIndicator';
import ChatInputMessage from './ChatInputMessage';
import { ModelSelection } from './ModelGridSelector';
import RemixButtonCard from './RemixButtonCard';
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

// Function to clean markdown formatting from a post
function cleanMarkdownFormatting(post: string): string {
  return post
    .replace(/^\*\*\s*/, '') // Remove ** at the very beginning
    .replace(/\s*\*\*$/, '') // Remove ** at the very end
    .trim();
}

// Function to remove numbering prefixes from a post
function removeNumberingPrefixes(post: string): string {
  return post
    .replace(/^(?:Tweet|Post|Caption)\s+\d+:\s*/gi, '')
    .replace(/^\d+\.\s*/, '')
    .replace(/^#\d+\s*/, '')
    .replace(/^Part\s+\d+:\s*/gi, '')
    .trim();
}

// Function to check if a message is an error
function isErrorMessage(message: string): boolean {
  return (
    message.startsWith('Rate limit exceeded') ||
    message.startsWith('Authentication error') ||
    message.startsWith('Server error') ||
    message.startsWith('Network error') ||
    message.startsWith('An error occurred')
  );
}

// Function to render error message with consistent styling
function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-2">
        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-sm font-medium text-red-700 dark:text-red-300">Error</span>
      </div>
      <p className="text-red-600 dark:text-red-400 text-sm">{message}</p>
    </div>
  );
}

// Function to parse social posts into individual posts
function parseSocialPosts(response: string): string[] {
  if (!response) return [];

  // Try to split by numbered patterns first (most common)
  const numberedPatterns = [
    /(?:Tweet|Post|Caption)\s+\d+:/gi,
    /^\d+\./gm,
    /^#\d+/gm,
    /^Part\s+\d+:/gi,
  ];

  for (const pattern of numberedPatterns) {
    const matches = response.match(pattern);
    if (matches && matches.length > 1) {
      // Split by the pattern and filter out empty strings
      const parts = response.split(pattern);
      const posts = parts
        .slice(1)
        .map((part) => part.trim())
        .filter((post) => post)
        .map(cleanMarkdownFormatting);

      if (posts.length > 1) {
        return posts;
      }
    }
  }

  // Try bullet point patterns
  const bulletPatterns = [/^-\s+/gm, /^•\s+/gm, /^\*\s+/gm];

  for (const pattern of bulletPatterns) {
    const matches = response.match(pattern);
    if (matches && matches.length > 1) {
      const parts = response.split(pattern);
      const posts = parts
        .slice(1)
        .map((part) => part.trim())
        .filter((post) => post)
        .map(cleanMarkdownFormatting);

      if (posts.length > 1) {
        return posts;
      }
    }
  }

  // Try double newline separation (common for markdown)
  const doubleNewlineSplit = response.split(/\n\s*\n/).filter((post) => post.trim());
  if (doubleNewlineSplit.length > 1) {
    // Check if these look like separate posts (not just paragraphs)
    const hasNumbering = doubleNewlineSplit.some((post) =>
      /^\d+\.|^Tweet|^Post|^Caption|^Part/i.test(post.trim()),
    );
    if (hasNumbering) {
      // Strip numbering prefixes from each post
      return doubleNewlineSplit.map((post) => {
        const trimmed = post.trim();
        return removeNumberingPrefixes(cleanMarkdownFormatting(trimmed));
      });
    }
  }

  // If no clear pattern found, return the whole response as a single post
  return [response.trim()];
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

export default function OutputColumns({
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
    console.log('Model selector animation completed');
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
      console.log('Auto-hiding AI selection because content is received');
      onToggleAISelection();
    }
  }, [hasAIContent, showAISelection, onToggleAISelection]);

  // Reset model selector state when resetModelSelector prop changes
  useEffect(() => {
    if (resetModelSelector) {
      console.log('Resetting model selector state');
      setIsModelSelectorCollapsed(false);
      setShowModelBadges(false);
      setHasSubmitted(false);
    }
  }, [resetModelSelector]);

  // Reset model selector when showAISelection becomes true
  useEffect(() => {
    if (showAISelection) {
      console.log('showAISelection is true, resetting model selector');
      setIsModelSelectorCollapsed(false);
      setShowModelBadges(false);
      setHasSubmitted(false);
    }
  }, [showAISelection]);

  // Show model badges when modelSelections are updated and AI selection is closed
  useEffect(() => {
    if (modelSelections.length > 0 && !showAISelection) {
      console.log('Model selections updated, showing model badges');
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
                      <div className="relative">
                        {(originalResponses[column] || columnResponses[column].join('\n\n')) && (
                          <div className="absolute top-2 right-2 z-10">
                            <CopyButton
                              content={
                                originalResponses[column] || columnResponses[column].join('\n\n')
                              }
                            />
                          </div>
                        )}
                        {isErrorMessage(
                          originalResponses[column] || columnResponses[column].join('\n\n'),
                        ) ? (
                          <ErrorMessage
                            message={
                              originalResponses[column] || columnResponses[column].join('\n\n')
                            }
                          />
                        ) : (
                          <HighlightableText
                            content={
                              originalResponses[column] || columnResponses[column].join('\n\n')
                            }
                            onAddSelection={(text) => handleAddSelection(text, column)}
                            column={column}
                          />
                        )}
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

          {/* Remix Response Cards */}
          {remixResponses &&
            remixResponses.map((response, index) => (
              <motion.div
                key={`remix-response-${index}`}
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
                      <div className="relative">
                        <div className="absolute top-2 right-2 z-10">
                          <CopyButton content={response} />
                        </div>
                        {isErrorMessage(response) ? (
                          <ErrorMessage message={response} />
                        ) : (
                          <HighlightableText
                            content={response}
                            onAddSelection={(text) => handleAddSelection(text, 'R')}
                            column="R"
                          />
                        )}
                      </div>
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
                  console.log('RemixButtonCard: onRemix called with modelId:', modelId);
                  if (onRemix) {
                    onRemix(modelId);
                  }
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

            // Function to get platform-specific colors
            const getPlatformColors = (platform: string) => {
              const colors = {
                twitter: 'from-black to-gray-800',
                linkedin: 'from-blue-600 to-blue-800',
                instagram: 'from-pink-400 to-purple-600',
                facebook: 'from-blue-500 to-blue-700',
                tiktok: 'from-pink-500 to-red-500',
              };
              return colors[platform as keyof typeof colors] || 'from-green-500 to-emerald-500';
            };

            // Function to get content type label
            const getContentTypeLabel = (postType: string) => {
              switch (postType) {
                case 'tweet':
                  return 'Tweet';
                case 'thread':
                  return 'Thread';
                case 'article':
                  return 'Article';
                case 'caption':
                  return 'Caption';
                case 'post':
                  return 'Post';
                default:
                  return 'Post';
              }
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
                      {config?.platform === 'twitter' ? (
                        <span className="text-lg font-bold">𝕏</span>
                      ) : config?.platform === 'linkedin' ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      ) : config?.platform === 'instagram' ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      ) : config?.platform === 'facebook' ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      ) : config?.platform === 'tiktok' ? (
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-.88-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                        </svg>
                      ) : (
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
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs font-medium bg-gradient-to-r ${getPlatformColors(config?.platform)} text-white px-2 py-1 rounded-full`}
                      >
                        {getContentTypeLabel(config?.postType || '')}
                      </span>
                      {config?.postType === 'article' && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                          Double-wide
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-1 rounded-full">
                      {config?.modelId || 'Model'}
                    </span>
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
                      // Individual Social Posts Display
                      <div className="space-y-4">
                        {(() => {
                          // Check if response is an error message
                          if (isErrorMessage(response)) {
                            return <ErrorMessage message={response} />;
                          }

                          const posts = parseSocialPosts(response);
                          return (
                            <>
                              {posts.length > 1 && response && (
                                <div className="flex items-center justify-between mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                  <div className="flex items-center space-x-2">
                                    <svg
                                      className="w-4 h-4 text-blue-600 dark:text-blue-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                      Generated {posts.length}{' '}
                                      {posts.length === 1
                                        ? config?.postType === 'tweet'
                                          ? 'tweet'
                                          : config?.postType === 'thread'
                                            ? 'thread part'
                                            : config?.postType === 'article'
                                              ? 'article'
                                              : config?.postType === 'post'
                                                ? 'post'
                                                : config?.postType === 'caption'
                                                  ? 'caption'
                                                  : 'post'
                                        : config?.postType === 'tweet'
                                          ? 'tweets'
                                          : config?.postType === 'thread'
                                            ? 'thread parts'
                                            : config?.postType === 'article'
                                              ? 'articles'
                                              : config?.postType === 'post'
                                                ? 'posts'
                                                : config?.postType === 'caption'
                                                  ? 'captions'
                                                  : 'posts'}
                                    </span>
                                  </div>
                                  <CopyButton content={response} />
                                </div>
                              )}
                              {posts.map((post, index) => (
                                <div
                                  key={index}
                                  className="relative bg-white dark:bg-kitchen-dark-surface border border-gray-200 dark:border-kitchen-dark-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                                >
                                  {post && post.trim() && (
                                    <div className="absolute top-2 right-2 z-10">
                                      <CopyButton content={post} />
                                    </div>
                                  )}
                                  <div className="flex items-center mb-3">
                                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-kitchen-dark-surface-light px-2 py-1 rounded">
                                      {config?.postType === 'tweet'
                                        ? 'Tweet'
                                        : config?.postType === 'thread'
                                          ? 'Thread Part'
                                          : config?.postType === 'article'
                                            ? 'Article'
                                            : config?.postType === 'post'
                                              ? 'Post'
                                              : config?.postType === 'caption'
                                                ? 'Caption'
                                                : 'Post'}{' '}
                                      {index + 1}
                                    </span>
                                    {post.length > 0 && (
                                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                                        {post.length} characters
                                      </span>
                                    )}
                                  </div>
                                  <HighlightableText
                                    content={post}
                                    onAddSelection={(text) => handleAddSelection(text, 'S')}
                                    column="S"
                                  />
                                </div>
                              ))}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
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
              isSubmitting={false}
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
              onRemix={onRemix}
              remixDisabled={remixDisabled}
              isRemixGenerating={isRemixGenerating}
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
}
