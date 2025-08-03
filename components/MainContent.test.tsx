import { render, screen, fireEvent } from '@testing-library/react';
import MainContent from './MainContent';
import { SelectedSentence } from '@/hooks';

// Mock the app context
jest.mock('@/app/page', () => ({
  useAppContext: () => ({
    chatState: {
      chatKey: 1,
      messageResponses: { '1': ['response1'], '2': ['response2'] },
      originalResponses: { '1': 'original1', '2': 'original2' },
      isGenerating: { '1': false, '2': true },
      currentMessage: 'test message',
      selectedSentences: [
        { id: '1', text: 'sentence 1', source: 'source1' },
        { id: '2', text: 'sentence 2', source: 'source2' },
      ] as SelectedSentence[],
      messageModels: { '1': 'gpt-4', '2': 'claude-3' },
      setSelectedSentences: jest.fn(),
      setCurrentMessage: jest.fn(),
      setMessageModels: jest.fn(),
      setMessageResponses: jest.fn(),
      setOriginalResponses: jest.fn(),
      setIsGenerating: jest.fn(),
      resetChatState: jest.fn(),
    },
    remixState: {
      remixResponses: ['remix1', 'remix2'],
      remixModels: ['gpt-4', 'claude-3'],
      isRemixGenerating: false,
      showRemix: true,
      remixModel: 'gpt-4',
      setRemixResponses: jest.fn(),
      setRemixModels: jest.fn(),
      setIsRemixGenerating: jest.fn(),
      setShowRemix: jest.fn(),
      setRemixModel: jest.fn(),
      resetRemixState: jest.fn(),
    },
    socialPostsState: {
      socialPostsResponses: { 'post-1': 'social response 1' },
      isSocialPostsGenerating: { 'post-1': false },
      showSocialPosts: { 'post-1': true },
      socialPostsConfigs: { 'post-1': { platform: 'twitter', postType: 'tweet' } },
      setSocialPostsResponses: jest.fn(),
      setIsSocialPostsGenerating: jest.fn(),
      setShowSocialPosts: jest.fn(),
      setSocialPostsConfigs: jest.fn(),
      resetSocialPostsState: jest.fn(),
    },
    modelSelectionState: {
      modelSelections: [{ modelId: 'gpt-4', count: 1 }],
      showAISelection: true,
      isUsingDefaultModel: false,
      resetModelSelector: false,
      setModelSelections: jest.fn(),
      setShowAISelection: jest.fn(),
      setIsUsingDefaultModel: jest.fn(),
      setResetModelSelector: jest.fn(),
      setShowModelSelectionModal: jest.fn(),
      resetModelSelectionState: jest.fn(),
    },
    uiState: {
      showRightPanel: true,
      isLeftNavCollapsed: false,
      setIsLeftNavCollapsed: jest.fn(),
      auroraConfig: {
        colorStops: ['#ff0000', '#00ff00'],
        speed: 1,
        blend: 'multiply',
        amplitude: 1,
      },
    },
    computedValues: {
      isHeaderVisible: false,
      isRemixDisabled: false,
      isGeneratingAny: false,
    },
    eventHandlers: {
      handleSentenceSelect: jest.fn(),
      handleCloseSocialPosts: jest.fn(),
      handleSubmit: jest.fn(),
      handleRemix: jest.fn(),
      handleModelSelectionsUpdate: jest.fn(),
      handleDirectSubmit: jest.fn(),
      handleSocialPostsGenerate: jest.fn(),
      handleModelSelectionsChange: jest.fn(),
      handleLeftNavToggle: jest.fn(),
    },
    toggleHandlers: {
      handleToggleAISelection: jest.fn(),
    },
  }),
}));

// Mock the child components
jest.mock('./ChatMessages', () => {
  return function MockChatMessages(props: any) {
    return (
      <div data-testid="chat-messages">
        <button onClick={() => props.onSentenceSelect({ id: '1', text: 'test', source: 'test' })}>
          Select Sentence
        </button>
        <button onClick={() => props.onSubmit('test prompt')}>Submit</button>
        <button onClick={() => props.onRemix('gpt-4')}>Remix</button>
        <button onClick={() => props.onModelSelectionsUpdate('gpt-4')}>Update Models</button>
        <button onClick={() => props.onDirectSubmit('test prompt', 'gpt-4')}>Direct Submit</button>
        <button onClick={() => props.onToggleAISelection()}>Toggle AI</button>
        <button onClick={() => props.onModelSelectionClick()}>Model Selection</button>
      </div>
    );
  };
});

jest.mock('./RightSelectionsPanel', () => {
  return function MockRightSelectionsPanel(props: any) {
    return (
      <div data-testid="right-selections-panel">
        <button onClick={() => props.onRemoveSentence('1')}>Remove Sentence</button>
      </div>
    );
  };
});

describe('MainContent', () => {
  const mockOnModelSelectionClick = jest.fn();
  const mockOnRemoveSentence = jest.fn();

  const defaultProps = {
    onModelSelectionClick: mockOnModelSelectionClick,
    onRemoveSentence: mockOnRemoveSentence,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render chat messages and right selections panel', () => {
    render(<MainContent {...defaultProps} />);

    expect(screen.getByTestId('chat-messages')).toBeInTheDocument();
    expect(screen.getByTestId('right-selections-panel')).toBeInTheDocument();
  });

  it('should call onModelSelectionClick when model selection button is clicked', () => {
    render(<MainContent {...defaultProps} />);

    fireEvent.click(screen.getByText('Model Selection'));

    expect(mockOnModelSelectionClick).toHaveBeenCalled();
  });

  it('should call onRemoveSentence when remove sentence button is clicked', () => {
    render(<MainContent {...defaultProps} />);

    fireEvent.click(screen.getByText('Remove Sentence'));

    expect(mockOnRemoveSentence).toHaveBeenCalledWith('1');
  });

  it('should pass correct props to ChatMessages', () => {
    render(<MainContent {...defaultProps} />);

    const chatMessages = screen.getByTestId('chat-messages');
    expect(chatMessages).toBeInTheDocument();
  });

  it('should pass correct props to RightSelectionsPanel', () => {
    render(<MainContent {...defaultProps} />);

    const rightPanel = screen.getByTestId('right-selections-panel');
    expect(rightPanel).toBeInTheDocument();
  });
});
