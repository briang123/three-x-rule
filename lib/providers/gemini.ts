import { geminiService } from '../gemini';
import { ChatRequest } from '../gemini';

// Create a simple provider object for Gemini
export const geminiProvider = {
  id: 'gemini',
  generateText: async ({ model, messages, temperature = 0.7 }: any) => {
    const request: ChatRequest = {
      messages: messages as any,
      model,
      temperature,
    };
    const response = await geminiService.sendMessage(request);
    return { text: response.content };
  },
};

// Fetch available models from Gemini API
export async function fetchGeminiModels(apiKey?: string) {
  // TODO: Implement actual API call to fetch models
  // For now, return hardcoded list
  return [
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Experimental' },
  ];
}

// Provider configuration
export const geminiProviderConfig = {
  id: 'gemini',
  name: 'Google Gemini',
  description: 'Google Gemini AI models',
  models: [
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Experimental' },
  ],
  defaultModel: 'gemini-2.0-flash',
  apiKeyRequired: true,
  apiKeyEnvVar: 'GOOGLE_GEMINI_API_KEY',
};

// Get provider config with dynamically fetched models
export async function getGeminiProviderConfig(apiKey?: string) {
  const models = await fetchGeminiModels(apiKey);
  return {
    ...geminiProviderConfig,
    models,
  };
}
