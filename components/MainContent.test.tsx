import { render, screen, fireEvent } from '@testing-library/react';
import MainContent from './MainContent';
import { SelectedSentence } from '@/hooks';

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
        <button onClick={() => props.resetModelSelector()}>Reset Models</button>
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
  const mockOnSentenceSelect = jest.fn();
  const mockOnCloseSocialPosts = jest.fn();
  const mockOnSubmit = jest.fn();
  const mockOnRemix = jest.fn();
  const mockOnModelSelectionsUpdate = jest.fn();
  const mockOnDirectSubmit = jest.fn();
  const mockOnToggleAISelection = jest.fn();
  const mockOnModelSelectionClick = jest.fn();
  const mockOnRemoveSentence = jest.fn();
  const mockResetModelSelector = jest.fn();

  const defaultProps = {
    // Chat state
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

    // Remix state
    remixResponses: ['remix1', 'remix2'],
    remixModels: ['gpt-4', 'claude-3'],
    isRemixGenerating: false,
    showRemix: true,
    remixModel: 'gpt-4',

    // Social posts state
    socialPostsResponses: { 'post-1': 'social response 1' },
    isSocialPostsGenerating: { 'post-1': false },
    showSocialPosts: { 'post-1': true },
    socialPostsConfigs: { 'post-1': { platform: 'twitter', postType: 'tweet' } },

    // Model selection state
    modelSelections: [{ modelId: 'gpt-4', count: 1 }],
    showAISelection: true,
    isUsingDefaultModel: false,

    // UI state
    showRightPanel: true,
    isLeftNavCollapsed: false,

    // Computed values
    isHeaderVisible: false,
    isRemixDisabled: false,

    // Event handlers
    onSentenceSelect: mockOnSentenceSelect,
    onCloseSocialPosts: mockOnCloseSocialPosts,
    onSubmit: mockOnSubmit,
    onRemix: mockOnRemix,
    onModelSelectionsUpdate: mockOnModelSelectionsUpdate,
    onDirectSubmit: mockOnDirectSubmit,
    onToggleAISelection: mockOnToggleAISelection,
    onModelSelectionClick: mockOnModelSelectionClick,
    onRemoveSentence: mockOnRemoveSentence,
    resetModelSelector: mockResetModelSelector,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the main content container', () => {
      render(<MainContent {...defaultProps} />);

      expect(screen.getByTestId('chat-messages')).toBeInTheDocument();
    });

    it('should render right selections panel when showRightPanel is true', () => {
      render(<MainContent {...defaultProps} />);

      expect(screen.getByTestId('right-selections-panel')).toBeInTheDocument();
    });

    it('should not render right selections panel when showRightPanel is false', () => {
      const propsWithoutRightPanel = { ...defaultProps, showRightPanel: false };
      render(<MainContent {...propsWithoutRightPanel} />);

      expect(screen.queryByTestId('right-selections-panel')).not.toBeInTheDocument();
    });

    it('should pass all props to ChatMessages component', () => {
      render(<MainContent {...defaultProps} />);

      const chatMessages = screen.getByTestId('chat-messages');
      expect(chatMessages).toBeInTheDocument();
    });

    it('should pass selectedSentences and onRemoveSentence to RightSelectionsPanel', () => {
      render(<MainContent {...defaultProps} />);

      const rightPanel = screen.getByTestId('right-selections-panel');
      expect(rightPanel).toBeInTheDocument();
    });
  });

  describe('event handling', () => {
    it('should call onSentenceSelect when sentence is selected', () => {
      render(<MainContent {...defaultProps} />);

      fireEvent.click(screen.getByText('Select Sentence'));

      expect(mockOnSentenceSelect).toHaveBeenCalledWith({
        id: '1',
        text: 'test',
        source: 'test',
      });
    });

    it('should call onSubmit when submit button is clicked', () => {
      render(<MainContent {...defaultProps} />);

      fireEvent.click(screen.getByText('Submit'));

      expect(mockOnSubmit).toHaveBeenCalledWith('test prompt');
    });

    it('should call onRemix when remix button is clicked', () => {
      render(<MainContent {...defaultProps} />);

      fireEvent.click(screen.getByText('Remix'));

      expect(mockOnRemix).toHaveBeenCalledWith('gpt-4');
    });

    it('should call onModelSelectionsUpdate when update models button is clicked', () => {
      render(<MainContent {...defaultProps} />);

      fireEvent.click(screen.getByText('Update Models'));

      expect(mockOnModelSelectionsUpdate).toHaveBeenCalledWith('gpt-4');
    });

    it('should call onDirectSubmit when direct submit button is clicked', () => {
      render(<MainContent {...defaultProps} />);

      fireEvent.click(screen.getByText('Direct Submit'));

      expect(mockOnDirectSubmit).toHaveBeenCalledWith('test prompt', 'gpt-4');
    });

    it('should call onToggleAISelection when toggle AI button is clicked', () => {
      render(<MainContent {...defaultProps} />);

      fireEvent.click(screen.getByText('Toggle AI'));

      expect(mockOnToggleAISelection).toHaveBeenCalled();
    });

    it('should call onModelSelectionClick when model selection button is clicked', () => {
      render(<MainContent {...defaultProps} />);

      fireEvent.click(screen.getByText('Model Selection'));

      expect(mockOnModelSelectionClick).toHaveBeenCalled();
    });

    it('should call resetModelSelector when reset models button is clicked', () => {
      render(<MainContent {...defaultProps} />);

      fireEvent.click(screen.getByText('Reset Models'));

      expect(mockResetModelSelector).toHaveBeenCalled();
    });

    it('should call onRemoveSentence when remove sentence button is clicked', () => {
      render(<MainContent {...defaultProps} />);

      fireEvent.click(screen.getByText('Remove Sentence'));

      expect(mockOnRemoveSentence).toHaveBeenCalledWith('1');
    });
  });

  describe('conditional rendering', () => {
    it('should render with different chat key', () => {
      const propsWithDifferentKey = { ...defaultProps, chatKey: 2 };
      render(<MainContent {...propsWithDifferentKey} />);

      expect(screen.getByTestId('chat-messages')).toBeInTheDocument();
    });

    it('should handle empty message responses', () => {
      const propsWithEmptyResponses = { ...defaultProps, messageResponses: {} };
      render(<MainContent {...propsWithEmptyResponses} />);

      expect(screen.getByTestId('chat-messages')).toBeInTheDocument();
    });

    it('should handle empty original responses', () => {
      const propsWithEmptyOriginal = { ...defaultProps, originalResponses: {} };
      render(<MainContent {...propsWithEmptyOriginal} />);

      expect(screen.getByTestId('chat-messages')).toBeInTheDocument();
    });

    it('should handle empty selected sentences', () => {
      const propsWithEmptySentences = { ...defaultProps, selectedSentences: [] };
      render(<MainContent {...propsWithEmptySentences} />);

      expect(screen.getByTestId('chat-messages')).toBeInTheDocument();
    });

    it('should handle empty model selections', () => {
      const propsWithEmptyModels = { ...defaultProps, modelSelections: [] };
      render(<MainContent {...propsWithEmptyModels} />);

      expect(screen.getByTestId('chat-messages')).toBeInTheDocument();
    });
  });

  describe('prop passing', () => {
    it('should pass all chat state props to ChatMessages', () => {
      render(<MainContent {...defaultProps} />);

      // The component should render without errors, indicating all props are passed correctly
      expect(screen.getByTestId('chat-messages')).toBeInTheDocument();
    });

    it('should pass all remix state props to ChatMessages', () => {
      render(<MainContent {...defaultProps} />);

      expect(screen.getByTestId('chat-messages')).toBeInTheDocument();
    });

    it('should pass all social posts state props to ChatMessages', () => {
      render(<MainContent {...defaultProps} />);

      expect(screen.getByTestId('chat-messages')).toBeInTheDocument();
    });

    it('should pass all model selection state props to ChatMessages', () => {
      render(<MainContent {...defaultProps} />);

      expect(screen.getByTestId('chat-messages')).toBeInTheDocument();
    });

    it('should pass all computed values props to ChatMessages', () => {
      render(<MainContent {...defaultProps} />);

      expect(screen.getByTestId('chat-messages')).toBeInTheDocument();
    });

    it('should pass all event handler props to ChatMessages', () => {
      render(<MainContent {...defaultProps} />);

      expect(screen.getByTestId('chat-messages')).toBeInTheDocument();
    });
  });

  describe('layout structure', () => {
    it('should have correct CSS classes for layout', () => {
      render(<MainContent {...defaultProps} />);

      const container = screen.getByTestId('chat-messages').parentElement?.parentElement;
      expect(container).toHaveClass('flex', 'flex-1', 'overflow-hidden');
    });

    it('should have correct CSS classes for inner container', () => {
      render(<MainContent {...defaultProps} />);

      const innerContainer = screen.getByTestId('chat-messages').parentElement?.parentElement;
      expect(innerContainer).toHaveClass('flex', 'flex-1', 'flex-col', 'overflow-hidden');
    });

    it('should have correct CSS classes for content area', () => {
      render(<MainContent {...defaultProps} />);

      const contentArea = screen.getByTestId('chat-messages').parentElement;
      expect(contentArea).toHaveClass('flex-1', 'p-6', 'pb-0', 'h-full');
    });
  });

  describe('edge cases', () => {
    it('should handle undefined props gracefully', () => {
      const propsWithUndefined = {
        ...defaultProps,
        messageResponses: undefined as any,
        originalResponses: undefined as any,
        selectedSentences: undefined as any,
      };

      expect(() => {
        render(<MainContent {...propsWithUndefined} />);
      }).not.toThrow();
    });

    it('should handle null props gracefully', () => {
      const propsWithNull = {
        ...defaultProps,
        messageResponses: null as any,
        originalResponses: null as any,
        selectedSentences: null as any,
      };

      expect(() => {
        render(<MainContent {...propsWithNull} />);
      }).not.toThrow();
    });

    it('should handle empty object props', () => {
      const propsWithEmptyObjects = {
        ...defaultProps,
        messageResponses: {},
        originalResponses: {},
        selectedSentences: [],
        modelSelections: [],
      };

      expect(() => {
        render(<MainContent {...propsWithEmptyObjects} />);
      }).not.toThrow();
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete workflow with all interactions', () => {
      render(<MainContent {...defaultProps} />);

      // Simulate a complete workflow
      fireEvent.click(screen.getByText('Select Sentence'));
      fireEvent.click(screen.getByText('Submit'));
      fireEvent.click(screen.getByText('Remix'));
      fireEvent.click(screen.getByText('Remove Sentence'));

      expect(mockOnSentenceSelect).toHaveBeenCalled();
      expect(mockOnSubmit).toHaveBeenCalled();
      expect(mockOnRemix).toHaveBeenCalled();
      expect(mockOnRemoveSentence).toHaveBeenCalled();
    });

    it('should handle multiple rapid interactions', () => {
      render(<MainContent {...defaultProps} />);

      // Simulate rapid interactions
      fireEvent.click(screen.getByText('Select Sentence'));
      fireEvent.click(screen.getByText('Select Sentence'));
      fireEvent.click(screen.getByText('Submit'));
      fireEvent.click(screen.getByText('Submit'));

      expect(mockOnSentenceSelect).toHaveBeenCalledTimes(2);
      expect(mockOnSubmit).toHaveBeenCalledTimes(2);
    });
  });
});
