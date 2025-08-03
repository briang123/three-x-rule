import { renderHook, act } from '@testing-library/react';
import { useUIState } from './useUIState';

describe('useUIState', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useUIState());

    expect(result.current.showRightPanel).toBe(false);
    expect(result.current.isLeftNavCollapsed).toBe(true);
    expect(result.current.auroraConfig).toEqual({
      colorStops: ['#1e74a9', '#97128c', '#05ecf0'],
      speed: 0.2,
      blend: 0.47,
      amplitude: 1.0,
    });
  });

  it('should update showRightPanel correctly', () => {
    const { result } = renderHook(() => useUIState());

    act(() => {
      result.current.setShowRightPanel(true);
    });

    expect(result.current.showRightPanel).toBe(true);

    act(() => {
      result.current.setShowRightPanel(false);
    });

    expect(result.current.showRightPanel).toBe(false);
  });

  it('should update isLeftNavCollapsed correctly', () => {
    const { result } = renderHook(() => useUIState());

    act(() => {
      result.current.setIsLeftNavCollapsed(false);
    });

    expect(result.current.isLeftNavCollapsed).toBe(false);

    act(() => {
      result.current.setIsLeftNavCollapsed(true);
    });

    expect(result.current.isLeftNavCollapsed).toBe(true);
  });

  it('should update auroraConfig correctly', () => {
    const { result } = renderHook(() => useUIState());

    const newConfig = {
      colorStops: ['#ff0000', '#00ff00', '#0000ff'] as [string, string, string],
      speed: 0.5,
      blend: 0.8,
      amplitude: 2.0,
    };

    act(() => {
      result.current.setAuroraConfig(newConfig);
    });

    expect(result.current.auroraConfig).toEqual(newConfig);
  });

  it('should handle partial auroraConfig updates correctly', () => {
    const { result } = renderHook(() => useUIState());

    const initialConfig = result.current.auroraConfig;

    act(() => {
      result.current.setAuroraConfig({
        ...initialConfig,
        speed: 0.8,
      });
    });

    expect(result.current.auroraConfig).toEqual({
      ...initialConfig,
      speed: 0.8,
    });

    // Verify other properties are preserved
    expect(result.current.auroraConfig.colorStops).toEqual(initialConfig.colorStops);
    expect(result.current.auroraConfig.blend).toEqual(initialConfig.blend);
    expect(result.current.auroraConfig.amplitude).toEqual(initialConfig.amplitude);
  });

  it('should handle multiple state updates correctly', () => {
    const { result } = renderHook(() => useUIState());

    const newConfig = {
      colorStops: ['#ff0000', '#00ff00', '#0000ff'] as [string, string, string],
      speed: 0.5,
      blend: 0.8,
      amplitude: 2.0,
    };

    act(() => {
      result.current.setShowRightPanel(true);
      result.current.setIsLeftNavCollapsed(false);
      result.current.setAuroraConfig(newConfig);
    });

    expect(result.current.showRightPanel).toBe(true);
    expect(result.current.isLeftNavCollapsed).toBe(false);
    expect(result.current.auroraConfig).toEqual(newConfig);
  });

  it('should preserve existing state when updating individual properties', () => {
    const { result } = renderHook(() => useUIState());

    // Set initial state
    act(() => {
      result.current.setShowRightPanel(true);
      result.current.setIsLeftNavCollapsed(false);
      result.current.setAuroraConfig({
        colorStops: ['#ff0000', '#00ff00', '#0000ff'] as [string, string, string],
        speed: 0.5,
        blend: 0.8,
        amplitude: 2.0,
      });
    });

    // Update one property
    act(() => {
      result.current.setShowRightPanel(false);
    });

    // Verify other properties are preserved
    expect(result.current.isLeftNavCollapsed).toBe(false);
    expect(result.current.auroraConfig).toEqual({
      colorStops: ['#ff0000', '#00ff00', '#0000ff'],
      speed: 0.5,
      blend: 0.8,
      amplitude: 2.0,
    });
  });

  it('should handle boolean state changes correctly', () => {
    const { result } = renderHook(() => useUIState());

    // Test showRightPanel
    act(() => {
      result.current.setShowRightPanel(true);
    });
    expect(result.current.showRightPanel).toBe(true);

    act(() => {
      result.current.setShowRightPanel(false);
    });
    expect(result.current.showRightPanel).toBe(false);

    // Test isLeftNavCollapsed
    act(() => {
      result.current.setIsLeftNavCollapsed(true);
    });
    expect(result.current.isLeftNavCollapsed).toBe(true);

    act(() => {
      result.current.setIsLeftNavCollapsed(false);
    });
    expect(result.current.isLeftNavCollapsed).toBe(false);
  });

  it('should handle auroraConfig colorStops correctly', () => {
    const { result } = renderHook(() => useUIState());

    const newColorStops: [string, string, string] = ['#ff0000', '#00ff00', '#0000ff'];

    act(() => {
      result.current.setAuroraConfig({
        ...result.current.auroraConfig,
        colorStops: newColorStops,
      });
    });

    expect(result.current.auroraConfig.colorStops).toEqual(newColorStops);
  });

  it('should handle auroraConfig speed correctly', () => {
    const { result } = renderHook(() => useUIState());

    act(() => {
      result.current.setAuroraConfig({
        ...result.current.auroraConfig,
        speed: 0.8,
      });
    });

    expect(result.current.auroraConfig.speed).toBe(0.8);
  });

  it('should handle auroraConfig blend correctly', () => {
    const { result } = renderHook(() => useUIState());

    act(() => {
      result.current.setAuroraConfig({
        ...result.current.auroraConfig,
        blend: 0.9,
      });
    });

    expect(result.current.auroraConfig.blend).toBe(0.9);
  });

  it('should handle auroraConfig amplitude correctly', () => {
    const { result } = renderHook(() => useUIState());

    act(() => {
      result.current.setAuroraConfig({
        ...result.current.auroraConfig,
        amplitude: 3.0,
      });
    });

    expect(result.current.auroraConfig.amplitude).toBe(3.0);
  });

  it('should handle complex auroraConfig updates correctly', () => {
    const { result } = renderHook(() => useUIState());

    const complexConfig = {
      colorStops: ['#ff6600', '#cc00ff', '#00ffff'] as [string, string, string],
      speed: 1.2,
      blend: 0.3,
      amplitude: 0.5,
    };

    act(() => {
      result.current.setAuroraConfig(complexConfig);
    });

    expect(result.current.auroraConfig).toEqual(complexConfig);
  });

  it('should maintain default auroraConfig structure', () => {
    const { result } = renderHook(() => useUIState());

    const defaultConfig = {
      colorStops: ['#1e74a9', '#97128c', '#05ecf0'] as [string, string, string],
      speed: 0.2,
      blend: 0.47,
      amplitude: 1.0,
    };

    expect(result.current.auroraConfig).toEqual(defaultConfig);
    expect(result.current.auroraConfig.colorStops).toHaveLength(3);
    expect(typeof result.current.auroraConfig.speed).toBe('number');
    expect(typeof result.current.auroraConfig.blend).toBe('number');
    expect(typeof result.current.auroraConfig.amplitude).toBe('number');
  });

  it('should handle edge case values correctly', () => {
    const { result } = renderHook(() => useUIState());

    // Test extreme values
    act(() => {
      result.current.setAuroraConfig({
        colorStops: ['#000000', '#ffffff', '#ff0000'] as [string, string, string],
        speed: 0,
        blend: 1,
        amplitude: 10,
      });
    });

    expect(result.current.auroraConfig.speed).toBe(0);
    expect(result.current.auroraConfig.blend).toBe(1);
    expect(result.current.auroraConfig.amplitude).toBe(10);
  });

  it('should handle multiple rapid state changes correctly', () => {
    const { result } = renderHook(() => useUIState());

    act(() => {
      result.current.setShowRightPanel(true);
      result.current.setShowRightPanel(false);
      result.current.setShowRightPanel(true);
    });

    expect(result.current.showRightPanel).toBe(true);

    act(() => {
      result.current.setIsLeftNavCollapsed(false);
      result.current.setIsLeftNavCollapsed(true);
      result.current.setIsLeftNavCollapsed(false);
    });

    expect(result.current.isLeftNavCollapsed).toBe(false);
  });
});
