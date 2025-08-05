'use client';

import React, { useEffect, useRef, useCallback, useMemo } from 'react';
import { SelectedSentence } from '@/hooks';
import ChatInputWrapper from './ChatInputWrapper';
import { ModelSelection } from './ModelGridSelector';
import {
  useScrollEffectsWithState,
  useSocialPostsBorderFadeOut,
  useModelOrchestration,
  useModels,
} from '@/hooks';
import PromptMessages from './PromptMessages';
import { SocialPostConfig, SocialPosts } from './social-platforms';
import RemixMessages from './RemixMessages';

// Core message data props
interface MessageDataProps {
  messageResponses: {
    [key: string]: string[];
  };
  originalResponses: {
    [key: string]: string;
  };
  isGenerating: {
    [key: string]: boolean;
  };
  messageModels?: { [key: string]: string };
}

// Remix functionality props
interface RemixProps {
  remixResponses?: string[][];
  remixModels?: string[];
  showRemix?: boolean;
  remixModel?: string;
  onRemix?: (modelId: string) => void;
  remixDisabled?: boolean;
  isRemixGenerating?: boolean;
}

// Social posts functionality props
interface SocialPostsProps {
  socialPostsResponses?: { [key: string]: string };
  isSocialPostsGenerating?: { [key: string]: boolean };
  showSocialPosts?: { [key: string]: boolean };
  onCloseSocialPosts?: (socialPostId: string) => void;
  socialPostsConfigs?: { [key: string]: SocialPostConfig };
}

// Chat input and submission props
interface ChatInputProps {
  onSubmit: (prompt: string, attachments?: File[]) => void;
  currentMessage?: string;
}

// Model selection and management props
interface ModelSelectionProps {
  modelSelections?: ModelSelection[];
  onModelSelect?: (modelId: string) => void;
  onModelSelectionsUpdate?: (modelId: string) => void;
  onDirectSubmit?: (prompt: string, modelId: string) => void;
  onRestoreModelSelection?: () => void;
  showAISelection?: boolean;
  onToggleAISelection?: () => void;
  resetModelSelector?: boolean;
  onModelSelectionClick?: () => void;
  isUsingDefaultModel?: boolean;
}

// UI state and navigation props
interface UIStateProps {
  isLeftNavCollapsed?: boolean;
}

// Event handler props
interface EventHandlerProps {
  onSentenceSelect: (sentence: SelectedSentence) => void;
}

// Combined interface
interface ChatMessagesProps
  extends MessageDataProps,
    RemixProps,
    SocialPostsProps,
    ChatInputProps,
    ModelSelectionProps,
    UIStateProps,
    EventHandlerProps {}

// Note: Removed ColumnModelSelector component since we now use the 3x3 grid system

const ChatMessages = React.memo(function ChatMessages({
  onSentenceSelect,
  messageResponses,
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
  messageModels = {},
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

  // Determine if we should show the 3x3 grid or output messages
  const hasAIContent = useMemo(() => {
    // Check if there's any AI-generated content
    const hasMessageContent = Object.values(originalResponses).some(
      (response) => response.trim() !== '',
    );
    const hasRemixContent = remixResponses.length > 0;
    const hasSocialContent = Object.values(socialPostsResponses).some(
      (response) => response.trim() !== '',
    );

    return hasMessageContent || hasRemixContent || hasSocialContent;
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

  const { models, loading } = useModels();

  // Use the social posts border fade-out hook
  const { socialPostsBorderStates, setSocialPostsBorderStates } = useSocialPostsBorderFadeOut({
    socialPostsResponses,
    showSocialPosts,
    isSocialPostsGenerating,
    fadeOutDelay: 10000,
  });

  // Get all message keys from messageResponses prop
  const messageKeys = Object.keys(messageResponses);

  // Use the consolidated scroll effects hook
  const {
    scrollToElement,
    scrollToTop,
    scrollContainerRef,
    remixResponseRefs,
    scrollToLatestRemix,
    socialPostsRefs,
    messageRefs,
    // State tracking
    prevShowRemixRef,
    prevShowSocialPostsRef,
    prevHasAIContentRef,
    prevMessageKeysRef,
    // Timeout refs
    remixScrollTimeout,
    aiContentScrollTimeout,
    newMessagesScrollTimeout,
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
    newMessagesScrollDelay: 100,
  });

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

  // Effect to scroll to new messages when they are added
  useEffect(() => {
    prevMessageKeysRef.current = messageKeys;
  }, [messageKeys]);

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
  }, [showRemix, scrollToElement]);

  useEffect(() => {
    if (hasAIContent && !prevHasAIContentRef.current) {
      aiContentScrollTimeout.current = setTimeout(() => {
        scrollToTop();
      }, 200);
    }
  }, [hasAIContent, scrollToTop]);

  useEffect(() => {
    if (messageKeys.length > prevMessageKeysRef.current.length && hasAIContent) {
      newMessagesScrollTimeout.current = setTimeout(() => {
        const newMessages = messageKeys.filter(
          (message) => !prevMessageKeysRef.current.includes(message),
        );
        if (newMessages.length > 0) {
          // Scroll to the last new message
          const lastNewMessage = newMessages[newMessages.length - 1];
          const messageRef = messageRefs.current[lastNewMessage];
          if (messageRef) {
            scrollToElement(messageRef, { center: true });
          }
        }
      }, 100);
    }
  }, [messageKeys, hasAIContent, scrollToElement]);

  const getMessageColor = (message: string) => {
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
    return colors[message as keyof typeof colors] || 'bg-gray-500';
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
            messageKeys={messageKeys}
            messageResponses={messageResponses}
            originalResponses={originalResponses}
            isGenerating={isGenerating}
            messageModels={messageModels}
            loading={loading}
            onAddSelection={handleAddSelection}
            messageRefs={messageRefs}
            getMessageColor={getMessageColor}
          />

          <RemixMessages
            remixResponses={remixResponses}
            remixModels={remixModels}
            remixModel={remixModel}
            isRemixGenerating={isRemixGenerating}
            remixDisabled={remixDisabled}
            hasAIContent={hasAIContent}
            messageResponses={messageResponses}
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
