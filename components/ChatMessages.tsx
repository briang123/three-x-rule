'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SelectedSentence } from '@/app/page';
import { ModelInfo } from '@/lib/api-client';
import ChatInputWrapper from './ChatInputWrapper';
import { ModelSelection } from './ModelGridSelector';
import { useScroll } from '@/hooks/useScroll';
import { useRemixScroll } from '@/hooks/useRemixScroll';
import { useScrollPerformance } from '@/hooks/useScrollPerformance';
import useTimeout from '@/hooks/useTimeout';
import useSocialPostsBorderFadeOut from '@/hooks/useSocialPostsBorderFadeOut';
import PromptMessages from './PromptMessages';
import { SocialPostConfig, SocialPosts } from './social-platforms';
import RemixMessages from './RemixMessages';

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

const ChatMessages = React.memo(function ChatMessages({
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
  // Use the social posts border fade-out hook
  const { socialPostsBorderStates, setSocialPostsBorderStates } = useSocialPostsBorderFadeOut({
    socialPostsResponses,
    showSocialPosts,
    isSocialPostsGenerating,
    fadeOutDelay: 10000,
  });

  // Refs for smooth scrolling
  const remixRef = useRef<HTMLDivElement>(null);
  const socialPostsRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Use the enhanced scroll hook with centering enabled
  const { scrollToElement, scrollToTop } = useScroll(scrollContainerRef, {
    behavior: 'smooth',
    offset: 20,
    centerElement: true,
  });

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

  // Enhanced scroll hook provides smoothScrollToElement functionality

  // Effect to scroll to remix when it appears
  useEffect(() => {
    prevShowRemixRef.current = showRemix;
  }, [showRemix]);

  // Effect to scroll to new social posts when they appear
  useEffect(() => {
    Object.entries(showSocialPosts).forEach(([socialPostId, isVisible]) => {
      if (isVisible && !prevShowSocialPostsRef.current[socialPostId]) {
        const socialPostRef = socialPostsRefs.current[socialPostId];
        if (socialPostRef) {
          // Small delay to ensure the element is rendered
          setTimeout(() => {
            scrollToElement(socialPostRef, { center: true });
          }, 100);
        }
      }
    });
    prevShowSocialPostsRef.current = { ...showSocialPosts };
  }, [showSocialPosts, scrollToElement]);

  // Effect to scroll to new AI content when it first appears
  useEffect(() => {
    prevHasAIContentRef.current = hasAIContent;
  }, [hasAIContent]);

  // Effect to scroll to new columns when they are added
  useEffect(() => {
    prevColumnKeysRef.current = columnKeys;
  }, [columnKeys]);

  // Use scroll performance optimization hook
  useScrollPerformance(scrollContainerRef, 150);

  // Timeout hooks for scroll effects
  const remixScrollTimeout = useTimeout(
    () => {
      if (remixRef.current) {
        scrollToElement(remixRef.current, { center: true });
      }
    },
    showRemix && !prevShowRemixRef.current ? 100 : null,
  );

  const aiContentScrollTimeout = useTimeout(
    () => {
      scrollToTop();
    },
    hasAIContent && !prevHasAIContentRef.current ? 200 : null,
  );

  const columnScrollTimeout = useTimeout(
    () => {
      const newColumns = columnKeys.filter((column) => !prevColumnKeysRef.current.includes(column));
      if (newColumns.length > 0 && hasAIContent) {
        // Scroll to the last new column
        const lastNewColumn = newColumns[newColumns.length - 1];
        const columnRef = columnRefs.current[lastNewColumn];
        if (columnRef) {
          scrollToElement(columnRef, { center: true });
        }
      }
    },
    columnKeys.length > prevColumnKeysRef.current.length && hasAIContent ? 100 : null,
  );

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
          <PromptMessages
            hasAIContent={hasAIContent}
            columnKeys={columnKeys}
            columnResponses={columnResponses}
            originalResponses={originalResponses}
            isGenerating={isGenerating}
            columnModels={columnModels}
            loading={loading}
            onAddSelection={handleAddSelection}
            columnRefs={columnRefs}
            getColumnColor={getColumnColor}
          />

          <RemixMessages
            remixResponses={remixResponses}
            remixModels={remixModels}
            remixModel={remixModel}
            isRemixGenerating={isRemixGenerating}
            remixDisabled={remixDisabled}
            hasAIContent={hasAIContent}
            columnResponses={columnResponses}
            onRemix={onRemix}
            onAddSelection={handleAddSelection}
            scrollToLatestRemix={scrollToLatestRemix}
            remixResponseRefs={remixResponseRefs}
          />

          <SocialPosts
            showSocialPosts={showSocialPosts}
            socialPostsResponses={socialPostsResponses}
            isSocialPostsGenerating={isSocialPostsGenerating}
            socialPostsConfigs={socialPostsConfigs}
            socialPostsBorderStates={socialPostsBorderStates}
            onCloseSocialPosts={onCloseSocialPosts}
            onAddSelection={handleAddSelection}
            socialPostsRefs={socialPostsRefs}
          />
        </div>
      </div>

      <ChatInputWrapper
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
  );
});

export default ChatMessages;
