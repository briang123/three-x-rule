import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ChatMessages from './ChatMessages';

// Mock child components
jest.mock('./ChatInputWrapper', () => {
  return function MockChatInputWrapper(props: any) {
    return (
      <div data-testid="chat-input-wrapper">
        <button onClick={() => props.onSubmit('test prompt')} data-testid="submit-button">
          Submit
        </button>
        <input
          value={props.currentMessage || ''}
          onChange={(e) => props.onSubmit(e.target.value)}
          data-testid="message-input"
          placeholder="Enter message"
        />
      </div>
    );
  };
});

jest.mock('./PromptMessages', () => {
  return function MockPromptMessages(props: any) {
    const hasMessages = Object.keys(props.messageResponses).length > 0;
    return (
      <div data-testid="prompt-messages">
        {hasMessages && Object.entries(props.messageResponses).map(([key, responses]: [string, any]) => (
          <div key={key} data-testid={`prompt-${key}`}>
            {Array.isArray(responses) ? responses.join(', ') : responses}
          </div>
        ))}
      </div>
    );
  };
});

jest.mock('./RemixMessages', () => {
  return function MockRemixMessages(props: any) {
    return (
      <div data-testid="remix-messages">
        {props.remixResponses?.map((response: string, index: number) => (
          <div key={index} data-testid={`remix-response-${index}`}>
            {response}
          </div>
        ))}
      </div>
    );
  };
});

jest.mock('./social-platforms', () => ({
  SocialPosts: function MockSocialPosts(props: any) {
    return (
      <div data-testid="social-posts">
        {Object.entries(props.socialPostsResponses || {}).map(([key, response]: [string, any]) => (
          <div key={key} data-testid={`social-post-${key}`}>
            {response}
          </div>
        ))}
      </div>
    );
  },
}));

// Mock hooks
jest.mock('@/hooks', () => ({
  useScrollEffectsWithState: jest.fn(() => ({
    scrollContainerRef: { current: null },
    scrollToElement: jest.fn(),
    scrollToTop: jest.fn(),
    scrollToLatest: jest.fn(),
    remixResponseRefs: { current: {} },
    scrollToLatestRemix: jest.fn(),
    socialPostsRefs: { current: {} },
    messageRefs: { current: {} },
    // State tracking refs
    prevShowRemixRef: { current: false },
    prevShowSocialPostsRef: { current: {} },
    prevHasAIContentRef: { current: false },
    prevMessageKeysRef: { current: [] },
    // Timeout refs
    remixScrollTimeout: { current: null },
    aiContentScrollTimeout: { current: null },
    newMessagesScrollTimeout: { current: null },
    socialPostsScrollTimeout: { current: null },
  })),
  useSocialPostsBorderFadeOut: jest.fn(() => ({
    socialPostsBorderStates: {},
    setSocialPostsBorderStates: jest.fn(),
  })),
  useModelOrchestration: jest.fn(() => ({
    showModelBadges: false,
    hasSubmitted: false,
    handleSubmitWithOrchestration: jest.fn(),
    handleRestoreModelSelection: jest.fn(),
    handleModelConfirmedOrchestration: jest.fn(),
    handleModelSelectorAnimationComplete: jest.fn(),
  })),
  useModels: jest.fn(() => ({
    models: [],
    loading: false,
    error: null,
    initialized: true,
    refetch: jest.fn(),
  })),
}));

describe('ChatMessages', () => {
  const defaultProps = {
    onSentenceSelect: jest.fn(),
    messageResponses: {},
    originalResponses: {},
    isGenerating: {},
    onSubmit: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing', () => {
    render(<ChatMessages {...defaultProps} />);
    expect(screen.getByTestId('chat-input-wrapper')).toBeInTheDocument();
  });

  it('should render prompt messages when provided', () => {
    const props = {
      ...defaultProps,
      messageResponses: {
        'msg-1': ['Response 1', 'Response 2'],
        'msg-2': ['Response 3'],
      },
    };

    render(<ChatMessages {...props} />);

    expect(screen.getByTestId('prompt-messages')).toBeInTheDocument();
    expect(screen.getByTestId('prompt-msg-1')).toBeInTheDocument();
    expect(screen.getByTestId('prompt-msg-2')).toBeInTheDocument();
  });

  it('should render remix messages when provided', () => {
    const props = {
      ...defaultProps,
      remixResponses: ['Remix 1', 'Remix 2'],
      showRemix: true,
    };

    render(<ChatMessages {...props} />);

    expect(screen.getByTestId('remix-messages')).toBeInTheDocument();
    expect(screen.getByTestId('remix-response-0')).toHaveTextContent('Remix 1');
    expect(screen.getByTestId('remix-response-1')).toHaveTextContent('Remix 2');
  });

  it('should render social posts when provided', () => {
    const props = {
      ...defaultProps,
      socialPostsResponses: {
        'post-1': 'Social post 1',
        'post-2': 'Social post 2',
      },
    };

    render(<ChatMessages {...props} />);

    expect(screen.getByTestId('social-posts')).toBeInTheDocument();
    expect(screen.getByTestId('social-post-post-1')).toHaveTextContent('Social post 1');
    expect(screen.getByTestId('social-post-post-2')).toHaveTextContent('Social post 2');
  });

  it('should pass current message to chat input wrapper', () => {
    const props = {
      ...defaultProps,
      currentMessage: 'Test message',
    };

    render(<ChatMessages {...props} />);

    const messageInput = screen.getByTestId('message-input') as HTMLInputElement;
    expect(messageInput.value).toBe('Test message');
  });

  it('should handle form submission', () => {
    const mockHandleSubmitWithOrchestration = jest.fn();
    const mockUseModelOrchestration = require('@/hooks').useModelOrchestration;
    mockUseModelOrchestration.mockReturnValue({
      showModelBadges: false,
      hasSubmitted: false,
      handleSubmitWithOrchestration: mockHandleSubmitWithOrchestration,
      handleRestoreModelSelection: jest.fn(),
      handleModelConfirmedOrchestration: jest.fn(),
      handleModelSelectorAnimationComplete: jest.fn(),
    });

    render(<ChatMessages {...defaultProps} />);

    const submitButton = screen.getByTestId('submit-button');
    fireEvent.click(submitButton);

    expect(mockHandleSubmitWithOrchestration).toHaveBeenCalledWith('test prompt', undefined);
  });

  it('should handle message input changes', () => {
    const mockHandleSubmitWithOrchestration = jest.fn();
    const mockUseModelOrchestration = require('@/hooks').useModelOrchestration;
    mockUseModelOrchestration.mockReturnValue({
      showModelBadges: false,
      hasSubmitted: false,
      handleSubmitWithOrchestration: mockHandleSubmitWithOrchestration,
      handleRestoreModelSelection: jest.fn(),
      handleModelConfirmedOrchestration: jest.fn(),
      handleModelSelectorAnimationComplete: jest.fn(),
    });

    render(<ChatMessages {...defaultProps} />);

    const messageInput = screen.getByTestId('message-input');
    fireEvent.change(messageInput, { target: { value: 'new message' } });

    expect(mockHandleSubmitWithOrchestration).toHaveBeenCalledWith('new message', undefined);
  });

  it('should render with left navigation collapsed by default', () => {
    render(<ChatMessages {...defaultProps} />);

    // The component should render with the default container class
    const container = screen.getByTestId('chat-input-wrapper').parentElement;
    expect(container).toHaveClass('relative', 'w-full', 'h-full', 'flex', 'flex-col');
  });

  it('should render with left navigation expanded when specified', () => {
    const props = {
      ...defaultProps,
      isLeftNavCollapsed: false,
    };

    render(<ChatMessages {...props} />);

    // The component should still render with the same container class
    // The left nav expansion is handled by the ChatInputWrapper component
    const container = screen.getByTestId('chat-input-wrapper').parentElement;
    expect(container).toHaveClass('relative', 'w-full', 'h-full', 'flex', 'flex-col');
  });

  it('should handle empty message responses', () => {
    const props = {
      ...defaultProps,
      messageResponses: {},
    };

    render(<ChatMessages {...props} />);

    expect(screen.getByTestId('prompt-messages')).toBeInTheDocument();
    // Should not have any prompt message children when messageResponses is empty
    const promptMessages = screen.getByTestId('prompt-messages');
    expect(promptMessages.children.length).toBe(0);
  });

  it('should handle empty remix responses', () => {
    const props = {
      ...defaultProps,
      remixResponses: [],
      showRemix: true,
    };

    render(<ChatMessages {...props} />);

    expect(screen.getByTestId('remix-messages')).toBeInTheDocument();
    // Should not have any remix response children
    expect(screen.queryByTestId(/^remix-response-/)).not.toBeInTheDocument();
  });

  it('should handle empty social posts responses', () => {
    const props = {
      ...defaultProps,
      socialPostsResponses: {},
    };

    render(<ChatMessages {...props} />);

    expect(screen.getByTestId('social-posts')).toBeInTheDocument();
    // Should not have any social post children
    expect(screen.queryByTestId(/^social-post-/)).not.toBeInTheDocument();
  });

  it('should handle generating state', () => {
    const props = {
      ...defaultProps,
      isGenerating: {
        'msg-1': true,
        'msg-2': false,
      },
    };

    render(<ChatMessages {...props} />);

    // The component should render without errors when some messages are generating
    expect(screen.getByTestId('chat-input-wrapper')).toBeInTheDocument();
  });

  it('should handle remix disabled state', () => {
    const props = {
      ...defaultProps,
      remixResponses: ['Remix 1'],
      showRemix: true,
      remixDisabled: true,
    };

    render(<ChatMessages {...props} />);

    expect(screen.getByTestId('remix-messages')).toBeInTheDocument();
    expect(screen.getByTestId('remix-response-0')).toHaveTextContent('Remix 1');
  });

  it('should handle remix generating state', () => {
    const props = {
      ...defaultProps,
      remixResponses: ['Remix 1'],
      showRemix: true,
      isRemixGenerating: true,
    };

    render(<ChatMessages {...props} />);

    expect(screen.getByTestId('remix-messages')).toBeInTheDocument();
    expect(screen.getByTestId('remix-response-0')).toHaveTextContent('Remix 1');
  });

  it('should handle model selections', () => {
    const props = {
      ...defaultProps,
      modelSelections: [
        { modelId: 'model-1', count: 1 },
        { modelId: 'model-2', count: 2 },
      ],
    };

    render(<ChatMessages {...props} />);

    // The component should render without errors when model selections are provided
    expect(screen.getByTestId('chat-input-wrapper')).toBeInTheDocument();
  });

  it('should handle message models', () => {
    const props = {
      ...defaultProps,
      messageModels: {
        'msg-1': 'model-1',
        'msg-2': 'model-2',
      },
    };

    render(<ChatMessages {...props} />);

    // The component should render without errors when message models are provided
    expect(screen.getByTestId('chat-input-wrapper')).toBeInTheDocument();
  });

  it('should handle social posts configs', () => {
    const props = {
      ...defaultProps,
      socialPostsConfigs: {
        'post-1': { 
          platform: 'twitter', 
          modelId: 'gemini-2.0-flash',
          postType: 'tweet',
          numberOfPosts: 1,
          characterLimit: 280,
          isThreaded: false
        },
        'post-2': { 
          platform: 'linkedin', 
          modelId: 'gemini-2.0-flash',
          postType: 'post',
          numberOfPosts: 1,
          characterLimit: 3000,
          isThreaded: false
        },
      },
    };

    render(<ChatMessages {...props} />);

    // The component should render without errors when social posts configs are provided
    expect(screen.getByTestId('chat-input-wrapper')).toBeInTheDocument();
  });

  it('should handle onCloseSocialPosts callback', () => {
    const mockOnCloseSocialPosts = jest.fn();
    const props = {
      ...defaultProps,
      onCloseSocialPosts: mockOnCloseSocialPosts,
    };

    render(<ChatMessages {...props} />);

    // The component should render without errors when onCloseSocialPosts is provided
    expect(screen.getByTestId('chat-input-wrapper')).toBeInTheDocument();
  });

  it('should handle onRemix callback', () => {
    const mockOnRemix = jest.fn();
    const props = {
      ...defaultProps,
      onRemix: mockOnRemix,
    };

    render(<ChatMessages {...props} />);

    // The component should render without errors when onRemix is provided
    expect(screen.getByTestId('chat-input-wrapper')).toBeInTheDocument();
  });

  it('should handle all optional props being undefined', () => {
    const minimalProps = {
      onSentenceSelect: jest.fn(),
      messageResponses: {},
      originalResponses: {},
      isGenerating: {},
      onSubmit: jest.fn(),
    };

    expect(() => {
      render(<ChatMessages {...minimalProps} />);
    }).not.toThrow();
  });

  it('should handle complex message responses with arrays', () => {
    const props = {
      ...defaultProps,
      messageResponses: {
        'msg-1': ['Response 1', 'Response 2', 'Response 3'],
        'msg-2': ['Single Response'],
        'msg-3': [],
      },
    };

    render(<ChatMessages {...props} />);

    expect(screen.getByTestId('prompt-msg-1')).toHaveTextContent(
      'Response 1, Response 2, Response 3',
    );
    expect(screen.getByTestId('prompt-msg-2')).toHaveTextContent('Single Response');
    expect(screen.getByTestId('prompt-msg-3')).toHaveTextContent('');
  });

  it('should handle remix models', () => {
    const props = {
      ...defaultProps,
      remixModels: ['model-1', 'model-2'],
      remixResponses: ['Remix 1'],
      showRemix: true,
    };

    render(<ChatMessages {...props} />);

    expect(screen.getByTestId('remix-messages')).toBeInTheDocument();
    expect(screen.getByTestId('remix-response-0')).toHaveTextContent('Remix 1');
  });

  it('should handle remix model', () => {
    const props = {
      ...defaultProps,
      remixModel: 'model-1',
      remixResponses: ['Remix 1'],
      showRemix: true,
    };

    render(<ChatMessages {...props} />);

    expect(screen.getByTestId('remix-messages')).toBeInTheDocument();
    expect(screen.getByTestId('remix-response-0')).toHaveTextContent('Remix 1');
  });
});
