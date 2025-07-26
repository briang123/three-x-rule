'use client';

import { motion } from 'framer-motion';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SelectedSentence } from '@/app/page';
import { ModelInfo } from '@/lib/api-client';
import ReactMarkdown from 'react-markdown';
import TextHighlighter, { useTextHighlighter, Highlight } from './TextHighlighter';
import { TypingIndicator } from './TypingIndicator';
import './TextHighlighter.css';

const generationMessages = [
  'The stage is yours. Choose a model, enter a prompt, get delighted!',
  'Try the same prompt with a different model - you might be surprised.',
  "Every model has its own voice. Let's hear another take.",
  'Same prompt, new perspective. Spin it again.',
  'Keep going - no two models think alike.',
  'Stack the outputs. Compare, remix, or build something better.',
  "The magic's in the mix. One prompt, many minds.",
  'Different models, different vibes. Which reply stands out?',
  "You're building a wall of ideas. What will you pull from each?",
  'Let the models riff on your prompt. Pick your favorite parts.',
  'Ten in - your prompt just sparked a creative swarm.',
  "You're basically conducting a panel of AIs. Keep them talking.",
  'This is where divergence becomes discovery.',
  'Let each model take a shot - then blend the best.',
  'Prompt once, learn from many. Try another model.',
  'Another voice, another angle. What does *this* one see?',
  "You're curating a collection - each output adds depth.",
  'Think of these as alternate drafts. Which version resonates?',
  'The remix potential is huge here. Keep them coming.',
  'See how far a single prompt can stretch. One more model?',
  "You've got a gallery of ideas now. Add another brushstroke.",
  'Each new model is a lens. Same prompt, fresh focus.',
  'This is collaborative AI - many minds, one seed idea.',
  'What happens when you fuse the best lines from each?',
  'Twenty-five versions deep. Your prompt has range!',
];

const getGenerationMessageForColumn = (index: number): string => {
  if (index >= generationMessages.length) {
    return generationMessages[generationMessages.length - 1];
  }
  return generationMessages[index];
};

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
    '1': 'rgba(59, 130, 246, 0.3)', // blue
    '2': 'rgba(34, 197, 94, 0.3)', // green
    '3': 'rgba(168, 85, 247, 0.3)', // purple
    '4': 'rgba(239, 68, 68, 0.3)', // red
    '5': 'rgba(245, 158, 11, 0.3)', // orange
    '6': 'rgba(16, 185, 129, 0.3)', // emerald
  };

  const handleHighlightAdd = (highlight: Highlight) => {
    // Disabled text selection functionality
    return;
  };

  const handleHighlightRemove = (highlightId: string) => {
    removeHighlight(highlightId);
  };

  return (
    <div className="relative">
      <TextHighlighter
        highlights={[]}
        onHighlightAdd={() => {}}
        onHighlightRemove={() => {}}
        highlightColor={
          columnColors[column as keyof typeof columnColors] || 'rgba(156, 163, 175, 0.3)'
        }
        className={`bg-gray-50 rounded-lg p-4 border border-gray-200 select-none highlightable-text-${column}`}
        disabled={true}
      >
        <div className="text-sm text-gray-800 markdown-content">
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
  onDeleteColumn?: (columnKey: string) => void;
}

// Simple Model Selector Component for Columns
const ColumnModelSelector = React.memo(
  ({
    selectedModel,
    onModelChange,
    models,
    column,
  }: {
    selectedModel: string;
    onModelChange: (model: string) => void;
    models: ModelInfo[];
    column: string;
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        if (!target.closest('.model-selector')) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    if (models.length === 0) {
      return (
        <div className="px-3 py-1 bg-kitchen-light-gray border border-kitchen-light-gray rounded-lg text-sm text-kitchen-text-light">
          No models available
        </div>
      );
    }

    return (
      <div className="relative model-selector">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 px-3 py-1 bg-kitchen-white border border-kitchen-light-gray rounded-lg text-sm hover:border-kitchen-primary transition-colors"
        >
          <span className="text-kitchen-text">
            {models.find((m) => m.id === selectedModel)?.name || 'Select Model'}
          </span>
          <svg
            className={`w-4 h-4 text-kitchen-text transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 mt-1 w-64 bg-kitchen-white border border-kitchen-light-gray rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
          >
            <div className="p-2 space-y-1">
              {models.map((model) => (
                <button
                  key={model.id}
                  onClick={() => {
                    onModelChange(model.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-sm transition-colors ${
                    selectedModel === model.id
                      ? 'bg-kitchen-primary/10 text-kitchen-primary'
                      : 'hover:bg-kitchen-light-gray text-kitchen-text'
                  }`}
                >
                  <div className="font-medium">{model.name}</div>
                  <div className="text-xs text-kitchen-text-light whitespace-normal break-words">
                    {model.description}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    );
  },
);

export default function OutputColumns({
  onSentenceSelect,
  selectedSentences,
  onModelChange,
  columnResponses,
  originalResponses,
  isGenerating,
  onAddColumn,
  onDeleteColumn,
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
  const [columnModels, setColumnModels] = useState<{ [key: string]: string }>({});
  const [initialized, setInitialized] = useState(false);

  // Carousel functionality
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Get all column keys from columnResponses prop
  const columnKeys = Object.keys(columnResponses);

  // Use ref to track previous columnModels to avoid infinite re-renders
  const prevColumnModelsRef = useRef<{ [key: string]: string }>({});
  // Use ref to track column keys to prevent infinite re-renders
  const prevColumnKeysRef = useRef<string[]>([]);

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

          // Set default models for each column only once
          if (data.data.models.length > 0 && !initialized) {
            const defaultModels: { [key: string]: string } = {};
            columnKeys.forEach((column, index) => {
              defaultModels[column] =
                data.data.models[index % data.data.models.length]?.id ||
                data.data.models[0]?.id ||
                '';
            });
            setColumnModels(defaultModels);
            setInitialized(true);
            console.log('OutputColumns: Set default column models:', defaultModels);

            // Notify parent component of initial model assignments only once
            if (onModelChange) {
              console.log('OutputColumns: Notifying parent of initial model assignments');
              Object.entries(defaultModels).forEach(([column, modelId]) => {
                onModelChange(column, modelId);
              });
            }
          }
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
  }, [initialized]); // Only run when initialized changes, not when columnResponses changes

  // Handle new columns being added
  useEffect(() => {
    if (models.length > 0 && initialized) {
      const newColumns = columnKeys.filter((column) => !(column in prevColumnModelsRef.current));
      if (newColumns.length > 0) {
        const updatedModels = { ...prevColumnModelsRef.current };
        newColumns.forEach((column, index) => {
          updatedModels[column] = models[index % models.length]?.id || models[0]?.id || '';
        });
        setColumnModels(updatedModels);
        prevColumnModelsRef.current = updatedModels;

        // Notify parent of new column model assignments
        if (onModelChange) {
          newColumns.forEach((column) => {
            onModelChange(column, updatedModels[column]);
          });
        }
      }
    }
  }, [columnKeys, models, initialized]);

  // Sync the ref with columnModels state
  useEffect(() => {
    prevColumnModelsRef.current = columnModels;
  }, [columnModels]);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, [columnResponses]);

  const handleModelChange = useCallback(
    (column: string, modelId: string) => {
      console.log(`OutputColumns: Model changed for column ${column}: ${modelId}`);
      setColumnModels((prev) => ({
        ...prev,
        [column]: modelId,
      }));

      // Notify parent component of model change
      if (onModelChange) {
        console.log(
          `OutputColumns: Notifying parent of model change for column ${column}: ${modelId}`,
        );
        onModelChange(column, modelId);
      }
    },
    [onModelChange],
  );

  const isSelected = (sentenceId: string) => {
    return selectedSentences.some((s) => s.id === sentenceId);
  };

  const getColumnColor = (column: string) => {
    const colors = {
      '1': 'bg-blue-500',
      '2': 'bg-green-500',
      '3': 'bg-purple-500',
      '4': 'bg-red-500',
      '5': 'bg-orange-500',
      '6': 'bg-emerald-500',
    };
    return colors[column as keyof typeof colors] || 'bg-gray-500';
  };

  return (
    <div className="relative w-full">
      {/* Carousel Container */}
      <div
        className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth py-6 [scrollbar-width:none]"
        ref={carouselRef}
        onScroll={checkScrollability}
      >
        <div className="flex flex-row justify-start gap-6 pl-6 pr-6">
          {columnKeys.map((column, index) => (
            <motion.div
              key={column}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index, ease: 'easeOut' }}
              className="kitchen-card p-6 flex flex-col overflow-hidden min-w-[400px] max-w-[400px] flex-shrink-0 column-container"
            >
              <div className="flex items-center justify-between mb-4 flex-shrink-0 min-h-0">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-lg font-semibold ${getColumnColor(column)}`}
                  >
                    {column}
                  </div>
                  {/* Model Selector */}
                  <ColumnModelSelector
                    selectedModel={columnModels[column] || ''}
                    onModelChange={(modelId) => handleModelChange(column, modelId)}
                    models={models}
                    column={column}
                  />
                </div>
                {/* Delete Button: Only show if more than one column */}
                {onDeleteColumn && columnKeys.length > 1 && (
                  <button
                    onClick={() => onDeleteColumn(column)}
                    className="ml-2 p-2 rounded-full hover:bg-red-100 transition-colors text-red-500 focus:outline-none focus:ring-2 focus:ring-red-300"
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
              <div className="output-column-scroll pr-2 column-content">
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
                      <p>{getGenerationMessageForColumn(index)}</p>
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
                        content={originalResponses[column] || columnResponses[column].join('\n\n')}
                        onAddSelection={(text) => handleAddSelection(text, column)}
                        column={column}
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Add Column Button */}
          {onAddColumn && columnKeys.length < 6 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * columnKeys.length, ease: 'easeOut' }}
              className="kitchen-card p-6 flex flex-col items-center justify-center min-w-[400px] max-w-[400px] flex-shrink-0 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer column-container"
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
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-4 px-6">
        <button
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          onClick={scrollLeft}
          disabled={!canScrollLeft}
        >
          <svg
            className="h-6 w-6 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          onClick={scrollRight}
          disabled={!canScrollRight}
        >
          <svg
            className="h-6 w-6 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
