'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { SelectedSentence } from '@/app/page';
import { ModelInfo } from '@/lib/api-client';
import ChatInputWrapper from './ChatInputWrapper';
import { ModelSelection } from './ModelGridSelector';
import {
  useScrollEffectsWithState,
  useSocialPostsBorderFadeOut,
  useModelOrchestration,
} from '@/hooks';
import PromptMessages from './PromptMessages';
import { SocialPostConfig, SocialPosts } from './social-platforms';
import RemixMessages from './RemixMessages';

interface ChatMessagesProps {
  onSentenceSelect: (sentence: SelectedSentence) => void;
  columnResponses: {
    [key: string]: string[];
  };
  originalResponses: {
    [key: string]: string;
  };
  isGenerating: {
    [key: string]: boolean;
  };
  // Remix props
  remixResponses?: string[];
  remixModels?: string[];
  showRemix?: boolean;
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
  columnResponses,
  originalResponses,
  isGenerating,
  remixResponses = [],
  remixModels = [],
  showRemix = false,
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
  modelSelections = [],
  columnModels = {},
  onModelSelect,
  onModelSelectionsUpdate,
  onDirectSubmit,
  onRestoreModelSelection,
  showAISelection = true,
  onToggleAISelection,
  resetModelSelector = false,
  onModelSelectionClick,
  isUsingDefaultModel = false,
  isLeftNavCollapsed = true,
}: ChatMessagesProps) {
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

  // Use the model orchestration hook
  const {
    showModelBadges,
    hasSubmitted,
    handleSubmitWithOrchestration,
    handleRestoreModelSelection,
    handleModelConfirmedOrchestration,
    handleModelSelectorAnimationComplete,
  } = useModelOrchestration({
    showAISelection,
    onToggleAISelection,
    onRestoreModelSelection,
    resetModelSelector,
    modelSelections,
    hasAIContent,
    onSubmit,
  });

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

  // Get all column keys from columnResponses prop
  const columnKeys = Object.keys(columnResponses);

  // Use the consolidated scroll effects hook
  const {
    scrollToElement,
    scrollToTop,
    scrollContainerRef,
    remixResponseRefs,
    scrollToLatestRemix,
    socialPostsRefs,
    columnRefs,
    // State tracking
    prevShowRemixRef,
    prevShowSocialPostsRef,
    prevHasAIContentRef,
    prevColumnKeysRef,
    // Timeout refs
    remixScrollTimeout,
    aiContentScrollTimeout,
    newColumnsScrollTimeout,
    socialPostsScrollTimeout,
  } = useScrollEffectsWithState(undefined, {
    scrollOptions: {
      behavior: 'smooth',
      offset: 20,
      centerElement: true,
    },
    performanceDelay: 150,
    remixScrollDelay: 100,
    socialPostsScrollDelay: 100,
    aiContentScrollDelay: 200,
    newColumnsScrollDelay: 100,
  });

  // Effect to scroll to remix when it appears
  useEffect(() => {
    prevShowRemixRef.current = showRemix;
  }, [showRemix, prevShowRemixRef]);

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
  }, [showSocialPosts, scrollToElement, prevShowSocialPostsRef, socialPostsRefs]);

  // Effect to scroll to new AI content when it first appears
  useEffect(() => {
    prevHasAIContentRef.current = hasAIContent;
  }, [hasAIContent, prevHasAIContentRef]);

  // Effect to scroll to new columns when they are added
  useEffect(() => {
    prevColumnKeysRef.current = columnKeys;
  }, [columnKeys, prevColumnKeysRef]);

  // Set up timeout triggers for scroll effects
  useEffect(() => {
    if (showRemix && !prevShowRemixRef.current) {
      remixScrollTimeout.current = setTimeout(() => {
        const keys = Object.keys(remixResponseRefs.current)
          .map(Number)
          .sort((a, b) => b - a);
        const latestIndex = keys[0];
        if (latestIndex !== undefined && remixResponseRefs.current[latestIndex]) {
          scrollToElement(remixResponseRefs.current[latestIndex], { center: true });
        }
      }, 100);
    }
  }, [showRemix, prevShowRemixRef, remixScrollTimeout, remixResponseRefs, scrollToElement]);

  useEffect(() => {
    if (hasAIContent && !prevHasAIContentRef.current) {
      aiContentScrollTimeout.current = setTimeout(() => {
        scrollToTop();
      }, 200);
    }
  }, [hasAIContent, prevHasAIContentRef, aiContentScrollTimeout, scrollToTop]);

  useEffect(() => {
    if (columnKeys.length > prevColumnKeysRef.current.length && hasAIContent) {
      newColumnsScrollTimeout.current = setTimeout(() => {
        const newColumns = columnKeys.filter(
          (column) => !prevColumnKeysRef.current.includes(column),
        );
        if (newColumns.length > 0) {
          // Scroll to the last new column
          const lastNewColumn = newColumns[newColumns.length - 1];
          const columnRef = columnRefs.current[lastNewColumn];
          if (columnRef) {
            scrollToElement(columnRef, { center: true });
          }
        }
      }, 100);
    }
  }, [
    columnKeys,
    prevColumnKeysRef,
    hasAIContent,
    newColumnsScrollTimeout,
    columnRefs,
    scrollToElement,
  ]);

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
