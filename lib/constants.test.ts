import {
  MESSAGE_COLORS,
  DEFAULT_MESSAGE_COLOR,
  SCROLL_OPTIONS,
  PERFORMANCE_DELAY,
  REMIX_SCROLL_DELAY,
  SOCIAL_POSTS_FADE_OUT_DELAY,
  CHAT_INPUT_BOTTOM_PADDING,
  CONTENT_PADDING,
  CONTENT_WIDTH,
  CONTENT_GAP,
} from './constants';

describe('Constants', () => {
  describe('MESSAGE_COLORS', () => {
    it('should have the correct color mappings', () => {
      expect(MESSAGE_COLORS.A).toBe('bg-blue-500');
      expect(MESSAGE_COLORS.B).toBe('bg-green-500');
      expect(MESSAGE_COLORS.C).toBe('bg-purple-500');
      expect(MESSAGE_COLORS.D).toBe('bg-red-500');
      expect(MESSAGE_COLORS.E).toBe('bg-orange-500');
      expect(MESSAGE_COLORS.F).toBe('bg-emerald-500');
      expect(MESSAGE_COLORS.R).toBe('bg-gradient-to-r from-purple-500 to-pink-500');
      expect(MESSAGE_COLORS.S).toBe('bg-gradient-to-r from-green-500 to-emerald-500');
    });
  });

  describe('DEFAULT_MESSAGE_COLOR', () => {
    it('should be the correct default color', () => {
      expect(DEFAULT_MESSAGE_COLOR).toBe('bg-gray-500');
    });
  });

  describe('SCROLL_OPTIONS', () => {
    it('should have the correct scroll behavior settings', () => {
      expect(SCROLL_OPTIONS.behavior).toBe('smooth');
      expect(SCROLL_OPTIONS.offset).toBe(20);
      expect(SCROLL_OPTIONS.centerElement).toBe(true);
    });
  });

  describe('Performance delays', () => {
    it('should have reasonable delay values', () => {
      expect(PERFORMANCE_DELAY).toBe(150);
      expect(REMIX_SCROLL_DELAY).toBe(100);
      expect(SOCIAL_POSTS_FADE_OUT_DELAY).toBe(10000);
    });
  });

  describe('UI constants', () => {
    it('should have the correct CSS classes', () => {
      expect(CHAT_INPUT_BOTTOM_PADDING).toBe('pb-96');
      expect(CONTENT_PADDING).toBe('pl-6 pr-6');
      expect(CONTENT_WIDTH).toBe('w-1/2 mx-auto');
      expect(CONTENT_GAP).toBe('gap-6');
    });
  });
});
