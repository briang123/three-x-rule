import { renderHook } from '@testing-library/react';
import { useComputedValues } from './useComputedValues';
import { ModelSelection } from '@/components/ModelGridSelector';

describe('useComputedValues', () => {
  const createMockProps = (overrides = {}) => ({
    messageResponses: { '1': ['response1'], '2': ['response2'] },
    originalResponses: { '1': 'original1', '2': 'original2' },
    isGenerating: { '1': false, '2': false },
    currentMessage: 'test message',
    modelSelections: [
      { modelId: 'gpt-4', count: 1 },
      { modelId: 'claude-3', count: 2 },
    ] as ModelSelection[],
    isUsingDefaultModel: false,
    ...overrides,
  });

  describe('isHeaderVisible', () => {
    it('should be true when no responses, no generating, and not using default model', () => {
      const props = createMockProps({
        messageResponses: {},
        originalResponses: {},
        isGenerating: {},
        isUsingDefaultModel: false,
      });

      const { result } = renderHook(() => useComputedValues(props));

      expect(result.current.isHeaderVisible).toBe(true);
    });

    it('should be false when there are message responses', () => {
      const props = createMockProps({
        messageResponses: { '1': ['response'] },
      });

      const { result } = renderHook(() => useComputedValues(props));

      expect(result.current.isHeaderVisible).toBe(false);
    });

    it('should be false when there are original responses', () => {
      const props = createMockProps({
        originalResponses: { '1': 'original response' },
      });

      const { result } = renderHook(() => useComputedValues(props));

      expect(result.current.isHeaderVisible).toBe(false);
    });

    it('should be false when something is generating', () => {
      const props = createMockProps({
        isGenerating: { '1': true },
      });

      const { result } = renderHook(() => useComputedValues(props));

      expect(result.current.isHeaderVisible).toBe(false);
    });

    it('should be false when using default model', () => {
      const props = createMockProps({
        isUsingDefaultModel: true,
      });

      const { result } = renderHook(() => useComputedValues(props));

      expect(result.current.isHeaderVisible).toBe(false);
    });

    it('should be false when any condition is not met', () => {
      const props = createMockProps({
        messageResponses: { '1': ['response'] },
        originalResponses: { '1': 'original' },
        isGenerating: { '1': true },
        isUsingDefaultModel: true,
      });

      const { result } = renderHook(() => useComputedValues(props));

      expect(result.current.isHeaderVisible).toBe(false);
    });
  });

  describe('isRemixDisabled', () => {
    it('should be true when no responses', () => {
      const props = createMockProps({
        messageResponses: {},
      });

      const { result } = renderHook(() => useComputedValues(props));

      expect(result.current.isRemixDisabled).toBe(true);
    });

    it('should be true when no current message', () => {
      const props = createMockProps({
        currentMessage: '',
      });

      const { result } = renderHook(() => useComputedValues(props));

      expect(result.current.isRemixDisabled).toBe(true);
    });

    it('should be true when less than 2 total model quantity', () => {
      const props = createMockProps({
        modelSelections: [{ modelId: 'gpt-4', count: 1 }],
      });

      const { result } = renderHook(() => useComputedValues(props));

      expect(result.current.isRemixDisabled).toBe(true);
    });

    it('should be false when all conditions are met', () => {
      const props = createMockProps({
        messageResponses: { '1': ['response'] },
        currentMessage: 'test message',
        modelSelections: [
          { modelId: 'gpt-4', count: 1 },
          { modelId: 'claude-3', count: 1 },
        ],
      });

      const { result } = renderHook(() => useComputedValues(props));

      expect(result.current.isRemixDisabled).toBe(false);
    });

    it('should be false when single model has count >= 2', () => {
      const props = createMockProps({
        messageResponses: { '1': ['response'] },
        currentMessage: 'test message',
        modelSelections: [{ modelId: 'gpt-4', count: 2 }],
      });

      const { result } = renderHook(() => useComputedValues(props));

      expect(result.current.isRemixDisabled).toBe(false);
    });

    it('should handle multiple models with different counts', () => {
      const props = createMockProps({
        messageResponses: { '1': ['response'] },
        currentMessage: 'test message',
        modelSelections: [
          { modelId: 'gpt-4', count: 1 },
          { modelId: 'claude-3', count: 3 },
        ],
      });

      const { result } = renderHook(() => useComputedValues(props));

      expect(result.current.isRemixDisabled).toBe(false);
    });
  });

  describe('isGeneratingAny', () => {
    it('should be true when any item is generating', () => {
      const props = createMockProps({
        isGenerating: { '1': true, '2': false },
      });

      const { result } = renderHook(() => useComputedValues(props));

      expect(result.current.isGeneratingAny).toBe(true);
    });

    it('should be false when nothing is generating', () => {
      const props = createMockProps({
        isGenerating: { '1': false, '2': false },
      });

      const { result } = renderHook(() => useComputedValues(props));

      expect(result.current.isGeneratingAny).toBe(false);
    });

    it('should be false when isGenerating is empty', () => {
      const props = createMockProps({
        isGenerating: {},
      });

      const { result } = renderHook(() => useComputedValues(props));

      expect(result.current.isGeneratingAny).toBe(false);
    });

    it('should handle mixed generating states', () => {
      const props = createMockProps({
        isGenerating: { '1': false, '2': true, '3': false },
      });

      const { result } = renderHook(() => useComputedValues(props));

      expect(result.current.isGeneratingAny).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle empty model selections', () => {
      const props = createMockProps({
        modelSelections: [],
      });

      const { result } = renderHook(() => useComputedValues(props));

      expect(result.current.isRemixDisabled).toBe(true);
    });

    it('should handle empty message responses with empty arrays', () => {
      const props = createMockProps({
        messageResponses: { '1': [], '2': [] },
      });

      const { result } = renderHook(() => useComputedValues(props));

      expect(result.current.isHeaderVisible).toBe(false);
    });

    it('should handle whitespace-only current message', () => {
      const props = createMockProps({
        currentMessage: '   ',
      });

      const { result } = renderHook(() => useComputedValues(props));

      expect(result.current.isRemixDisabled).toBe(true);
    });

    it('should handle null/undefined values gracefully', () => {
      const props = createMockProps({
        messageResponses: { '1': null as any, '2': undefined as any },
        originalResponses: { '1': null as any, '2': undefined as any },
      });

      const { result } = renderHook(() => useComputedValues(props));

      expect(result.current.isHeaderVisible).toBe(false);
    });
  });

  describe('computed values interaction', () => {
    it('should return all computed values correctly', () => {
      const props = createMockProps({
        messageResponses: { '1': ['response'] },
        originalResponses: { '1': 'original' },
        isGenerating: { '1': true },
        currentMessage: 'test message',
        modelSelections: [
          { modelId: 'gpt-4', count: 1 },
          { modelId: 'claude-3', count: 1 },
        ],
        isUsingDefaultModel: false,
      });

      const { result } = renderHook(() => useComputedValues(props));

      expect(result.current.isHeaderVisible).toBe(false);
      expect(result.current.isRemixDisabled).toBe(false);
      expect(result.current.isGeneratingAny).toBe(true);
    });

    it('should handle all true conditions for header visibility', () => {
      const props = createMockProps({
        messageResponses: {},
        originalResponses: {},
        isGenerating: {},
        currentMessage: 'test message',
        modelSelections: [
          { modelId: 'gpt-4', count: 1 },
          { modelId: 'claude-3', count: 1 },
        ],
        isUsingDefaultModel: false,
      });

      const { result } = renderHook(() => useComputedValues(props));

      expect(result.current.isHeaderVisible).toBe(true);
      expect(result.current.isRemixDisabled).toBe(true);
      expect(result.current.isGeneratingAny).toBe(false);
    });
  });
});
