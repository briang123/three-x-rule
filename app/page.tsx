'use client';

import { useState, useCallback } from 'react';
import TopBar from '@/components/TopBar';
import LeftNavigation from '@/components/LeftNavigation';
import OutputColumns from '@/components/OutputColumns';
import RightSelectionsPanel from '@/components/RightSelectionsPanel';
import ChatInput from '@/components/ChatInput';
import SocialPostsDrawer, { SocialPostConfig } from '@/components/SocialPostsDrawer';

export interface SelectedSentence {
  id: string;
  text: string;
  source: string;
}

export default function Home() {
  const [selectedSentences, setSelectedSentences] = useState<SelectedSentence[]>([]);
  const [showRightPanel, setShowRightPanel] = useState(false); // Add state to control right panel visibility
  const [columnModels, setColumnModels] = useState<{ [key: string]: string }>({
    '1': 'gemini-2.5-pro',
    '2': 'gemini-2.5-flash',
    '3': 'gemini-2.5-flash-lite',
  });
  const [columnResponses, setColumnResponses] = useState<{ [key: string]: string[] }>({
    '1': [],
    '2': [],
    '3': [],
  });
  const [originalResponses, setOriginalResponses] = useState<{ [key: string]: string }>({
    '1': '',
    '2': '',
    '3': '',
  });
  const [isGenerating, setIsGenerating] = useState<{ [key: string]: boolean }>({
    '1': false,
    '2': false,
    '3': false,
  });
  const [currentMessage, setCurrentMessage] = useState('');

  // Remix state
  const [remixResponse, setRemixResponse] = useState<string>('');
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

  const handleSubmit = async (prompt: string, attachments?: File[]) => {
    console.log('Main page: handleSubmit called with prompt:', prompt);
    console.log('Main page: Current column models:', columnModels);

    // Store the current message
    setCurrentMessage(prompt);

    // Send the same prompt to all columns with their respective models
    const promises = [];

    for (const column of Object.keys(columnModels)) {
      if (columnModels[column]) {
        console.log(
          `Main page: Adding promise for column ${column} with model ${columnModels[column]}`,
        );
        promises.push(handleColumnPromptSubmit(column, prompt, attachments));
      } else {
        console.log(`Main page: No model selected for column ${column}`);
      }
    }

    if (promises.length === 0) {
      console.error('No models selected for any column');
      alert('Please select models for at least one column before submitting.');
      return;
    }

    console.log(`Main page: Starting ${promises.length} API calls`);
    try {
      await Promise.all(promises);
      console.log('Main page: All API calls completed');
    } catch (error) {
      console.error('Error generating responses:', error);
    }
  };

  const handleNewChat = () => {
    console.log('Main page: handleNewChat called, clearing currentMessage');
    setSelectedSentences([]);
    setColumnResponses((prev) => {
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
    // Clear remix state
    setRemixResponse('');
    setIsRemixGenerating(false);
    setShowRemix(false);
    setRemixModel('');

    // Clear social posts state
    setSocialPostsResponses({});
    setIsSocialPostsGenerating({});
    setShowSocialPosts({});
    setSocialPostsConfigs({});
    console.log('Main page: currentMessage cleared');
  };

  const handleColumnPromptSubmit = async (column: string, prompt: string, attachments: File[]) => {
    console.log(`Main page: handleColumnPromptSubmit called for column ${column}`);
    console.log(`Main page: Using model ${columnModels[column]} for column ${column}`);

    // Set generating state for this column
    setIsGenerating((prev) => ({
      ...prev,
      [column]: true,
    }));

    // Clear previous responses for this column
    setColumnResponses((prev) => ({
      ...prev,
      [column]: [],
    }));
    setOriginalResponses((prev) => ({
      ...prev,
      [column]: '',
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
        model: columnModels[column],
        stream: true, // Enable streaming
      };

      console.log(`Main page: Sending request for column ${column}`);
      console.log(`Main page: Column ${column} - attachments:`, attachments);
      console.log(`Main page: Column ${column} - attachments.length:`, attachments?.length);
      console.log(`Main page: Column ${column} - attachments type:`, typeof attachments);

      let response;

      if (attachments && attachments.length > 0) {
        console.log(
          `Main page: Column ${column} - Using attachments endpoint with ${attachments.length} files`,
        );
        // Use the attachments endpoint
        const formData = new FormData();
        formData.append('jsonData', JSON.stringify(requestBody));

        // Add files to form data
        attachments.forEach((file, index) => {
          console.log(
            `Main page: Column ${column} - Adding file ${index}:`,
            file.name,
            file.type,
            file.size,
          );
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
        console.error(`Main page: Column ${column} - API error response:`, errorText);
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
              console.log(`Main page: Stream completed for column ${column}`);
              break;
            }

            try {
              const parsed = JSON.parse(data);
              if (parsed.success && parsed.data && parsed.data.content) {
                accumulatedResponse += parsed.data.content;
                setColumnResponses((prev) => ({
                  ...prev,
                  [column]: [...(prev[column] || []), parsed.data.content],
                }));
              } else if (!parsed.success) {
                console.error('API Error:', parsed.error);
                throw new Error(parsed.error || 'API request failed');
              }
            } catch (e) {
              console.error('Error parsing JSON:', e);
            }
          }
        }
      }

      // Set the final accumulated response
      setOriginalResponses((prev) => ({
        ...prev,
        [column]: accumulatedResponse,
      }));

      console.log(`Main page: Completed response for column ${column}:`, accumulatedResponse);
    } catch (error) {
      console.error(`Error in column ${column}:`, error);
      setColumnResponses((prev) => ({
        ...prev,
        [column]: [...(prev[column] || []), 'Error: Failed to generate response'],
      }));
    } finally {
      setIsGenerating((prev) => ({
        ...prev,
        [column]: false,
      }));
    }
  };

  const handleModelChange = useCallback((column: string, modelId: string) => {
    console.log(`Main page: Model changed for column ${column}: ${modelId}`);
    setColumnModels((prev) => ({
      ...prev,
      [column]: modelId,
    }));
  }, []);

  const handleAddColumn = useCallback(() => {
    const existingColumns = Object.keys(columnModels);

    // Limit to maximum 6 columns
    if (existingColumns.length >= 6) {
      return;
    }

    const nextColumn = (existingColumns.length + 1).toString(); // '1', '2', ...

    setColumnModels((prev) => ({
      ...prev,
      [nextColumn]: '',
    }));

    setColumnResponses((prev) => ({
      ...prev,
      [nextColumn]: [],
    }));

    setOriginalResponses((prev) => ({
      ...prev,
      [nextColumn]: '',
    }));

    setIsGenerating((prev) => ({
      ...prev,
      [nextColumn]: false,
    }));
  }, [columnModels]);

  const handleDeleteColumn = useCallback(
    (columnKey: string) => {
      // Only allow delete if more than one column remains
      const currentColumns = Object.keys(columnModels);
      if (currentColumns.length <= 1) return;
      // Remove the column and re-index all columns
      const filteredKeys = currentColumns.filter((key) => key !== columnKey);
      const remap = (obj: { [key: string]: any }) => {
        const newObj: { [key: string]: any } = {};
        filteredKeys.forEach((oldKey, idx) => {
          newObj[(idx + 1).toString()] = obj[oldKey];
        });
        return newObj;
      };
      setColumnModels((prev) => remap(prev));
      setColumnResponses((prev) => remap(prev));
      setOriginalResponses((prev) => remap(prev));
      setIsGenerating((prev) => remap(prev));
    },
    [columnModels],
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

      console.log('Main page: handleRemix called with model:', modelId);

      setIsRemixGenerating(true);
      setShowRemix(true);
      setRemixResponse('');
      setRemixModel(modelId);

      try {
        // Combine all existing responses
        const combinedResponses = Object.entries(originalResponses)
          .filter(([_, response]) => response.trim() !== '')
          .map(([column, response]) => `Column ${column}:\n${response}`)
          .join('\n\n---\n\n');

        // Create the remix prompt
        const remixPrompt = `${currentMessage}\n\nCombine the best parts from all of the responses together and provide a synthesized and curated response.\n\nHere are the responses to combine:\n\n${combinedResponses}`;

        console.log('Main page: Sending remix request with prompt:', remixPrompt);

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
                console.log('Main page: Remix stream completed');
                break;
              }

              try {
                const parsed = JSON.parse(data);
                if (parsed.success && parsed.data && parsed.data.content) {
                  accumulatedResponse += parsed.data.content;
                  setRemixResponse(accumulatedResponse);
                } else if (!parsed.success) {
                  console.error('API Error:', parsed.error);
                  throw new Error(parsed.error || 'API request failed');
                }
              } catch (e) {
                console.error('Error parsing JSON:', e);
              }
            }
          }
        }

        console.log('Main page: Remix completed:', accumulatedResponse);
      } catch (error) {
        console.error('Error in remix:', error);
        setRemixResponse('Error: Failed to generate remix response');
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
      console.log('Main page: handleSocialPostsGenerate called with config:', config);

      // Generate a unique ID for this social post column
      const socialPostId = `social-${Date.now()}`;

      // Initialize the column
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

        // If using selected columns or existing responses, include them
        if (!config.customPrompt) {
          let responsesToInclude: string[] = [];

          // If specific columns are selected, use those
          if (config.selectedColumns && config.selectedColumns.length > 0) {
            responsesToInclude = config.selectedColumns
              .filter(
                (columnKey) =>
                  originalResponses[columnKey] && originalResponses[columnKey].trim() !== '',
              )
              .map((columnKey) => `Column ${columnKey}:\n${originalResponses[columnKey]}`);
          } else {
            // Otherwise, use all existing responses
            const hasResponses = Object.values(originalResponses).some(
              (response) => response.trim() !== '',
            );
            if (hasResponses) {
              responsesToInclude = Object.entries(originalResponses)
                .filter(([_, response]) => response.trim() !== '')
                .map(([column, response]) => `Column ${column}:\n${response}`);
            }
          }

          if (responsesToInclude.length > 0) {
            const combinedResponses = responsesToInclude.join('\n\n---\n\n');
            socialPrompt += `\n\nUse the following content as reference:\n\n${combinedResponses}`;
          }
        }

        console.log('Main page: Sending social posts request with prompt:', socialPrompt);

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
                console.log('Main page: Social posts stream completed');
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
              }
            }
          }
        }

        console.log('Main page: Social posts completed:', accumulatedResponse);
      } catch (error) {
        console.error('Error in social posts generation:', error);
        setSocialPostsResponses((prev) => ({
          ...prev,
          [socialPostId]: 'Error: Failed to generate social posts',
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

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-kitchen-dark-bg transition-colors duration-200">
      <LeftNavigation />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar onNewChat={handleNewChat} onSocialPosts={handleSocialPosts} />
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 p-6 pb-0 h-full">
              <OutputColumns
                onSentenceSelect={handleSentenceSelect}
                selectedSentences={selectedSentences}
                onModelChange={handleModelChange}
                columnResponses={columnResponses}
                originalResponses={originalResponses}
                isGenerating={isGenerating}
                onAddColumn={handleAddColumn}
                onDeleteColumn={handleDeleteColumn}
                remixResponse={remixResponse}
                isRemixGenerating={isRemixGenerating}
                showRemix={showRemix}
                onCloseRemix={handleCloseRemix}
                remixModel={remixModel}
                socialPostsResponses={socialPostsResponses}
                isSocialPostsGenerating={isSocialPostsGenerating}
                showSocialPosts={showSocialPosts}
                onCloseSocialPosts={handleCloseSocialPosts}
                socialPostsConfigs={socialPostsConfigs}
                onSubmit={handleSubmit}
                currentMessage={currentMessage}
                onRemix={handleRemix}
                remixDisabled={
                  !Object.values(originalResponses).some((response) => response.trim() !== '') ||
                  !currentMessage.trim()
                }
                isRemixGenerating={isRemixGenerating}
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
        availableColumns={originalResponses}
      />
    </div>
  );
}
