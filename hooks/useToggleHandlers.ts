import { useCallback } from 'react';

interface UseToggleHandlersProps {
  setShowAISelection: React.Dispatch<React.SetStateAction<boolean>>;
  setMessageModels: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  setMessageResponses: React.Dispatch<React.SetStateAction<{ [key: string]: string[] }>>;
  setOriginalResponses: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  setIsGenerating: React.Dispatch<React.SetStateAction<{ [key: string]: boolean }>>;
  modelSelections: any[];
}

export const useToggleHandlers = ({
  setShowAISelection,
  setMessageModels,
  setMessageResponses,
  setOriginalResponses,
  setIsGenerating,
  modelSelections,
}: UseToggleHandlersProps) => {
  const handleToggleAISelection = useCallback(() => {
    setShowAISelection((prev) => {
      const newValue = !prev;
      if (prev && !newValue && (modelSelections?.length || 0) === 0) {
        setMessageModels({});
        setMessageResponses({});
        setOriginalResponses({});
        setIsGenerating({});
      }
      return newValue;
    });
  }, [
    modelSelections?.length || 0,
    setShowAISelection,
    setMessageModels,
    setMessageResponses,
    setOriginalResponses,
    setIsGenerating,
  ]);

  return {
    handleToggleAISelection,
  };
};
