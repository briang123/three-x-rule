import React from 'react';

interface MessageModelBadgeProps {
  modelName: string;
  hasAIContent: boolean;
}

const MessageModelBadge: React.FC<MessageModelBadgeProps> = ({ modelName, hasAIContent }) => (
  <span className="text-xs bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-1 rounded-full">
    {hasAIContent ? modelName : modelName || 'Unknown Model'}
  </span>
);

export default MessageModelBadge;
