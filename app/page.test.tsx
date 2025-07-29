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

jest.mock('../components/OutputColumns', () => {
  return function MockOutputColumns({
    remixDisabled,
    onRemix,
    columnResponses,
    currentMessage,
    modelSelections,
  }: any) {
    return (
      <div data-testid="output-columns">
        <div data-testid="remix-disabled">{remixDisabled.toString()}</div>
        <div data-testid="column-responses">{JSON.stringify(columnResponses)}</div>
        <div data-testid="current-message">{currentMessage}</div>
        <div data-testid="model-selections">{JSON.stringify(modelSelections)}</div>
        {onRemix && <button onClick={() => onRemix('test-model')}>Remix</button>}
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
    expect(screen.getByTestId('output-columns')).toBeInTheDocument();
  });
});
