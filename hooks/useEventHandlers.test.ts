import { renderHook, act } from '@testing-library/react';
import { useEventHandlers } from './useEventHandlers';
import { SelectedSentence } from './useChatState';
import { ModelSelection } from '@/components/ModelGridSelector';
import { SocialPostConfig } from '@/components/SocialPostsDrawer';

// Mock the API utilities
jest.mock('@/lib/api-utils', () => ({
  sendChatRequest: jest.fn(),
  handleStreamResponse: jest.fn(),
}));

// Mock the error utilities
jest.mock('@/lib/error-utils', () => ({
  createErrorMessage: jest.fn((error: Error) => `Error: ${error.message}`),
}));

describe('useEventHandlers', () => {
  // Mock state setters
  const mockSetSelectedSentences = jest.fn();
  const mockSetCurrentMessage = jest.fn();
  const mockSetMessageModels = jest.fn();
  const mockSetMessageResponses = jest.fn();
  const mockSetOriginalResponses = jest.fn();
  const mockSetIsGenerating = jest.fn();
  const mockSetRemixResponses = jest.fn();
  const mockSetRemixModels = jest.fn();
  const mockSetIsRemixGenerating = jest.fn();
  const mockSetShowRemix = jest.fn();
  const mockSetRemixModel = jest.fn();
  const mockSetSocialPostsResponses = jest.fn();
  const mockSetIsSocialPostsGenerating = jest.fn();
  const mockSetShowSocialPosts = jest.fn();
  const mockSetSocialPostsConfigs = jest.fn();
  const mockSetModelSelections = jest.fn();
  const mockSetIsUsingDefaultModel = jest.fn();
  const mockSetShowModelSelectionModal = jest.fn();
  const mockSetIsLeftNavCollapsed = jest.fn();
  const mockSetPendingOrchestration = jest.fn();

  // Mock current state values
  const mockMessageResponses = { '1': ['response1'], '2': ['response2'] };
  const mockOriginalResponses = { '1': 'original1', '2': 'original2' };
  const mockIsGenerating = { '1': false, '2': true };
  const mockCurrentMessage = 'test message';
  const mockModelSelections: ModelSelection[] = [
    { modelId: 'gpt-4', count: 1 },
    { modelId: 'claude-3', count: 2 },
  ];
  const mockPendingOrchestration = null;

  const defaultProps = {
    setSelectedSentences: mockSetSelectedSentences,
    setCurrentMessage: mockSetCurrentMessage,
    setMessageModels: mockSetMessageModels,
    setMessageResponses: mockSetMessageResponses,
    setOriginalResponses: mockSetOriginalResponses,
    setIsGenerating: mockSetIsGenerating,
    setRemixResponses: mockSetRemixResponses,
    setRemixModels: mockSetRemixModels,
    setIsRemixGenerating: mockSetIsRemixGenerating,
    setShowRemix: mockSetShowRemix,
    setRemixModel: mockSetRemixModel,
    setSocialPostsResponses: mockSetSocialPostsResponses,
    setIsSocialPostsGenerating: mockSetIsSocialPostsGenerating,
    setShowSocialPosts: mockSetShowSocialPosts,
    setSocialPostsConfigs: mockSetSocialPostsConfigs,
    setModelSelections: mockSetModelSelections,
    setIsUsingDefaultModel: mockSetIsUsingDefaultModel,
    setShowModelSelectionModal: mockSetShowModelSelectionModal,
    setIsLeftNavCollapsed: mockSetIsLeftNavCollapsed,
    messageResponses: mockMessageResponses,
    originalResponses: mockOriginalResponses,
    isGenerating: mockIsGenerating,
    currentMessage: mockCurrentMessage,
    modelSelections: mockModelSelections,
    pendingOrchestration: mockPendingOrchestration,
    setPendingOrchestration: mockSetPendingOrchestration,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleSentenceSelect', () => {
    it('should add a new sentence when it does not exist', () => {
      const { result } = renderHook(() => useEventHandlers(defaultProps));
      const newSentence: SelectedSentence = { id: '3', text: 'new text', source: 'source3' };

      act(() => {
        result.current.handleSentenceSelect(newSentence);
      });

      expect(mockSetSelectedSentences).toHaveBeenCalledWith(expect.any(Function));
      const setterFunction = mockSetSelectedSentences.mock.calls[0][0];
      const result2 = setterFunction([{ id: '1', text: 'text1', source: 'source1' }]);
      expect(result2).toEqual([
        { id: '1', text: 'text1', source: 'source1' },
        { id: '3', text: 'new text', source: 'source3' },
      ]);
    });

    it('should remove a sentence when it already exists', () => {
      const { result } = renderHook(() => useEventHandlers(defaultProps));
      const existingSentence: SelectedSentence = { id: '1', text: 'text1', source: 'source1' };

      act(() => {
        result.current.handleSentenceSelect(existingSentence);
      });

      expect(mockSetSelectedSentences).toHaveBeenCalledWith(expect.any(Function));
      const setterFunction = mockSetSelectedSentences.mock.calls[0][0];
      const result2 = setterFunction([
        { id: '1', text: 'text1', source: 'source1' },
        { id: '2', text: 'text2', source: 'source2' },
      ]);
      expect(result2).toEqual([{ id: '2', text: 'text2', source: 'source2' }]);
    });
  });

  describe('handleModelSelectionsChange', () => {
    it('should update model selections and related state', () => {
      const { result } = renderHook(() => useEventHandlers(defaultProps));
      const newSelections: ModelSelection[] = [
        { modelId: 'gpt-4', count: 2 },
        { modelId: 'claude-3', count: 1 },
      ];

      act(() => {
        result.current.handleModelSelectionsChange(newSelections);
      });

      expect(mockSetModelSelections).toHaveBeenCalledWith(newSelections);
      expect(mockSetIsUsingDefaultModel).toHaveBeenCalledWith(false);
      expect(mockSetMessageModels).toHaveBeenCalled();
      expect(mockSetMessageResponses).toHaveBeenCalled();
      expect(mockSetOriginalResponses).toHaveBeenCalled();
      expect(mockSetIsGenerating).toHaveBeenCalled();
    });

    it('should preserve existing responses when updating models', () => {
      const { result } = renderHook(() => useEventHandlers(defaultProps));
      const newSelections: ModelSelection[] = [{ modelId: 'gpt-4', count: 1 }];

      act(() => {
        result.current.handleModelSelectionsChange(newSelections);
      });

      expect(mockSetMessageResponses).toHaveBeenCalledWith(expect.any(Object));
      const setterFunction = mockSetMessageResponses.mock.calls[0][0];
      expect(setterFunction).toEqual({ '1': ['response1'] });
    });
  });

  describe('handleModelSelectionsUpdate', () => {
    it('should create single model selection and set using default model', () => {
      const { result } = renderHook(() => useEventHandlers(defaultProps));

      act(() => {
        result.current.handleModelSelectionsUpdate('gpt-4');
      });

      expect(mockSetIsUsingDefaultModel).toHaveBeenCalledWith(true);
    });
  });

  describe('handleDirectSubmit', () => {
    it('should set pending orchestration when no models are selected', async () => {
      const propsWithNoModels = { ...defaultProps, modelSelections: [] };
      const { result } = renderHook(() => useEventHandlers(propsWithNoModels));

      await act(async () => {
        await result.current.handleDirectSubmit('test prompt', 'gpt-4');
      });

      expect(mockSetCurrentMessage).toHaveBeenCalledWith('test prompt');
      expect(mockSetPendingOrchestration).toHaveBeenCalledWith({
        prompt: 'test prompt',
        modelId: 'gpt-4',
      });
    });

    it('should call handleMessagePromptSubmit when models are selected', async () => {
      const { result } = renderHook(() => useEventHandlers(defaultProps));

      await act(async () => {
        await result.current.handleDirectSubmit('test prompt', 'gpt-4');
      });

      expect(mockSetCurrentMessage).toHaveBeenCalledWith('test prompt');
    });
  });

  describe('handleSubmit', () => {
    it('should show model selection modal when no models are selected', async () => {
      const propsWithNoModels = { ...defaultProps, modelSelections: [] };
      const { result } = renderHook(() => useEventHandlers(propsWithNoModels));

      await act(async () => {
        await result.current.handleSubmit('test prompt');
      });

      expect(mockSetShowModelSelectionModal).toHaveBeenCalledWith(true);
    });

    it('should process submission when models are selected', async () => {
      const { result } = renderHook(() => useEventHandlers(defaultProps));

      await act(async () => {
        await result.current.handleSubmit('test prompt');
      });

      expect(mockSetCurrentMessage).toHaveBeenCalledWith('test prompt');
    });
  });

  describe('handleRemix', () => {
    it('should show alert when no responses are available', async () => {
      const propsWithNoResponses = { ...defaultProps, originalResponses: {} };
      const { result } = renderHook(() => useEventHandlers(propsWithNoResponses));
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      await act(async () => {
        await result.current.handleRemix('gpt-4');
      });

      expect(alertSpy).toHaveBeenCalledWith(
        'No responses available to remix. Please generate some responses first.',
      );
      alertSpy.mockRestore();
    });

    it('should show alert when no current message', async () => {
      const propsWithNoMessage = { ...defaultProps, currentMessage: '' };
      const { result } = renderHook(() => useEventHandlers(propsWithNoMessage));
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

      await act(async () => {
        await result.current.handleRemix('gpt-4');
      });

      expect(alertSpy).toHaveBeenCalledWith(
        'No current message to remix. Please submit a prompt first.',
      );
      alertSpy.mockRestore();
    });

    it('should process remix when conditions are met', async () => {
      const { result } = renderHook(() => useEventHandlers(defaultProps));

      await act(async () => {
        await result.current.handleRemix('gpt-4');
      });

      expect(mockSetIsRemixGenerating).toHaveBeenCalledWith(true);
      expect(mockSetShowRemix).toHaveBeenCalledWith(true);
      expect(mockSetRemixResponses).toHaveBeenCalled();
      expect(mockSetRemixModels).toHaveBeenCalled();
      expect(mockSetRemixModel).toHaveBeenCalledWith('gpt-4');
    });
  });

  describe('handleSocialPostsGenerate', () => {
    it('should process social posts generation', async () => {
      const { result } = renderHook(() => useEventHandlers(defaultProps));
      const config: SocialPostConfig = {
        platform: 'twitter',
        postType: 'tweet',
        numberOfPosts: 3,
        characterLimit: 280,
        modelId: 'gpt-4',
        customPrompt: 'test prompt',
        selectedColumns: ['1'],
        isThreaded: false,
      };

      await act(async () => {
        await result.current.handleSocialPostsGenerate(config);
      });

      expect(mockSetIsSocialPostsGenerating).toHaveBeenCalled();
      expect(mockSetShowSocialPosts).toHaveBeenCalled();
      expect(mockSetSocialPostsResponses).toHaveBeenCalled();
      expect(mockSetSocialPostsConfigs).toHaveBeenCalled();
    });

    it('should throw error when no prompt is available', async () => {
      const propsWithNoMessage = { ...defaultProps, currentMessage: '' };
      const { result } = renderHook(() => useEventHandlers(propsWithNoMessage));
      const config: SocialPostConfig = {
        platform: 'twitter',
        postType: 'tweet',
        numberOfPosts: 3,
        characterLimit: 280,
        modelId: 'gpt-4',
        selectedColumns: ['1'],
        isThreaded: false,
      };

      await act(async () => {
        await result.current.handleSocialPostsGenerate(config);
      });

      expect(mockSetSocialPostsResponses).toHaveBeenCalled();
    });
  });

  describe('handleCloseSocialPosts', () => {
    it('should remove social post from all state objects', () => {
      const { result } = renderHook(() => useEventHandlers(defaultProps));

      act(() => {
        result.current.handleCloseSocialPosts('social-123');
      });

      expect(mockSetShowSocialPosts).toHaveBeenCalled();
      expect(mockSetSocialPostsResponses).toHaveBeenCalled();
      expect(mockSetSocialPostsConfigs).toHaveBeenCalled();
      expect(mockSetIsSocialPostsGenerating).toHaveBeenCalled();
    });
  });

  describe('handleLeftNavToggle', () => {
    it('should toggle left navigation collapsed state', () => {
      const { result } = renderHook(() => useEventHandlers(defaultProps));

      act(() => {
        result.current.handleLeftNavToggle(true);
      });

      expect(mockSetIsLeftNavCollapsed).toHaveBeenCalledWith(true);
    });
  });
});
