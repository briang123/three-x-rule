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

  // Create individual useChat instances for each model
  const chatHooks = useMemo(() => {
    const hooks: { [messageKey: string]: ReturnType<typeof useChat> } = {};

    chatInstances.forEach((instance) => {
      const { messageKey, modelId } = instance;

      // Create a unique useChat instance for each message
      const chatHook = useChat({
        api: '/api/chat',
        id: `multi-model-${messageKey}`,
        body: {
          model: modelId,
          messageKey,
        },
        onFinish: (message) => {
          const content = message.content;
          setOriginalResponses((prev) => ({
            ...prev,
            [messageKey]: content,
          }));
          setIsGenerating((prev) => ({
            ...prev,
            [messageKey]: false,
          }));
          onModelFinish?.(modelId, messageKey, content);
        },
        onError: (error) => {
          console.error(`Error in model ${modelId} (${messageKey}):`, error);
          setIsGenerating((prev) => ({
            ...prev,
            [messageKey]: false,
          }));
          onModelError?.(modelId, messageKey, error);
        },
      });

      hooks[messageKey] = chatHook;
    });

    return hooks;
  }, [chatInstances, onModelFinish, onModelError]);

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
        setMessages((prev) => ({
          ...prev,
          [instance.messageKey]: [],
        }));
        setOriginalResponses((prev) => ({
          ...prev,
          [instance.messageKey]: '',
        }));
      });

      try {
        // Submit to all chat instances simultaneously
        const promises = chatInstances.map(async (instance) => {
          const { messageKey, modelId } = instance;
          const chatHook = chatHooks[messageKey];

          if (!chatHook) {
            throw new Error(`Chat hook not found for message ${messageKey}`);
          }

          // Prepare the request body with attachments
          const body: any = {
            messages: [{ role: 'user', content: prompt }],
            model: modelId,
            messageKey,
          };

          if (attachments && attachments.length > 0) {
            body.attachments = Array.from(attachments);
          }

          // Submit the message using the chat hook
          await chatHook.append(
            {
              role: 'user',
              content: prompt,
            },
            {
              options: {
                body,
              },
            },
          );
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
    [chatInstances, chatHooks],
  );

  // Update messages from chat hooks
  useEffect(() => {
    chatInstances.forEach((instance) => {
      const { messageKey } = instance;
      const chatHook = chatHooks[messageKey];

      if (chatHook && chatHook.messages.length > 0) {
        const lastMessage = chatHook.messages[chatHook.messages.length - 1];
        if (lastMessage.role === 'assistant' && lastMessage.content) {
          // For streaming, we'll get the full content
          setMessages((prev) => ({
            ...prev,
            [messageKey]: [lastMessage.content],
          }));
        }
      }
    });
  }, [chatInstances, chatHooks]);

  // Reset all instances
  const resetAll = useCallback(() => {
    setMessages({});
    setOriginalResponses({});
    setIsGenerating({});

    // Reset all chat hooks
    Object.values(chatHooks).forEach((chatHook) => {
      chatHook.reload();
    });
  }, [chatHooks]);

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
