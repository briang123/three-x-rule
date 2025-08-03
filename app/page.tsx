'use client';

import { useState, useCallback, createContext, useContext } from 'react';
import TopBar from '@/components/TopBar';
import LeftNavigation from '@/components/LeftNavigation';
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

// Create a context for the app state to reduce prop drilling
interface AppContextType {
  // Chat state
  chatState: ReturnType<typeof useChatState>;
  remixState: ReturnType<typeof useRemixState>;
  socialPostsState: ReturnType<typeof useSocialPostsState>;
  modelSelectionState: ReturnType<typeof useModelSelectionState>;
  uiState: ReturnType<typeof useUIState>;

  // Computed values
  computedValues: ReturnType<typeof useComputedValues>;

  // Event handlers
  eventHandlers: ReturnType<typeof useEventHandlers>;
  resetHandlers: ReturnType<typeof useResetHandlers>;
  toggleHandlers: ReturnType<typeof useToggleHandlers>;

  // Local state
  pendingOrchestration: PendingOrchestration | null;
  setPendingOrchestration: React.Dispatch<React.SetStateAction<PendingOrchestration | null>>;
}

const AppContext = createContext<AppContextType | null>(null);

// Custom hook to use the app context
export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

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

  // Custom hooks
  const eventHandlers = useEventHandlers({
    setSelectedSentences: chatState.setSelectedSentences,
    setCurrentMessage: chatState.setCurrentMessage,
    setMessageModels: chatState.setMessageModels,
    setMessageResponses: chatState.setMessageResponses,
    setOriginalResponses: chatState.setOriginalResponses,
    setIsGenerating: chatState.setIsGenerating,
    setRemixResponses: remixState.setRemixResponses,
    setRemixModels: remixState.setRemixModels,
    setIsRemixGenerating: remixState.setIsRemixGenerating,
    setShowRemix: remixState.setShowRemix,
    setRemixModel: remixState.setRemixModel,
    setSocialPostsResponses: socialPostsState.setSocialPostsResponses,
    setIsSocialPostsGenerating: socialPostsState.setIsSocialPostsGenerating,
    setShowSocialPosts: socialPostsState.setShowSocialPosts,
    setSocialPostsConfigs: socialPostsState.setSocialPostsConfigs,
    setModelSelections: modelSelectionState.setModelSelections,
    setIsUsingDefaultModel: modelSelectionState.setIsUsingDefaultModel,
    setShowModelSelectionModal: modelSelectionState.setShowModelSelectionModal,
    setIsLeftNavCollapsed: uiState.setIsLeftNavCollapsed,
    messageResponses: chatState.messageResponses,
    originalResponses: chatState.originalResponses,
    isGenerating: chatState.isGenerating,
    currentMessage: chatState.currentMessage,
    modelSelections: modelSelectionState.modelSelections,
    pendingOrchestration,
    setPendingOrchestration,
  });

  const computedValues = useComputedValues({
    messageResponses: chatState.messageResponses,
    originalResponses: chatState.originalResponses,
    isGenerating: chatState.isGenerating,
    currentMessage: chatState.currentMessage,
    modelSelections: modelSelectionState.modelSelections,
    isUsingDefaultModel: modelSelectionState.isUsingDefaultModel,
  });

  const resetHandlers = useResetHandlers({
    resetChatState: chatState.resetChatState,
    resetRemixState: remixState.resetRemixState,
    resetSocialPostsState: socialPostsState.resetSocialPostsState,
    resetModelSelectionState: modelSelectionState.resetModelSelectionState,
  });

  const toggleHandlers = useToggleHandlers({
    setShowAISelection: modelSelectionState.setShowAISelection,
    setMessageModels: chatState.setMessageModels,
    setMessageResponses: chatState.setMessageResponses,
    setOriginalResponses: chatState.setOriginalResponses,
    setIsGenerating: chatState.setIsGenerating,
    modelSelections: modelSelectionState.modelSelections,
  });

  // Effects
  useEffects({
    pendingOrchestration,
    setPendingOrchestration,
    modelSelections: modelSelectionState.modelSelections,
    handleDirectSubmit: eventHandlers.handleDirectSubmit,
    setShowModelSelectionModal: modelSelectionState.setShowModelSelectionModal,
  });

  // Event handlers
  const handleModelSelectionClick = useCallback(() => {
    modelSelectionState.setShowModelSelectionModal(true);
  }, [modelSelectionState.setShowModelSelectionModal]);

  const handleRemoveSentence = useCallback(
    (id: string) => {
      chatState.setSelectedSentences((prev) => prev.filter((s) => s.id !== id));
    },
    [chatState.setSelectedSentences],
  );

  // Context value
  const contextValue: AppContextType = {
    chatState,
    remixState,
    socialPostsState,
    modelSelectionState,
    uiState,
    computedValues,
    eventHandlers,
    resetHandlers,
    toggleHandlers,
    pendingOrchestration,
    setPendingOrchestration,
  };

  return (
    <AppContext.Provider value={contextValue}>
      <AuroraBackground
        colorStops={uiState.auroraConfig.colorStops}
        speed={uiState.auroraConfig.speed}
        blend={uiState.auroraConfig.blend}
        amplitude={uiState.auroraConfig.amplitude}
      >
        <div className="flex h-screen transition-colors duration-200">
          <LeftNavigation
            isCollapsed={uiState.isLeftNavCollapsed}
            onToggleCollapse={eventHandlers.handleLeftNavToggle}
          />
          <div className="flex flex-1 flex-col overflow-hidden">
            <TopBar
              onNewChat={resetHandlers.handleNewChat}
              onSocialPosts={() => socialPostsState.setShowSocialPostsDrawer(true)}
            />
            <MainContent
              onModelSelectionClick={handleModelSelectionClick}
              onRemoveSentence={handleRemoveSentence}
            />
          </div>

          <SocialPostsDrawer
            isOpen={socialPostsState.showSocialPostsDrawer}
            onClose={() => socialPostsState.setShowSocialPostsDrawer(false)}
            onGenerate={eventHandlers.handleSocialPostsGenerate}
            availableMessages={chatState.originalResponses}
          />

          <ModelSelectionModal
            isOpen={modelSelectionState.showModelSelectionModal}
            onClose={() => modelSelectionState.setShowModelSelectionModal(false)}
            onModelSelectionsChange={eventHandlers.handleModelSelectionsChange}
            initialSelections={modelSelectionState.modelSelections}
            disabled={computedValues.isGeneratingAny}
          />
        </div>
      </AuroraBackground>
    </AppContext.Provider>
  );
}
