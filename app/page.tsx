'use client';

import { useState } from 'react';
import TopBar from '@/components/TopBar';
import LeftNavigation from '@/components/LeftNavigation';
import OutputColumns from '@/components/OutputColumns';
import RightSelectionsPanel from '@/components/RightSelectionsPanel';
import ChatInput from '@/components/ChatInput';
import FinalResponse from '@/components/FinalResponse';

export interface SelectedSentence {
  id: string;
  text: string;
  source: 'A' | 'B' | 'C';
}

export interface FinalResponseData {
  id: string;
  prompt: string;
  selectedSentences: SelectedSentence[];
  response: string;
  timestamp: Date;
}

export default function Home() {
  const [selectedSentences, setSelectedSentences] = useState<SelectedSentence[]>([]);
  const [finalResponses, setFinalResponses] = useState<FinalResponseData[]>([]);
  const [isGeneratingFinal, setIsGeneratingFinal] = useState(false);
  const [columnModels, setColumnModels] = useState({
    A: '',
    B: '',
    C: '',
  });
  const [columnResponses, setColumnResponses] = useState({
    A: [] as string[],
    B: [] as string[],
    C: [] as string[],
  });
  const [originalResponses, setOriginalResponses] = useState({
    A: '',
    B: '',
    C: '',
  });
  const [isGenerating, setIsGenerating] = useState({
    A: false,
    B: false,
    C: false,
  });
  const [currentMessage, setCurrentMessage] = useState('');

  const handleSentenceSelect = (sentence: SelectedSentence) => {
    setSelectedSentences((prev) => {
      const exists = prev.find((s) => s.id === sentence.id);
      if (exists) {
        return prev.filter((s) => s.id !== sentence.id);
      } else {
        return [...prev, sentence];
      }
    });
  };

  const handleSubmit = async (prompt: string, attachments?: File[]) => {
    console.log('Main page: handleSubmit called with prompt:', prompt);
    console.log('Main page: Current column models:', columnModels);

    // Store the current message
    setCurrentMessage(prompt);

    // Send the same prompt to all three columns with their respective models
    const promises = [];

    for (const column of ['A', 'B', 'C'] as const) {
      if (columnModels[column]) {
        console.log(
          `Main page: Adding promise for column ${column} with model ${columnModels[column]}`,
        );
        promises.push(handleColumnPromptSubmit(column, prompt, attachments || []));
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
    setSelectedSentences([]);
    setFinalResponses([]);
    setColumnResponses({
      A: [],
      B: [],
      C: [],
    });
    setOriginalResponses({
      A: '',
      B: '',
      C: '',
    });
    setCurrentMessage('');
    // Focus will be handled by the ChatInput component
  };

  const handleColumnPromptSubmit = async (
    column: 'A' | 'B' | 'C',
    prompt: string,
    attachments: File[],
  ) => {
    if (!columnModels[column]) {
      console.error(`No model selected for column ${column}`);
      return;
    }

    console.log(`Starting generation for column ${column} with model: ${columnModels[column]}`);
    setIsGenerating((prev) => ({ ...prev, [column]: true }));

    try {
      // Import the API client
      const { apiClient } = await import('@/lib/api-client');

      console.log(`Sending request to API for column ${column}`);
      const response = await apiClient.sendMessageWithAttachments(
        prompt,
        columnModels[column],
        attachments,
      );

      console.log(`API response for column ${column}:`, response);

      if (response.success && response.data) {
        // Store the original response for markdown view
        setOriginalResponses((prev) => ({
          ...prev,
          [column]: response.data?.content || '',
        }));

        // Split the response into sentences for better selection
        const sentences = response.data.content
          .split(/[.!?]+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 10); // Filter out very short sentences

        console.log(`Generated ${sentences.length} sentences for column ${column}:`, sentences);

        setColumnResponses((prev) => ({
          ...prev,
          [column]: [...prev[column], ...sentences],
        }));
      } else {
        console.error('Failed to generate response:', response.error);
        // Add user feedback for errors - use a more user-friendly approach
        console.error(`Error generating response for column ${column}: ${response.error}`);
      }
    } catch (error) {
      console.error(`Error generating response for column ${column}:`, error);
      // Add user feedback for errors - use a more user-friendly approach
      console.error(
        `Error generating response for column ${column}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    } finally {
      setIsGenerating((prev) => ({ ...prev, [column]: false }));
    }
  };

  const handleModelChange = (column: 'A' | 'B' | 'C', modelId: string) => {
    console.log(`Model changed for column ${column}: ${modelId}`);
    setColumnModels((prev) => {
      const newModels = {
        ...prev,
        [column]: modelId,
      };
      console.log('Updated column models:', newModels);
      return newModels;
    });
  };

  const handleGenerateFinalResponse = async (prompt: string) => {
    if (selectedSentences.length === 0) return;

    setIsGeneratingFinal(true);
    try {
      // TODO: Implement AI final response generation
      // For now, simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newFinalResponse: FinalResponseData = {
        id: Date.now().toString(),
        prompt,
        selectedSentences: [...selectedSentences],
        response: `Based on your selected sentences, here's a refined response that combines the best elements from all three outputs. This approach demonstrates how the 3x Rule methodology can create more comprehensive and well-rounded content by leveraging multiple AI perspectives.`,
        timestamp: new Date(),
      };

      setFinalResponses((prev) => [newFinalResponse, ...prev]);
      setSelectedSentences([]); // Clear selections after generating
    } catch (error) {
      console.error('Error generating final response:', error);
    } finally {
      setIsGeneratingFinal(false);
    }
  };

  return (
    <div className="h-screen bg-kitchen-off-white flex overflow-hidden">
      {/* Left Navigation - Full height from top to bottom */}
      <LeftNavigation />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar onNewChat={handleNewChat} />
        <div className="flex flex-1 overflow-hidden">
          {/* Output Columns and Chat Input */}
          <div className="flex-1 flex flex-col p-6">
            {/* Fixed Height Output Columns */}
            <div className="h-[calc(100vh-16rem)] mb-6">
              <OutputColumns
                onSentenceSelect={handleSentenceSelect}
                selectedSentences={selectedSentences}
                onModelChange={handleModelChange}
                columnResponses={columnResponses}
                originalResponses={originalResponses}
                isGenerating={isGenerating}
              />
            </div>

            {/* Message Box and Send Button */}
            <ChatInput
              onSubmit={handleSubmit}
              currentMessage={currentMessage}
              onNewChat={handleNewChat}
            />

            {/* Final Response Section - Scrollable if needed */}
            {finalResponses.length > 0 && (
              <div className="mt-6 overflow-y-auto flex-1">
                <h2 className="text-xl font-semibold text-kitchen-text mb-4">Final Responses</h2>
                <div className="space-y-4">
                  {finalResponses.map((finalResponse) => (
                    <FinalResponse key={finalResponse.id} data={finalResponse} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Selections Panel - Fixed height */}
          <div className="h-[calc(100vh-4rem)] overflow-hidden">
            <RightSelectionsPanel
              selectedSentences={selectedSentences}
              onRemoveSentence={(id) => {
                setSelectedSentences((prev) => prev.filter((s) => s.id !== id));
              }}
              onGenerateFinal={handleGenerateFinalResponse}
              isGenerating={isGeneratingFinal}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
