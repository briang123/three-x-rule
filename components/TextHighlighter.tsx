'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

// Types
export interface Highlight {
  id: string;
  text: string;
  startOffset: number;
  endOffset: number;
  color: string;
  timestamp: number;
  rects: DOMRect[]; // Store multiple rectangles for multi-line selections
  lineNumber?: number; // Store the line number for line-based highlights
}

export interface TextHighlighterProps {
  content?: string | React.ReactNode;
  highlights?: Highlight[];
  onHighlightAdd?: (highlight: Highlight) => void;
  onHighlightRemove?: (highlightId: string) => void;
  highlightColor?: string;
  className?: string;
  disabled?: boolean;
  children?: React.ReactNode;
}

// Hook for managing highlights
export const useTextHighlighter = (initialHighlights: Highlight[] = []) => {
  const [highlights, setHighlights] = useState<Highlight[]>(initialHighlights);

  const addHighlight = useCallback((highlight: Omit<Highlight, 'id' | 'timestamp'>) => {
    const newHighlight: Highlight = {
      ...highlight,
      id: `highlight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    setHighlights((prev) => [...prev, newHighlight]);
    return newHighlight;
  }, []);

  const removeHighlight = useCallback((highlightId: string) => {
    setHighlights((prev) => prev.filter((h) => h.id !== highlightId));
  }, []);

  const clearHighlights = useCallback(() => {
    setHighlights([]);
  }, []);

  const getHighlightedText = useCallback(() => {
    return highlights.map((h) => h.text).join(' ');
  }, [highlights]);

  return {
    highlights,
    addHighlight,
    removeHighlight,
    clearHighlights,
    getHighlightedText,
  };
};

// Main TextHighlighter Component
export const TextHighlighter: React.FC<TextHighlighterProps> = ({
  content,
  highlights = [],
  onHighlightAdd,
  onHighlightRemove,
  highlightColor = 'rgba(255, 255, 0, 0.4)',
  className = '',
  disabled = false,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionPreview, setSelectionPreview] = useState<{
    text: string;
    rect: DOMRect;
    lineNumber?: number;
  } | null>(null);

  // Handle mouse down to start selection
  const handleMouseDown = useCallback(() => {
    if (disabled) return;
    setIsSelecting(true);
    setSelectionPreview(null);
  }, [disabled]);

  // Handle mouse move during selection
  const handleMouseMove = useCallback(() => {
    if (!isSelecting || disabled) return;

    const selection = window.getSelection();
    if (!selection || selection.toString().trim().length === 0) {
      setSelectionPreview(null);
      return;
    }

    const selectedText = selection.toString().trim();
    if (selectedText.length > 0) {
      const range = selection.getRangeAt(0);
      const container = containerRef.current;

      if (container) {
        // Get the actual text nodes and their positions
        const startNode = range.startContainer;
        const endNode = range.endContainer;

        // Create a temporary range to get precise boundaries
        const tempRange = document.createRange();
        tempRange.setStart(startNode, range.startOffset);
        tempRange.setEnd(endNode, range.endOffset);

        const rects = tempRange.getClientRects();
        const containerRect = container.getBoundingClientRect();

        if (rects.length > 0) {
          // For preview, we'll use the first rectangle for simplicity
          const rect = rects[0];
          const relativeRect = {
            left: rect.left - containerRect.left,
            top: rect.top - containerRect.top,
            width: rect.width,
            height: rect.height,
          };

          setSelectionPreview({
            text: selectedText,
            rect: new DOMRect(
              relativeRect.left,
              relativeRect.top,
              relativeRect.width,
              relativeRect.height,
            ),
          });
        }
      }
    }
  }, [isSelecting, disabled]);

  // Handle mouse up to complete selection
  const handleMouseUp = useCallback(() => {
    if (disabled) return;

    const selection = window.getSelection();
    if (!selection || selection.toString().trim().length === 0) {
      setIsSelecting(false);
      setSelectionPreview(null);
      return;
    }

    const selectedText = selection.toString().trim();
    if (selectedText.length > 0) {
      const range = selection.getRangeAt(0);
      const container = containerRef.current;

      if (container) {
        // Get the actual text nodes and their positions
        const startNode = range.startContainer;
        const endNode = range.endContainer;

        // Create a temporary range to get precise boundaries
        const tempRange = document.createRange();
        tempRange.setStart(startNode, range.startOffset);
        tempRange.setEnd(endNode, range.endOffset);

        const rects = tempRange.getClientRects();
        const containerRect = container.getBoundingClientRect();

        if (rects.length > 0) {
          // Convert all rectangles to relative coordinates
          const relativeRects = Array.from(rects).map(
            (rect) =>
              new DOMRect(
                rect.left - containerRect.left,
                rect.top - containerRect.top,
                rect.width,
                rect.height,
              ),
          );

          const highlight: Omit<Highlight, 'id' | 'timestamp'> = {
            text: selectedText,
            startOffset: range.startOffset,
            endOffset: range.endOffset,
            color: highlightColor,
            rects: relativeRects,
          };

          if (onHighlightAdd) {
            onHighlightAdd(highlight as Highlight);
          }
        }
      }
    }

    // Clear the selection
    selection.removeAllRanges();
    setIsSelecting(false);
    setSelectionPreview(null);
  }, [disabled, onHighlightAdd, highlightColor]);

  // Add click outside handler to clear selection
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        window.getSelection()?.removeAllRanges();
        setIsSelecting(false);
        setSelectionPreview(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className={`text-highlighter-container ${className} ${
          disabled ? 'pointer-events-none' : 'cursor-text'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{ userSelect: 'text' }}
      >
        {children || content}
      </div>

      {/* Selection preview */}
      {selectionPreview && (
        <div
          className="text-highlighter-selection-preview"
          style={{
            left: selectionPreview.rect.left,
            top: selectionPreview.rect.top,
            width: selectionPreview.rect.width,
            height: selectionPreview.rect.height,
            backgroundColor: highlightColor,
          }}
        />
      )}

      {/* Highlight overlays */}
      {highlights.map((highlight) => (
        <div key={highlight.id}>
          {highlight.rects.map((rect, rectIndex) => {
            return (
              <div
                key={`${highlight.id}-${rectIndex}`}
                className="absolute pointer-events-none"
                style={{
                  left: rect.left,
                  top: rect.top,
                  width: rect.width,
                  height: rect.height,
                  backgroundColor: highlight.color,
                  borderRadius: '2px',
                  zIndex: 10,
                }}
              >
                {/* Remove button - only show on the first rectangle */}
                {rectIndex === 0 && (
                  <button
                    className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold hover:scale-110 transition-transform z-20 pointer-events-auto"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
                    onClick={() => onHighlightRemove?.(highlight.id)}
                    title="Remove highlight"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

// Export default component
export default TextHighlighter;
