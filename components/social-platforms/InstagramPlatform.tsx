'use client';

import React from 'react';
import BaseSocialPlatform from './BaseSocialPlatform';
import { SocialPlatformProps } from './types';

interface InstagramPlatformProps extends SocialPlatformProps {
  // Add any Instagram-specific props here
}

export default function InstagramPlatform(props: InstagramPlatformProps) {
  return (
    <BaseSocialPlatform
      {...props}
      config={{
        ...props.config,
        platform: 'instagram', // Ensure platform is set to instagram
      }}
    >
      {/* Add any Instagram-specific UI elements here */}
    </BaseSocialPlatform>
  );
}
