import React from 'react';
import RemixLoadingIcon from './RemixLoadingIcon';
import RemixModelBadge from './RemixModelBadge';

interface RemixResponseHeaderProps {
  index: number;
  isGenerating: boolean;
  isLastItem: boolean;
  modelName: string;
}

const RemixResponseHeader: React.FC<RemixResponseHeaderProps> = ({
  index,
  isGenerating,
  isLastItem,
  modelName,
}) => (
  <div className="flex items-center justify-between mb-4 flex-shrink-0 min-h-0">
    <div className="flex items-center space-x-3">
      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-lg font-semibold bg-gradient-to-r from-purple-500 to-pink-500">
        <RemixLoadingIcon isGenerating={isGenerating && isLastItem} />
      </div>
      <div className="flex items-center space-x-2">
        <span className="text-lg font-semibold text-kitchen-text dark:text-kitchen-dark-text">
          {isGenerating && isLastItem ? 'Generating Remix...' : `Remix Response ${index + 1}`}
        </span>
      </div>
    </div>
    <div className="flex items-center space-x-2">
      <RemixModelBadge modelName={modelName} />
    </div>
  </div>
);

export default RemixResponseHeader;
