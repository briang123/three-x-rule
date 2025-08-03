import { renderHook } from '@testing-library/react';
import { useEffects } from './useEffects';
import { PendingOrchestration } from '@/lib/types';

// Mock useEffect to capture calls
const mockUseEffect = jest.fn();
jest.mock('react', () => ({
  ...jest.requireActual('react'),
  useEffect: (effect: () => void, deps?: any[]) => mockUseEffect(effect, deps),
}));

describe('useEffects', () => {
  const mockSetPendingOrchestration = jest.fn();
  const mockHandleDirectSubmit = jest.fn();
  const mockSetShowModelSelectionModal = jest.fn();

  const createMockProps = (overrides = {}) => ({
    pendingOrchestration: null as PendingOrchestration | null,
    setPendingOrchestration: mockSetPendingOrchestration,
    modelSelections: [],
    handleDirectSubmit: mockHandleDirectSubmit,
    setShowModelSelectionModal: mockSetShowModelSelectionModal,
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEffect.mockClear();
  });

  describe('pending orchestration effect', () => {
    it('should call handleDirectSubmit when pending orchestration exists and models are selected', () => {
      const pendingOrchestration: PendingOrchestration = {
        prompt: 'test prompt',
        modelId: 'gpt-4',
      };
      const props = createMockProps({
        pendingOrchestration,
        modelSelections: [{ modelId: 'gpt-4', count: 1 }],
      });

      renderHook(() => useEffects(props));

      expect(mockUseEffect).toHaveBeenCalledTimes(3);

      // Get the first useEffect (pending orchestration effect)
      const firstEffect = mockUseEffect.mock.calls[0][0];
      firstEffect();

      expect(mockSetPendingOrchestration).toHaveBeenCalledWith(null);
      expect(mockHandleDirectSubmit).toHaveBeenCalledWith('test prompt', 'gpt-4');
    });

    it('should not call handleDirectSubmit when pending orchestration is null', () => {
      const props = createMockProps({
        pendingOrchestration: null,
        modelSelections: [{ modelId: 'gpt-4', count: 1 }],
      });

      renderHook(() => useEffects(props));

      const firstEffect = mockUseEffect.mock.calls[0][0];
      firstEffect();

      expect(mockSetPendingOrchestration).not.toHaveBeenCalled();
      expect(mockHandleDirectSubmit).not.toHaveBeenCalled();
    });

    it('should not call handleDirectSubmit when no models are selected', () => {
      const pendingOrchestration: PendingOrchestration = {
        prompt: 'test prompt',
        modelId: 'gpt-4',
      };
      const props = createMockProps({
        pendingOrchestration,
        modelSelections: [],
      });

      renderHook(() => useEffects(props));

      const firstEffect = mockUseEffect.mock.calls[0][0];
      firstEffect();

      expect(mockSetPendingOrchestration).not.toHaveBeenCalled();
      expect(mockHandleDirectSubmit).not.toHaveBeenCalled();
    });

    it('should have correct dependencies for pending orchestration effect', () => {
      const props = createMockProps();

      renderHook(() => useEffects(props));

      expect(mockUseEffect).toHaveBeenCalledTimes(3);
      const firstCall = mockUseEffect.mock.calls[0];
      expect(firstCall[1]).toEqual([
        props.modelSelections,
        props.pendingOrchestration,
        props.handleDirectSubmit,
        props.setPendingOrchestration,
      ]);
    });
  });

  describe('model selection modal effect', () => {
    it('should call setShowModelSelectionModal with true', () => {
      const props = createMockProps();

      renderHook(() => useEffects(props));

      expect(mockUseEffect).toHaveBeenCalledTimes(3);

      // Get the second useEffect (modal effect)
      const secondEffect = mockUseEffect.mock.calls[1][0];
      secondEffect();

      expect(mockSetShowModelSelectionModal).toHaveBeenCalledWith(true);
    });

    it('should have correct dependencies for modal effect', () => {
      const props = createMockProps();

      renderHook(() => useEffects(props));

      expect(mockUseEffect).toHaveBeenCalledTimes(3);
      const secondCall = mockUseEffect.mock.calls[1];
      expect(secondCall[1]).toEqual([props.setShowModelSelectionModal]);
    });
  });

  describe('effect execution order', () => {
    it('should register both effects in correct order', () => {
      const props = createMockProps();

      renderHook(() => useEffects(props));

      expect(mockUseEffect).toHaveBeenCalledTimes(3);

      // First effect should be pending orchestration
      const firstEffect = mockUseEffect.mock.calls[0][0];
      expect(typeof firstEffect).toBe('function');

      // Second effect should be modal
      const secondEffect = mockUseEffect.mock.calls[1][0];
      expect(typeof secondEffect).toBe('function');
    });
  });

  describe('edge cases', () => {
    it('should handle empty model selections array', () => {
      const pendingOrchestration: PendingOrchestration = {
        prompt: 'test prompt',
        modelId: 'gpt-4',
      };
      const props = createMockProps({
        pendingOrchestration,
        modelSelections: [],
      });

      renderHook(() => useEffects(props));

      const firstEffect = mockUseEffect.mock.calls[0][0];
      firstEffect();

      expect(mockHandleDirectSubmit).not.toHaveBeenCalled();
    });

    it('should handle model selections with length 0', () => {
      const pendingOrchestration: PendingOrchestration = {
        prompt: 'test prompt',
        modelId: 'gpt-4',
      };
      const props = createMockProps({
        pendingOrchestration,
        modelSelections: [],
      });

      renderHook(() => useEffects(props));

      const firstEffect = mockUseEffect.mock.calls[0][0];
      firstEffect();

      expect(mockHandleDirectSubmit).not.toHaveBeenCalled();
    });

    it('should handle multiple model selections', () => {
      const pendingOrchestration: PendingOrchestration = {
        prompt: 'test prompt',
        modelId: 'gpt-4',
      };
      const props = createMockProps({
        pendingOrchestration,
        modelSelections: [
          { modelId: 'gpt-4', count: 1 },
          { modelId: 'claude-3', count: 2 },
        ],
      });

      renderHook(() => useEffects(props));

      const firstEffect = mockUseEffect.mock.calls[0][0];
      firstEffect();

      expect(mockSetPendingOrchestration).toHaveBeenCalledWith(null);
      expect(mockHandleDirectSubmit).toHaveBeenCalledWith('test prompt', 'gpt-4');
    });
  });

  describe('function references', () => {
    it('should pass function references correctly', () => {
      const props = createMockProps();

      renderHook(() => useEffects(props));

      expect(mockUseEffect).toHaveBeenCalledTimes(3);

      // Both effects should be functions
      const firstEffect = mockUseEffect.mock.calls[0][0];
      const secondEffect = mockUseEffect.mock.calls[1][0];

      expect(typeof firstEffect).toBe('function');
      expect(typeof secondEffect).toBe('function');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete flow with pending orchestration', () => {
      const pendingOrchestration: PendingOrchestration = {
        prompt: 'test prompt',
        modelId: 'gpt-4',
      };
      const props = createMockProps({
        pendingOrchestration,
        modelSelections: [{ modelId: 'gpt-4', count: 1 }],
      });

      renderHook(() => useEffects(props));

      // Execute both effects
      const firstEffect = mockUseEffect.mock.calls[0][0];
      const secondEffect = mockUseEffect.mock.calls[1][0];

      firstEffect();
      secondEffect();

      expect(mockSetPendingOrchestration).toHaveBeenCalledWith(null);
      expect(mockHandleDirectSubmit).toHaveBeenCalledWith('test prompt', 'gpt-4');
      expect(mockSetShowModelSelectionModal).toHaveBeenCalledWith(true);
    });

    it('should handle flow without pending orchestration', () => {
      const props = createMockProps({
        pendingOrchestration: null,
        modelSelections: [{ modelId: 'gpt-4', count: 1 }],
      });

      renderHook(() => useEffects(props));

      // Execute both effects
      const firstEffect = mockUseEffect.mock.calls[0][0];
      const secondEffect = mockUseEffect.mock.calls[1][0];

      firstEffect();
      secondEffect();

      expect(mockSetPendingOrchestration).not.toHaveBeenCalled();
      expect(mockHandleDirectSubmit).not.toHaveBeenCalled();
      expect(mockSetShowModelSelectionModal).toHaveBeenCalledWith(true);
    });
  });
});
