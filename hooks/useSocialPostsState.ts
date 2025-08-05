import { useState, useCallback } from 'react';
import { SocialPostConfig } from '@/components/SocialPostsDrawer';

export const useSocialPostsState = () => {
  const [showSocialPostsDrawer, setShowSocialPostsDrawer] = useState<boolean>(false);
  const [socialPostsResponses, setSocialPostsResponses] = useState<{ [key: string]: string }>({});
  const [isSocialPostsGenerating, setIsSocialPostsGenerating] = useState<{
    [key: string]: boolean;
  }>({});
  const [showSocialPosts, setShowSocialPosts] = useState<{ [key: string]: boolean }>({});
  const [socialPostsConfigs, setSocialPostsConfigs] = useState<{ [key: string]: SocialPostConfig }>(
    {},
  );

  // TODO: Remove useChat import and usage. Use AI SDK v5 streaming primitives instead.

  const resetSocialPostsState = useCallback(() => {
    setSocialPostsResponses({});
    setIsSocialPostsGenerating({});
    setShowSocialPosts({});
    setSocialPostsConfigs({});

    // Reset the AI SDK chat instance
    // socialPostsChat.reload(); // This line is removed as per the edit hint
  }, []); // Removed socialPostsChat from dependency array as it's no longer used

  return {
    showSocialPostsDrawer,
    setShowSocialPostsDrawer,
    socialPostsResponses,
    setSocialPostsResponses,
    isSocialPostsGenerating,
    setIsSocialPostsGenerating,
    showSocialPosts,
    setShowSocialPosts,
    socialPostsConfigs,
    setSocialPostsConfigs,
    resetSocialPostsState,
    // socialPostsChat, // Expose the AI SDK chat instance - Removed as per the edit hint
  };
};
