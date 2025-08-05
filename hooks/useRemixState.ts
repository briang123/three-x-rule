import { useState, useCallback } from 'react';
// TODO: Remove useChat import and usage. Use AI SDK v5 streaming primitives instead.

export const useRemixState = () => {
  const [remixResponses, setRemixResponses] = useState<string[][]>([]);
  const [remixModels, setRemixModels] = useState<string[]>([]);
  const [isRemixGenerating, setIsRemixGenerating] = useState<boolean>(false);
  const [showRemix, setShowRemix] = useState<boolean>(false);
  const [remixModel, setRemixModel] = useState<string>('');

  // Create AI SDK useChat instance for remix
  // TODO: Remove useChat import and usage. Use AI SDK v5 streaming primitives instead.

  const resetRemixState = useCallback(() => {
    setRemixResponses([]);
    setRemixModels([]);
    setIsRemixGenerating(false);
    setShowRemix(false);
    setRemixModel('');

    // Reset the AI SDK chat instance
    // TODO: Remove useChat import and usage. Use AI SDK v5 streaming primitives instead.
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
    // TODO: Remove useChat import and usage. Use AI SDK v5 streaming primitives instead.
  };
};
