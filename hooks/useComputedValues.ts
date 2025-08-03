import { useMemo } from 'react';
import { ModelSelection } from '@/components/ModelGridSelector';

interface UseComputedValuesProps {
  messageResponses: { [key: string]: string[] };
  originalResponses: { [key: string]: string };
  isGenerating: { [key: string]: boolean };
  currentMessage: string;
  modelSelections: ModelSelection[];
  isUsingDefaultModel: boolean;
}

export const useComputedValues = ({
  messageResponses,
  originalResponses,
  isGenerating,
  currentMessage,
  modelSelections,
  isUsingDefaultModel,
}: UseComputedValuesProps) => {
  const isHeaderVisible = useMemo(() => {
    return (
      Object.values(messageResponses || {}).every((responses) => responses?.length === 0) &&
      Object.values(originalResponses || {}).every((response) => !response) &&
      !Object.values(isGenerating || {}).some((generating) => generating) &&
      !isUsingDefaultModel
    );
  }, [messageResponses, originalResponses, isGenerating, isUsingDefaultModel]);

  const isRemixDisabled = useMemo(() => {
    const hasResponses = Object.values(messageResponses || {}).some(
      (responses) => responses?.length > 0,
    );
    const hasCurrentMessage = currentMessage?.trim() !== '';
    const totalModelQuantity = (modelSelections || []).reduce(
      (sum, selection) => sum + selection.count,
      0,
    );

    return !hasResponses || !hasCurrentMessage || totalModelQuantity < 2;
  }, [messageResponses, currentMessage, modelSelections]);

  const isGeneratingAny = useMemo(() => {
    return Object.values(isGenerating || {}).some((generating) => generating);
  }, [isGenerating]);

  return {
    isHeaderVisible,
    isRemixDisabled,
    isGeneratingAny,
  };
};
