import {
  geminiProvider,
  geminiProviderConfig,
  fetchGeminiModels,
  getGeminiProviderConfig,
} from './gemini';

// Type for provider configurations
export type ProviderConfig = {
  id: string;
  name: string;
  models: string[];
  capabilities: string[];
  defaultModel: string;
  defaultTemperature: number;
  maxTokens: number;
};

// Type for provider with API key
export type ProviderWithApiKey = {
  id: string;
  apiKey?: string;
};

// Provider registry
const _providers: Record<string, { provider: any; config: any }> = {};

// Initialize providers lazily to avoid circular dependencies
function getProviders() {
  if (Object.keys(_providers).length === 0) {
    _providers.gemini = {
      provider: geminiProvider,
      config: geminiProviderConfig,
    };
  }
  return _providers;
}

// Get a specific provider
export function getProvider(providerId: string) {
  const providers = getProviders();
  return providers[providerId];
}

// Get all providers
export function getAllProviders() {
  const providers = getProviders();
  return Object.entries(providers).map(([id, provider]) => ({
    id,
    provider: provider.provider,
    config: provider.config,
  }));
}

// Get all provider configurations
export function getProviderConfigs() {
  const providers = getProviders();
  return Object.values(providers).map((provider) => provider.config);
}

// Get provider config with models
export async function getProviderConfigWithModels(providerId: string, apiKey?: string) {
  const provider = getProvider(providerId);
  if (!provider) {
    return null;
  }

  // For now, return the static config
  // TODO: Implement dynamic model fetching
  return provider.config;
}

// Get all provider configs with models
export async function getAllProviderConfigsWithModels(apiKeys?: Record<string, string>) {
  const providers = getProviders();
  const configs = [];

  for (const [providerId, provider] of Object.entries(providers)) {
    const apiKey = apiKeys?.[providerId];
    const config = await getProviderConfigWithModels(providerId, apiKey);
    if (config) {
      configs.push(config);
    }
  }

  return configs;
}

// Fetch models for a specific provider
export async function fetchProviderModels(providerId: string, apiKey?: string) {
  switch (providerId) {
    case 'gemini':
      return await fetchGeminiModels(apiKey);
    default:
      return [];
  }
}

// Re-export for convenience
export { geminiProvider, geminiProviderConfig, fetchGeminiModels, getGeminiProviderConfig };
