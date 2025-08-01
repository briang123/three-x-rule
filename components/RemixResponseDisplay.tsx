import React from 'react';
import { TypingIndicator } from './TypingIndicator';
import ContainerizedAIResponseContent from './ContainerizedAIResponseContent';

interface RemixResponseDisplayProps {
  isGenerating: boolean;
  response: string;
  modelName: string;
  onAddSelection: (text: string) => void;
}

const RemixResponseDisplay: React.FC<RemixResponseDisplayProps> = ({
  isGenerating,
  response,
  modelName,
  onAddSelection,
}) => (
  <div className="column-content pr-2">
    <div className="space-y-3">
      {isGenerating ? (
        // Loading state for the last card
        <div className="text-center text-blue-600 py-4">
          <div className="flex items-center justify-center space-x-2 mb-3">
            <TypingIndicator />
            <span className="text-sm font-medium">Generating remix...</span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            <p className="mb-2">
              Synthesizing responses from all columns into a curated remix using {modelName}.
            </p>
            <p>
              This process combines the best insights from multiple AI perspectives to create a
              comprehensive answer.
            </p>
          </div>
        </div>
      ) : (
        // Completed response display
        <ContainerizedAIResponseContent
          content={response}
          column="R"
          onAddSelection={onAddSelection}
        />
      )}
    </div>
  </div>
);

export default RemixResponseDisplay;
