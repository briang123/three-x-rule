'use client';

import React from 'react';
import ContainerizedAIResponseContent from '@/components/ContainerizedAIResponseContent';
import CopyButton from '@/components/CopyButton';
import PostNumberBadge from './PostNumberBadge';
import CharacterCount from './CharacterCount';

interface ContainerizedAIResponseCardProps {
  post: string;
  index: number;
  contentType: string;
  onAddSelection: (text: string) => void;
  className?: string;
}

export default function ContainerizedAIResponseCard({
  post,
  index,
  contentType,
  onAddSelection,
  className = 'relative bg-white dark:bg-kitchen-dark-surface border border-gray-200 dark:border-kitchen-dark-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow',
}: ContainerizedAIResponseCardProps) {
  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <PostNumberBadge contentType={contentType} postNumber={index + 1} />
          <CharacterCount count={post.length} />
        </div>
        <CopyButton content={post} />
      </div>
      <ContainerizedAIResponseContent
        content={post}
        message="S"
        onAddSelection={onAddSelection}
        showCopyButton={false}
      />
    </div>
  );
}
