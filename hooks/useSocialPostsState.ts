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

  const resetSocialPostsState = useCallback(() => {
    setSocialPostsResponses({});
    setIsSocialPostsGenerating({});
    setShowSocialPosts({});
    setSocialPostsConfigs({});
  }, []);

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
  };
};
