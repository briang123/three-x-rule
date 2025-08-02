// Export types
export * from './types';
export type { SocialPostConfig } from './types';

// Export base component
export { default as BaseSocialPlatform } from './BaseSocialPlatform';

// Export platform-specific components
export { default as TwitterPlatform } from './TwitterPlatform';
export { default as LinkedInPlatform } from './LinkedInPlatform';
export { default as InstagramPlatform } from './InstagramPlatform';
export { default as FacebookPlatform } from './FacebookPlatform';
export { default as TikTokPlatform } from './TikTokPlatform';

// Export factory component
export { default as SocialPlatformFactory } from './SocialPlatformFactory';

// Export utility components
export { default as ModelBadge } from './ModelBadge';
export { default as ContentTypeBadge } from './ContentTypeBadge';
export { default as PlatformIcon } from './PlatformIcon';
export { default as ErrorDisplay } from './ErrorDisplay';
export { default as CharacterCount } from './CharacterCount';
export { default as PostNumberBadge } from './PostNumberBadge';
export { default as GeneratedSummary } from './GeneratedSummary';
export { default as GeneratingIndicator } from './GeneratingIndicator';
export { default as EmptyState } from './EmptyState';
export { default as ContainerizedAIResponseCard } from './ContainerizedAIResponseCard';
export { default as MotionBorderCard } from './MotionBorderCard';

// Export main social posts component
export { default as SocialPosts } from './SocialPosts';
