import { useCallback } from 'react';
import ChatMessages from './ChatMessages';
import RightSelectionsPanel from './RightSelectionsPanel';
import { SelectedSentence } from '@/hooks';

interface MainContentProps {
  // Chat state
  chatKey: number;
  messageResponses: { [key: string]: string[] };
  originalResponses: { [key: string]: string };
  isGenerating: { [key: string]: boolean };
  currentMessage: string;
  selectedSentences: SelectedSentence[];
  messageModels: { [key: string]: string };

  // Remix state
  remixResponses: string[];
  remixModels: string[];
  isRemixGenerating: boolean;
  showRemix: boolean;
  remixModel: string;

  // Social posts state
  socialPostsResponses: { [key: string]: string };
  isSocialPostsGenerating: { [key: string]: boolean };
  showSocialPosts: { [key: string]: boolean };
  socialPostsConfigs: { [key: string]: any };

  // Model selection state
  modelSelections: any[];
  showAISelection: boolean;
  isUsingDefaultModel: boolean;

  // UI state
  showRightPanel: boolean;
  isLeftNavCollapsed: boolean;

  // Computed values
  isHeaderVisible: boolean;
  isRemixDisabled: boolean;

  // Event handlers
  onSentenceSelect: (sentence: SelectedSentence) => void;
  onCloseSocialPosts: (socialPostId: string) => void;
  onSubmit: (prompt: string, attachments?: File[]) => Promise<void>;
  onRemix: (modelId: string) => Promise<void>;
  onModelSelectionsUpdate: (modelId: string) => void;
  onDirectSubmit: (prompt: string, modelId: string) => Promise<void>;
  onToggleAISelection: () => void;
  onModelSelectionClick: () => void;
  onRemoveSentence: (id: string) => void;
  resetModelSelector: () => void;
}

export default function MainContent({
  chatKey,
  messageResponses,
  originalResponses,
  isGenerating,
  currentMessage,
  selectedSentences,
  messageModels,
  remixResponses,
  remixModels,
  isRemixGenerating,
  showRemix,
  remixModel,
  socialPostsResponses,
  isSocialPostsGenerating,
  showSocialPosts,
  socialPostsConfigs,
  modelSelections,
  showAISelection,
  isUsingDefaultModel,
  showRightPanel,
  isLeftNavCollapsed,
  isHeaderVisible,
  isRemixDisabled,
  onSentenceSelect,
  onCloseSocialPosts,
  onSubmit,
  onRemix,
  onModelSelectionsUpdate,
  onDirectSubmit,
  onToggleAISelection,
  onModelSelectionClick,
  onRemoveSentence,
  resetModelSelector,
}: MainContentProps) {
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
            key={chatKey}
            onSentenceSelect={onSentenceSelect}
            messageResponses={messageResponses}
            originalResponses={originalResponses}
            isGenerating={isGenerating}
            remixResponses={remixResponses}
            remixModels={remixModels}
            isRemixGenerating={isRemixGenerating}
            showRemix={showRemix}
            remixModel={remixModel}
            socialPostsResponses={socialPostsResponses}
            isSocialPostsGenerating={isSocialPostsGenerating}
            showSocialPosts={showSocialPosts}
            onCloseSocialPosts={onCloseSocialPosts}
            socialPostsConfigs={socialPostsConfigs}
            onSubmit={onSubmit}
            currentMessage={currentMessage}
            onRemix={onRemix}
            remixDisabled={isRemixDisabled}
            modelSelections={modelSelections}
            messageModels={messageModels}
            onModelSelect={() => {}} // Placeholder
            onModelSelectionsUpdate={onModelSelectionsUpdate}
            onDirectSubmit={onDirectSubmit}
            onRestoreModelSelection={() => {}} // Placeholder
            showAISelection={showAISelection}
            onToggleAISelection={onToggleAISelection}
            resetModelSelector={resetModelSelector}
            onModelSelectionClick={onModelSelectionClick}
            isUsingDefaultModel={isUsingDefaultModel}
            isLeftNavCollapsed={isLeftNavCollapsed}
          />
        </div>
      </div>
      {showRightPanel && (
        <RightSelectionsPanel
          selectedSentences={selectedSentences}
          onRemoveSentence={handleRemoveSentence}
        />
      )}
    </div>
  );
}
