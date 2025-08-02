import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import RemixMessages from './RemixMessages';

// Mock the child components
jest.mock('./RemixResponseCard', () => {
  return function MockRemixResponseCard({ children, index }: any) {
    return <div data-testid={`remix-response-card-${index}`}>{children}</div>;
  };
});

jest.mock('./RemixResponseHeader', () => {
  return function MockRemixResponseHeader({ index }: any) {
    return <div data-testid={`remix-response-header-${index}`}>Header {index}</div>;
  };
});

jest.mock('./RemixResponseDisplay', () => {
  return function MockRemixResponseDisplay({ response }: any) {
    return <div data-testid="remix-response-display">{response}</div>;
  };
});

jest.mock('./RemixButtonWrapper', () => {
  return function MockRemixButtonWrapper({ responseCount, disabled }: any) {
    return (
      <div
        data-testid="remix-button-wrapper"
        data-response-count={responseCount}
        data-disabled={disabled}
      >
        Remix Button (Count: {responseCount})
      </div>
    );
  };
});

const defaultProps = {
  remixResponses: [],
  remixModels: [],
  remixModel: '',
  isRemixGenerating: false,
  remixDisabled: false,
  hasAIContent: false,
  messageResponses: {},
  onRemix: jest.fn(),
  onAddSelection: jest.fn(),
  scrollToLatestRemix: jest.fn(),
  remixResponseRefs: { current: {} },
};

describe('RemixMessages', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Remix Panel Visibility', () => {
    it('should NOT show remix panel when there is only one message', () => {
      const props = {
        ...defaultProps,
        hasAIContent: true,
        messageResponses: { '1': ['Response 1'] },
      };

      render(<RemixMessages {...props} />);

      expect(screen.queryByTestId('remix-button-wrapper')).not.toBeInTheDocument();
    });

    it('should show remix panel when there are two messages', () => {
      const props = {
        ...defaultProps,
        hasAIContent: true,
        messageResponses: { '1': ['Response 1'], '2': ['Response 2'] },
      };

      render(<RemixMessages {...props} />);

      const remixButton = screen.getByTestId('remix-button-wrapper');
      expect(remixButton).toBeInTheDocument();
      expect(remixButton).toHaveAttribute('data-response-count', '2');
    });

    it('should show remix panel when there are three messages', () => {
      const props = {
        ...defaultProps,
        hasAIContent: true,
        messageResponses: { '1': ['Response 1'], '2': ['Response 2'], '3': ['Response 3'] },
      };

      render(<RemixMessages {...props} />);

      const remixButton = screen.getByTestId('remix-button-wrapper');
      expect(remixButton).toBeInTheDocument();
      expect(remixButton).toHaveAttribute('data-response-count', '3');
    });

    it('should NOT show remix panel when there is no AI content', () => {
      const props = {
        ...defaultProps,
        hasAIContent: false,
        messageResponses: { '1': ['Response 1'], '2': ['Response 2'] },
      };

      render(<RemixMessages {...props} />);

      expect(screen.queryByTestId('remix-button-wrapper')).not.toBeInTheDocument();
    });

    it('should NOT show remix panel when there are no message responses', () => {
      const props = {
        ...defaultProps,
        hasAIContent: true,
        messageResponses: {},
      };

      render(<RemixMessages {...props} />);

      expect(screen.queryByTestId('remix-button-wrapper')).not.toBeInTheDocument();
    });

    it('should pass correct props to RemixButtonWrapper when visible', () => {
      const props = {
        ...defaultProps,
        hasAIContent: true,
        messageResponses: { '1': ['Response 1'], '2': ['Response 2'] },
        remixDisabled: true,
        isRemixGenerating: true,
      };

      render(<RemixMessages {...props} />);

      const remixButton = screen.getByTestId('remix-button-wrapper');
      expect(remixButton).toHaveAttribute('data-response-count', '2');
      expect(remixButton).toHaveAttribute('data-disabled', 'true');
    });
  });

  describe('Remix Response Cards', () => {
    it('should render remix response cards when remixResponses exist', () => {
      const props = {
        ...defaultProps,
        remixResponses: ['Remix Response 1', 'Remix Response 2'],
        remixModels: ['model1', 'model2'],
      };

      render(<RemixMessages {...props} />);

      expect(screen.getByTestId('remix-response-card-0')).toBeInTheDocument();
      expect(screen.getByTestId('remix-response-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('remix-response-header-0')).toBeInTheDocument();
      expect(screen.getByTestId('remix-response-header-1')).toBeInTheDocument();
      expect(screen.getAllByTestId('remix-response-display')).toHaveLength(2);
    });

    it('should not render remix response cards when remixResponses is empty', () => {
      const props = {
        ...defaultProps,
        remixResponses: [],
      };

      render(<RemixMessages {...props} />);

      expect(screen.queryByTestId('remix-response-card-0')).not.toBeInTheDocument();
      expect(screen.queryByTestId('remix-response-display')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty messageResponses object', () => {
      const props = {
        ...defaultProps,
        hasAIContent: true,
        messageResponses: {},
      };

      render(<RemixMessages {...props} />);

      expect(screen.queryByTestId('remix-button-wrapper')).not.toBeInTheDocument();
    });

    it('should handle messageResponses with empty arrays', () => {
      const props = {
        ...defaultProps,
        hasAIContent: true,
        messageResponses: { '1': [], '2': [] },
      };

      render(<RemixMessages {...props} />);

      // Should still show remix panel because there are 2 message keys
      const remixButton = screen.getByTestId('remix-button-wrapper');
      expect(remixButton).toBeInTheDocument();
      expect(remixButton).toHaveAttribute('data-response-count', '2');
    });

    it('should handle mixed messageResponses with some empty arrays', () => {
      const props = {
        ...defaultProps,
        hasAIContent: true,
        messageResponses: { '1': ['Response 1'], '2': [] },
      };

      render(<RemixMessages {...props} />);

      // Should still show remix panel because there are 2 message keys
      const remixButton = screen.getByTestId('remix-button-wrapper');
      expect(remixButton).toBeInTheDocument();
      expect(remixButton).toHaveAttribute('data-response-count', '2');
    });
  });
});
