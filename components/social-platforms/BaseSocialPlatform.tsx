'use client';

import React from 'react';
import { SocialPlatformProps, getPlatformColors, getContentTypeLabel } from './types';
import CloseButton from './CloseButton';
import ModelBadge from './ModelBadge';
import ContentTypeBadge from './ContentTypeBadge';
import PlatformIcon from './PlatformIcon';
import ErrorDisplay from './ErrorDisplay';
import GeneratedSummary from './GeneratedSummary';
import GeneratingIndicator from './GeneratingIndicator';
import EmptyState from './EmptyState';
import ContainerizedAIResponseCard from './ContainerizedAIResponseCard';
import MotionBorderCard from './MotionBorderCard';

// Function to clean markdown formatting from a post
function cleanMarkdownFormatting(post: string): string {
  return post
    .replace(/^\*\*\s*/, '') // Remove ** at the very beginning
    .replace(/\s*\*\*$/, '') // Remove ** at the very end
    .trim();
}

// Function to remove numbering prefixes from a post
function removeNumberingPrefixes(post: string): string {
  return post
    .replace(/^(?:Tweet|Post|Caption)\s+\d+:\s*/gi, '')
    .replace(/^\d+\.\s*/, '')
    .replace(/^#\d+\s*/, '')
    .replace(/^Part\s+\d+:\s*/gi, '')
    .trim();
}

// Function to parse social posts into individual posts
function parseSocialPosts(response: string): string[] {
  if (!response) return [];

  // Try to split by numbered patterns first (most common)
  const numberedPatterns = [
    /(?:Tweet|Post|Caption)\s+\d+:/gi,
    /^\d+\./gm,
    /^#\d+/gm,
    /^Part\s+\d+:/gi,
  ];

  for (const pattern of numberedPatterns) {
    const matches = response.match(pattern);
    if (matches && matches.length > 1) {
      // Split by the pattern and filter out empty strings
      const parts = response.split(pattern);
      const posts = parts
        .slice(1)
        .map((part) => part.trim())
        .filter((post) => post)
        .map(cleanMarkdownFormatting);

      if (posts.length > 1) {
        return posts;
      }
    }
  }

  // Try bullet point patterns
  const bulletPatterns = [/^-\s+/gm, /^•\s+/gm, /^\*\s+/gm];

  for (const pattern of bulletPatterns) {
    const matches = response.match(pattern);
    if (matches && matches.length > 1) {
      const parts = response.split(pattern);
      const posts = parts
        .slice(1)
        .map((part) => part.trim())
        .filter((post) => post)
        .map(cleanMarkdownFormatting);

      if (posts.length > 1) {
        return posts;
      }
    }
  }

  // Try double newline separation (common for markdown)
  const doubleNewlineSplit = response.split(/\n\s*\n/).filter((post) => post.trim());
  if (doubleNewlineSplit.length > 1) {
    // Check if these look like separate posts (not just paragraphs)
    const hasNumbering = doubleNewlineSplit.some((post) =>
      /^\d+\.|^Tweet|^Post|^Caption|^Part/i.test(post.trim()),
    );
    if (hasNumbering) {
      // Strip numbering prefixes from each post
      return doubleNewlineSplit.map((post) => {
        const trimmed = post.trim();
        return removeNumberingPrefixes(cleanMarkdownFormatting(trimmed));
      });
    }
  }

  // If no clear pattern found, return the whole response as a single post
  return [response.trim()];
}

// Function to get the appropriate content type label based on post type and count
function getContentTypeLabelWithCount(postType: string, count: number): string {
  const isPlural = count > 1;

  switch (postType) {
    case 'tweet':
      return isPlural ? 'tweets' : 'tweet';
    case 'thread':
      return isPlural ? 'thread parts' : 'thread part';
    case 'article':
      return isPlural ? 'articles' : 'article';
    case 'post':
      return isPlural ? 'posts' : 'post';
    case 'caption':
      return isPlural ? 'captions' : 'caption';
    default:
      return isPlural ? 'posts' : 'post';
  }
}

interface BaseSocialPlatformProps extends SocialPlatformProps {
  children?: React.ReactNode;
}

export default function BaseSocialPlatform({
  config,
  response,
  isGenerating,
  isBorderFaded,
  onClose,
  onAddSelection,
  children,
}: BaseSocialPlatformProps) {
  const platformColors = getPlatformColors(config.platform);
  const contentTypeLabel = getContentTypeLabel(config.postType);

  // Check if response is an error message
  const isError =
    response &&
    (response.startsWith('Rate limit exceeded') ||
      response.startsWith('Authentication error') ||
      response.startsWith('Server error') ||
      response.startsWith('Network error') ||
      response.startsWith('An error occurred'));

  const posts = parseSocialPosts(response);

  return (
    <MotionBorderCard isBorderFaded={isBorderFaded}>
      <div className="flex items-center justify-between mb-4 flex-shrink-0 min-h-0">
        <div className="flex items-center space-x-3">
          <PlatformIcon icon={platformColors.icon} gradient={platformColors.gradient} />
          <ContentTypeBadge contentType={contentTypeLabel} gradient={platformColors.gradient} />
        </div>
        <div className="flex items-center space-x-2">
          <ModelBadge modelId={config.modelId} />
          {onClose && <CloseButton onClose={onClose} />}
        </div>
      </div>

      {/* Social Posts Response Display */}
      <div className="output-column-scroll pr-2 column-content">
        <div className="space-y-3">
          {isGenerating && <GeneratingIndicator />}

          {!response && !isGenerating ? (
            <EmptyState />
          ) : (
            // Individual Social Posts Display
            <div className="space-y-4">
              {isError ? (
                <ErrorDisplay errorMessage={response} />
              ) : (
                <>
                  {posts.length > 1 && response && (
                    <GeneratedSummary
                      postCount={posts.length}
                      contentType={getContentTypeLabelWithCount(config.postType, posts.length)}
                      fullResponse={response}
                    />
                  )}
                  {posts.map((post, index) => (
                    <ContainerizedAIResponseCard
                      key={index}
                      post={post}
                      index={index}
                      contentType={getContentTypeLabelWithCount(config.postType, 1)}
                      onAddSelection={onAddSelection}
                    />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
      {children}
    </MotionBorderCard>
  );
}
