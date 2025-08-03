import { useState, useEffect, useCallback, useMemo } from 'react';
import { ModelSelection } from '@/components/ModelGridSelector';

interface ChatInstance {
  modelId: string;
  messageKey: string;
  isLoading: boolean;
  messages: string[];
  error: Error | null;
}

interface UseMultiModelChatProps {
  modelSelections: ModelSelection[];
  onModelFinish?: (modelId: string, messageKey: string, content: string) => void;
  onModelError?: (modelId: string, messageKey: string, error: Error) => void;
}

interface UseMultiModelChatReturn {
  chatInstances: ChatInstance[];
  handleSubmit: (prompt: string, attachments?: File[]) => Promise<void>;
  isLoading: boolean;
  messages: { [messageKey: string]: string[] };
  originalResponses: { [messageKey: string]: string };
  isGenerating: { [messageKey: string]: boolean };
  resetAll: () => void;
}

export const useMultiModelChat = ({
  modelSelections,
  onModelFinish,
  onModelError,
}: UseMultiModelChatProps): UseMultiModelChatReturn => {
  const [chatInstances, setChatInstances] = useState<ChatInstance[]>([]);
  const [messages, setMessages] = useState<{ [messageKey: string]: string[] }>({});
  const [originalResponses, setOriginalResponses] = useState<{ [messageKey: string]: string }>({});
  const [isGenerating, setIsGenerating] = useState<{ [messageKey: string]: boolean }>({});

  // Create chat instances for each model selection
  useEffect(() => {
    const instances: ChatInstance[] = [];
    let messageIndex = 1;

    modelSelections.forEach((selection) => {
      for (let i = 0; i < selection.count; i++) {
        const messageKey = messageIndex.toString();

        instances.push({
          modelId: selection.modelId,
          messageKey,
          isLoading: false,
          messages: [],
          error: null,
        });

        messageIndex++;
      }
    });

    setChatInstances(instances);
  }, [modelSelections]);

  // Submit to all selected models simultaneously
  const handleSubmit = useCallback(
    async (prompt: string, attachments?: File[]) => {
      if (chatInstances.length === 0) {
        throw new Error('No models selected');
      }

      // Set all instances to generating state
      chatInstances.forEach((instance) => {
        setIsGenerating((prev) => ({
          ...prev,
          [instance.messageKey]: true,
        }));
      });

      try {
        // Submit to all instances simultaneously
        const promises = chatInstances.map(async (instance) => {
          const messageKey = instance.messageKey;

          try {
            const response = await fetch('/api/chat', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                messages: [{ role: 'user', content: prompt }],
                model: instance.modelId,
                messageKey,
                attachments: attachments ? Array.from(attachments) : undefined,
              }),
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = response.body?.getReader();
            if (!reader) {
              throw new Error('No response body');
            }

            let accumulatedResponse = '';
            const decoder = new TextDecoder();

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6);
                  if (data === '[DONE]') break;

                  try {
                    const parsed = JSON.parse(data);
                    if (parsed.success && parsed.data?.content) {
                      accumulatedResponse += parsed.data.content;

                      // Update streaming messages
                      setMessages((prev) => ({
                        ...prev,
                        [messageKey]: [...(prev[messageKey] || []), parsed.data.content],
                      }));
                    } else if (!parsed.success) {
                      throw new Error(parsed.error || 'API request failed');
                    }
                  } catch (e) {
                    console.error('Error parsing JSON:', e);
                  }
                }
              }
            }

            // Handle completion
            setOriginalResponses((prev) => ({
              ...prev,
              [messageKey]: accumulatedResponse,
            }));
            setIsGenerating((prev) => ({
              ...prev,
              [messageKey]: false,
            }));
            onModelFinish?.(instance.modelId, messageKey, accumulatedResponse);
          } catch (error) {
            console.error(`Error in model ${instance.modelId}:`, error);
            setIsGenerating((prev) => ({
              ...prev,
              [messageKey]: false,
            }));
            onModelError?.(instance.modelId, messageKey, error as Error);
          }
        });

        await Promise.all(promises);
      } catch (error) {
        console.error('Error submitting to models:', error);
        // Reset generating state on error
        chatInstances.forEach((instance) => {
          setIsGenerating((prev) => ({
            ...prev,
            [instance.messageKey]: false,
          }));
        });
        throw error;
      }
    },
    [chatInstances, onModelFinish, onModelError],
  );

  // Reset all instances
  const resetAll = useCallback(() => {
    setMessages({});
    setOriginalResponses({});
    setIsGenerating({});
  }, []);

  // Aggregate loading state
  const isLoading = useMemo(() => {
    return Object.values(isGenerating).some(Boolean);
  }, [isGenerating]);

  return {
    chatInstances,
    handleSubmit,
    isLoading,
    messages,
    originalResponses,
    isGenerating,
    resetAll,
  };
};
