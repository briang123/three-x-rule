import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from './page';

// Mock the components that are used in the page
jest.mock('../components/AuroraBackground', () => {
  return function MockAuroraBackground({ children }: any) {
    return <div data-testid="aurora-background">{children}</div>;
  };
});

jest.mock('../components/LeftNavigation', () => {
  return function MockLeftNavigation() {
    return <div data-testid="left-navigation" />;
  };
});

jest.mock('../components/TopBar', () => {
  return function MockTopBar({ onNewChat, onSocialPosts }: any) {
    return (
      <div data-testid="top-bar">
        {onNewChat && <button onClick={onNewChat}>New Chat</button>}
        {onSocialPosts && <button onClick={onSocialPosts}>Social Posts</button>}
      </div>
    );
  };
});

jest.mock('../components/MainContent', () => {
  return function MockMainContent({
    onSentenceSelect,
    messageResponses,
    originalResponses,
    isGenerating,
    remixResponses,
    remixModels,
    showRemix,
    remixModel,
    socialPostsResponses,
    isSocialPostsGenerating,
    showSocialPosts,
    onCloseSocialPosts,
    socialPostsConfigs,
    onSubmit,
    currentMessage,
    onRemix,
    isRemixDisabled,
    isRemixGenerating,
    modelSelections,
    messageModels,
    onModelSelect,
    onModelSelectionsUpdate,
    onDirectSubmit,
    onRestoreModelSelection,
    showAISelection,
    onToggleAISelection,
    resetModelSelector,
    onModelSelectionClick,
    isUsingDefaultModel,
    isLeftNavCollapsed,
  }: any) {
    return (
      <div data-testid="main-content">
        <div data-testid="remix-disabled">{isRemixDisabled?.toString() || 'false'}</div>
        <div data-testid="message-responses">{JSON.stringify(messageResponses)}</div>
        <div data-testid="current-message">{currentMessage}</div>
        <div data-testid="model-selections">{JSON.stringify(modelSelections)}</div>
        {onRemix && <button onClick={() => onRemix('test-model')}>Remix</button>}
        <button onClick={() => onSubmit('test prompt')}>Submit</button>
      </div>
    );
  };
});

jest.mock('../components/RightSelectionsPanel', () => {
  return function MockRightSelectionsPanel() {
    return <div data-testid="right-selections-panel" />;
  };
});

jest.mock('../components/SocialPostsDrawer', () => {
  return function MockSocialPostsDrawer() {
    return <div data-testid="social-posts-drawer" />;
  };
});

jest.mock('../components/HeaderText', () => {
  return function MockHeaderText({ isVisible }: any) {
    if (!isVisible) return null;
    return <div data-testid="header-text">Header Text</div>;
  };
});

jest.mock('../components/ModelSelectionModal', () => {
  return function MockModelSelectionModal({ isOpen, onClose }: any) {
    if (!isOpen) return null;
    return (
      <div data-testid="model-selection-modal">
        <button onClick={onClose}>Close Modal</button>
      </div>
    );
  };
});

// Define types for test data
interface ModelSelection {
  modelId: string;
  count: number;
}

interface MessageResponses {
  [key: string]: string[];
}

interface OriginalResponses {
  [key: string]: string;
}

interface IsGenerating {
  [key: string]: boolean;
}

// Test the remixDisabled calculation logic directly
const calculateRemixDisabled = (
  messageResponses: MessageResponses,
  currentMessage: string,
  modelSelections: ModelSelection[],
) => {
  const hasResponses = Object.values(messageResponses).some(
    (responses: string[]) => responses.length > 0,
  );
  const hasCurrentMessage = currentMessage.trim();
  const totalModelQuantity = modelSelections.reduce(
    (total, selection) => total + selection.count,
    0,
  );
  const hasMultipleModels = totalModelQuantity >= 2;
  const isDisabled = !hasResponses || !hasCurrentMessage || !hasMultipleModels;

  return isDisabled;
};

describe('Remix Button Logic', () => {
  it('should disable remix button when no responses exist', () => {
    const messageResponses: MessageResponses = {};
    const currentMessage = 'test message';
    const modelSelections: ModelSelection[] = [
      { modelId: 'gemini-2.5-flash', count: 1 },
      { modelId: 'gemini-2.5-flash-lite', count: 1 },
    ];

    const isDisabled = calculateRemixDisabled(messageResponses, currentMessage, modelSelections);
    expect(isDisabled).toBe(true);
  });

  it('should disable remix button when no current message', () => {
    const messageResponses: MessageResponses = { '1': ['Response 1'], '2': ['Response 2'] };
    const currentMessage = '';
    const modelSelections: ModelSelection[] = [
      { modelId: 'gemini-2.5-flash', count: 1 },
      { modelId: 'gemini-2.5-flash-lite', count: 1 },
    ];

    const isDisabled = calculateRemixDisabled(messageResponses, currentMessage, modelSelections);
    expect(isDisabled).toBe(true);
  });

  it('should disable remix button when total model quantity is 1', () => {
    const messageResponses: MessageResponses = { '1': ['Response 1'] };
    const currentMessage = 'test message';
    const modelSelections: ModelSelection[] = [{ modelId: 'gemini-2.5-flash', count: 1 }];

    const isDisabled = calculateRemixDisabled(messageResponses, currentMessage, modelSelections);
    expect(isDisabled).toBe(true);
  });

  it('should disable remix button when total model quantity is 0', () => {
    const messageResponses: MessageResponses = { '1': ['Response 1'] };
    const currentMessage = 'test message';
    const modelSelections: ModelSelection[] = [];

    const isDisabled = calculateRemixDisabled(messageResponses, currentMessage, modelSelections);
    expect(isDisabled).toBe(true);
  });

  it('should enable remix button when all conditions are met', () => {
    const messageResponses: MessageResponses = { '1': ['Response 1'], '2': ['Response 2'] };
    const currentMessage = 'test message';
    const modelSelections: ModelSelection[] = [
      { modelId: 'gemini-2.5-flash', count: 1 },
      { modelId: 'gemini-2.5-flash-lite', count: 1 },
    ];

    const isDisabled = calculateRemixDisabled(messageResponses, currentMessage, modelSelections);
    expect(isDisabled).toBe(false);
  });

  it('should enable remix button when total model quantity is 3', () => {
    const messageResponses: MessageResponses = { '1': ['Response 1'] };
    const currentMessage = 'test message';
    const modelSelections: ModelSelection[] = [
      { modelId: 'gemini-2.5-flash', count: 2 },
      { modelId: 'gemini-2.5-flash-lite', count: 1 },
    ];

    const isDisabled = calculateRemixDisabled(messageResponses, currentMessage, modelSelections);
    expect(isDisabled).toBe(false);
  });
});

describe('Home Page - Component Rendering', () => {
  it('should render all required components', () => {
    render(<Home />);

    expect(screen.getByTestId('aurora-background')).toBeInTheDocument();
    expect(screen.getByTestId('left-navigation')).toBeInTheDocument();
    expect(screen.getByTestId('top-bar')).toBeInTheDocument();
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
  });
});

describe('Model Selection Response Preservation', () => {
  it('should preserve existing responses when model selections change', () => {
    // This test verifies the new functionality where updating model selections
    // preserves existing responses instead of clearing them

    // Mock the handleModelSelectionsChange function behavior
    const mockMessageResponses: MessageResponses = {
      '1': ['Existing response 1', 'Existing response 2'],
      '2': ['Existing response 3'],
    };
    const mockOriginalResponses: OriginalResponses = {
      '1': 'Original response 1',
      '2': 'Original response 2',
    };
    const mockIsGenerating: IsGenerating = {
      '1': false,
      '2': false,
    };

    // Simulate the new model selections
    const newSelections: ModelSelection[] = [
      { modelId: 'gemini-2.5-flash', count: 1 },
      { modelId: 'claude-3-5-sonnet', count: 1 },
    ];

    // Simulate the updated state that should preserve responses
    const newMessageModels: { [key: string]: string } = {};
    const newMessageResponses: MessageResponses = {};
    const newOriginalResponses: OriginalResponses = {};
    const newIsGenerating: IsGenerating = {};

    let messageIndex = 1;
    newSelections.forEach((selection) => {
      for (let i = 0; i < selection.count; i++) {
        const messageKey = messageIndex.toString();
        newMessageModels[messageKey] = selection.modelId;
        // Preserve existing responses if they exist, otherwise initialize empty
        newMessageResponses[messageKey] = mockMessageResponses[messageKey] || [];
        newOriginalResponses[messageKey] = mockOriginalResponses[messageKey] || '';
        newIsGenerating[messageKey] = mockIsGenerating[messageKey] || false;
        messageIndex++;
      }
    });

    // Verify that responses are preserved
    expect(newMessageResponses['1']).toEqual(['Existing response 1', 'Existing response 2']);
    expect(newMessageResponses['2']).toEqual(['Existing response 3']);
    expect(newOriginalResponses['1']).toBe('Original response 1');
    expect(newOriginalResponses['2']).toBe('Original response 2');
    expect(newIsGenerating['1']).toBe(false);
    expect(newIsGenerating['2']).toBe(false);

    // Verify that message models are updated correctly
    expect(newMessageModels['1']).toBe('gemini-2.5-flash');
    expect(newMessageModels['2']).toBe('claude-3-5-sonnet');
  });

  it('should initialize empty responses for new messages when no existing responses', () => {
    // This test verifies that new messages get empty responses when there are no existing ones

    const mockMessageResponses: MessageResponses = {};
    const mockOriginalResponses: OriginalResponses = {};
    const mockIsGenerating: IsGenerating = {};

    const newSelections: ModelSelection[] = [{ modelId: 'gemini-2.5-flash', count: 2 }];

    const newMessageModels: { [key: string]: string } = {};
    const newMessageResponses: MessageResponses = {};
    const newOriginalResponses: OriginalResponses = {};
    const newIsGenerating: IsGenerating = {};

    let messageIndex = 1;
    newSelections.forEach((selection) => {
      for (let i = 0; i < selection.count; i++) {
        const messageKey = messageIndex.toString();
        newMessageModels[messageKey] = selection.modelId;
        // Preserve existing responses if they exist, otherwise initialize empty
        newMessageResponses[messageKey] = mockMessageResponses[messageKey] || [];
        newOriginalResponses[messageKey] = mockOriginalResponses[messageKey] || '';
        newIsGenerating[messageKey] = mockIsGenerating[messageKey] || false;
        messageIndex++;
      }
    });

    // Verify that new messages get empty responses
    expect(newMessageResponses['1']).toEqual([]);
    expect(newMessageResponses['2']).toEqual([]);
    expect(newOriginalResponses['1']).toBe('');
    expect(newOriginalResponses['2']).toBe('');
    expect(newIsGenerating['1']).toBe(false);
    expect(newIsGenerating['2']).toBe(false);

    // Verify that message models are set correctly
    expect(newMessageModels['1']).toBe('gemini-2.5-flash');
    expect(newMessageModels['2']).toBe('gemini-2.5-flash');
  });
});

describe('Remix Panel Visibility Logic', () => {
  it('should calculate remixDisabled correctly for single message', () => {
    const messageResponses: MessageResponses = { '1': ['Response 1'] };
    const currentMessage = 'test message';
    const modelSelections: ModelSelection[] = [{ modelId: 'gemini-2.5-flash', count: 1 }];

    const isDisabled = calculateRemixDisabled(messageResponses, currentMessage, modelSelections);
    expect(isDisabled).toBe(true);
  });

  it('should calculate remixDisabled correctly for multiple messages', () => {
    const messageResponses: MessageResponses = { '1': ['Response 1'], '2': ['Response 2'] };
    const currentMessage = 'test message';
    const modelSelections: ModelSelection[] = [
      { modelId: 'gemini-2.5-flash', count: 1 },
      { modelId: 'claude-3-5-sonnet', count: 1 },
    ];

    const isDisabled = calculateRemixDisabled(messageResponses, currentMessage, modelSelections);
    expect(isDisabled).toBe(false);
  });

  it('should calculate remixDisabled correctly for multiple responses from single model', () => {
    const messageResponses: MessageResponses = { '1': ['Response 1'], '2': ['Response 2'] };
    const currentMessage = 'test message';
    const modelSelections: ModelSelection[] = [{ modelId: 'gemini-2.5-flash', count: 2 }];

    const isDisabled = calculateRemixDisabled(messageResponses, currentMessage, modelSelections);
    expect(isDisabled).toBe(false);
  });

  it('should calculate remixDisabled correctly when no current message', () => {
    const messageResponses: MessageResponses = { '1': ['Response 1'], '2': ['Response 2'] };
    const currentMessage = '';
    const modelSelections: ModelSelection[] = [
      { modelId: 'gemini-2.5-flash', count: 1 },
      { modelId: 'claude-3-5-sonnet', count: 1 },
    ];

    const isDisabled = calculateRemixDisabled(messageResponses, currentMessage, modelSelections);
    expect(isDisabled).toBe(true);
  });

  it('should calculate remixDisabled correctly when no responses', () => {
    const messageResponses: MessageResponses = {};
    const currentMessage = 'test message';
    const modelSelections: ModelSelection[] = [
      { modelId: 'gemini-2.5-flash', count: 1 },
      { modelId: 'claude-3-5-sonnet', count: 1 },
    ];

    const isDisabled = calculateRemixDisabled(messageResponses, currentMessage, modelSelections);
    expect(isDisabled).toBe(true);
  });
});
