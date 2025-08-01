import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CopyButton from './CopyButton';

// Mock the useCopyToClipboard hook
jest.mock('@/hooks/useCopyToClipboard');

const mockUseCopyToClipboard = require('@/hooks/useCopyToClipboard').useCopyToClipboard;

describe('CopyButton', () => {
  const mockCopyToClipboard = jest.fn();
  const mockResetCopied = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render copy button with default props', () => {
    mockUseCopyToClipboard.mockReturnValue({
      copied: false,
      copyToClipboard: mockCopyToClipboard,
      resetCopied: mockResetCopied,
    });

    render(<CopyButton content="test content" />);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('title', 'Copy to clipboard');
  });

  it('should call copyToClipboard when clicked', async () => {
    mockUseCopyToClipboard.mockReturnValue({
      copied: false,
      copyToClipboard: mockCopyToClipboard,
      resetCopied: mockResetCopied,
    });

    render(<CopyButton content="test content" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockCopyToClipboard).toHaveBeenCalledWith('test content');
    });
  });

  it('should show checkmark icon when copied is true', () => {
    mockUseCopyToClipboard.mockReturnValue({
      copied: true,
      copyToClipboard: mockCopyToClipboard,
      resetCopied: mockResetCopied,
    });

    render(<CopyButton content="test content" />);

    const button = screen.getByRole('button');
    const checkmarkIcon = button.querySelector('svg');

    // Check if the checkmark path is present
    const checkmarkPath = checkmarkIcon?.querySelector('path[d="M5 13l4 4L19 7"]');
    expect(checkmarkPath).toBeInTheDocument();
  });

  it('should show copy icon when copied is false', () => {
    mockUseCopyToClipboard.mockReturnValue({
      copied: false,
      copyToClipboard: mockCopyToClipboard,
      resetCopied: mockResetCopied,
    });

    render(<CopyButton content="test content" />);

    const button = screen.getByRole('button');
    const copyIcon = button.querySelector('svg');

    // Check if the copy path is present
    const copyPath = copyIcon?.querySelector(
      'path[d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"]',
    );
    expect(copyPath).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    mockUseCopyToClipboard.mockReturnValue({
      copied: false,
      copyToClipboard: mockCopyToClipboard,
      resetCopied: mockResetCopied,
    });

    render(<CopyButton content="test content" className="custom-class" />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('should apply custom title', () => {
    mockUseCopyToClipboard.mockReturnValue({
      copied: false,
      copyToClipboard: mockCopyToClipboard,
      resetCopied: mockResetCopied,
    });

    render(<CopyButton content="test content" title="Custom title" />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Custom title');
  });

  it('should apply different sizes', () => {
    mockUseCopyToClipboard.mockReturnValue({
      copied: false,
      copyToClipboard: mockCopyToClipboard,
      resetCopied: mockResetCopied,
    });

    const { rerender } = render(<CopyButton content="test content" size="sm" />);

    let icon = screen.getByRole('button').querySelector('svg');
    expect(icon).toHaveClass('w-3', 'h-3');

    rerender(<CopyButton content="test content" size="lg" />);

    icon = screen.getByRole('button').querySelector('svg');
    expect(icon).toHaveClass('w-5', 'h-5');
  });

  it('should apply different variants', () => {
    mockUseCopyToClipboard.mockReturnValue({
      copied: false,
      copyToClipboard: mockCopyToClipboard,
      resetCopied: mockResetCopied,
    });

    const { rerender } = render(<CopyButton content="test content" variant="default" />);

    let button = screen.getByRole('button');
    expect(button).toHaveClass('p-1', 'text-kitchen-text-light');

    rerender(<CopyButton content="test content" variant="minimal" />);

    button = screen.getByRole('button');
    expect(button).toHaveClass('p-0.5', 'text-gray-400');
  });

  // Additional edge case tests
  it('should handle empty content', async () => {
    mockUseCopyToClipboard.mockReturnValue({
      copied: false,
      copyToClipboard: mockCopyToClipboard,
      resetCopied: mockResetCopied,
    });

    render(<CopyButton content="" />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockCopyToClipboard).toHaveBeenCalledWith('');
    });
  });

  it('should handle very long content', async () => {
    const longContent = 'a'.repeat(1000);
    mockUseCopyToClipboard.mockReturnValue({
      copied: false,
      copyToClipboard: mockCopyToClipboard,
      resetCopied: mockResetCopied,
    });

    render(<CopyButton content={longContent} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockCopyToClipboard).toHaveBeenCalledWith(longContent);
    });
  });

  it('should handle special characters in content', async () => {
    const specialContent = 'Hello\nWorld\tTest\r\nSpecial chars: !@#$%^&*()';
    mockUseCopyToClipboard.mockReturnValue({
      copied: false,
      copyToClipboard: mockCopyToClipboard,
      resetCopied: mockResetCopied,
    });

    render(<CopyButton content={specialContent} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockCopyToClipboard).toHaveBeenCalledWith(specialContent);
    });
  });

  it('should combine variant classes with custom className', () => {
    mockUseCopyToClipboard.mockReturnValue({
      copied: false,
      copyToClipboard: mockCopyToClipboard,
      resetCopied: mockResetCopied,
    });

    render(<CopyButton content="test content" variant="minimal" className="custom-class" />);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('p-0.5', 'text-gray-400', 'custom-class');
  });

  it('should handle multiple rapid clicks', async () => {
    mockUseCopyToClipboard.mockReturnValue({
      copied: false,
      copyToClipboard: mockCopyToClipboard,
      resetCopied: mockResetCopied,
    });

    render(<CopyButton content="test content" />);

    const button = screen.getByRole('button');

    // Multiple rapid clicks
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockCopyToClipboard).toHaveBeenCalledTimes(3);
      expect(mockCopyToClipboard).toHaveBeenCalledWith('test content');
    });
  });

  it('should maintain accessibility attributes', () => {
    mockUseCopyToClipboard.mockReturnValue({
      copied: false,
      copyToClipboard: mockCopyToClipboard,
      resetCopied: mockResetCopied,
    });

    render(<CopyButton content="test content" />);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('title', 'Copy to clipboard');
    expect(button).toBeEnabled();
  });

  it('should handle content with HTML-like strings', async () => {
    const htmlContent = '<div>Hello <strong>World</strong></div>';
    mockUseCopyToClipboard.mockReturnValue({
      copied: false,
      copyToClipboard: mockCopyToClipboard,
      resetCopied: mockResetCopied,
    });

    render(<CopyButton content={htmlContent} />);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockCopyToClipboard).toHaveBeenCalledWith(htmlContent);
    });
  });
});
