import { useCallback } from 'react';
import ChatMessages from './ChatMessages';
import RightSelectionsPanel from './RightSelectionsPanel';
import { useAppContext } from '@/app/page';

interface MainContentProps {
  onModelSelectionClick: () => void;
  onRemoveSentence: (id: string) => void;
}

export default function MainContent({ onModelSelectionClick, onRemoveSentence }: MainContentProps) {
  const {
    chatState,
    remixState,
    socialPostsState,
    modelSelectionState,
    uiState,
    computedValues,
    eventHandlers,
    toggleHandlers,
  } = useAppContext();

  const handleRemoveSentence = useCallback(
    (id: string) => {
      onRemoveSentence(id);
    },
    [onRemoveSentence],
  );

  return (
    <div className="flex flex-1 overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 p-6 pb-0 h-full">
          <ChatMessages
            key={chatState.chatKey}
            onSentenceSelect={eventHandlers.handleSentenceSelect}
            messageResponses={chatState.messageResponses}
            originalResponses={chatState.originalResponses}
            isGenerating={chatState.isGenerating}
            remixResponses={remixState.remixResponses}
            remixModels={remixState.remixModels}
            isRemixGenerating={remixState.isRemixGenerating}
            showRemix={remixState.showRemix}
            remixModel={remixState.remixModel}
            socialPostsResponses={socialPostsState.socialPostsResponses}
            isSocialPostsGenerating={socialPostsState.isSocialPostsGenerating}
            showSocialPosts={socialPostsState.showSocialPosts}
            onCloseSocialPosts={eventHandlers.handleCloseSocialPosts}
            socialPostsConfigs={socialPostsState.socialPostsConfigs}
            onSubmit={eventHandlers.handleSubmit}
            currentMessage={chatState.currentMessage}
            onRemix={eventHandlers.handleRemix}
            remixDisabled={computedValues.isRemixDisabled}
            modelSelections={modelSelectionState.modelSelections}
            messageModels={chatState.messageModels}
            onModelSelect={() => {}} // Placeholder
            onModelSelectionsUpdate={eventHandlers.handleModelSelectionsUpdate}
            onDirectSubmit={eventHandlers.handleDirectSubmit}
            onRestoreModelSelection={() => {}} // Placeholder
            showAISelection={modelSelectionState.showAISelection}
            onToggleAISelection={toggleHandlers.handleToggleAISelection}
            resetModelSelector={modelSelectionState.resetModelSelector}
            onModelSelectionClick={onModelSelectionClick}
            isUsingDefaultModel={modelSelectionState.isUsingDefaultModel}
            isLeftNavCollapsed={uiState.isLeftNavCollapsed}
          />
        </div>
      </div>
      {uiState.showRightPanel && (
        <RightSelectionsPanel
          selectedSentences={chatState.selectedSentences}
          onRemoveSentence={handleRemoveSentence}
        />
      )}
    </div>
  );
}
