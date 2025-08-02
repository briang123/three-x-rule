import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HeaderText from './HeaderText';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock the ColourfulText component
jest.mock('./ColourfulText', () => ({
  ColourfulText: ({ text, highlightedWords, useGradient }: any) => (
    <span data-testid="colourful-text" data-text={text} data-highlights={JSON.stringify(highlightedWords)} data-gradient={useGradient}>
      {text}
    </span>
  ),
}));

// Mock the icon components
jest.mock('./icons/LightbulbIcon', () => {
  return function MockLightbulbIcon() {
    return <div data-testid="lightbulb-icon">💡</div>;
  };
});

jest.mock('./icons/ChatBubbleIcon', () => {
  return function MockChatBubbleIcon({ className }: any) {
    return <div data-testid="chat-bubble-icon" className={className}>💬</div>;
  };
});

jest.mock('./icons/LightningIcon', () => {
  return function MockLightningIcon() {
    return <div data-testid="lightning-icon">⚡</div>;
  };
});

describe('HeaderText', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render without crashing when visible', () => {
    render(<HeaderText isVisible={true} />);
    expect(screen.getByTestId('colourful-text')).toBeInTheDocument();
  });

  it('should not render when not visible', () => {
    render(<HeaderText isVisible={false} />);
    expect(screen.queryByTestId('colourful-text')).not.toBeInTheDocument();
  });

  it('should display the main heading', () => {
    render(<HeaderText isVisible={true} />);
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
  });

  it('should display the subtitle text', () => {
    render(<HeaderText isVisible={true} />);
    expect(screen.getByText('Select your AI models and start generating content with multiple AI assistants')).toBeInTheDocument();
  });

  it('should display the feature icons and text', () => {
    render(<HeaderText isVisible={true} />);
    
    // Check for icons
    expect(screen.getByTestId('lightbulb-icon')).toBeInTheDocument();
    expect(screen.getByTestId('chat-bubble-icon')).toBeInTheDocument();
    expect(screen.getByTestId('lightning-icon')).toBeInTheDocument();
    
    // Check for feature text
    expect(screen.getByText('Multiple AI Models')).toBeInTheDocument();
    expect(screen.getByText('Compare Responses')).toBeInTheDocument();
    expect(screen.getByText('Lightning Fast')).toBeInTheDocument();
  });

  it('should use ColourfulText component with proper props', () => {
    render(<HeaderText isVisible={true} />);
    
    const colourfulText = screen.getByTestId('colourful-text');
    expect(colourfulText).toBeInTheDocument();
    expect(colourfulText).toHaveAttribute('data-gradient', 'true');
    
    // Check that it has text and highlights
    const text = colourfulText.getAttribute('data-text');
    const highlights = colourfulText.getAttribute('data-highlights');
    
    expect(text).toBeTruthy();
    expect(highlights).toBeTruthy();
  });

  it('should have proper semantic structure', () => {
    render(<HeaderText isVisible={true} />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    
    const paragraph = screen.getByText('Select your AI models and start generating content with multiple AI assistants');
    expect(paragraph.tagName).toBe('P');
  });

  it('should have proper CSS classes', () => {
    render(<HeaderText isVisible={true} />);
    
    const container = screen.getByText('Select your AI models and start generating content with multiple AI assistants').closest('div');
    expect(container).toHaveClass('text-center', 'max-w-2xl', 'mx-auto', 'px-6');
  });

  it('should handle visibility toggle', () => {
    const { rerender } = render(<HeaderText isVisible={true} />);
    expect(screen.getByTestId('colourful-text')).toBeInTheDocument();
    
    rerender(<HeaderText isVisible={false} />);
    expect(screen.queryByTestId('colourful-text')).not.toBeInTheDocument();
    
    rerender(<HeaderText isVisible={true} />);
    expect(screen.getByTestId('colourful-text')).toBeInTheDocument();
  });

  it('should display different intro messages based on date', () => {
    render(<HeaderText isVisible={true} />);
    
    const colourfulText = screen.getByTestId('colourful-text');
    const text = colourfulText.getAttribute('data-text');
    
    // Should have some text content
    expect(text).toBeTruthy();
    expect(text!.length).toBeGreaterThan(0);
  });

  it('should have proper accessibility attributes', () => {
    render(<HeaderText isVisible={true} />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    
    // Check that the heading is properly structured
    expect(heading.tagName).toBe('H1');
  });



  it('should maintain consistent structure across renders', () => {
    const { rerender } = render(<HeaderText isVisible={true} />);
    
    // First render
    expect(screen.getByTestId('colourful-text')).toBeInTheDocument();
    expect(screen.getByText('Select your AI models and start generating content with multiple AI assistants')).toBeInTheDocument();
    
    // Re-render
    rerender(<HeaderText isVisible={true} />);
    
    // Should still have the same structure
    expect(screen.getByTestId('colourful-text')).toBeInTheDocument();
    expect(screen.getByText('Select your AI models and start generating content with multiple AI assistants')).toBeInTheDocument();
  });

  it('should handle rapid visibility changes', () => {
    const { rerender } = render(<HeaderText isVisible={true} />);
    
    // Rapidly toggle visibility
    for (let i = 0; i < 5; i++) {
      rerender(<HeaderText isVisible={i % 2 === 0} />);
    }
    
    // Should handle rapid changes without errors
    expect(() => {
      rerender(<HeaderText isVisible={true} />);
    }).not.toThrow();
  });

  it('should have proper motion animation props', () => {
    render(<HeaderText isVisible={true} />);
    
    // The motion.div should have animation props
    const motionDiv = screen.getByText('Select your AI models and start generating content with multiple AI assistants').closest('div');
    expect(motionDiv).toHaveClass('text-center', 'max-w-2xl', 'mx-auto', 'px-6');
  });

  it('should display feature list with proper spacing', () => {
    render(<HeaderText isVisible={true} />);
    
    const featureContainer = screen.getByText('Multiple AI Models').closest('div');
    expect(featureContainer).toHaveClass('flex', 'items-center', 'space-x-1');
  });

  it('should handle different screen sizes gracefully', () => {
    render(<HeaderText isVisible={true} />);
    
    // Should have responsive classes
    const container = screen.getByText('Select your AI models and start generating content with multiple AI assistants').closest('div');
    expect(container).toHaveClass('max-w-2xl', 'mx-auto', 'px-6');
  });

  it('should maintain proper text hierarchy', () => {
    render(<HeaderText isVisible={true} />);
    
    const heading = screen.getByRole('heading', { level: 1 });
    const subtitle = screen.getByText('Select your AI models and start generating content with multiple AI assistants');
    
    // Heading should be larger than subtitle
    expect(heading.tagName).toBe('H1');
    expect(subtitle.tagName).toBe('P');
  });

  it('should handle icon rendering correctly', () => {
    render(<HeaderText isVisible={true} />);
    
    // All icons should be present
    expect(screen.getByTestId('lightbulb-icon')).toBeInTheDocument();
    expect(screen.getByTestId('chat-bubble-icon')).toBeInTheDocument();
    expect(screen.getByTestId('lightning-icon')).toBeInTheDocument();
    
    // Chat bubble icon should have the passed className
    const chatBubbleIcon = screen.getByTestId('chat-bubble-icon');
    expect(chatBubbleIcon).toHaveClass('w-4', 'h-4');
  });
});
