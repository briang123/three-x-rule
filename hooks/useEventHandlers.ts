import { useCallback } from 'react';
import { SelectedSentence } from './useChatState';
import { ModelSelection } from '@/components/ModelGridSelector';
import { SocialPostConfig } from '@/components/SocialPostsDrawer';
import { createErrorMessage } from '@/lib/error-utils';
import { handleStreamResponse, sendChatRequest } from '@/lib/api-utils';

interface UseEventHandlersProps {
  // Chat state
  setSelectedSentences: React.Dispatch<React.SetStateAction<SelectedSentence[]>>;
  setCurrentMessage: (message: string) => void;
  setMessageModels: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  setMessageResponses: React.Dispatch<React.SetStateAction<{ [key: string]: string[] }>>;
  setOriginalResponses: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  setIsGenerating: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;

  // Remix state
  setRemixResponses: React.Dispatch<React.SetStateAction<string[]>>;
  setRemixModels: React.Dispatch<React.SetStateAction<string[]>>;
  setIsRemixGenerating: (generating: boolean) => void;
  setShowRemix: (show: boolean) => void;
  setRemixModel: (model: string) => void;

  // Social posts state
  setSocialPostsResponses: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  setIsSocialPostsGenerating: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  setShowSocialPosts: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  setSocialPostsConfigs: React.Dispatch<React.SetStateAction<{ [key: string]: SocialPostConfig }>>;

  // Model selection state
  setModelSelections: React.Dispatch<React.SetStateAction<ModelSelection[]>>;
  setIsUsingDefaultModel: (using: boolean) => void;
  setShowModelSelectionModal: (show: boolean) => void;

  // UI state
  setIsLeftNavCollapsed: (collapsed: boolean) => void;

  // Current state values
  messageResponses: { [key: string]: string[] };
  originalResponses: { [key: string]: string };
  isGenerating: { [key: string]: boolean };
  currentMessage: string;
  modelSelections: ModelSelection[];
  pendingOrchestration: { prompt: string; modelId: string } | null;
  setPendingOrchestration: React.Dispatch<
    React.SetStateAction<{ prompt: string; modelId: string } | null>
  >;
}

export const useEventHandlers = ({
  setSelectedSentences,
  setCurrentMessage,
  setMessageModels,
  setMessageResponses,
  setOriginalResponses,
  setIsGenerating,
  setRemixResponses,
  setRemixModels,
  setIsRemixGenerating,
  setShowRemix,
  setRemixModel,
  setSocialPostsResponses,
  setIsSocialPostsGenerating,
  setShowSocialPosts,
  setSocialPostsConfigs,
  setModelSelections,
  setIsUsingDefaultModel,
  setShowModelSelectionModal,
  setIsLeftNavCollapsed,
  messageResponses,
  originalResponses,
  isGenerating,
  currentMessage,
  modelSelections,
  pendingOrchestration,
  setPendingOrchestration,
}: UseEventHandlersProps) => {
  const handleSentenceSelect = useCallback(
    (sentence: SelectedSentence) => {
      setSelectedSentences((prev) => {
        const exists = prev.find((s) => s.id === sentence.id);
        return exists ? prev.filter((s) => s.id !== sentence.id) : [...prev, sentence];
      });
    },
    [setSelectedSentences],
  );

  const handleModelSelectionsChange = useCallback(
    (selections: ModelSelection[]) => {
      setModelSelections(selections);
      setIsUsingDefaultModel(false);

      const newMessageModels: { [key: string]: string } = {};
      const newMessageResponses: { [key: string]: string[] } = {};
      const newOriginalResponses: { [key: string]: string } = {};
      const newIsGenerating: { [key: string]: boolean } = {};

      let messageIndex = 1;
      selections.forEach((selection) => {
        for (let i = 0; i < selection.count; i++) {
          const messageKey = messageIndex.toString();
          newMessageModels[messageKey] = selection.modelId;
          newMessageResponses[messageKey] = messageResponses[messageKey] || [];
          newOriginalResponses[messageKey] = originalResponses[messageKey] || '';
          newIsGenerating[messageKey] = isGenerating[messageKey] || false;
          messageIndex++;
        }
      });

      setMessageModels(newMessageModels);
      setMessageResponses(newMessageResponses);
      setOriginalResponses(newOriginalResponses);
      setIsGenerating(newIsGenerating);
    },
    [
      messageResponses,
      originalResponses,
      isGenerating,
      setModelSelections,
      setIsUsingDefaultModel,
      setMessageModels,
      setMessageResponses,
      setOriginalResponses,
      setIsGenerating,
    ],
  );

  const handleModelSelectionsUpdate = useCallback(
    (modelId: string) => {
      const newSelections: ModelSelection[] = [{ modelId, count: 1 }];
      handleModelSelectionsChange(newSelections);
      setIsUsingDefaultModel(true);
    },
    [handleModelSelectionsChange, setIsUsingDefaultModel],
  );

  const handleMessagePromptSubmit = useCallback(
    async (message: string, prompt: string, attachments: File[], model: string) => {
      setIsGenerating((prev) => ({ ...prev, [message]: true }));
      setMessageResponses((prev) => ({ ...prev, [message]: [] }));
      setOriginalResponses((prev) => ({ ...prev, [message]: '' }));

      try {
        const response = await sendChatRequest(prompt, model, attachments);

        await handleStreamResponse(
          response,
          (content) => {
            setMessageResponses((prev) => ({
              ...prev,
              [message]: [...(prev[message] || []), content],
            }));
          },
          (accumulatedResponse) => {
            setOriginalResponses((prev) => ({
              ...prev,
              [message]: accumulatedResponse,
            }));
          },
        );
      } catch (error) {
        console.error(`Error in message ${message}:`, error);
        const errorMessage = createErrorMessage(error as Error);
        setMessageResponses((prev) => ({
          ...prev,
          [message]: [...(prev[message] || []), errorMessage],
        }));
      } finally {
        setIsGenerating((prev) => ({ ...prev, [message]: false }));
      }
    },
    [setIsGenerating, setMessageResponses, setOriginalResponses],
  );

  const handleDirectSubmit = useCallback(
    async (prompt: string, modelId: string) => {
      setCurrentMessage(prompt);

      if (modelSelections.length === 0) {
        setPendingOrchestration({ prompt, modelId });
        return;
      }

      try {
        await handleMessagePromptSubmit('1', prompt, [], modelId);
      } catch (error) {
        console.error('Error in direct submit:', error);
      }
    },
    [modelSelections.length, setCurrentMessage, setPendingOrchestration, handleMessagePromptSubmit],
  );

  const handleSubmit = useCallback(
    async (prompt: string, attachments?: File[]) => {
      if (modelSelections.length === 0) {
        setShowModelSelectionModal(true);
        return;
      }

      setCurrentMessage(prompt);

      const dynamicMessageModels: { [key: string]: string } = {};
      let messageIndex = 1;
      modelSelections.forEach((selection) => {
        for (let i = 0; i < selection.count; i++) {
          const messageKey = messageIndex.toString();
          dynamicMessageModels[messageKey] = selection.modelId;
          messageIndex++;
        }
      });

      const promises = Object.keys(dynamicMessageModels)
        .filter((message) => dynamicMessageModels[message])
        .map((message) =>
          handleMessagePromptSubmit(
            message,
            prompt,
            attachments || [],
            dynamicMessageModels[message],
          ),
        );

      if (promises.length === 0) {
        console.error('No models selected for any message');
        alert('Please select models for at least one message before submitting.');
        return;
      }

      try {
        await Promise.all(promises);
      } catch (error) {
        console.error('Error generating responses:', error);
      }
    },
    [modelSelections, setCurrentMessage, setShowModelSelectionModal, handleMessagePromptSubmit],
  );

  const handleRemix = useCallback(
    async (modelId: string) => {
      const hasResponses = Object.values(originalResponses).some(
        (response) => response.trim() !== '',
      );
      if (!hasResponses) {
        alert('No responses available to remix. Please generate some responses first.');
        return;
      }

      if (!currentMessage.trim()) {
        alert('No current message to remix. Please submit a prompt first.');
        return;
      }

      setIsRemixGenerating(true);
      setShowRemix(true);
      setRemixResponses((prev) => [...prev, '']);
      setRemixModels((prev) => [...prev, modelId]);
      setRemixModel(modelId);

      try {
        const combinedResponses = Object.entries(originalResponses)
          .filter(([_, response]) => response.trim() !== '')
          .map(([message, response]) => `Message ${message}:\n${response}`)
          .join('\n\n---\n\n');

        const remixPrompt = `${currentMessage}\n\nCombine the best parts from all of the responses together and provide a synthesized and curated response.\n\nHere are the responses to combine:\n\n${combinedResponses}`;

        const response = await sendChatRequest(remixPrompt, modelId);

        await handleStreamResponse(
          response,
          () => {}, // No need to update individual chunks for remix
          (accumulatedResponse) => {
            setRemixResponses((prev) => {
              const newResponses = [...prev];
              newResponses[newResponses.length - 1] = accumulatedResponse;
              return newResponses;
            });
          },
        );
      } catch (error) {
        console.error('Error in remix:', error);
        const errorMessage = createErrorMessage(error as Error);
        setRemixResponses((prev) => [...prev, errorMessage]);
      } finally {
        setIsRemixGenerating(false);
      }
    },
    [
      originalResponses,
      currentMessage,
      setIsRemixGenerating,
      setShowRemix,
      setRemixResponses,
      setRemixModels,
      setRemixModel,
    ],
  );

  const handleSocialPostsGenerate = useCallback(
    async (config: SocialPostConfig) => {
      const socialPostId = `social-${Date.now()}`;

      setIsSocialPostsGenerating((prev) => ({ ...prev, [socialPostId]: true }));
      setShowSocialPosts((prev) => ({ ...prev, [socialPostId]: true }));
      setSocialPostsResponses((prev) => ({ ...prev, [socialPostId]: '' }));
      setSocialPostsConfigs((prev) => ({ ...prev, [socialPostId]: config }));

      try {
        const basePrompt = config.customPrompt || currentMessage;
        if (!basePrompt.trim()) {
          throw new Error('No prompt available for social posts generation');
        }

        const platformPrompts = {
          twitter: 'Create engaging X (Twitter) content that is',
          linkedin: 'Create professional LinkedIn content that is',
          instagram: 'Create Instagram content that is',
          facebook: 'Create Facebook content that is',
          tiktok: 'Create TikTok content that is',
        };

        const typePrompts = {
          tweet: `${config.numberOfPosts} separate tweets (max ${config.characterLimit} characters each). Make each tweet engaging, informative, and include relevant hashtags. Format each tweet in its own block with "Tweet 1:", "Tweet 2:", etc.`,
          thread: `a thread of ${config.numberOfPosts} tweets (max ${config.characterLimit} characters each). Each tweet should build on the previous one and include relevant hashtags. Format each tweet in its own block with "Tweet 1:", "Tweet 2:", etc.`,
          article: `a comprehensive article (max ${config.characterLimit} characters). Structure it with clear headings, engaging content, and a strong conclusion.`,
          post: `${config.numberOfPosts} separate social media posts (max ${config.characterLimit} characters each). Make each post engaging and include relevant hashtags. Format each post in its own block with "Post 1:", "Post 2:", etc.`,
          caption: `${config.numberOfPosts} separate Instagram captions (max ${config.characterLimit} characters each). Make each caption engaging, include relevant hashtags, and use emojis appropriately. Format each caption in its own block with "Caption 1:", "Caption 2:", etc.`,
        };

        let socialPrompt = `${basePrompt}\n\n`;
        socialPrompt += `${platformPrompts[config.platform as keyof typeof platformPrompts]} ${typePrompts[config.postType as keyof typeof typePrompts]}`;

        if (!config.customPrompt) {
          let responsesToInclude: string[] = [];

          if (config.selectedColumns && config.selectedColumns.length > 0) {
            responsesToInclude = config.selectedColumns
              .filter(
                (messageKey) =>
                  originalResponses[messageKey] && originalResponses[messageKey].trim() !== '',
              )
              .map((messageKey) => `Message ${messageKey}:\n${originalResponses[messageKey]}`);
          } else {
            const hasResponses = Object.values(originalResponses).some(
              (response) => response.trim() !== '',
            );
            if (hasResponses) {
              responsesToInclude = Object.entries(originalResponses)
                .filter(([_, response]) => response.trim() !== '')
                .map(([message, response]) => `Message ${message}:\n${response}`);
            }
          }

          if (responsesToInclude.length > 0) {
            const combinedResponses = responsesToInclude.join('\n\n---\n\n');
            socialPrompt += `\n\nUse the following content as reference:\n\n${combinedResponses}`;
          }
        }

        const response = await sendChatRequest(socialPrompt, config.modelId);

        await handleStreamResponse(
          response,
          () => {}, // No need to update individual chunks for social posts
          (accumulatedResponse) => {
            setSocialPostsResponses((prev) => ({
              ...prev,
              [socialPostId]: accumulatedResponse,
            }));
          },
        );
      } catch (error) {
        console.error('Error in social posts generation:', error);
        const errorMessage = createErrorMessage(error as Error);
        setSocialPostsResponses((prev) => ({
          ...prev,
          [socialPostId]: errorMessage,
        }));
      } finally {
        setIsSocialPostsGenerating((prev) => ({ ...prev, [socialPostId]: false }));
      }
    },
    [
      originalResponses,
      currentMessage,
      setIsSocialPostsGenerating,
      setShowSocialPosts,
      setSocialPostsResponses,
      setSocialPostsConfigs,
    ],
  );

  const handleCloseSocialPosts = useCallback(
    (socialPostId: string) => {
      const removeFromState = <T>(
        setter: React.Dispatch<React.SetStateAction<{ [key: string]: T }>>,
      ) => {
        setter((prev) => {
          const newState = { ...prev };
          delete newState[socialPostId];
          return newState;
        });
      };

      removeFromState(setShowSocialPosts);
      removeFromState(setSocialPostsResponses);
      removeFromState(setSocialPostsConfigs);
      removeFromState(setIsSocialPostsGenerating);
    },
    [
      setShowSocialPosts,
      setSocialPostsResponses,
      setSocialPostsConfigs,
      setIsSocialPostsGenerating,
    ],
  );

  const handleLeftNavToggle = useCallback(
    (collapsed: boolean) => {
      setIsLeftNavCollapsed(collapsed);
    },
    [setIsLeftNavCollapsed],
  );

  return {
    handleSentenceSelect,
    handleModelSelectionsChange,
    handleModelSelectionsUpdate,
    handleMessagePromptSubmit,
    handleDirectSubmit,
    handleSubmit,
    handleRemix,
    handleSocialPostsGenerate,
    handleCloseSocialPosts,
    handleLeftNavToggle,
  };
};
