import React from 'react';

interface RemixModelBadgeProps {
  modelName: string;
}

const RemixModelBadge: React.FC<RemixModelBadgeProps> = ({ modelName }) => (
  <span className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full">
    {modelName}
  </span>
);

export default RemixModelBadge;
