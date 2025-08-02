// Message color constants for different AI model responses
export const MESSAGE_COLORS = {
  A: 'bg-blue-500',
  B: 'bg-green-500',
  C: 'bg-purple-500',
  D: 'bg-red-500',
  E: 'bg-orange-500',
  F: 'bg-emerald-500',
  R: 'bg-gradient-to-r from-purple-500 to-pink-500', // Remix responses
  S: 'bg-gradient-to-r from-green-500 to-emerald-500', // Social posts
} as const;

// Default color for unknown message types
export const DEFAULT_MESSAGE_COLOR = 'bg-gray-500';

// Scroll behavior constants
export const SCROLL_OPTIONS = {
  behavior: 'smooth' as const,
  offset: 20,
  centerElement: true,
};

// Performance and timing constants
export const PERFORMANCE_DELAY = 150;
export const REMIX_SCROLL_DELAY = 100;
export const SOCIAL_POSTS_SCROLL_DELAY = 100;
export const AI_CONTENT_SCROLL_DELAY = 200;
export const NEW_MESSAGES_SCROLL_DELAY = 100;
export const SOCIAL_POSTS_FADE_OUT_DELAY = 10000;
export const ELEMENT_RENDER_DELAY = 100;

// UI constants
export const CHAT_INPUT_BOTTOM_PADDING = 'pb-96';
export const CONTENT_PADDING = 'pl-6 pr-6';
export const CONTENT_WIDTH = 'w-1/2 mx-auto';
export const CONTENT_GAP = 'gap-6';
