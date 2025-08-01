'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import TextHighlighter, { useTextHighlighter, Highlight } from './TextHighlighter';
import CopyButton from './CopyButton';
import './TextHighlighter.css';

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

interface ContainerizedAIResponseCardProps {
  content: string;
  column: string;
  onAddSelection: (text: string) => void;
  showCopyButton?: boolean;
  className?: string;
}

const ContainerizedAIResponseCard: React.FC<ContainerizedAIResponseCardProps> = ({
  content,
  column,
  onAddSelection,
  showCopyButton = true,
  className = '',
}) => {
  if (!content || content.trim() === '') {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      {showCopyButton && (
        <div className="absolute top-2 right-2 z-10">
          <CopyButton content={content} />
        </div>
      )}
      {isErrorMessage(content) ? (
        <ErrorMessage message={content} />
      ) : (
        <HighlightableText content={content} onAddSelection={onAddSelection} column={column} />
      )}
    </div>
  );
};

export default ContainerizedAIResponseCard;
