'use client';

import React from 'react';
import BaseSocialPlatform from './BaseSocialPlatform';
import { SocialPlatformProps } from './types';

interface LinkedInPlatformProps extends SocialPlatformProps {
  // Add any LinkedIn-specific props here
}

export default function LinkedInPlatform(props: LinkedInPlatformProps) {
  return (
    <BaseSocialPlatform
      {...props}
      config={{
        ...props.config,
        platform: 'linkedin', // Ensure platform is set to linkedin
      }}
    >
      {/* Add any LinkedIn-specific UI elements here */}
    </BaseSocialPlatform>
  );
}
