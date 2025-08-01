import { renderHook, act } from '@testing-library/react';
import { useCopyToClipboard } from './useCopyToClipboard';

// Mock navigator.clipboard
const mockClipboard = {
  writeText: jest.fn(),
};

Object.assign(navigator, {
  clipboard: mockClipboard,
});

describe('useCopyToClipboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should copy text to clipboard successfully', async () => {
    const mockText = 'test content';
    mockClipboard.writeText.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copyToClipboard(mockText);
    });

    expect(mockClipboard.writeText).toHaveBeenCalledWith(mockText);
    expect(result.current.copied).toBe(true);
  });

  it('should reset copied state after timeout', async () => {
    const mockText = 'test content';
    mockClipboard.writeText.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCopyToClipboard({ timeout: 1000 }));

    await act(async () => {
      await result.current.copyToClipboard(mockText);
    });

    expect(result.current.copied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.copied).toBe(false);
  });

  it('should handle clipboard errors', async () => {
    const mockText = 'test content';
    const mockError = new Error('Clipboard permission denied');
    mockClipboard.writeText.mockRejectedValue(mockError);

    const onError = jest.fn();
    const { result } = renderHook(() => useCopyToClipboard({ onError }));

    await act(async () => {
      await result.current.copyToClipboard(mockText);
    });

    expect(mockClipboard.writeText).toHaveBeenCalledWith(mockText);
    expect(result.current.copied).toBe(false);
    expect(onError).toHaveBeenCalledWith(mockError);
  });

  it('should call onSuccess callback when copy succeeds', async () => {
    const mockText = 'test content';
    mockClipboard.writeText.mockResolvedValue(undefined);

    const onSuccess = jest.fn();
    const { result } = renderHook(() => useCopyToClipboard({ onSuccess }));

    await act(async () => {
      await result.current.copyToClipboard(mockText);
    });

    expect(onSuccess).toHaveBeenCalled();
  });

  it('should reset copied state manually', async () => {
    const mockText = 'test content';
    mockClipboard.writeText.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copyToClipboard(mockText);
    });

    expect(result.current.copied).toBe(true);

    act(() => {
      result.current.resetCopied();
    });

    expect(result.current.copied).toBe(false);
  });

  it('should use default timeout of 2000ms', async () => {
    const mockText = 'test content';
    mockClipboard.writeText.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copyToClipboard(mockText);
    });

    expect(result.current.copied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(1999);
    });

    expect(result.current.copied).toBe(true);

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(result.current.copied).toBe(false);
  });

  // Additional edge case tests
  it('should handle empty string content', async () => {
    const mockText = '';
    mockClipboard.writeText.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copyToClipboard(mockText);
    });

    expect(mockClipboard.writeText).toHaveBeenCalledWith('');
    expect(result.current.copied).toBe(true);
  });

  it('should handle multiple rapid copy calls', async () => {
    const mockText1 = 'first content';
    const mockText2 = 'second content';
    mockClipboard.writeText.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCopyToClipboard({ timeout: 1000 }));

    // First copy
    await act(async () => {
      await result.current.copyToClipboard(mockText1);
    });

    expect(result.current.copied).toBe(true);

    // Second copy before timeout
    await act(async () => {
      await result.current.copyToClipboard(mockText2);
    });

    expect(mockClipboard.writeText).toHaveBeenCalledWith(mockText2);
    expect(result.current.copied).toBe(true);

    // Advance time to trigger timeout
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.copied).toBe(false);
  });

  it('should not call callbacks if not provided', async () => {
    const mockText = 'test content';
    mockClipboard.writeText.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCopyToClipboard());

    // Should not throw when callbacks are not provided
    await act(async () => {
      await expect(result.current.copyToClipboard(mockText)).resolves.not.toThrow();
    });

    expect(result.current.copied).toBe(true);
  });

  it('should handle very long text content', async () => {
    const mockText = 'a'.repeat(10000); // 10KB of text
    mockClipboard.writeText.mockResolvedValue(undefined);

    const { result } = renderHook(() => useCopyToClipboard());

    await act(async () => {
      await result.current.copyToClipboard(mockText);
    });

    expect(mockClipboard.writeText).toHaveBeenCalledWith(mockText);
    expect(result.current.copied).toBe(true);
  });
});
