'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import TopBar from '@/components/TopBar';
import LeftNavigation from '@/components/LeftNavigation';
import ChatMessages from '@/components/ChatMessages';
import RightSelectionsPanel from '@/components/RightSelectionsPanel';
import SocialPostsDrawer, { SocialPostConfig } from '@/components/SocialPostsDrawer';
import { ModelSelection } from '@/components/ModelGridSelector';
import ModelSelectionModal from '@/components/ModelSelectionModal';
import HeaderText from '@/components/HeaderText';
import AuroraBackground from '@/components/AuroraBackground';

// Types
export interface SelectedSentence {
  id: string;
  text: string;
  source: string;
}

interface AuroraConfig {
  colorStops: [string, string, string];
  speed: number;
  blend: number;
  amplitude: number;
}

interface PendingOrchestration {
  prompt: string;
  modelId: string;
}

// Constants
const DEFAULT_AURORA_CONFIG: AuroraConfig = {
  colorStops: ['#1e74a9', '#97128c', '#05ecf0'],
  speed: 0.2,
  blend: 0.47,
  amplitude: 1.0,
};

const MAX_MESSAGES = 6;

// Utility functions
const createErrorMessage = (error: Error): string => {
  if (
    error.message.includes('429') ||
    error.message.includes('quota') ||
    error.message.includes('Too Many Requests')
  ) {
    return 'Rate limit exceeded. This model has reached its daily quota. Please try again later or use a different model.';
  }
  if (error.message.includes('401') || error.message.includes('unauthorized')) {
    return 'Authentication error. Please check your API configuration.';
  }
  if (error.message.includes('500') || error.message.includes('internal server error')) {
    return 'Server error. Please try again in a few moments.';
  }
  if (error.message.includes('network') || error.message.includes('fetch')) {
    return 'Network error. Please check your internet connection and try again.';
  }
  return 'An error occurred while generating the response.';
};

const resetObjectValues = <T,>(
  obj: { [key: string]: T },
  defaultValue: T,
): { [key: string]: T } => {
  const reset: { [key: string]: T } = {};
  Object.keys(obj).forEach((key) => {
    reset[key] = defaultValue;
  });
  return reset;
};

const remapObjectKeys = <T,>(
  obj: { [key: string]: T },
  filteredKeys: string[],
): { [key: string]: T } => {
  const newObj: { [key: string]: T } = {};
  filteredKeys.forEach((key, index) => {
    const newKey = (index + 1).toString();
    newObj[newKey] = obj[key];
  });
  return newObj;
};

// Custom hooks
const useChatState = () => {
  const [selectedSentences, setSelectedSentences] = useState<SelectedSentence[]>([]);
  const [messageModels, setMessageModels] = useState<{ [key: string]: string }>({});
  const [messageResponses, setMessageResponses] = useState<{ [key: string]: string[] }>({});
  const [originalResponses, setOriginalResponses] = useState<{ [key: string]: string }>({});
  const [isGenerating, setIsGenerating] = useState<{ [key: string]: boolean }>({});
  const [currentMessage, setCurrentMessage] = useState('');
  const [chatKey, setChatKey] = useState(0);

  const resetChatState = useCallback(() => {
    setSelectedSentences([]);
    setMessageResponses(resetObjectValues(messageResponses, []));
    setOriginalResponses(resetObjectValues(originalResponses, ''));
    setIsGenerating(resetObjectValues(isGenerating, false));
    setCurrentMessage('');
    setChatKey((prev) => prev + 1);
  }, [messageResponses, originalResponses, isGenerating]);

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
  };
};

const useRemixState = () => {
  const [remixResponses, setRemixResponses] = useState<string[]>([]);
  const [remixModels, setRemixModels] = useState<string[]>([]);
  const [isRemixGenerating, setIsRemixGenerating] = useState<boolean>(false);
  const [showRemix, setShowRemix] = useState<boolean>(false);
  const [remixModel, setRemixModel] = useState<string>('');

  const resetRemixState = useCallback(() => {
    setRemixResponses([]);
    setRemixModels([]);
    setIsRemixGenerating(false);
    setShowRemix(false);
    setRemixModel('');
  }, []);

  return {
    remixResponses,
    setRemixResponses,
    remixModels,
    setRemixModels,
    isRemixGenerating,
    setIsRemixGenerating,
    showRemix,
    setShowRemix,
    remixModel,
    setRemixModel,
    resetRemixState,
  };
};

const useSocialPostsState = () => {
  const [showSocialPostsDrawer, setShowSocialPostsDrawer] = useState<boolean>(false);
  const [socialPostsResponses, setSocialPostsResponses] = useState<{ [key: string]: string }>({});
  const [isSocialPostsGenerating, setIsSocialPostsGenerating] = useState<{
    [key: string]: boolean;
  }>({});
  const [showSocialPosts, setShowSocialPosts] = useState<{ [key: string]: boolean }>({});
  const [socialPostsConfigs, setSocialPostsConfigs] = useState<{ [key: string]: SocialPostConfig }>(
    {},
  );

  const resetSocialPostsState = useCallback(() => {
    setSocialPostsResponses({});
    setIsSocialPostsGenerating({});
    setShowSocialPosts({});
    setSocialPostsConfigs({});
  }, []);

  return {
    showSocialPostsDrawer,
    setShowSocialPostsDrawer,
    socialPostsResponses,
    setSocialPostsResponses,
    isSocialPostsGenerating,
    setIsSocialPostsGenerating,
    showSocialPosts,
    setShowSocialPosts,
    socialPostsConfigs,
    setSocialPostsConfigs,
    resetSocialPostsState,
  };
};

const useModelSelectionState = () => {
  const [modelSelections, setModelSelections] = useState<ModelSelection[]>([]);
  const [showAISelection, setShowAISelection] = useState<boolean>(true);
  const [resetModelSelector, setResetModelSelector] = useState<boolean>(false);
  const [showModelSelectionModal, setShowModelSelectionModal] = useState<boolean>(false);
  const [isUsingDefaultModel, setIsUsingDefaultModel] = useState<boolean>(false);

  const resetModelSelectionState = useCallback(() => {
    setModelSelections([]);
    setShowModelSelectionModal(true);
    setIsUsingDefaultModel(false);
    setResetModelSelector(true);
    setTimeout(() => setResetModelSelector(false), 100);
  }, []);

  return {
    modelSelections,
    setModelSelections,
    showAISelection,
    setShowAISelection,
    resetModelSelector,
    setResetModelSelector,
    showModelSelectionModal,
    setShowModelSelectionModal,
    isUsingDefaultModel,
    setIsUsingDefaultModel,
    resetModelSelectionState,
  };
};

const useUIState = () => {
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [isLeftNavCollapsed, setIsLeftNavCollapsed] = useState<boolean>(true);
  const [auroraConfig, setAuroraConfig] = useState<AuroraConfig>(DEFAULT_AURORA_CONFIG);

  return {
    showRightPanel,
    setShowRightPanel,
    isLeftNavCollapsed,
    setIsLeftNavCollapsed,
    auroraConfig,
    setAuroraConfig,
  };
};

// API functions
const createRequestBody = (prompt: string, model: string) => ({
  messages: [{ role: 'user' as const, content: prompt }],
  model,
  stream: true,
});

const handleStreamResponse = async (
  response: Response,
  onChunk: (content: string) => void,
  onComplete: (accumulatedResponse: string) => void,
) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
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
            onChunk(parsed.data.content);
          } else if (!parsed.success) {
            throw new Error(parsed.error || 'API request failed');
          }
        } catch (e) {
          console.error('Error parsing JSON:', e);
        }
      }
    }
  }

  onComplete(accumulatedResponse);
};

const sendChatRequest = async (prompt: string, model: string, attachments?: File[]) => {
  const requestBody = createRequestBody(prompt, model);

  if (attachments && attachments.length > 0) {
    const formData = new FormData();
    formData.append('jsonData', JSON.stringify(requestBody));
    attachments.forEach((file, index) => {
      formData.append(`file-${index}`, file);
    });

    return fetch('/api/chat/with-attachments', {
      method: 'POST',
      body: formData,
    });
  }

  return fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
  });
};

// Main component
export default function Home() {
  // State management
  const chatState = useChatState();
  const remixState = useRemixState();
  const socialPostsState = useSocialPostsState();
  const modelSelectionState = useModelSelectionState();
  const uiState = useUIState();

  const [pendingOrchestration, setPendingOrchestration] = useState<PendingOrchestration | null>(
    null,
  );

  // Destructure state for easier access
  const {
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
  } = chatState;

  const {
    remixResponses,
    setRemixResponses,
    remixModels,
    setRemixModels,
    isRemixGenerating,
    setIsRemixGenerating,
    showRemix,
    setShowRemix,
    remixModel,
    setRemixModel,
    resetRemixState,
  } = remixState;

  const {
    showSocialPostsDrawer,
    setShowSocialPostsDrawer,
    socialPostsResponses,
    setSocialPostsResponses,
    isSocialPostsGenerating,
    setIsSocialPostsGenerating,
    showSocialPosts,
    setShowSocialPosts,
    socialPostsConfigs,
    setSocialPostsConfigs,
    resetSocialPostsState,
  } = socialPostsState;

  const {
    modelSelections,
    setModelSelections,
    showAISelection,
    setShowAISelection,
    resetModelSelector,
    showModelSelectionModal,
    setShowModelSelectionModal,
    isUsingDefaultModel,
    setIsUsingDefaultModel,
    resetModelSelectionState,
  } = modelSelectionState;

  const { showRightPanel, isLeftNavCollapsed, setIsLeftNavCollapsed, auroraConfig } = uiState;

  // Event handlers
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
    [modelSelections.length, setCurrentMessage],
  );

  const handleSubmit = async (prompt: string, attachments?: File[]) => {
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
  };

  const handleMessagePromptSubmit = async (
    message: string,
    prompt: string,
    attachments: File[],
    model: string,
  ) => {
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
  };

  const handleNewChat = useCallback(() => {
    resetChatState();
    resetRemixState();
    resetSocialPostsState();
    resetModelSelectionState();
  }, [resetChatState, resetRemixState, resetSocialPostsState, resetModelSelectionState]);

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
      const removeFromState = <T,>(
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

  const handleToggleAISelection = useCallback(() => {
    setShowAISelection((prev) => {
      const newValue = !prev;
      if (prev && !newValue && modelSelections.length === 0) {
        setMessageModels({});
        setMessageResponses({});
        setOriginalResponses({});
        setIsGenerating({});
      }
      return newValue;
    });
  }, [
    modelSelections.length,
    setShowAISelection,
    setMessageModels,
    setMessageResponses,
    setOriginalResponses,
    setIsGenerating,
  ]);

  const handleLeftNavToggle = useCallback(
    (collapsed: boolean) => {
      setIsLeftNavCollapsed(collapsed);
    },
    [setIsLeftNavCollapsed],
  );

  // Effects
  useEffect(() => {
    if (pendingOrchestration && modelSelections.length > 0) {
      const { prompt, modelId } = pendingOrchestration;
      setPendingOrchestration(null);
      handleDirectSubmit(prompt, modelId);
    }
  }, [modelSelections, pendingOrchestration, handleDirectSubmit]);

  useEffect(() => {
    setShowModelSelectionModal(true);
  }, [setShowModelSelectionModal]);

  // Computed values
  const isHeaderVisible = useMemo(() => {
    return (
      Object.values(messageResponses).every((responses) => responses.length === 0) &&
      Object.values(originalResponses).every((response) => !response) &&
      !Object.values(isGenerating).some((generating) => generating) &&
      !isUsingDefaultModel
    );
  }, [messageResponses, originalResponses, isGenerating, isUsingDefaultModel]);

  const isRemixDisabled = useMemo(() => {
    const hasResponses = Object.values(messageResponses).some((responses) => responses.length > 0);
    const hasCurrentMessage = currentMessage.trim();
    const totalModelQuantity = modelSelections.reduce(
      (total, selection) => total + selection.count,
      0,
    );
    const hasMultipleModels = totalModelQuantity >= 2;
    return !hasResponses || !hasCurrentMessage || !hasMultipleModels;
  }, [messageResponses, currentMessage, modelSelections]);

  const isGeneratingAny = useMemo(() => {
    return Object.values(isGenerating).some((generating) => generating);
  }, [isGenerating]);

  return (
    <AuroraBackground
      colorStops={auroraConfig.colorStops}
      speed={auroraConfig.speed}
      blend={auroraConfig.blend}
      amplitude={auroraConfig.amplitude}
    >
      <div className="flex h-screen transition-colors duration-200">
        <LeftNavigation isCollapsed={isLeftNavCollapsed} onToggleCollapse={handleLeftNavToggle} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar onNewChat={handleNewChat} onSocialPosts={() => setShowSocialPostsDrawer(true)} />
          <div className="flex flex-1 overflow-hidden">
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 p-6 pb-0 h-full">
                <HeaderText isVisible={isHeaderVisible} />

                <ChatMessages
                  key={chatKey}
                  onSentenceSelect={handleSentenceSelect}
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
                  onCloseSocialPosts={handleCloseSocialPosts}
                  socialPostsConfigs={socialPostsConfigs}
                  onSubmit={handleSubmit}
                  currentMessage={currentMessage}
                  onRemix={handleRemix}
                  remixDisabled={isRemixDisabled}
                  modelSelections={modelSelections}
                  messageModels={messageModels}
                  onModelSelect={() => {}} // Placeholder
                  onModelSelectionsUpdate={handleModelSelectionsUpdate}
                  onDirectSubmit={handleDirectSubmit}
                  onRestoreModelSelection={() => {}} // Placeholder
                  showAISelection={showAISelection}
                  onToggleAISelection={handleToggleAISelection}
                  resetModelSelector={resetModelSelector}
                  onModelSelectionClick={() => setShowModelSelectionModal(true)}
                  isUsingDefaultModel={isUsingDefaultModel}
                  isLeftNavCollapsed={isLeftNavCollapsed}
                />
              </div>
            </div>
            {showRightPanel && (
              <RightSelectionsPanel
                selectedSentences={selectedSentences}
                onRemoveSentence={useCallback(
                  (id) => {
                    setSelectedSentences((prev) => prev.filter((s) => s.id !== id));
                  },
                  [setSelectedSentences],
                )}
              />
            )}
          </div>
        </div>

        <SocialPostsDrawer
          isOpen={showSocialPostsDrawer}
          onClose={() => setShowSocialPostsDrawer(false)}
          onGenerate={handleSocialPostsGenerate}
          availableMessages={originalResponses}
        />

        <ModelSelectionModal
          isOpen={showModelSelectionModal}
          onClose={() => setShowModelSelectionModal(false)}
          onModelSelectionsChange={handleModelSelectionsChange}
          initialSelections={modelSelections}
          disabled={isGeneratingAny}
        />
      </div>
    </AuroraBackground>
  );
}
