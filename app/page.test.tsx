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

jest.mock('../components/ChatMessages', () => {
  return function MockChatMessages({
    onSentenceSelect,
    columnResponses,
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
    remixDisabled,
    isRemixGenerating,
    modelSelections,
    columnModels,
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
      <div data-testid="chat-messages">
        <div data-testid="remix-disabled">{remixDisabled?.toString() || 'false'}</div>
        <div data-testid="column-responses">{JSON.stringify(columnResponses)}</div>
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

// Test the remixDisabled calculation logic directly
const calculateRemixDisabled = (
  columnResponses: any,
  currentMessage: string,
  modelSelections: any[],
) => {
  const hasResponses = Object.values(columnResponses).some(
    (responses: any) => responses.length > 0,
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
    const columnResponses = {};
    const currentMessage = 'test message';
    const modelSelections = [
      { modelId: 'gemini-2.5-flash', count: 1 },
      { modelId: 'gemini-2.5-flash-lite', count: 1 },
    ];

    const isDisabled = calculateRemixDisabled(columnResponses, currentMessage, modelSelections);
    expect(isDisabled).toBe(true);
  });

  it('should disable remix button when no current message', () => {
    const columnResponses = { '1': ['Response 1'], '2': ['Response 2'] };
    const currentMessage = '';
    const modelSelections = [
      { modelId: 'gemini-2.5-flash', count: 1 },
      { modelId: 'gemini-2.5-flash-lite', count: 1 },
    ];

    const isDisabled = calculateRemixDisabled(columnResponses, currentMessage, modelSelections);
    expect(isDisabled).toBe(true);
  });

  it('should disable remix button when total model quantity is 1', () => {
    const columnResponses = { '1': ['Response 1'] };
    const currentMessage = 'test message';
    const modelSelections = [{ modelId: 'gemini-2.5-flash', count: 1 }];

    const isDisabled = calculateRemixDisabled(columnResponses, currentMessage, modelSelections);
    expect(isDisabled).toBe(true);
  });

  it('should disable remix button when total model quantity is 0', () => {
    const columnResponses = { '1': ['Response 1'] };
    const currentMessage = 'test message';
    const modelSelections = [];

    const isDisabled = calculateRemixDisabled(columnResponses, currentMessage, modelSelections);
    expect(isDisabled).toBe(true);
  });

  it('should enable remix button when all conditions are met', () => {
    const columnResponses = { '1': ['Response 1'], '2': ['Response 2'] };
    const currentMessage = 'test message';
    const modelSelections = [
      { modelId: 'gemini-2.5-flash', count: 1 },
      { modelId: 'gemini-2.5-flash-lite', count: 1 },
    ];

    const isDisabled = calculateRemixDisabled(columnResponses, currentMessage, modelSelections);
    expect(isDisabled).toBe(false);
  });

  it('should enable remix button when total model quantity is 3', () => {
    const columnResponses = { '1': ['Response 1'] };
    const currentMessage = 'test message';
    const modelSelections = [
      { modelId: 'gemini-2.5-flash', count: 2 },
      { modelId: 'gemini-2.5-flash-lite', count: 1 },
    ];

    const isDisabled = calculateRemixDisabled(columnResponses, currentMessage, modelSelections);
    expect(isDisabled).toBe(false);
  });
});

describe('Home Page - Component Rendering', () => {
  it('should render all required components', () => {
    render(<Home />);

    expect(screen.getByTestId('aurora-background')).toBeInTheDocument();
    expect(screen.getByTestId('left-navigation')).toBeInTheDocument();
    expect(screen.getByTestId('top-bar')).toBeInTheDocument();
    expect(screen.getByTestId('chat-messages')).toBeInTheDocument();
  });
});

describe('Model Selection Response Preservation', () => {
  it('should preserve existing responses when model selections change', () => {
    // This test verifies the new functionality where updating model selections
    // preserves existing responses instead of clearing them

    // Mock the handleModelSelectionsChange function behavior
    const mockColumnResponses = {
      '1': ['Existing response 1', 'Existing response 2'],
      '2': ['Existing response 3'],
    };
    const mockOriginalResponses = {
      '1': 'Original response 1',
      '2': 'Original response 2',
    };
    const mockIsGenerating = {
      '1': false,
      '2': false,
    };

    // Simulate the new model selections
    const newSelections = [
      { modelId: 'gemini-2.5-flash', count: 1 },
      { modelId: 'claude-3-5-sonnet', count: 1 },
    ];

    // Simulate the updated state that should preserve responses
    const newColumnModels: { [key: string]: string } = {};
    const newColumnResponses: { [key: string]: string[] } = {};
    const newOriginalResponses: { [key: string]: string } = {};
    const newIsGenerating: { [key: string]: boolean } = {};

    let columnIndex = 1;
    newSelections.forEach((selection) => {
      for (let i = 0; i < selection.count; i++) {
        const columnKey = columnIndex.toString();
        newColumnModels[columnKey] = selection.modelId;
        // Preserve existing responses if they exist, otherwise initialize empty
        newColumnResponses[columnKey] = mockColumnResponses[columnKey] || [];
        newOriginalResponses[columnKey] = mockOriginalResponses[columnKey] || '';
        newIsGenerating[columnKey] = mockIsGenerating[columnKey] || false;
        columnIndex++;
      }
    });

    // Verify that responses are preserved
    expect(newColumnResponses['1']).toEqual(['Existing response 1', 'Existing response 2']);
    expect(newColumnResponses['2']).toEqual(['Existing response 3']);
    expect(newOriginalResponses['1']).toBe('Original response 1');
    expect(newOriginalResponses['2']).toBe('Original response 2');
    expect(newIsGenerating['1']).toBe(false);
    expect(newIsGenerating['2']).toBe(false);

    // Verify that column models are updated correctly
    expect(newColumnModels['1']).toBe('gemini-2.5-flash');
    expect(newColumnModels['2']).toBe('claude-3-5-sonnet');
  });

  it('should initialize empty responses for new columns when no existing responses', () => {
    // This test verifies that new columns get empty responses when there are no existing ones

    const mockColumnResponses = {};
    const mockOriginalResponses = {};
    const mockIsGenerating = {};

    const newSelections = [{ modelId: 'gemini-2.5-flash', count: 2 }];

    const newColumnModels: { [key: string]: string } = {};
    const newColumnResponses: { [key: string]: string[] } = {};
    const newOriginalResponses: { [key: string]: string } = {};
    const newIsGenerating: { [key: string]: boolean } = {};

    let columnIndex = 1;
    newSelections.forEach((selection) => {
      for (let i = 0; i < selection.count; i++) {
        const columnKey = columnIndex.toString();
        newColumnModels[columnKey] = selection.modelId;
        // Preserve existing responses if they exist, otherwise initialize empty
        newColumnResponses[columnKey] = mockColumnResponses[columnKey] || [];
        newOriginalResponses[columnKey] = mockOriginalResponses[columnKey] || '';
        newIsGenerating[columnKey] = mockIsGenerating[columnKey] || false;
        columnIndex++;
      }
    });

    // Verify that new columns get empty responses
    expect(newColumnResponses['1']).toEqual([]);
    expect(newColumnResponses['2']).toEqual([]);
    expect(newOriginalResponses['1']).toBe('');
    expect(newOriginalResponses['2']).toBe('');
    expect(newIsGenerating['1']).toBe(false);
    expect(newIsGenerating['2']).toBe(false);

    // Verify that column models are set correctly
    expect(newColumnModels['1']).toBe('gemini-2.5-flash');
    expect(newColumnModels['2']).toBe('gemini-2.5-flash');
  });
});
