'use client';

import React from 'react';
import BaseSocialPlatform from './BaseSocialPlatform';
import { SocialPlatformProps } from './types';

interface TikTokPlatformProps extends SocialPlatformProps {
  // Add any TikTok-specific props here
}

export default function TikTokPlatform(props: TikTokPlatformProps) {
  return (
    <BaseSocialPlatform
      {...props}
      config={{
        ...props.config,
        platform: 'tiktok', // Ensure platform is set to tiktok
      }}
    >
      {/* Add any TikTok-specific UI elements here */}
    </BaseSocialPlatform>
  );
}
