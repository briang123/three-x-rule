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

export interface SelectedSentence {
  id: string;
  text: string;
  source: string;
}

export default function Home() {
  const [selectedSentences, setSelectedSentences] = useState<SelectedSentence[]>([]);
  const [showRightPanel, setShowRightPanel] = useState(false); // Add state to control right panel visibility
  const [modelSelections, setModelSelections] = useState<ModelSelection[]>([]);
  const [messageModels, setMessageModels] = useState<{ [key: string]: string }>({});
  const [messageResponses, setMessageResponses] = useState<{ [key: string]: string[] }>({});
  const [originalResponses, setOriginalResponses] = useState<{ [key: string]: string }>({});
  const [isGenerating, setIsGenerating] = useState<{ [key: string]: boolean }>({});
  const [currentMessage, setCurrentMessage] = useState('');

  // Add a key to force re-render when New Chat is clicked
  const [chatKey, setChatKey] = useState(0);

  // Aurora configuration state
  const [auroraConfig, setAuroraConfig] = useState({
    colorStops: ['#1e74a9', '#97128c', '#05ecf0'] as [string, string, string],
    speed: 0.2,
    blend: 0.47,
    amplitude: 1.0,
  });

  // Remix state
  const [remixResponses, setRemixResponses] = useState<string[]>([]);
  const [remixModels, setRemixModels] = useState<string[]>([]);
  const [isRemixGenerating, setIsRemixGenerating] = useState<boolean>(false);
  const [showRemix, setShowRemix] = useState<boolean>(false);
  const [remixModel, setRemixModel] = useState<string>('');

  // Social Posts state
  const [showSocialPostsDrawer, setShowSocialPostsDrawer] = useState<boolean>(false);
  const [socialPostsResponses, setSocialPostsResponses] = useState<{ [key: string]: string }>({});
  const [isSocialPostsGenerating, setIsSocialPostsGenerating] = useState<{
    [key: string]: boolean;
  }>({});
  const [showSocialPosts, setShowSocialPosts] = useState<{ [key: string]: boolean }>({});
  const [socialPostsConfigs, setSocialPostsConfigs] = useState<{ [key: string]: SocialPostConfig }>(
    {},
  );

  // AI Selection toggle state
  const [showAISelection, setShowAISelection] = useState<boolean>(true);
  const [resetModelSelector, setResetModelSelector] = useState<boolean>(false);

  // New modal state
  const [showModelSelectionModal, setShowModelSelectionModal] = useState<boolean>(false);

  // Add state to track default model usage
  const [isUsingDefaultModel, setIsUsingDefaultModel] = useState<boolean>(false);

  // Add state to track left navigation collapse state
  const [isLeftNavCollapsed, setIsLeftNavCollapsed] = useState<boolean>(true);

  const handleSentenceSelect = useCallback((sentence: SelectedSentence) => {
    setSelectedSentences((prev) => {
      const exists = prev.find((s) => s.id === sentence.id);
      if (exists) {
        return prev.filter((s) => s.id !== sentence.id);
      } else {
        return [...prev, sentence];
      }
    });
  }, []);

  const handleModelSelectionsChange = useCallback(
    (selections: ModelSelection[]) => {
      setModelSelections(selections);
      // Reset default model flag when user manually selects models
      setIsUsingDefaultModel(false);
      // Generate messages based on model selections
      const newMessageModels: { [key: string]: string } = {};
      const newMessageResponses: { [key: string]: string[] } = {};
      const newOriginalResponses: { [key: string]: string } = {};
      const newIsGenerating: { [key: string]: boolean } = {};

      let messageIndex = 1;
      selections.forEach((selection) => {
        for (let i = 0; i < selection.count; i++) {
          const messageKey = messageIndex.toString();
          newMessageModels[messageKey] = selection.modelId;
          // Preserve existing responses if they exist, otherwise initialize empty
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
    [messageResponses, originalResponses, isGenerating],
  );

  // Add effect to handle orchestration after model selections are updated
  const [pendingOrchestration, setPendingOrchestration] = useState<{
    prompt: string;
    modelId: string;
  } | null>(null);

  const handleModelSelectionsUpdate = useCallback(
    (modelId: string) => {
      // Create a single model selection for the default model
      const newSelections: ModelSelection[] = [
        {
          modelId: modelId,
          count: 1,
        },
      ];
      handleModelSelectionsChange(newSelections);
      // Mark that we're using the default model
      setIsUsingDefaultModel(true);
    },
    [handleModelSelectionsChange],
  );

  const handleModelSelect = useCallback((modelId: string) => {
    // This function can be used for any additional model selection logic
    // For now, it's just a placeholder that can be extended later
  }, []);

  // Modal handlers
  const handleOpenModelSelectionModal = useCallback(() => {
    setShowModelSelectionModal(true);
  }, []);

  const handleCloseModelSelectionModal = useCallback(() => {
    setShowModelSelectionModal(false);
  }, []);

  const handleDirectSubmit = useCallback(
    async (prompt: string, modelId: string) => {
      // Store the current message
      setCurrentMessage(prompt);

      // If model selections are empty, we need to wait for them to be updated
      if (modelSelections.length === 0) {
        setPendingOrchestration({ prompt, modelId });
        return;
      }

      // Create a single message with the specified model
      const directMessageModels: { [key: string]: string } = { '1': modelId };

      // Send the prompt directly to the API
      try {
        await handleMessagePromptSubmit('1', prompt, [], modelId);
      } catch (error) {
        console.error('Error in direct submit:', error);
      }
    },
    [modelSelections.length],
  );

  // Add effect to handle orchestration after model selections are updated
  useEffect(() => {
    if (pendingOrchestration && modelSelections.length > 0) {
      const { prompt, modelId } = pendingOrchestration;
      setPendingOrchestration(null);

      // Start the orchestration with the updated model selections
      handleDirectSubmit(prompt, modelId);
    }
  }, [modelSelections, pendingOrchestration, handleDirectSubmit]);

  // Show modal on initial page load
  useEffect(() => {
    setShowModelSelectionModal(true);
  }, []);

  const handleSubmit = async (prompt: string, attachments?: File[]) => {
    // Check if any models are selected
    if (modelSelections.length === 0) {
      // Show the model selection modal instead of alert
      setShowModelSelectionModal(true);
      return;
    }

    // Store the current message
    setCurrentMessage(prompt);

    // Generate messages dynamically from modelSelections to ensure we have the latest data
    const dynamicMessageModels: { [key: string]: string } = {};
    let messageIndex = 1;
    modelSelections.forEach((selection) => {
      for (let i = 0; i < selection.count; i++) {
        const messageKey = messageIndex.toString();
        dynamicMessageModels[messageKey] = selection.modelId;
        messageIndex++;
      }
    });

    // Send the same prompt to all messages with their respective models
    const promises = [];

    for (const message of Object.keys(dynamicMessageModels)) {
      if (dynamicMessageModels[message]) {
        promises.push(
          handleMessagePromptSubmit(
            message,
            prompt,
            attachments || [],
            dynamicMessageModels[message],
          ),
        );
      } else {
      }
    }

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

  const handleNewChat = () => {
    setSelectedSentences([]);
    setMessageResponses((prev) => {
      const reset: { [key: string]: string[] } = {};
      Object.keys(prev).forEach((key) => {
        reset[key] = [];
      });
      return reset;
    });
    setOriginalResponses((prev) => {
      const reset: { [key: string]: string } = {};
      Object.keys(prev).forEach((key) => {
        reset[key] = '';
      });
      return reset;
    });
    setIsGenerating((prev) => {
      const reset: { [key: string]: boolean } = {};
      Object.keys(prev).forEach((key) => {
        reset[key] = false;
      });
      return reset;
    });
    setCurrentMessage('');
    // Increment chatKey to force re-render
    setChatKey((prev) => prev + 1);
    // Clear remix state
    setRemixResponses([]);
    setRemixModels([]);
    setIsRemixGenerating(false);
    setShowRemix(false);
    setRemixModel('');

    // Clear social posts state
    setSocialPostsResponses({});
    setIsSocialPostsGenerating({});
    setShowSocialPosts({});
    setSocialPostsConfigs({});

    // Reset model selections and show modal
    setModelSelections([]);
    setMessageModels({});
    setShowModelSelectionModal(true);
    // Reset default model flag
    setIsUsingDefaultModel(false);

    // Trigger model selector reset
    setResetModelSelector(true);
    // Reset the flag after a short delay
    setTimeout(() => setResetModelSelector(false), 100);
  };

  const handleMessagePromptSubmit = async (
    message: string,
    prompt: string,
    attachments: File[],
    model: string,
  ) => {
    // Set generating state for this message
    setIsGenerating((prev) => ({
      ...prev,
      [message]: true,
    }));

    // Clear previous responses for this message
    setMessageResponses((prev) => ({
      ...prev,
      [message]: [],
    }));
    setOriginalResponses((prev) => ({
      ...prev,
      [message]: '',
    }));

    try {
      // Prepare the request body as JSON
      const requestBody = {
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        model: model,
        stream: true, // Enable streaming
      };

      let response;

      if (attachments && attachments.length > 0) {
        // Use the attachments endpoint
        const formData = new FormData();
        formData.append('jsonData', JSON.stringify(requestBody));

        // Add files to form data
        attachments.forEach((file, index) => {
          formData.append(`file-${index}`, file);
        });

        response = await fetch('/api/chat/with-attachments', {
          method: 'POST',
          body: formData,
        });
      } else {
        // Use the regular endpoint
        response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Main page: Message ${message} - API error response:`, errorText);
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
            if (data === '[DONE]') {
              break;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.success && parsed.data && parsed.data.content) {
                accumulatedResponse += parsed.data.content;
                setMessageResponses((prev) => ({
                  ...prev,
                  [message]: [...(prev[message] || []), parsed.data.content],
                }));
              } else if (!parsed.success) {
                console.error('API Error:', parsed.error);
                throw new Error(parsed.error || 'API request failed');
              }
            } catch (e) {
              console.error('Error parsing JSON:', e);
              // Don't throw here, just continue processing other chunks
              // The error will be handled by the outer catch block if it's a critical error
            }
          }
        }
      }

      // Set the final accumulated response
      setOriginalResponses((prev) => ({
        ...prev,
        [message]: accumulatedResponse,
      }));
    } catch (error) {
      console.error(`Error in message ${message}:`, error);

      // Create user-friendly error message based on error type
      let errorMessage = 'An error occurred while generating the response.';

      if (error instanceof Error) {
        if (
          error.message.includes('429') ||
          error.message.includes('quota') ||
          error.message.includes('Too Many Requests')
        ) {
          errorMessage =
            'Rate limit exceeded. This model has reached its daily quota. Please try again later or use a different model.';
        } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
          errorMessage = 'Authentication error. Please check your API configuration.';
        } else if (
          error.message.includes('500') ||
          error.message.includes('internal server error')
        ) {
          errorMessage = 'Server error. Please try again in a few moments.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your internet connection and try again.';
        }
      }

      setMessageResponses((prev) => ({
        ...prev,
        [message]: [...(prev[message] || []), errorMessage],
      }));
    } finally {
      setIsGenerating((prev) => ({
        ...prev,
        [message]: false,
      }));
    }
  };

  const handleModelChange = useCallback((message: string, modelId: string) => {
    setMessageModels((prev) => ({
      ...prev,
      [message]: modelId,
    }));
  }, []);

  const handleAddMessage = useCallback(() => {
    const existingMessages = Object.keys(messageModels);

    // Limit to maximum 6 messages
    if (existingMessages.length >= 6) {
      alert('Maximum 6 messages allowed.');
      return;
    }

    const nextMessage = (existingMessages.length + 1).toString(); // '1', '2', ...

    setMessageModels((prev) => ({
      ...prev,
      [nextMessage]: '',
    }));

    setMessageResponses((prev) => ({
      ...prev,
      [nextMessage]: [],
    }));

    setOriginalResponses((prev) => ({
      ...prev,
      [nextMessage]: '',
    }));

    setIsGenerating((prev) => ({
      ...prev,
      [nextMessage]: false,
    }));
  }, [messageModels]);

  const handleDeleteMessage = useCallback(
    (messageKey: string) => {
      // Only allow delete if more than one message remains
      const currentMessages = Object.keys(messageModels);
      if (currentMessages.length <= 1) return;
      // Remove the message and re-index all messages
      const filteredKeys = currentMessages.filter((key) => key !== messageKey);
      const remap = (obj: { [key: string]: any }) => {
        const newObj: { [key: string]: any } = {};
        filteredKeys.forEach((key, index) => {
          const newKey = (index + 1).toString();
          newObj[newKey] = obj[key];
        });
        return newObj;
      };
      setMessageModels((prev) => remap(prev));
      setMessageResponses((prev) => remap(prev));
      setOriginalResponses((prev) => remap(prev));
      setIsGenerating((prev) => remap(prev));
    },
    [messageModels],
  );

  const handleRemix = useCallback(
    async (modelId: string) => {
      // Check if we have any responses to remix
      const hasResponses = Object.values(originalResponses).some(
        (response) => response.trim() !== '',
      );
      if (!hasResponses) {
        alert('No responses available to remix. Please generate some responses first.');
        return;
      }

      // Check if we have a current message
      if (!currentMessage.trim()) {
        alert('No current message to remix. Please submit a prompt first.');
        return;
      }

      setIsRemixGenerating(true);
      setShowRemix(true);
      // Add empty string to start new remix response
      setRemixResponses((prev) => [...prev, '']);
      // Add the model ID for this specific remix
      setRemixModels((prev) => [...prev, modelId]);
      setRemixModel(modelId);

      try {
        // Combine all existing responses
        const combinedResponses = Object.entries(originalResponses)
          .filter(([_, response]) => response.trim() !== '')
          .map(([message, response]) => `Message ${message}:\n${response}`)
          .join('\n\n---\n\n');

        // Create the remix prompt
        const remixPrompt = `${currentMessage}\n\nCombine the best parts from all of the responses together and provide a synthesized and curated response.\n\nHere are the responses to combine:\n\n${combinedResponses}`;

        // Prepare the request body
        const requestBody = {
          messages: [
            {
              role: 'user',
              content: remixPrompt,
            },
          ],
          model: modelId,
          stream: true,
        };

        // For remix, we don't need to include attachments since we're working with existing responses
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
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
              if (data === '[DONE]') {
                break;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.success && parsed.data && parsed.data.content) {
                  accumulatedResponse += parsed.data.content;
                  // Update the last element in the array with the accumulated response
                  setRemixResponses((prev) => {
                    const newResponses = [...prev];
                    newResponses[newResponses.length - 1] = accumulatedResponse;
                    return newResponses;
                  });
                } else if (!parsed.success) {
                  console.error('API Error:', parsed.error);
                  throw new Error(parsed.error || 'API request failed');
                }
              } catch (e) {
                console.error('Error parsing JSON:', e);
                // Don't throw here, just continue processing other chunks
                // The error will be handled by the outer catch block if it's a critical error
              }
            }
          }
        }
      } catch (error) {
        console.error('Error in remix:', error);

        // Create user-friendly error message based on error type
        let errorMessage = 'An error occurred while generating the remix response.';

        if (error instanceof Error) {
          if (
            error.message.includes('429') ||
            error.message.includes('quota') ||
            error.message.includes('Too Many Requests')
          ) {
            errorMessage =
              'Rate limit exceeded. The remix model has reached its daily quota. Please try again later or use a different model for remix.';
          } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
            errorMessage = 'Authentication error. Please check your API configuration.';
          } else if (
            error.message.includes('500') ||
            error.message.includes('internal server error')
          ) {
            errorMessage = 'Server error. Please try again in a few moments.';
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = 'Network error. Please check your internet connection and try again.';
          }
        }

        // Add error message as a new response
        setRemixResponses((prev) => [...prev, errorMessage]);
      } finally {
        setIsRemixGenerating(false);
      }
    },
    [originalResponses, currentMessage],
  );

  const handleCloseRemix = useCallback(() => {
    setShowRemix(false);
  }, []);

  const handleSocialPosts = useCallback(() => {
    setShowSocialPostsDrawer(true);
  }, []);

  const handleSocialPostsGenerate = useCallback(
    async (config: SocialPostConfig) => {
      // Generate a unique ID for this social post message
      const socialPostId = `social-${Date.now()}`;

      // Initialize the message
      setIsSocialPostsGenerating((prev) => ({ ...prev, [socialPostId]: true }));
      setShowSocialPosts((prev) => ({ ...prev, [socialPostId]: true }));
      setSocialPostsResponses((prev) => ({ ...prev, [socialPostId]: '' }));
      setSocialPostsConfigs((prev) => ({ ...prev, [socialPostId]: config }));

      try {
        // Determine the prompt to use
        const basePrompt = config.customPrompt || currentMessage;
        if (!basePrompt.trim()) {
          throw new Error('No prompt available for social posts generation');
        }

        // Create the social post prompt based on platform and type
        let socialPrompt = `${basePrompt}\n\n`;

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

        socialPrompt += `${platformPrompts[config.platform as keyof typeof platformPrompts]} ${typePrompts[config.postType as keyof typeof typePrompts]}`;

        // If using selected messages or existing responses, include them
        if (!config.customPrompt) {
          let responsesToInclude: string[] = [];

          // If specific messages are selected, use those
          if (config.selectedColumns && config.selectedColumns.length > 0) {
            responsesToInclude = config.selectedColumns
              .filter(
                (messageKey) =>
                  originalResponses[messageKey] && originalResponses[messageKey].trim() !== '',
              )
              .map((messageKey) => `Message ${messageKey}:\n${originalResponses[messageKey]}`);
          } else {
            // Otherwise, use all existing responses
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

        // Prepare the request body
        const requestBody = {
          messages: [
            {
              role: 'user',
              content: socialPrompt,
            },
          ],
          model: config.modelId,
          stream: true,
        };

        // For social posts, we don't need to include attachments since we're working with existing responses
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
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
              if (data === '[DONE]') {
                break;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.success && parsed.data && parsed.data.content) {
                  accumulatedResponse += parsed.data.content;
                  setSocialPostsResponses((prev) => ({
                    ...prev,
                    [socialPostId]: accumulatedResponse,
                  }));
                } else if (!parsed.success) {
                  console.error('API Error:', parsed.error);
                  throw new Error(parsed.error || 'API request failed');
                }
              } catch (e) {
                console.error('Error parsing JSON:', e);
                // Don't throw here, just continue processing other chunks
                // The error will be handled by the outer catch block if it's a critical error
              }
            }
          }
        }
      } catch (error) {
        console.error('Error in social posts generation:', error);

        // Create user-friendly error message based on error type
        let errorMessage = 'An error occurred while generating social posts.';

        if (error instanceof Error) {
          if (
            error.message.includes('429') ||
            error.message.includes('quota') ||
            error.message.includes('Too Many Requests')
          ) {
            errorMessage =
              'Rate limit exceeded. This model has reached its daily quota. Please try again later or use a different model.';
          } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
            errorMessage = 'Authentication error. Please check your API configuration.';
          } else if (
            error.message.includes('500') ||
            error.message.includes('internal server error')
          ) {
            errorMessage = 'Server error. Please try again in a few moments.';
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            errorMessage = 'Network error. Please check your internet connection and try again.';
          }
        }

        setSocialPostsResponses((prev) => ({
          ...prev,
          [socialPostId]: errorMessage,
        }));
      } finally {
        setIsSocialPostsGenerating((prev) => ({ ...prev, [socialPostId]: false }));
      }
    },
    [originalResponses, currentMessage],
  );

  const handleCloseSocialPosts = useCallback((socialPostId: string) => {
    setShowSocialPosts((prev) => {
      const newState = { ...prev };
      delete newState[socialPostId];
      return newState;
    });
    setSocialPostsResponses((prev) => {
      const newState = { ...prev };
      delete newState[socialPostId];
      return newState;
    });
    setSocialPostsConfigs((prev) => {
      const newState = { ...prev };
      delete newState[socialPostId];
      return newState;
    });
    setIsSocialPostsGenerating((prev) => {
      const newState = { ...prev };
      delete newState[socialPostId];
      return newState;
    });
  }, []);

  const handleToggleAISelection = useCallback(() => {
    setShowAISelection((prev) => {
      const newValue = !prev;
      // Only clear model selections if we're manually closing (not auto-hiding)
      // Auto-hiding happens when content is received, and we want to keep the selections
      if (prev && !newValue && modelSelections.length === 0) {
        // Only clear if there are no model selections (manual close)
        setMessageModels({});
        setMessageResponses({});
        setOriginalResponses({});
        setIsGenerating({});
      }
      return newValue;
    });
  }, [modelSelections.length]);

  const handleLeftNavToggle = useCallback((collapsed: boolean) => {
    setIsLeftNavCollapsed(collapsed);
  }, []);

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
          <TopBar onNewChat={handleNewChat} onSocialPosts={handleSocialPosts} />
          <div className="flex flex-1 overflow-hidden">
            <div className="flex flex-1 flex-col overflow-hidden">
              <div className="flex-1 p-6 pb-0 h-full">
                {/* Show header text when no AI responses are present */}
                <HeaderText
                  isVisible={
                    Object.values(messageResponses).every((responses) => responses.length === 0) &&
                    Object.values(originalResponses).every((response) => !response) &&
                    !Object.values(isGenerating).some((generating) => generating) &&
                    !isUsingDefaultModel
                  }
                />

                <ChatMessages
                  key={chatKey} // Add key to force re-render
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
                  remixDisabled={useMemo(() => {
                    const hasResponses = Object.values(messageResponses).some(
                      (responses) => responses.length > 0,
                    );
                    const hasCurrentMessage = currentMessage.trim();
                    const totalModelQuantity = modelSelections.reduce(
                      (total, selection) => total + selection.count,
                      0,
                    );
                    const hasMultipleModels = totalModelQuantity >= 2;
                    return !hasResponses || !hasCurrentMessage || !hasMultipleModels;
                  }, [messageResponses, currentMessage, modelSelections])}
                  modelSelections={modelSelections}
                  messageModels={messageModels}
                  onModelSelect={handleModelSelect}
                  onModelSelectionsUpdate={handleModelSelectionsUpdate}
                  onDirectSubmit={handleDirectSubmit}
                  onRestoreModelSelection={() => {
                    // Reset any state if needed when model selection is restored
                  }}
                  showAISelection={showAISelection}
                  onToggleAISelection={handleToggleAISelection}
                  resetModelSelector={resetModelSelector}
                  onModelSelectionClick={handleOpenModelSelectionModal}
                  isUsingDefaultModel={isUsingDefaultModel}
                  isLeftNavCollapsed={isLeftNavCollapsed}
                />
              </div>
            </div>
            {showRightPanel && (
              <RightSelectionsPanel
                selectedSentences={selectedSentences}
                onRemoveSentence={useCallback((id) => {
                  setSelectedSentences((prev) => prev.filter((s) => s.id !== id));
                }, [])}
              />
            )}
          </div>
        </div>

        {/* Social Posts Drawer */}
        <SocialPostsDrawer
          isOpen={showSocialPostsDrawer}
          onClose={() => setShowSocialPostsDrawer(false)}
          onGenerate={handleSocialPostsGenerate}
          availableMessages={originalResponses}
        />

        {/* Model Selection Modal */}
        <ModelSelectionModal
          isOpen={showModelSelectionModal}
          onClose={handleCloseModelSelectionModal}
          onModelSelectionsChange={handleModelSelectionsChange}
          initialSelections={modelSelections}
          disabled={Object.values(isGenerating).some((generating) => generating)}
        />
      </div>
    </AuroraBackground>
  );
}
