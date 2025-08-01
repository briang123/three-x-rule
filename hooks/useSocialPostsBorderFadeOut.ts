import { useState, useEffect } from 'react';
import useTimeout from './useTimeout';

interface UseSocialPostsBorderFadeOutProps {
  socialPostsResponses: { [key: string]: string };
  showSocialPosts: { [key: string]: boolean };
  isSocialPostsGenerating: { [key: string]: boolean };
  fadeOutDelay?: number;
}

export default function useSocialPostsBorderFadeOut({
  socialPostsResponses,
  showSocialPosts,
  isSocialPostsGenerating,
  fadeOutDelay = 10000,
}: UseSocialPostsBorderFadeOutProps) {
  const [socialPostsBorderStates, setSocialPostsBorderStates] = useState<{
    [key: string]: boolean;
  }>({});

  // State to track which social posts need fade-out timers
  const [socialPostsNeedingFadeOut, setSocialPostsNeedingFadeOut] = useState<{
    [key: string]: boolean;
  }>({});

  // Effect to determine which social posts need fade-out timers
  useEffect(() => {
    const postsNeedingFadeOut: { [key: string]: boolean } = {};

    Object.entries(socialPostsResponses).forEach(([socialPostId, response]) => {
      // Only start fade-out timer if:
      // 1. The social post is visible
      // 2. There's actual content (not empty)
      // 3. It's not currently generating
      // 4. The border hasn't already faded
      if (
        showSocialPosts[socialPostId] &&
        response &&
        response.trim() !== '' &&
        !isSocialPostsGenerating[socialPostId] &&
        !socialPostsBorderStates[socialPostId]
      ) {
        postsNeedingFadeOut[socialPostId] = true;
      }
    });

    setSocialPostsNeedingFadeOut(postsNeedingFadeOut);
  }, [socialPostsResponses, showSocialPosts, isSocialPostsGenerating, socialPostsBorderStates]);

  // Timeout hook for social posts border fade-out
  const socialPostsFadeOutTimeout = useTimeout(
    () => {
      Object.keys(socialPostsNeedingFadeOut).forEach((socialPostId) => {
        setSocialPostsBorderStates((prev) => ({
          ...prev,
          [socialPostId]: true, // true means faded out
        }));
      });
    },
    Object.keys(socialPostsNeedingFadeOut).length > 0 ? fadeOutDelay : null,
  );

  // Clean up border states when social posts are removed
  useEffect(() => {
    const currentSocialPostIds = Object.keys(showSocialPosts);
    setSocialPostsBorderStates((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((id) => {
        if (!currentSocialPostIds.includes(id)) {
          delete newState[id];
        }
      });
      return newState;
    });
  }, [showSocialPosts]);

  return {
    socialPostsBorderStates,
    setSocialPostsBorderStates,
  };
}
