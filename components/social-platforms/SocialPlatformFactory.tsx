'use client';

import React from 'react';
import { SocialPlatformProps } from './types';
import TwitterPlatform from './TwitterPlatform';
import LinkedInPlatform from './LinkedInPlatform';
import InstagramPlatform from './InstagramPlatform';
import FacebookPlatform from './FacebookPlatform';
import TikTokPlatform from './TikTokPlatform';
import BaseSocialPlatform from './BaseSocialPlatform';

interface SocialPlatformFactoryProps extends SocialPlatformProps {
  // No additional props needed
}

export default function SocialPlatformFactory(props: SocialPlatformFactoryProps) {
  const { config } = props;
  const platform = config.platform;

  // Render the appropriate platform component based on the platform type
  switch (platform) {
    case 'twitter':
      return <TwitterPlatform {...props} />;
    case 'linkedin':
      return <LinkedInPlatform {...props} />;
    case 'instagram':
      return <InstagramPlatform {...props} />;
    case 'facebook':
      return <FacebookPlatform {...props} />;
    case 'tiktok':
      return <TikTokPlatform {...props} />;
    default:
      // Fallback to base component for unknown platforms
      return <BaseSocialPlatform {...props} />;
  }
}
