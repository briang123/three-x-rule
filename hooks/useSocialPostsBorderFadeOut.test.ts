import { renderHook, act } from '@testing-library/react';
import useSocialPostsBorderFadeOut from './useSocialPostsBorderFadeOut';

// Mock the useTimeout hook
jest.mock('./useTimeout', () => {
  return jest.fn();
});

const mockUseTimeout = require('./useTimeout') as jest.MockedFunction<
  typeof import('./useTimeout').default
>;

describe('useSocialPostsBorderFadeOut', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const defaultProps = {
    socialPostsResponses: {},
    showSocialPosts: {},
    isSocialPostsGenerating: {},
  };

  it('should initialize with empty border states', () => {
    const { result } = renderHook(() => useSocialPostsBorderFadeOut(defaultProps));

    expect(result.current.socialPostsBorderStates).toEqual({});
    expect(typeof result.current.setSocialPostsBorderStates).toBe('function');
  });

  it('should not start fade-out timer for invisible social posts', () => {
    const props = {
      socialPostsResponses: { 'post-1': 'Some content' },
      showSocialPosts: { 'post-1': false },
      isSocialPostsGenerating: { 'post-1': false },
    };

    renderHook(() => useSocialPostsBorderFadeOut(props));

    expect(mockUseTimeout).toHaveBeenCalledWith(expect.any(Function), null);
  });

  it('should not start fade-out timer for empty responses', () => {
    const props = {
      socialPostsResponses: { 'post-1': '' },
      showSocialPosts: { 'post-1': true },
      isSocialPostsGenerating: { 'post-1': false },
    };

    renderHook(() => useSocialPostsBorderFadeOut(props));

    expect(mockUseTimeout).toHaveBeenCalledWith(expect.any(Function), null);
  });

  it('should not start fade-out timer for whitespace-only responses', () => {
    const props = {
      socialPostsResponses: { 'post-1': '   \n\t  ' },
      showSocialPosts: { 'post-1': true },
      isSocialPostsGenerating: { 'post-1': false },
    };

    renderHook(() => useSocialPostsBorderFadeOut(props));

    expect(mockUseTimeout).toHaveBeenCalledWith(expect.any(Function), null);
  });

  it('should not start fade-out timer for generating posts', () => {
    const props = {
      socialPostsResponses: { 'post-1': 'Some content' },
      showSocialPosts: { 'post-1': true },
      isSocialPostsGenerating: { 'post-1': true },
    };

    renderHook(() => useSocialPostsBorderFadeOut(props));

    expect(mockUseTimeout).toHaveBeenCalledWith(expect.any(Function), null);
  });

  it('should not start fade-out timer for already faded posts', () => {
    const props = {
      socialPostsResponses: { 'post-1': 'Some content' },
      showSocialPosts: { 'post-1': true },
      isSocialPostsGenerating: { 'post-1': false },
    };

    const { result } = renderHook(() => useSocialPostsBorderFadeOut(props));

    // Manually set the border state to faded
    act(() => {
      result.current.setSocialPostsBorderStates({ 'post-1': true });
    });

    // Re-render to trigger the effect
    renderHook(() => useSocialPostsBorderFadeOut(props));

    expect(mockUseTimeout).toHaveBeenCalledWith(expect.any(Function), null);
  });

  it('should start fade-out timer for valid posts', () => {
    const props = {
      socialPostsResponses: { 'post-1': 'Some content' },
      showSocialPosts: { 'post-1': true },
      isSocialPostsGenerating: { 'post-1': false },
    };

    renderHook(() => useSocialPostsBorderFadeOut(props));

    expect(mockUseTimeout).toHaveBeenCalledWith(expect.any(Function), 10000);
  });

  it('should use custom fade-out delay', () => {
    const props = {
      socialPostsResponses: { 'post-1': 'Some content' },
      showSocialPosts: { 'post-1': true },
      isSocialPostsGenerating: { 'post-1': false },
      fadeOutDelay: 5000,
    };

    renderHook(() => useSocialPostsBorderFadeOut(props));

    expect(mockUseTimeout).toHaveBeenCalledWith(expect.any(Function), 5000);
  });

  it('should handle multiple posts correctly', () => {
    const props = {
      socialPostsResponses: {
        'post-1': 'Content 1',
        'post-2': 'Content 2',
        'post-3': 'Content 3',
      },
      showSocialPosts: {
        'post-1': true,
        'post-2': true,
        'post-3': false,
      },
      isSocialPostsGenerating: {
        'post-1': false,
        'post-2': true,
        'post-3': false,
      },
    };

    renderHook(() => useSocialPostsBorderFadeOut(props));

    // Should only start timer for post-1 (visible, has content, not generating)
    expect(mockUseTimeout).toHaveBeenCalledWith(expect.any(Function), 10000);
  });

  it('should execute fade-out callback correctly', () => {
    const props = {
      socialPostsResponses: {
        'post-1': 'Content 1',
        'post-2': 'Content 2',
      },
      showSocialPosts: {
        'post-1': true,
        'post-2': true,
      },
      isSocialPostsGenerating: {
        'post-1': false,
        'post-2': false,
      },
    };

    let timeoutCallback: (() => void) | null = null;
    mockUseTimeout.mockImplementation((callback, delay) => {
      timeoutCallback = callback;
      return { current: setTimeout(() => {}, delay || 0) };
    });

    const { result } = renderHook(() => useSocialPostsBorderFadeOut(props));

    expect(result.current.socialPostsBorderStates).toEqual({});

    // Execute the timeout callback
    act(() => {
      if (timeoutCallback) {
        timeoutCallback();
      }
    });

    expect(result.current.socialPostsBorderStates).toEqual({
      'post-1': true,
      'post-2': true,
    });
  });

  it('should allow manual setting of border states', () => {
    const props = {
      socialPostsResponses: { 'post-1': 'Some content' },
      showSocialPosts: { 'post-1': true },
      isSocialPostsGenerating: { 'post-1': false },
    };

    const { result } = renderHook(() => useSocialPostsBorderFadeOut(props));

    // Initially border states should be empty
    expect(result.current.socialPostsBorderStates).toEqual({});

    // Manually set border state
    act(() => {
      result.current.setSocialPostsBorderStates({ 'post-1': true });
    });

    expect(result.current.socialPostsBorderStates).toEqual({ 'post-1': true });
  });
});
