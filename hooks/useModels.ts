import { useState, useEffect } from 'react';
import { ModelInfo, apiClient } from '@/lib/api-client';

interface UseModelsReturn {
  models: ModelInfo[];
  loading: boolean;
  error: string | null;
  initialized: boolean;
  refetch: () => Promise<void>;
}

export const useModels = (): UseModelsReturn => {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const fetchModels = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getModels();

      if (response.success && response.data) {
        setModels(response.data.models);
        setInitialized(true);
      } else {
        const errorMessage = response.error || 'Failed to fetch models';
        setError(errorMessage);
        console.error('useModels: Failed to fetch models:', errorMessage);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('useModels: Error fetching models:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeModels = async () => {
      await fetchModels();

      // Only update state if component is still mounted
      if (!isMounted) return;
    };

    initializeModels();

    return () => {
      isMounted = false;
    };
  }, []); // Only run once on mount

  return {
    models,
    loading,
    error,
    initialized,
    refetch: fetchModels,
  };
};
