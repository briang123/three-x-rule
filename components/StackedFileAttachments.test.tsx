import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { motion } from 'framer-motion';
import StackedFileAttachments from './StackedFileAttachments';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => {
      const { whileHover, whileTap, ...restProps } = props;
      return <div {...restProps}>{children}</div>;
    },
    button: ({ children, ...props }: any) => {
      const { whileHover, whileTap, ...restProps } = props;
      return <button {...restProps}>{children}</button>;
    },
  },
  AnimatePresence: ({ children }: any) => <div data-testid="animate-presence">{children}</div>,
}));

describe('StackedFileAttachments', () => {
  const mockOnRemove = jest.fn();
  const mockOnView = jest.fn();
  const mockGetFileIcon = jest.fn();
  const mockGetFileColor = jest.fn();

  const createMockFile = (name: string, type: string) => {
    return new File(['test content'], name, { type });
  };

  const mockFiles = {
    text: createMockFile('test.txt', 'text/plain'),
    pdf: createMockFile('document.pdf', 'application/pdf'),
    image: createMockFile('image.jpg', 'image/jpeg'),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render nothing when no attachments', () => {
    render(
      <StackedFileAttachments
        attachments={[]}
        onRemove={mockOnRemove}
        onView={mockOnView}
        getFileIcon={mockGetFileIcon}
        getFileColor={mockGetFileColor}
      />,
    );

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('should render single file attachment', () => {
    render(
      <StackedFileAttachments
        attachments={[mockFiles.text]}
        onRemove={mockOnRemove}
        onView={mockOnView}
        getFileIcon={mockGetFileIcon}
        getFileColor={mockGetFileColor}
      />,
    );

    // Get the file button specifically (not the remove button)
    const fileButtons = screen.getAllByRole('button');
    const fileButton = fileButtons.find((button) => !button.textContent?.includes('×'));
    expect(fileButton).toBeInTheDocument();
    expect(mockGetFileIcon).toHaveBeenCalledWith(mockFiles.text);
    expect(mockGetFileColor).toHaveBeenCalledWith(mockFiles.text);
  });

  it('should render multiple file attachments in stack', () => {
    const files = [mockFiles.text, mockFiles.pdf, mockFiles.image];

    render(
      <StackedFileAttachments
        attachments={files}
        onRemove={mockOnRemove}
        onView={mockOnView}
        getFileIcon={mockGetFileIcon}
        getFileColor={mockGetFileColor}
      />,
    );

    // Should show 3 file buttons and 1 remove button (for the top file)
    const allButtons = screen.getAllByRole('button');
    const fileButtons = allButtons.filter((button) => !button.textContent?.includes('×'));
    const removeButtons = allButtons.filter((button) => button.textContent?.includes('×'));

    expect(fileButtons).toHaveLength(3);
    expect(removeButtons).toHaveLength(1);
  });

  it('should show remove button on the topmost file', () => {
    const files = [mockFiles.text, mockFiles.pdf];

    render(
      <StackedFileAttachments
        attachments={files}
        onRemove={mockOnRemove}
        onView={mockOnView}
        getFileIcon={mockGetFileIcon}
        getFileColor={mockGetFileColor}
      />,
    );

    const allButtons = screen.getAllByRole('button');
    const removeButton = allButtons.find((button) => button.textContent?.includes('×'));
    expect(removeButton).toBeInTheDocument();
  });

  it('should call onView when file is clicked', () => {
    render(
      <StackedFileAttachments
        attachments={[mockFiles.text]}
        onRemove={mockOnRemove}
        onView={mockOnView}
        getFileIcon={mockGetFileIcon}
        getFileColor={mockGetFileColor}
      />,
    );

    const allButtons = screen.getAllByRole('button');
    const fileButton = allButtons.find((button) => !button.textContent?.includes('×'));
    fireEvent.click(fileButton!);

    expect(mockOnView).toHaveBeenCalledWith(mockFiles.text);
  });

  it('should call onRemove when remove button is clicked', () => {
    render(
      <StackedFileAttachments
        attachments={[mockFiles.text]}
        onRemove={mockOnRemove}
        onView={mockOnView}
        getFileIcon={mockGetFileIcon}
        getFileColor={mockGetFileColor}
      />,
    );

    const allButtons = screen.getAllByRole('button');
    const removeButton = allButtons.find((button) => button.textContent?.includes('×'));
    fireEvent.click(removeButton!);

    expect(mockOnRemove).toHaveBeenCalledWith(0);
  });

  it('should handle different file types correctly', () => {
    const files = [mockFiles.text, mockFiles.pdf, mockFiles.image];

    render(
      <StackedFileAttachments
        attachments={files}
        onRemove={mockOnRemove}
        onView={mockOnView}
        getFileIcon={mockGetFileIcon}
        getFileColor={mockGetFileColor}
      />,
    );

    expect(mockGetFileColor).toHaveBeenCalledWith(files[0]); // text/plain
    expect(mockGetFileColor).toHaveBeenCalledWith(files[1]); // application/pdf
    expect(mockGetFileColor).toHaveBeenCalledWith(files[2]); // image/jpeg
  });
});
