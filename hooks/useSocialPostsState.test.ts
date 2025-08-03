import { renderHook, act } from '@testing-library/react';
import { useSocialPostsState } from './useSocialPostsState';
import { SocialPostConfig } from '@/components/SocialPostsDrawer';

describe('useSocialPostsState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useSocialPostsState());

    expect(result.current.showSocialPostsDrawer).toBe(false);
    expect(result.current.socialPostsResponses).toEqual({});
    expect(result.current.isSocialPostsGenerating).toEqual({});
    expect(result.current.showSocialPosts).toEqual({});
    expect(result.current.socialPostsConfigs).toEqual({});
  });

  it('should update showSocialPostsDrawer correctly', () => {
    const { result } = renderHook(() => useSocialPostsState());

    act(() => {
      result.current.setShowSocialPostsDrawer(true);
    });

    expect(result.current.showSocialPostsDrawer).toBe(true);

    act(() => {
      result.current.setShowSocialPostsDrawer(false);
    });

    expect(result.current.showSocialPostsDrawer).toBe(false);
  });

  it('should update socialPostsResponses correctly', () => {
    const { result } = renderHook(() => useSocialPostsState());

    const responses = {
      'post-1': 'Response 1',
      'post-2': 'Response 2',
      'post-3': 'Response 3',
    };

    act(() => {
      result.current.setSocialPostsResponses(responses);
    });

    expect(result.current.socialPostsResponses).toEqual(responses);
  });

  it('should update isSocialPostsGenerating correctly', () => {
    const { result } = renderHook(() => useSocialPostsState());

    const generating = {
      'post-1': true,
      'post-2': false,
      'post-3': true,
    };

    act(() => {
      result.current.setIsSocialPostsGenerating(generating);
    });

    expect(result.current.isSocialPostsGenerating).toEqual(generating);
  });

  it('should update showSocialPosts correctly', () => {
    const { result } = renderHook(() => useSocialPostsState());

    const showPosts = {
      'post-1': true,
      'post-2': false,
      'post-3': true,
    };

    act(() => {
      result.current.setShowSocialPosts(showPosts);
    });

    expect(result.current.showSocialPosts).toEqual(showPosts);
  });

  it('should update socialPostsConfigs correctly', () => {
    const { result } = renderHook(() => useSocialPostsState());

    const configs: { [key: string]: SocialPostConfig } = {
      'post-1': {
        platform: 'twitter',
        postType: 'tweet',
        numberOfPosts: 3,
        characterLimit: 280,
        modelId: 'gpt-4',
        customPrompt: 'Test prompt',
        selectedColumns: ['1', '2'],
        isThreaded: false,
      },
      'post-2': {
        platform: 'linkedin',
        postType: 'article',
        numberOfPosts: 1,
        characterLimit: 3000,
        modelId: 'claude-3',
        customPrompt: '',
        selectedColumns: [],
        isThreaded: false,
      },
    };

    act(() => {
      result.current.setSocialPostsConfigs(configs);
    });

    expect(result.current.socialPostsConfigs).toEqual(configs);
  });

  it('should reset all state when resetSocialPostsState is called', () => {
    const { result } = renderHook(() => useSocialPostsState());

    // Set some initial state
    const responses = { 'post-1': 'Response 1' };
    const generating = { 'post-1': true };
    const showPosts = { 'post-1': true };
    const configs: { [key: string]: SocialPostConfig } = {
      'post-1': {
        platform: 'twitter',
        postType: 'tweet',
        numberOfPosts: 3,
        characterLimit: 280,
        modelId: 'gpt-4',
        customPrompt: 'Test prompt',
        selectedColumns: ['1'],
        isThreaded: false,
      },
    };

    act(() => {
      result.current.setShowSocialPostsDrawer(true);
      result.current.setSocialPostsResponses(responses);
      result.current.setIsSocialPostsGenerating(generating);
      result.current.setShowSocialPosts(showPosts);
      result.current.setSocialPostsConfigs(configs);
    });

    // Verify state is set
    expect(result.current.showSocialPostsDrawer).toBe(true);
    expect(Object.keys(result.current.socialPostsResponses)).toHaveLength(1);
    expect(Object.keys(result.current.isSocialPostsGenerating)).toHaveLength(1);
    expect(Object.keys(result.current.showSocialPosts)).toHaveLength(1);
    expect(Object.keys(result.current.socialPostsConfigs)).toHaveLength(1);

    // Reset state
    act(() => {
      result.current.resetSocialPostsState();
    });

    // Verify state is reset
    expect(result.current.socialPostsResponses).toEqual({});
    expect(result.current.isSocialPostsGenerating).toEqual({});
    expect(result.current.showSocialPosts).toEqual({});
    expect(result.current.socialPostsConfigs).toEqual({});
  });

  it('should preserve existing state when updating individual properties', () => {
    const { result } = renderHook(() => useSocialPostsState());

    // Set initial state
    act(() => {
      result.current.setSocialPostsResponses({ 'post-1': 'Response 1' });
      result.current.setIsSocialPostsGenerating({ 'post-1': true });
      result.current.setShowSocialPosts({ 'post-1': true });
      result.current.setSocialPostsConfigs({
        'post-1': {
          platform: 'twitter',
          postType: 'tweet',
          numberOfPosts: 3,
          characterLimit: 280,
          modelId: 'gpt-4',
          customPrompt: 'Test prompt',
          selectedColumns: ['1'],
          isThreaded: false,
        },
      });
    });

    // Update one property
    act(() => {
      result.current.setSocialPostsResponses({
        'post-1': 'Response 1',
        'post-2': 'Response 2',
      });
    });

    // Verify other properties are preserved
    expect(result.current.isSocialPostsGenerating).toEqual({ 'post-1': true });
    expect(result.current.showSocialPosts).toEqual({ 'post-1': true });
    expect(Object.keys(result.current.socialPostsConfigs)).toHaveLength(1);
  });

  it('should handle empty objects correctly', () => {
    const { result } = renderHook(() => useSocialPostsState());

    act(() => {
      result.current.setSocialPostsResponses({});
      result.current.setIsSocialPostsGenerating({});
      result.current.setShowSocialPosts({});
      result.current.setSocialPostsConfigs({});
    });

    expect(result.current.socialPostsResponses).toEqual({});
    expect(result.current.isSocialPostsGenerating).toEqual({});
    expect(result.current.showSocialPosts).toEqual({});
    expect(result.current.socialPostsConfigs).toEqual({});
  });

  it('should handle multiple state updates correctly', () => {
    const { result } = renderHook(() => useSocialPostsState());

    act(() => {
      result.current.setShowSocialPostsDrawer(true);
      result.current.setSocialPostsResponses({ 'post-1': 'Response 1' });
      result.current.setIsSocialPostsGenerating({ 'post-1': true });
      result.current.setShowSocialPosts({ 'post-1': true });
      result.current.setSocialPostsConfigs({
        'post-1': {
          platform: 'twitter',
          postType: 'tweet',
          numberOfPosts: 3,
          characterLimit: 280,
          modelId: 'gpt-4',
          customPrompt: 'Test prompt',
          selectedColumns: ['1'],
          isThreaded: false,
        },
      });
    });

    expect(result.current.showSocialPostsDrawer).toBe(true);
    expect(result.current.socialPostsResponses).toEqual({ 'post-1': 'Response 1' });
    expect(result.current.isSocialPostsGenerating).toEqual({ 'post-1': true });
    expect(result.current.showSocialPosts).toEqual({ 'post-1': true });
    expect(Object.keys(result.current.socialPostsConfigs)).toHaveLength(1);
  });

  it('should handle boolean state changes correctly', () => {
    const { result } = renderHook(() => useSocialPostsState());

    act(() => {
      result.current.setShowSocialPostsDrawer(true);
    });
    expect(result.current.showSocialPostsDrawer).toBe(true);

    act(() => {
      result.current.setShowSocialPostsDrawer(false);
    });
    expect(result.current.showSocialPostsDrawer).toBe(false);
  });

  it('should handle object state changes correctly', () => {
    const { result } = renderHook(() => useSocialPostsState());

    // Test socialPostsResponses
    act(() => {
      result.current.setSocialPostsResponses({ 'post-1': 'Response 1' });
    });
    expect(result.current.socialPostsResponses).toEqual({ 'post-1': 'Response 1' });

    act(() => {
      result.current.setSocialPostsResponses({
        'post-1': 'Response 1',
        'post-2': 'Response 2',
        'post-3': 'Response 3',
      });
    });
    expect(result.current.socialPostsResponses).toEqual({
      'post-1': 'Response 1',
      'post-2': 'Response 2',
      'post-3': 'Response 3',
    });

    // Test isSocialPostsGenerating
    act(() => {
      result.current.setIsSocialPostsGenerating({ 'post-1': true });
    });
    expect(result.current.isSocialPostsGenerating).toEqual({ 'post-1': true });

    act(() => {
      result.current.setIsSocialPostsGenerating({
        'post-1': true,
        'post-2': false,
        'post-3': true,
      });
    });
    expect(result.current.isSocialPostsGenerating).toEqual({
      'post-1': true,
      'post-2': false,
      'post-3': true,
    });
  });

  it('should handle complex SocialPostConfig objects correctly', () => {
    const { result } = renderHook(() => useSocialPostsState());

    const complexConfig: SocialPostConfig = {
      platform: 'linkedin',
      postType: 'article',
      numberOfPosts: 5,
      characterLimit: 5000,
      modelId: 'claude-3-sonnet',
      customPrompt: 'Create a comprehensive article about AI',
      selectedColumns: ['1', '2', '3'],
      isThreaded: true,
    };

    act(() => {
      result.current.setSocialPostsConfigs({ 'post-1': complexConfig });
    });

    expect(result.current.socialPostsConfigs['post-1']).toEqual(complexConfig);
  });
});
