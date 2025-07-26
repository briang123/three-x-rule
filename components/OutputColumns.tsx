'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { SelectedSentence } from '@/app/page';
import { ModelInfo } from '@/lib/api-client';
import ReactMarkdown from 'react-markdown';

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

// Floating Add Button Component
function FloatingAddButton({
  selectedText,
  onAdd,
  position,
  columnColor,
}: {
  selectedText: string;
  onAdd: () => void;
  position: { x: number; y: number };
  columnColor: string;
}) {
  return (
    <div
      className="fixed z-50"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <button
        onClick={onAdd}
        className={`w-8 h-8 rounded-full shadow-lg flex items-center justify-center text-white transition-all duration-200 hover:scale-110 ${columnColor}`}
        title="Add to selections"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}

// Highlightable Text Component
function HighlightableText({
  content,
  onAddSelection,
  column,
}: {
  content: string;
  onAddSelection: (text: string) => void;
  column: 'A' | 'B' | 'C';
}) {
  const [selectedText, setSelectedText] = useState('');
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [showButton, setShowButton] = useState(false);
  const [highlightedTexts, setHighlightedTexts] = useState<string[]>([]);

  const columnColors = {
    A: 'bg-blue-500 hover:bg-blue-600',
    B: 'bg-green-500 hover:bg-green-600',
    C: 'bg-purple-500 hover:bg-purple-600',
  };

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const text = selection.toString().trim();
      if (text.length > 0) {
        setSelectedText(text);

        // Get selection coordinates
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        setButtonPosition({
          x: rect.right + 10,
          y: rect.top - 20,
        });
        setShowButton(true);
      }
    } else {
      setShowButton(false);
    }
  };

  const handleAddSelection = () => {
    if (selectedText) {
      onAddSelection(selectedText);
      setHighlightedTexts((prev) => [...prev, selectedText]);
      setShowButton(false);
      setSelectedText('');
      window.getSelection()?.removeAllRanges();
    }
  };

  // Hide button when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowButton(false);
      setSelectedText('');
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div
        className={`bg-gray-50 rounded-lg p-4 border border-gray-200 select-text highlightable-text-${column.toLowerCase()}`}
        onMouseUp={handleMouseUp}
      >
        <div className="text-sm text-gray-800 markdown-content">
          <ReactMarkdown
            components={{
              // Custom components to maintain styling
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
      </div>

      {showButton && (
        <FloatingAddButton
          selectedText={selectedText}
          onAdd={handleAddSelection}
          position={buttonPosition}
          columnColor={columnColors[column]}
        />
      )}
    </div>
  );
}

interface OutputColumnsProps {
  onSentenceSelect: (sentence: SelectedSentence) => void;
  selectedSentences: SelectedSentence[];
  onModelChange?: (column: 'A' | 'B' | 'C', modelId: string) => void;
  columnResponses: {
    A: string[];
    B: string[];
    C: string[];
  };
  originalResponses: {
    A: string;
    B: string;
    C: string;
  };
  isGenerating: {
    A: boolean;
    B: boolean;
    C: boolean;
  };
}

// Simple Model Selector Component for Columns
function ColumnModelSelector({
  selectedModel,
  onModelChange,
  models,
  column,
}: {
  selectedModel: string;
  onModelChange: (model: string) => void;
  models: ModelInfo[];
  column: string;
}) {
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
                <div className="text-xs text-kitchen-text-light truncate">{model.description}</div>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default function OutputColumns({
  onSentenceSelect,
  selectedSentences,
  onModelChange,
  columnResponses,
  originalResponses,
  isGenerating,
}: OutputColumnsProps) {
  const handleAddSelection = (text: string, source: 'A' | 'B' | 'C') => {
    const selectionId = `${source}-${Date.now()}`;
    onSentenceSelect({
      id: selectionId,
      text: text,
      source: source,
    });
  };
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [columnModels, setColumnModels] = useState({
    A: '',
    B: '',
    C: '',
  });

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
          // Set default models for each column
          if (data.data.models.length > 0) {
            const defaultModels = {
              A: data.data.models[0]?.id || '',
              B: data.data.models[1]?.id || data.data.models[0]?.id || '',
              C: data.data.models[2]?.id || data.data.models[0]?.id || '',
            };
            setColumnModels(defaultModels);
            console.log('OutputColumns: Set default column models:', defaultModels);

            // Notify parent component of initial model assignments
            if (onModelChange) {
              console.log('OutputColumns: Notifying parent of initial model assignments');
              onModelChange('A', defaultModels.A);
              onModelChange('B', defaultModels.B);
              onModelChange('C', defaultModels.C);
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
  }, []);

  const handleModelChange = (column: 'A' | 'B' | 'C', modelId: string) => {
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
  };

  const isSelected = (sentenceId: string) => {
    return selectedSentences.some((s) => s.id === sentenceId);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {(['A', 'B', 'C'] as const).map((column, index) => (
        <motion.div
          key={column}
          className="kitchen-card p-6 flex flex-col h-full overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: index * 0.1 }}
        >
          <div className="flex items-center justify-between mb-4 flex-shrink-0 min-h-0">
            <div className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-lg font-semibold
                ${column === 'A' ? 'bg-blue-500' : column === 'B' ? 'bg-green-500' : 'bg-purple-500'}`}
              >
                {column}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {loading ? (
                <div className="px-3 py-1 bg-kitchen-light-gray border border-kitchen-light-gray rounded-lg text-sm text-kitchen-text-light flex items-center space-x-2">
                  <div className="w-3 h-3 border border-kitchen-text-light border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading models...</span>
                </div>
              ) : (
                <ColumnModelSelector
                  selectedModel={columnModels[column]}
                  onModelChange={(modelId) => handleModelChange(column, modelId)}
                  models={models}
                  column={column}
                />
              )}
            </div>
          </div>

          {/* Responses Display */}
          <div className="output-column-scroll pr-2 flex-1 min-h-0 max-h-full">
            <div className="space-y-3">
              {isGenerating[column] && (
                <div className="text-center text-blue-600 py-4">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
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
                      content={originalResponses[column] || columnResponses[column].join('\n\n')}
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
    </div>
  );
}
