import { renderHook, waitFor } from '@testing-library/react';
import { useModels } from './useModels';
import { apiClient } from '@/lib/api-client';

// Mock the apiClient
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    getModels: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('useModels', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useModels());

    expect(result.current.models).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.initialized).toBe(false);
    expect(typeof result.current.refetch).toBe('function');
  });

  it('should fetch models successfully', async () => {
    const mockModels = [
      {
        id: 'model-1',
        name: 'Test Model 1',
        description: 'Test Description 1',
        maxInputTokens: 1000,
        maxOutputTokens: 500,
        supportsImages: false,
        supportsVideo: false,
        supportsAudio: false,
      },
      {
        id: 'model-2',
        name: 'Test Model 2',
        description: 'Test Description 2',
        maxInputTokens: 2000,
        maxOutputTokens: 1000,
        supportsImages: true,
        supportsVideo: false,
        supportsAudio: false,
      },
    ];

    mockApiClient.getModels.mockResolvedValue({
      success: true,
      data: {
        models: mockModels,
        totalModels: 2,
        timestamp: new Date().toISOString(),
      },
    });

    const { result } = renderHook(() => useModels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.models).toEqual(mockModels);
    expect(result.current.error).toBeNull();
    expect(result.current.initialized).toBe(true);
    expect(mockApiClient.getModels).toHaveBeenCalledTimes(1);
  });

  it('should handle API error', async () => {
    const errorMessage = 'Failed to fetch models';
    mockApiClient.getModels.mockResolvedValue({
      success: false,
      error: errorMessage,
    });

    const { result } = renderHook(() => useModels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.models).toEqual([]);
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.initialized).toBe(false);
  });

  it('should handle network error', async () => {
    const errorMessage = 'Network error';
    mockApiClient.getModels.mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useModels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.models).toEqual([]);
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.initialized).toBe(false);
  });

  it('should allow refetching models', async () => {
    const mockModels = [
      {
        id: 'model-1',
        name: 'Test Model 1',
        description: 'Test Description 1',
        maxInputTokens: 1000,
        maxOutputTokens: 500,
        supportsImages: false,
        supportsVideo: false,
        supportsAudio: false,
      },
    ];

    mockApiClient.getModels.mockResolvedValue({
      success: true,
      data: {
        models: mockModels,
        totalModels: 1,
        timestamp: new Date().toISOString(),
      },
    });

    const { result } = renderHook(() => useModels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear the mock to verify refetch calls it again
    mockApiClient.getModels.mockClear();

    // Call refetch
    await result.current.refetch();

    expect(mockApiClient.getModels).toHaveBeenCalledTimes(1);
  });

  it('should handle refetch error', async () => {
    mockApiClient.getModels.mockResolvedValue({
      success: true,
      data: {
        models: [],
        totalModels: 0,
        timestamp: new Date().toISOString(),
      },
    });

    const { result } = renderHook(() => useModels());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Mock error for refetch
    const errorMessage = 'Refetch error';
    mockApiClient.getModels.mockResolvedValue({
      success: false,
      error: errorMessage,
    });

    await result.current.refetch();

    await waitFor(() => {
      expect(result.current.error).toBe(errorMessage);
    });
  });
});
