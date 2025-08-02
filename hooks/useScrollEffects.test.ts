import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useScrollEffects, useScrollEffectsWithState } from './useScrollEffects';

// Mock useTimeout
jest.mock('./useTimeout', () => {
  return jest.fn(() => ({
    current: null,
  }));
});

describe('useScrollEffects', () => {
  beforeEach(() => {
    // Mock DOM elements
    const mockElement = {
      getBoundingClientRect: () => ({
        top: 100,
        left: 0,
        width: 100,
        height: 50,
      }),
      offsetTop: 100,
      clientHeight: 50,
    };

    const mockContainer = {
      scrollTop: 0,
      clientHeight: 400,
      scrollTo: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    // Mock document.querySelector
    document.querySelector = jest.fn(() => ({
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
      },
    }));

    // Mock refs
    jest.spyOn(React, 'useRef').mockImplementation((initialValue) => ({
      current: initialValue,
    }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return scroll functions and refs', () => {
    const { result } = renderHook(() => useScrollEffects());

    expect(result.current.scrollToElement).toBeDefined();
    expect(result.current.scrollToTop).toBeDefined();
    expect(result.current.scrollToBottom).toBeDefined();
    expect(result.current.scrollToLatest).toBeDefined();
    expect(result.current.scrollToIndex).toBeDefined();
    expect(result.current.scrollContainerRef).toBeDefined();
    expect(result.current.remixResponseRefs).toBeDefined();
    expect(result.current.socialPostsRefs).toBeDefined();
    expect(result.current.columnRefs).toBeDefined();
    expect(result.current.scrollToLatestRemix).toBeDefined();
    expect(typeof result.current.isScrolling).toBe('boolean');
  });

  it('should accept custom options', () => {
    const options = {
      scrollOptions: {
        behavior: 'auto' as ScrollBehavior,
        offset: 50,
        centerElement: true,
      },
      performanceDelay: 200,
      remixScrollDelay: 150,
      socialPostsScrollDelay: 120,
      aiContentScrollDelay: 250,
      newColumnsScrollDelay: 180,
    };

    const { result } = renderHook(() => useScrollEffects(undefined, options));

    expect(result.current.scrollToElement).toBeDefined();
    expect(result.current.scrollToTop).toBeDefined();
    expect(result.current.scrollToBottom).toBeDefined();
  });
});

describe('useScrollEffectsWithState', () => {
  beforeEach(() => {
    // Mock useTimeout
    jest.mock('./useTimeout', () => {
      return jest.fn(() => ({
        current: null,
      }));
    });
  });

  it('should return additional state tracking refs and timeout refs', () => {
    const { result } = renderHook(() => useScrollEffectsWithState());

    // Core scroll effects
    expect(result.current.scrollToElement).toBeDefined();
    expect(result.current.scrollToTop).toBeDefined();
    expect(result.current.scrollContainerRef).toBeDefined();

    // State tracking refs
    expect(result.current.prevShowRemixRef).toBeDefined();
    expect(result.current.prevShowSocialPostsRef).toBeDefined();
    expect(result.current.prevHasAIContentRef).toBeDefined();
    expect(result.current.prevColumnKeysRef).toBeDefined();

    // Timeout refs
    expect(result.current.remixScrollTimeout).toBeDefined();
    expect(result.current.aiContentScrollTimeout).toBeDefined();
    expect(result.current.newColumnsScrollTimeout).toBeDefined();
    expect(result.current.socialPostsScrollTimeout).toBeDefined();
  });
});
