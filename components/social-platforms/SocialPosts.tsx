import React from 'react';
import { SocialPlatformFactory, SocialPostConfig } from './index';

interface SocialPostsProps {
  showSocialPosts: { [key: string]: boolean };
  socialPostsResponses: { [key: string]: string };
  isSocialPostsGenerating: { [key: string]: boolean };
  socialPostsConfigs: { [key: string]: SocialPostConfig };
  socialPostsBorderStates: { [key: string]: boolean };
  onCloseSocialPosts?: (socialPostId: string) => void;
  onAddSelection: (text: string, source: string) => void;
  socialPostsRefs: React.MutableRefObject<{ [key: string]: HTMLDivElement | null }>;
}

const SocialPosts: React.FC<SocialPostsProps> = ({
  showSocialPosts,
  socialPostsResponses,
  isSocialPostsGenerating,
  socialPostsConfigs,
  socialPostsBorderStates,
  onCloseSocialPosts,
  onAddSelection,
  socialPostsRefs,
}) => {
  return (
    <>
      {Object.entries(showSocialPosts).map(([socialPostId, isVisible]) => {
        if (!isVisible) return null;

        const config = socialPostsConfigs[socialPostId];
        const response = socialPostsResponses[socialPostId];
        const isGenerating = isSocialPostsGenerating[socialPostId];
        const isBorderFaded = socialPostsBorderStates[socialPostId];

        return (
          <div
            key={socialPostId}
            ref={(el) => {
              socialPostsRefs.current[socialPostId] = el;
            }}
          >
            <SocialPlatformFactory
              config={config}
              response={response}
              isGenerating={isGenerating}
              isBorderFaded={isBorderFaded}
              onClose={() => onCloseSocialPosts?.(socialPostId)}
              onAddSelection={onAddSelection}
            />
          </div>
        );
      })}
    </>
  );
};

export default SocialPosts;
