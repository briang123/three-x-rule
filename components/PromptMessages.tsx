import React from 'react';
import { motion } from 'framer-motion';
import { TypingIndicator } from './TypingIndicator';
import ContainerizedAIResponseContent from './ContainerizedAIResponseContent';
import MessageModelBadge from './MessageModelBadge';
import ChatBubbleIcon from './icons/ChatBubbleIcon';

interface PromptMessagesProps {
  hasAIContent: boolean;
  messageKeys: string[];
  messageResponses: { [key: string]: string[] };
  originalResponses: { [key: string]: string };
  isGenerating: { [key: string]: boolean };
  messageModels: { [key: string]: string };
  loading: boolean;
  onAddSelection: (text: string, source: string) => void;
  messageRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
  getMessageColor: (message: string) => string;
}

const PromptMessages: React.FC<PromptMessagesProps> = ({
  hasAIContent,
  messageKeys,
  messageResponses,
  originalResponses,
  isGenerating,
  messageModels,
  loading,
  onAddSelection,
  messageRefs,
  getMessageColor,
}) => {
  return (
    <>
      {hasAIContent &&
        messageKeys.map((message, index) => (
          <motion.div
            key={message}
            ref={(el) => {
              messageRefs.current[message] = el;
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 * index, ease: 'easeOut' }}
            className="kitchen-card p-6 flex flex-col overflow-hidden w-full max-w-full flex-shrink-0 message-container"
          >
            <div className="flex items-center justify-between mb-4 flex-shrink-0 min-h-0">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-lg font-semibold ${getMessageColor(message)} bg-kitchen-accent-blue dark:bg-kitchen-dark-accent-blue`}
                >
                  {message}
                </div>
              </div>
              {loading ? (
                <div className="px-3 py-1 bg-kitchen-light-gray border border-kitchen-light-gray rounded-lg text-sm text-kitchen-text-light flex items-center space-x-2">
                  <div className="w-3 h-3 border border-kitchen-text-light border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading models...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  {/* Show model badge instead of dropdown when there's AI content */}
                  <MessageModelBadge
                    modelName={messageModels[message] || 'Model'}
                    hasAIContent={hasAIContent}
                  />
                </div>
              )}
            </div>

            {/* Responses Display */}
            <div className="message-content pr-2">
              <div className="space-y-3">
                {isGenerating[message] && (
                  <div className="text-center text-blue-600 py-4">
                    <div className="flex items-center justify-center space-x-2">
                      <TypingIndicator />
                      <span className="text-sm font-medium">Generating response...</span>
                    </div>
                  </div>
                )}

                {messageResponses[message].length === 0 && !isGenerating[message] ? (
                  <div className="text-center text-gray-500 py-8">
                    <ChatBubbleIcon />
                    <p>No responses yet. Enter a prompt above to generate content.</p>
                  </div>
                ) : (
                  // Markdown View
                  <ContainerizedAIResponseContent
                    content={originalResponses[message] || messageResponses[message].join('\n\n')}
                    message={message}
                    onAddSelection={(text) => onAddSelection(text, message)}
                  />
                )}
              </div>
            </div>
          </motion.div>
        ))}
    </>
  );
};

export default PromptMessages;
