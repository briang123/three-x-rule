import { useState, useCallback } from 'react';
// TODO: Remove useChat import and usage. Use AI SDK v5 streaming primitives instead.

export interface SelectedSentence {
  id: string;
  text: string;
  source: string;
}

export const useChatState = () => {
  const [selectedSentences, setSelectedSentences] = useState<SelectedSentence[]>([]);
  const [messageModels, setMessageModels] = useState<{ [key: string]: string }>({});
  const [messageResponses, setMessageResponses] = useState<{ [key: string]: string[] }>({});
  const [originalResponses, setOriginalResponses] = useState<{ [key: string]: string }>({});
  const [isGenerating, setIsGenerating] = useState<{ [key: string]: boolean }>({});
  const [currentMessage, setCurrentMessage] = useState('');
  const [chatKey, setChatKey] = useState(0);

  // Create AI SDK useChat instance for single-model operations
  // TODO: Remove useChat import and usage. Use AI SDK v5 streaming primitives instead.

  const resetChatState = useCallback(() => {
    setSelectedSentences([]);
    setMessageModels({});
    setMessageResponses({});
    setOriginalResponses({});
    setIsGenerating({});
    setCurrentMessage('');
    setChatKey((prev) => prev + 1);

    // Reset the AI SDK chat instance
    // TODO: Remove useChat import and usage. Use AI SDK v5 streaming primitives instead.
  }, []);

  return {
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
    // TODO: Remove useChat import and usage. Use AI SDK v5 streaming primitives instead.
  };
};
