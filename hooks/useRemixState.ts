import { useState, useCallback } from 'react';

export const useRemixState = () => {
  const [remixResponses, setRemixResponses] = useState<string[]>([]);
  const [remixModels, setRemixModels] = useState<string[]>([]);
  const [isRemixGenerating, setIsRemixGenerating] = useState<boolean>(false);
  const [showRemix, setShowRemix] = useState<boolean>(false);
  const [remixModel, setRemixModel] = useState<string>('');

  const resetRemixState = useCallback(() => {
    setRemixResponses([]);
    setRemixModels([]);
    setIsRemixGenerating(false);
    setShowRemix(false);
    setRemixModel('');
  }, []);

  return {
    remixResponses,
    setRemixResponses,
    remixModels,
    setRemixModels,
    isRemixGenerating,
    setIsRemixGenerating,
    showRemix,
    setShowRemix,
    remixModel,
    setRemixModel,
    resetRemixState,
  };
};
