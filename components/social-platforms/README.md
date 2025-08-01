# Social Platform Components

This directory contains the refactored social platform components that were previously inlined in the `OutputColumns.tsx` component.

## Structure

```
social-platforms/
├── types.ts                    # Shared types and utility functions
├── BaseSocialPlatform.tsx      # Base component with common functionality
├── TwitterPlatform.tsx         # Twitter-specific component
├── LinkedInPlatform.tsx        # LinkedIn-specific component
├── InstagramPlatform.tsx       # Instagram-specific component
├── FacebookPlatform.tsx        # Facebook-specific component
├── TikTokPlatform.tsx          # TikTok-specific component
├── SocialPlatformFactory.tsx   # Factory component for platform selection
├── index.ts                    # Export file
├── SocialPlatformFactory.test.tsx # Tests
└── README.md                   # This file
```

## Components

### BaseSocialPlatform.tsx

The base component that provides common functionality for all social platforms:

- Platform-specific colors and icons
- Content type labels
- Social post parsing and formatting
- Error handling
- Loading states
- Copy functionality

### Platform-Specific Components

Each platform has its own component that extends the base functionality:

- `TwitterPlatform.tsx` - Twitter/X specific features
- `LinkedInPlatform.tsx` - LinkedIn specific features
- `InstagramPlatform.tsx` - Instagram specific features
- `FacebookPlatform.tsx` - Facebook specific features
- `TikTokPlatform.tsx` - TikTok specific features

### SocialPlatformFactory.tsx

A factory component that renders the appropriate platform component based on the platform type in the configuration.

## Usage

### Basic Usage

```tsx
import { SocialPlatformFactory } from '@/components/social-platforms';

const config = {
  platform: 'twitter',
  modelId: 'gemini-2.0-flash',
  postType: 'tweet',
  numberOfPosts: 1,
  characterLimit: 280,
  isThreaded: false,
};

<SocialPlatformFactory
  config={config}
  response="Your social post content here"
  isGenerating={false}
  isBorderFaded={false}
  onClose={() => console.log('Close clicked')}
  onAddSelection={(text, source) => console.log('Selection:', text, source)}
/>;
```

### Using Individual Platform Components

```tsx
import { TwitterPlatform } from '@/components/social-platforms';

<TwitterPlatform
  config={config}
  response="Your tweet content"
  isGenerating={false}
  isBorderFaded={false}
  onAddSelection={handleAddSelection}
/>;
```

## Types

### SocialPostConfig

```tsx
interface SocialPostConfig {
  platform: string;
  modelId: string;
  postType: string;
  numberOfPosts: number;
  characterLimit: number;
  isThreaded: boolean;
  customPrompt?: string;
  selectedColumns?: string[];
}
```

### SocialPlatformProps

```tsx
interface SocialPlatformProps {
  config: SocialPostConfig;
  response: string;
  isGenerating: boolean;
  isBorderFaded: boolean;
  onClose?: () => void;
  onAddSelection: (text: string, source: string) => void;
}
```

## Supported Platforms

- **Twitter/X** - Tweets, threads
- **LinkedIn** - Posts, articles
- **Instagram** - Captions, posts
- **Facebook** - Posts
- **TikTok** - Captions, posts

## Adding New Platforms

To add a new platform:

1. Create a new platform component (e.g., `YouTubePlatform.tsx`)
2. Add the platform colors and icon to `types.ts`
3. Add the platform to the factory component
4. Export the new component in `index.ts`
5. Add tests for the new platform

Example:

```tsx
// YouTubePlatform.tsx
import React from 'react';
import BaseSocialPlatform, { SocialPlatformProps } from './BaseSocialPlatform';

export default function YouTubePlatform(props: SocialPlatformProps) {
  return (
    <BaseSocialPlatform
      {...props}
      config={{
        ...props.config,
        platform: 'youtube',
      }}
    >
      {/* YouTube-specific UI elements */}
    </BaseSocialPlatform>
  );
}
```

## Benefits of This Refactoring

1. **Separation of Concerns** - Each platform has its own component
2. **Maintainability** - Easier to modify platform-specific features
3. **Reusability** - Components can be used independently
4. **Testability** - Each component can be tested in isolation
5. **Extensibility** - Easy to add new platforms
6. **Code Organization** - Cleaner, more organized codebase

## Migration from Inline Code

The social posts rendering was previously inlined in `OutputColumns.tsx`. This refactoring:

- Removed ~300 lines of inline code from `OutputColumns.tsx`
- Created reusable, platform-specific components
- Improved code organization and maintainability
- Made it easier to add platform-specific features
- Enabled better testing and debugging
