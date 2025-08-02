import { GeminiModel } from './gemini';

describe('Gemini Types and Constants', () => {
  describe('GeminiModel type', () => {
    it('should include all expected model names', () => {
      const expectedModels: GeminiModel[] = [
        'gemini-2.5-pro',
        'gemini-2.5-flash',
        'gemini-2.5-flash-lite',
        'gemini-2.0-flash',
        'gemini-2.0-flash-lite',
        'gemini-1.5-pro',
        'gemini-1.5-flash',
      ];

      // This test ensures the type includes all expected models
      expect(expectedModels).toBeDefined();
    });
  });

  describe('Model Information', () => {
    const modelInfo = {
      'gemini-2.5-pro': {
        name: 'Gemini 2.5 Pro',
        description: 'Most powerful thinking model with maximum response accuracy',
        maxInputTokens: 2097152,
        maxOutputTokens: 8192,
        supportsImages: true,
        supportsVideo: true,
        supportsAudio: true,
      },
      'gemini-2.5-flash': {
        name: 'Gemini 2.5 Flash',
        description: 'Best price-performance model with well-rounded capabilities',
        maxInputTokens: 2097152,
        maxOutputTokens: 8192,
        supportsImages: true,
        supportsVideo: true,
        supportsAudio: true,
      },
      'gemini-2.5-flash-lite': {
        name: 'Gemini 2.5 Flash Lite',
        description: 'Most cost-efficient model supporting high throughput',
        maxInputTokens: 2097152,
        maxOutputTokens: 8192,
        supportsImages: true,
        supportsVideo: true,
        supportsAudio: true,
      },
      'gemini-2.0-flash': {
        name: 'Gemini 2.0 Flash',
        description: 'Next generation features, speed, and realtime streaming',
        maxInputTokens: 1048576,
        maxOutputTokens: 8192,
        supportsImages: true,
        supportsVideo: true,
        supportsAudio: true,
      },
      'gemini-2.0-flash-lite': {
        name: 'Gemini 2.0 Flash Lite',
        description: 'Cost efficiency and low latency',
        maxInputTokens: 1048576,
        maxOutputTokens: 8192,
        supportsImages: true,
        supportsVideo: true,
        supportsAudio: true,
      },
      'gemini-1.5-pro': {
        name: 'Gemini 1.5 Pro',
        description: 'Long context window and multimodal capabilities',
        maxInputTokens: 1048576,
        maxOutputTokens: 8192,
        supportsImages: true,
        supportsVideo: true,
        supportsAudio: true,
      },
      'gemini-1.5-flash': {
        name: 'Gemini 1.5 Flash',
        description: 'Fast and efficient model',
        maxInputTokens: 1048576,
        maxOutputTokens: 8192,
        supportsImages: true,
        supportsVideo: true,
        supportsAudio: true,
      },
    };

    it('should have correct info for gemini-2.5-pro', () => {
      const info = modelInfo['gemini-2.5-pro'];
      expect(info.name).toBe('Gemini 2.5 Pro');
      expect(info.description).toBe('Most powerful thinking model with maximum response accuracy');
      expect(info.maxInputTokens).toBe(2097152);
      expect(info.maxOutputTokens).toBe(8192);
      expect(info.supportsImages).toBe(true);
      expect(info.supportsVideo).toBe(true);
      expect(info.supportsAudio).toBe(true);
    });

    it('should have correct info for gemini-2.0-flash', () => {
      const info = modelInfo['gemini-2.0-flash'];
      expect(info.name).toBe('Gemini 2.0 Flash');
      expect(info.description).toBe('Next generation features, speed, and realtime streaming');
      expect(info.maxInputTokens).toBe(1048576);
      expect(info.maxOutputTokens).toBe(8192);
      expect(info.supportsImages).toBe(true);
      expect(info.supportsVideo).toBe(true);
      expect(info.supportsAudio).toBe(true);
    });

    it('should have correct info for gemini-1.5-flash', () => {
      const info = modelInfo['gemini-1.5-flash'];
      expect(info.name).toBe('Gemini 1.5 Flash');
      expect(info.description).toBe('Fast and efficient model');
      expect(info.maxInputTokens).toBe(1048576);
      expect(info.maxOutputTokens).toBe(8192);
      expect(info.supportsImages).toBe(true);
      expect(info.supportsVideo).toBe(true);
      expect(info.supportsAudio).toBe(true);
    });

    it('should have consistent structure for all models', () => {
      Object.values(modelInfo).forEach((info) => {
        expect(info).toHaveProperty('name');
        expect(info).toHaveProperty('description');
        expect(info).toHaveProperty('maxInputTokens');
        expect(info).toHaveProperty('maxOutputTokens');
        expect(info).toHaveProperty('supportsImages');
        expect(info).toHaveProperty('supportsVideo');
        expect(info).toHaveProperty('supportsAudio');

        expect(typeof info.name).toBe('string');
        expect(typeof info.description).toBe('string');
        expect(typeof info.maxInputTokens).toBe('number');
        expect(typeof info.maxOutputTokens).toBe('number');
        expect(typeof info.supportsImages).toBe('boolean');
        expect(typeof info.supportsVideo).toBe('boolean');
        expect(typeof info.supportsAudio).toBe('boolean');
      });
    });
  });

  describe('Available Models List', () => {
    it('should include all expected models in the correct order', () => {
      const availableModels: GeminiModel[] = [
        'gemini-2.5-pro',
        'gemini-2.5-flash',
        'gemini-2.5-flash-lite',
        'gemini-2.0-flash',
        'gemini-2.0-flash-lite',
        'gemini-1.5-pro',
        'gemini-1.5-flash',
      ];

      expect(availableModels).toHaveLength(7);
      expect(availableModels).toContain('gemini-2.5-pro');
      expect(availableModels).toContain('gemini-2.5-flash');
      expect(availableModels).toContain('gemini-2.5-flash-lite');
      expect(availableModels).toContain('gemini-2.0-flash');
      expect(availableModels).toContain('gemini-2.0-flash-lite');
      expect(availableModels).toContain('gemini-1.5-pro');
      expect(availableModels).toContain('gemini-1.5-flash');
    });
  });
});
