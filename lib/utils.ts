import { MESSAGE_COLORS, DEFAULT_MESSAGE_COLOR } from './constants';

/**
 * Get the appropriate color class for a message based on its identifier
 * @param message - The message identifier (A, B, C, D, E, F, R, S)
 * @returns The Tailwind CSS color class
 */
export function getMessageColor(message: string): string {
  return MESSAGE_COLORS[message as keyof typeof MESSAGE_COLORS] || DEFAULT_MESSAGE_COLOR;
}

/**
 * Generate a unique selection ID for text selections
 * @param source - The source of the selection
 * @returns A unique selection ID
 */
export function generateSelectionId(source: string): string {
  return `${source}-${Date.now()}`;
}

/**
 * Check if there's any AI-generated content across different response types
 * @param originalResponses - Original AI responses
 * @param remixResponses - Remix responses
 * @param socialPostsResponses - Social posts responses
 * @returns True if there's any AI content, false otherwise
 */
export function hasAIContent(
  originalResponses: { [key: string]: string },
  remixResponses: string[],
  socialPostsResponses: { [key: string]: string },
): boolean {
  const hasMessageContent = Object.values(originalResponses).some(
    (response) => response.trim() !== '',
  );
  const hasRemixContent = remixResponses.length > 0;
  const hasSocialContent = Object.values(socialPostsResponses).some(
    (response) => response.trim() !== '',
  );

  return hasMessageContent || hasRemixContent || hasSocialContent;
}

/**
 * Check if any generation is currently in progress
 * @param isGenerating - Object containing generation states
 * @returns True if any generation is in progress, false otherwise
 */
export function isAnyGenerating(isGenerating: { [key: string]: boolean }): boolean {
  return Object.values(isGenerating).some((generating) => generating);
}

/**
 * Get the latest index from a refs object
 * @param refs - Object containing refs with numeric keys
 * @returns The latest index or undefined if no refs exist
 */
export function getLatestRefIndex(refs: { [key: string]: any }): number | undefined {
  const keys = Object.keys(refs)
    .map(Number)
    .sort((a, b) => b - a);
  return keys[0];
}

/**
 * Find new messages that weren't in the previous set
 * @param currentKeys - Current message keys
 * @param previousKeys - Previous message keys
 * @returns Array of new message keys
 */
export function findNewMessages(currentKeys: string[], previousKeys: string[]): string[] {
  return currentKeys.filter((message) => !previousKeys.includes(message));
}

/**
 * Get the last item from an array
 * @param array - The array to get the last item from
 * @returns The last item or undefined if array is empty
 */
export function getLastItem<T>(array: T[]): T | undefined {
  return array.length > 0 ? array[array.length - 1] : undefined;
}
