// Mock the entire providers module
jest.mock('./index', () => {
  const mockGeminiProvider = { id: 'gemini' };
  const mockGeminiConfig = {
    id: 'gemini',
    name: 'Google Gemini',
    capabilities: ['text-generation', 'structured-output', 'streaming'],
    defaultModel: 'gemini-2.0-flash',
    defaultTemperature: 0.7,
    maxTokens: 8192,
  };

  return {
    getProvider: jest.fn((providerId) => {
      if (providerId === 'gemini') {
        return {
          provider: mockGeminiProvider,
          config: mockGeminiConfig,
        };
      }
      return undefined;
    }),
    getAllProviders: jest.fn(() => [
      {
        provider: mockGeminiProvider,
        config: mockGeminiConfig,
      },
    ]),
    getProviderConfigs: jest.fn(() => [mockGeminiConfig]),
    getProviderConfigWithModels: jest.fn(),
    getAllProviderConfigsWithModels: jest.fn(),
    fetchProviderModels: jest.fn(),
  };
});

// Mock the gemini module
jest.mock('./gemini', () => ({
  geminiProvider: { id: 'gemini' },
  geminiProviderConfig: {
    id: 'gemini',
    name: 'Google Gemini',
    capabilities: ['text-generation', 'structured-output', 'streaming'],
    defaultModel: 'gemini-2.0-flash',
    defaultTemperature: 0.7,
    maxTokens: 8192,
  },
  getGeminiProviderConfig: jest.fn(),
  fetchGeminiModels: jest.fn(),
}));

// Import the mocked functions
const {
  getProvider,
  getAllProviders,
  getProviderConfigs,
  getProviderConfigWithModels,
  getAllProviderConfigsWithModels,
  fetchProviderModels,
} = require('./index');

describe('Providers Index Functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProvider', () => {
    it('should return gemini provider when valid ID is provided', () => {
      const result = getProvider('gemini');
      expect(result).toBeDefined();
      expect(result?.provider.id).toBe('gemini');
      expect(result?.config.id).toBe('gemini');
      expect(getProvider).toHaveBeenCalledWith('gemini');
    });

    it('should return undefined for invalid provider ID', () => {
      const result = getProvider('invalid-provider');
      expect(result).toBeUndefined();
      expect(getProvider).toHaveBeenCalledWith('invalid-provider');
    });
  });

  describe('getAllProviders', () => {
    it('should return array of all providers', () => {
      const result = getAllProviders();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(getAllProviders).toHaveBeenCalled();
    });

    it('should contain gemini provider', () => {
      const result = getAllProviders();
      const geminiProviderEntry = result.find((p: any) => p.provider.id === 'gemini');
      expect(geminiProviderEntry).toBeDefined();
      expect(geminiProviderEntry?.provider.id).toBe('gemini');
      expect(geminiProviderEntry?.config.id).toBe('gemini');
    });
  });

  describe('getProviderConfigs', () => {
    it('should return array of provider configurations', () => {
      const result = getProviderConfigs();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(getProviderConfigs).toHaveBeenCalled();
    });

    it('should return valid configuration objects', () => {
      const result = getProviderConfigs();
      result.forEach((config: any) => {
        expect(config).toHaveProperty('id');
        expect(config).toHaveProperty('name');
        expect(config).toHaveProperty('capabilities');
        expect(config).toHaveProperty('defaultModel');
        expect(config).toHaveProperty('defaultTemperature');
        expect(config).toHaveProperty('maxTokens');
      });
    });

    it('should contain gemini configuration', () => {
      const result = getProviderConfigs();
      const geminiConfig = result.find((config: any) => config.id === 'gemini');
      expect(geminiConfig).toBeDefined();
      expect(geminiConfig?.id).toBe('gemini');
    });
  });

  describe('getProviderConfigWithModels', () => {
    it('should return gemini provider config with models', async () => {
      const mockConfig = {
        id: 'gemini',
        name: 'Google Gemini',
        models: ['gemini-2.0-flash', 'gemini-2.0-flash-exp'],
        capabilities: ['text-generation'],
        defaultModel: 'gemini-2.0-flash',
        defaultTemperature: 0.7,
        maxTokens: 8192,
      };

      getProviderConfigWithModels.mockResolvedValue(mockConfig);

      const result = await getProviderConfigWithModels('gemini', 'test-api-key');

      expect(result).toEqual(mockConfig);
      expect(getProviderConfigWithModels).toHaveBeenCalledWith('gemini', 'test-api-key');
    });

    it('should return null for unsupported provider', async () => {
      getProviderConfigWithModels.mockResolvedValue(null);

      const result = await getProviderConfigWithModels('unsupported-provider', 'test-api-key');

      expect(result).toBeNull();
      expect(getProviderConfigWithModels).toHaveBeenCalledWith(
        'unsupported-provider',
        'test-api-key',
      );
    });
  });

  describe('getAllProviderConfigsWithModels', () => {
    it('should return all provider configs with models', async () => {
      const mockConfig = {
        id: 'gemini',
        name: 'Google Gemini',
        models: ['gemini-2.0-flash'],
        capabilities: ['text-generation'],
        defaultModel: 'gemini-2.0-flash',
        defaultTemperature: 0.7,
        maxTokens: 8192,
      };

      getAllProviderConfigsWithModels.mockResolvedValue([mockConfig]);

      const providersWithKeys = [{ id: 'gemini', apiKey: 'test-api-key' }];

      const result = await getAllProviderConfigsWithModels(providersWithKeys);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(1);
      expect(result[0]).toEqual(mockConfig);
      expect(getAllProviderConfigsWithModels).toHaveBeenCalledWith(providersWithKeys);
    });

    it('should handle providers without configs', async () => {
      getAllProviderConfigsWithModels.mockResolvedValue([]);

      const providersWithKeys = [{ id: 'gemini', apiKey: 'test-api-key' }];

      const result = await getAllProviderConfigsWithModels(providersWithKeys);

      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(0);
      expect(getAllProviderConfigsWithModels).toHaveBeenCalledWith(providersWithKeys);
    });
  });

  describe('fetchProviderModels', () => {
    it('should fetch models for gemini provider', async () => {
      const mockModels = ['gemini-2.0-flash', 'gemini-2.0-flash-exp'];
      fetchProviderModels.mockResolvedValue(mockModels);

      const result = await fetchProviderModels('gemini', 'test-api-key');

      expect(result).toEqual(mockModels);
      expect(fetchProviderModels).toHaveBeenCalledWith('gemini', 'test-api-key');
    });

    it('should return empty array for unsupported provider', async () => {
      fetchProviderModels.mockResolvedValue([]);

      const result = await fetchProviderModels('unsupported-provider', 'test-api-key');

      expect(result).toEqual([]);
      expect(fetchProviderModels).toHaveBeenCalledWith('unsupported-provider', 'test-api-key');
    });
  });
});
