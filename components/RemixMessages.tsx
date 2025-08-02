import React from 'react';
import RemixResponseCard from './RemixResponseCard';
import RemixResponseHeader from './RemixResponseHeader';
import RemixResponseDisplay from './RemixResponseDisplay';
import RemixButtonWrapper from './RemixButtonWrapper';

interface RemixMessagesProps {
  remixResponses: string[];
  remixModels: string[];
  remixModel: string;
  isRemixGenerating: boolean;
  remixDisabled: boolean;
  hasAIContent: boolean;
  messageResponses: { [key: string]: string[] };
  onRemix?: (modelId: string) => void;
  onAddSelection: (text: string, source: string) => void;
  scrollToLatestRemix: () => void;
  remixResponseRefs: React.MutableRefObject<{ [key: number]: HTMLDivElement | null }>;
}

const RemixMessages: React.FC<RemixMessagesProps> = ({
  remixResponses,
  remixModels,
  remixModel,
  isRemixGenerating,
  remixDisabled,
  hasAIContent,
  messageResponses,
  onRemix,
  onAddSelection,
  scrollToLatestRemix,
  remixResponseRefs,
}) => {
  return (
    <>
      {/* Remix Response Cards */}
      {remixResponses &&
        remixResponses.map((response, index) => (
          <RemixResponseCard
            key={`remix-response-${index}`}
            index={index}
            onRef={(el) => {
              remixResponseRefs.current[index] = el;
            }}
          >
            <RemixResponseHeader
              index={index}
              isGenerating={isRemixGenerating}
              isLastItem={index === remixResponses.length - 1}
              modelName={remixModels[index] || remixModel || 'Model'}
            />

            <RemixResponseDisplay
              isGenerating={isRemixGenerating && index === remixResponses.length - 1}
              response={response}
              modelName={remixModels[index] || remixModel || 'selected model'}
              onAddSelection={(text) => onAddSelection(text, 'R')}
            />
          </RemixResponseCard>
        ))}

      {/* RemixButtonCard Component */}
      {hasAIContent && (
        <RemixButtonWrapper
          onRemix={onRemix}
          remixDisabled={remixDisabled}
          isRemixGenerating={isRemixGenerating}
          responseCount={Object.keys(messageResponses).length}
        />
      )}
    </>
  );
};

export default RemixMessages;
