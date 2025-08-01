import React from 'react';
import ChatInputMessage from './ChatInputMessage';
import { ModelInfo } from '@/lib/api-client';
import { ModelSelection } from './ModelGridSelector';

interface ChatInputWrapperProps {
  onSubmit: (prompt: string, modelId: string, attachments?: File[]) => void;
  currentMessage: string;
  isSubmitting: boolean;
  onModelSelect?: (modelId: string) => void;
  onModelSelectionsUpdate?: (modelId: string) => void;
  onDirectSubmit?: (prompt: string, modelId: string) => void;
  modelSelections: ModelSelection[];
  showModelBadges: boolean;
  onRestoreModelSelection: () => void;
  onModelConfirmedOrchestration: () => void;
  availableModels: ModelInfo[];
  toolsRowRef: React.RefObject<HTMLDivElement>;
  showAISelection: boolean;
  onToggleAISelection?: () => void;
  onModelSelectionClick?: () => void;
  modelSelectionDisabled: boolean;
  isUsingDefaultModel: boolean;
  isLeftNavCollapsed: boolean;
}

const ChatInputWrapper: React.FC<ChatInputWrapperProps> = ({
  onSubmit,
  currentMessage,
  isSubmitting,
  onModelSelect,
  onModelSelectionsUpdate,
  onDirectSubmit,
  modelSelections,
  showModelBadges,
  onRestoreModelSelection,
  onModelConfirmedOrchestration,
  availableModels,
  toolsRowRef,
  showAISelection,
  onToggleAISelection,
  onModelSelectionClick,
  modelSelectionDisabled,
  isUsingDefaultModel,
  isLeftNavCollapsed,
}) => {
  return (
    <div
      className="fixed bottom-0 bg-transparent z-50 backdrop-blur-optimized chat-input-container transform-gpu will-change-transform transition-all duration-300 ease-out"
      style={{
        left: isLeftNavCollapsed ? '64px' : '256px',
        right: '0px',
      }}
    >
      <div className="flex justify-center">
        <div className="flex flex-col justify-start gap-6 pl-6 pr-6 w-1/2 transition-all duration-300">
          <ChatInputMessage
            onSubmit={onSubmit}
            currentMessage={currentMessage}
            isSubmitting={isSubmitting}
            onModelSelect={onModelSelect}
            onModelSelectionsUpdate={onModelSelectionsUpdate}
            onDirectSubmit={onDirectSubmit}
            modelSelections={modelSelections}
            showModelBadges={showModelBadges}
            onRestoreModelSelection={onRestoreModelSelection}
            onModelConfirmedOrchestration={onModelConfirmedOrchestration}
            availableModels={availableModels}
            toolsRowRef={toolsRowRef}
            showAISelection={showAISelection}
            onToggleAISelection={onToggleAISelection}
            onModelSelectionClick={onModelSelectionClick}
            modelSelectionDisabled={modelSelectionDisabled}
            isUsingDefaultModel={isUsingDefaultModel}
            isLeftNavCollapsed={isLeftNavCollapsed}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInputWrapper;
