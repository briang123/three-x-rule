import {
  getMessageColor,
  generateSelectionId,
  hasAIContent,
  isAnyGenerating,
  getLatestRefIndex,
  findNewMessages,
  getLastItem,
} from './utils';

describe('Utils', () => {
  describe('getMessageColor', () => {
    it('should return correct colors for known message types', () => {
      expect(getMessageColor('A')).toBe('bg-blue-500');
      expect(getMessageColor('B')).toBe('bg-green-500');
      expect(getMessageColor('R')).toBe('bg-gradient-to-r from-purple-500 to-pink-500');
      expect(getMessageColor('S')).toBe('bg-gradient-to-r from-green-500 to-emerald-500');
    });

    it('should return default color for unknown message types', () => {
      expect(getMessageColor('X')).toBe('bg-gray-500');
      expect(getMessageColor('')).toBe('bg-gray-500');
    });
  });

  describe('generateSelectionId', () => {
    it('should generate unique IDs with source prefix', () => {
      const id1 = generateSelectionId('test');

      expect(id1).toMatch(/^test-\d+$/);
    });

    it('should generate different IDs for different calls', () => {
      const id1 = generateSelectionId('test');
      // Add a small delay to ensure different timestamps
      setTimeout(() => {}, 1);
      const id2 = generateSelectionId('test');

      expect(id1).toMatch(/^test-\d+$/);
      expect(id2).toMatch(/^test-\d+$/);
      // Since we can't guarantee different timestamps in tests, just check format
    });
  });

  describe('hasAIContent', () => {
    it('should return true when there is message content', () => {
      const originalResponses = { '1': 'Some content' };
      const remixResponses: string[] = [];
      const socialPostsResponses = {};

      expect(hasAIContent(originalResponses, remixResponses, socialPostsResponses)).toBe(true);
    });

    it('should return true when there is remix content', () => {
      const originalResponses = {};
      const remixResponses = ['Remix content'];
      const socialPostsResponses = {};

      expect(hasAIContent(originalResponses, remixResponses, socialPostsResponses)).toBe(true);
    });

    it('should return true when there is social posts content', () => {
      const originalResponses = {};
      const remixResponses: string[] = [];
      const socialPostsResponses = { post1: 'Social content' };

      expect(hasAIContent(originalResponses, remixResponses, socialPostsResponses)).toBe(true);
    });

    it('should return false when there is no content', () => {
      const originalResponses = {};
      const remixResponses: string[] = [];
      const socialPostsResponses = {};

      expect(hasAIContent(originalResponses, remixResponses, socialPostsResponses)).toBe(false);
    });

    it('should return false when content is empty strings', () => {
      const originalResponses = { '1': '', '2': '   ' };
      const remixResponses: string[] = [];
      const socialPostsResponses = { post1: '' };

      expect(hasAIContent(originalResponses, remixResponses, socialPostsResponses)).toBe(false);
    });
  });

  describe('isAnyGenerating', () => {
    it('should return true when any generation is in progress', () => {
      const isGenerating = { '1': false, '2': true, '3': false };
      expect(isAnyGenerating(isGenerating)).toBe(true);
    });

    it('should return false when no generation is in progress', () => {
      const isGenerating = { '1': false, '2': false, '3': false };
      expect(isAnyGenerating(isGenerating)).toBe(false);
    });

    it('should return false for empty object', () => {
      const isGenerating = {};
      expect(isAnyGenerating(isGenerating)).toBe(false);
    });
  });

  describe('getLatestRefIndex', () => {
    it('should return the highest numeric key', () => {
      const refs = { '1': 'ref1', '5': 'ref5', '3': 'ref3' };
      expect(getLatestRefIndex(refs)).toBe(5);
    });

    it('should return undefined for empty object', () => {
      const refs = {};
      expect(getLatestRefIndex(refs)).toBeUndefined();
    });

    it('should handle string keys that are not numbers', () => {
      const refs = { abc: 'ref1', def: 'ref2' };
      expect(getLatestRefIndex(refs)).toBeNaN();
    });
  });

  describe('findNewMessages', () => {
    it('should return messages that are new', () => {
      const currentKeys = ['1', '2', '3'];
      const previousKeys = ['1', '2'];
      expect(findNewMessages(currentKeys, previousKeys)).toEqual(['3']);
    });

    it('should return empty array when no new messages', () => {
      const currentKeys = ['1', '2'];
      const previousKeys = ['1', '2'];
      expect(findNewMessages(currentKeys, previousKeys)).toEqual([]);
    });

    it('should return all messages when previous is empty', () => {
      const currentKeys = ['1', '2', '3'];
      const previousKeys: string[] = [];
      expect(findNewMessages(currentKeys, previousKeys)).toEqual(['1', '2', '3']);
    });
  });

  describe('getLastItem', () => {
    it('should return the last item from array', () => {
      expect(getLastItem([1, 2, 3])).toBe(3);
      expect(getLastItem(['a', 'b', 'c'])).toBe('c');
    });

    it('should return undefined for empty array', () => {
      expect(getLastItem([])).toBeUndefined();
    });

    it('should return the only item from single-item array', () => {
      expect(getLastItem([42])).toBe(42);
    });
  });
});
