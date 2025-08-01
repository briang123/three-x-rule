'use client';

import React from 'react';
import BaseSocialPlatform from './BaseSocialPlatform';
import { SocialPlatformProps } from './types';

interface TwitterPlatformProps extends SocialPlatformProps {
  // Add any Twitter-specific props here
}

export default function TwitterPlatform(props: TwitterPlatformProps) {
  return (
    <BaseSocialPlatform
      {...props}
      config={{
        ...props.config,
        platform: 'twitter', // Ensure platform is set to twitter
      }}
    >
      {/* Add any Twitter-specific UI elements here */}
    </BaseSocialPlatform>
  );
}
