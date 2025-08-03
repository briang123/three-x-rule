'use client';

import { useState, useCallback } from 'react';
import TopBar from '@/components/TopBar';
import LeftNavigation from '@/components/LeftNavigation';
import HeaderText from '@/components/HeaderText';
import AuroraBackground from '@/components/AuroraBackground';
import MainContent from '@/components/MainContent';
import SocialPostsDrawer from '@/components/SocialPostsDrawer';
import ModelSelectionModal from '@/components/ModelSelectionModal';
import {
  useChatState,
  useRemixState,
  useSocialPostsState,
  useModelSelectionState,
  useUIState,
  useEventHandlers,
  useComputedValues,
  useEffects,
  useResetHandlers,
  useToggleHandlers,
} from '@/hooks';
import { PendingOrchestration } from '@/lib/types';

// Main component
export default function Home() {
  // State management
  const chatState = useChatState();
  const remixState = useRemixState();
  const socialPostsState = useSocialPostsState();
  const modelSelectionState = useModelSelectionState();
  const uiState = useUIState();

  const [pendingOrchestration, setPendingOrchestration] = useState<PendingOrchestration | null>(
    null,
  );

  // Destructure state for easier access
  const {
    selectedSentences,
    setSelectedSentences,
    messageModels,
    setMessageModels,
    messageResponses,
    setMessageResponses,
    originalResponses,
    setOriginalResponses,
    isGenerating,
    setIsGenerating,
    currentMessage,
    setCurrentMessage,
    chatKey,
    resetChatState,
  } = chatState;

  const {
    remixResponses,
    setRemixResponses,
    remixModels,
    setRemixModels,
    isRemixGenerating,
    setIsRemixGenerating,
    showRemix,
    setShowRemix,
    remixModel,
    setRemixModel,
    resetRemixState,
  } = remixState;

  const {
    showSocialPostsDrawer,
    setShowSocialPostsDrawer,
    socialPostsResponses,
    setSocialPostsResponses,
    isSocialPostsGenerating,
    setIsSocialPostsGenerating,
    showSocialPosts,
    setShowSocialPosts,
    socialPostsConfigs,
    setSocialPostsConfigs,
    resetSocialPostsState,
  } = socialPostsState;

  const {
    modelSelections,
    setModelSelections,
    showAISelection,
    setShowAISelection,
    resetModelSelector,
    setResetModelSelector,
    showModelSelectionModal,
    setShowModelSelectionModal,
    isUsingDefaultModel,
    setIsUsingDefaultModel,
    resetModelSelectionState,
  } = modelSelectionState;

  const { showRightPanel, isLeftNavCollapsed, setIsLeftNavCollapsed, auroraConfig } = uiState;

  // Custom hooks
  const eventHandlers = useEventHandlers({
    setSelectedSentences,
    setCurrentMessage,
    setMessageModels,
    setMessageResponses,
    setOriginalResponses,
    setIsGenerating,
    setRemixResponses,
    setRemixModels,
    setIsRemixGenerating,
    setShowRemix,
    setRemixModel,
    setSocialPostsResponses,
    setIsSocialPostsGenerating,
    setShowSocialPosts,
    setSocialPostsConfigs,
    setModelSelections,
    setIsUsingDefaultModel,
    setShowModelSelectionModal,
    setIsLeftNavCollapsed,
    messageResponses,
    originalResponses,
    isGenerating,
    currentMessage,
    modelSelections,
    pendingOrchestration,
    setPendingOrchestration,
  });

  const computedValues = useComputedValues({
    messageResponses,
    originalResponses,
    isGenerating,
    currentMessage,
    modelSelections,
    isUsingDefaultModel,
  });

  const resetHandlers = useResetHandlers({
    resetChatState,
    resetRemixState,
    resetSocialPostsState,
    resetModelSelectionState,
  });

  const toggleHandlers = useToggleHandlers({
    setShowAISelection,
    setMessageModels,
    setMessageResponses,
    setOriginalResponses,
    setIsGenerating,
    modelSelections,
  });

  // Effects
  useEffects({
    pendingOrchestration,
    setPendingOrchestration,
    modelSelections,
    handleDirectSubmit: eventHandlers.handleDirectSubmit,
    setShowModelSelectionModal,
  });

  // Event handlers
  const handleModelSelectionClick = useCallback(() => {
    setShowModelSelectionModal(true);
  }, [setShowModelSelectionModal]);

  const handleRemoveSentence = useCallback(
    (id: string) => {
      setSelectedSentences((prev) => prev.filter((s) => s.id !== id));
    },
    [setSelectedSentences],
  );

  const handleResetModelSelector = useCallback(() => {
    setResetModelSelector(true);
    setTimeout(() => setResetModelSelector(false), 100);
  }, [setResetModelSelector]);

  return (
    <AuroraBackground
      colorStops={auroraConfig.colorStops}
      speed={auroraConfig.speed}
      blend={auroraConfig.blend}
      amplitude={auroraConfig.amplitude}
    >
      <div className="flex h-screen transition-colors duration-200">
        <LeftNavigation
          isCollapsed={isLeftNavCollapsed}
          onToggleCollapse={eventHandlers.handleLeftNavToggle}
        />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar
            onNewChat={resetHandlers.handleNewChat}
            onSocialPosts={() => setShowSocialPostsDrawer(true)}
          />
          <MainContent
            chatKey={chatKey}
            messageResponses={messageResponses}
            originalResponses={originalResponses}
            isGenerating={isGenerating}
            currentMessage={currentMessage}
            selectedSentences={selectedSentences}
            messageModels={messageModels}
            remixResponses={remixResponses}
            remixModels={remixModels}
            isRemixGenerating={isRemixGenerating}
            showRemix={showRemix}
            remixModel={remixModel}
            socialPostsResponses={socialPostsResponses}
            isSocialPostsGenerating={isSocialPostsGenerating}
            showSocialPosts={showSocialPosts}
            socialPostsConfigs={socialPostsConfigs}
            modelSelections={modelSelections}
            showAISelection={showAISelection}
            isUsingDefaultModel={isUsingDefaultModel}
            showRightPanel={showRightPanel}
            isLeftNavCollapsed={isLeftNavCollapsed}
            isHeaderVisible={computedValues.isHeaderVisible}
            isRemixDisabled={computedValues.isRemixDisabled}
            onSentenceSelect={eventHandlers.handleSentenceSelect}
            onCloseSocialPosts={eventHandlers.handleCloseSocialPosts}
            onSubmit={eventHandlers.handleSubmit}
            onRemix={eventHandlers.handleRemix}
            onModelSelectionsUpdate={eventHandlers.handleModelSelectionsUpdate}
            onDirectSubmit={eventHandlers.handleDirectSubmit}
            onToggleAISelection={toggleHandlers.handleToggleAISelection}
            onModelSelectionClick={handleModelSelectionClick}
            onRemoveSentence={handleRemoveSentence}
            resetModelSelector={handleResetModelSelector}
          />
        </div>

        <SocialPostsDrawer
          isOpen={showSocialPostsDrawer}
          onClose={() => setShowSocialPostsDrawer(false)}
          onGenerate={eventHandlers.handleSocialPostsGenerate}
          availableMessages={originalResponses}
        />

        <ModelSelectionModal
          isOpen={showModelSelectionModal}
          onClose={() => setShowModelSelectionModal(false)}
          onModelSelectionsChange={eventHandlers.handleModelSelectionsChange}
          initialSelections={modelSelections}
          disabled={computedValues.isGeneratingAny}
        />
      </div>
    </AuroraBackground>
  );
}
