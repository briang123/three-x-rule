'use client';

import React from 'react';
import BaseSocialPlatform from './BaseSocialPlatform';
import { SocialPlatformProps } from './types';

interface FacebookPlatformProps extends SocialPlatformProps {
  // Add any Facebook-specific props here
}

export default function FacebookPlatform(props: FacebookPlatformProps) {
  return (
    <BaseSocialPlatform
      {...props}
      config={{
        ...props.config,
        platform: 'facebook', // Ensure platform is set to facebook
      }}
    >
      {/* Add any Facebook-specific UI elements here */}
    </BaseSocialPlatform>
  );
}
