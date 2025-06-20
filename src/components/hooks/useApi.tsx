import { useState, useCallback } from 'react';

interface ApiOptions {
  method?: string;
  body?: string;
  headers?: Record<string, string>;
}

export function useApi() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiCall = useCallback(async <T = any>(
    endpoint: string, 
    options: ApiOptions = {}
  ): Promise<T | null> => {
    setLoading(true);
    setError(null);

    try {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) throw new Error('Authentication token not found.');

      const response = await fetch(`http://localhost:8080${endpoint}`, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
          ...options.headers,
        },
        ...(options.body && { body: options.body }),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status} ${response.statusText}`);
      }

      // Handle different response types
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        return data;
      }
      
      // For successful requests without JSON response (like DELETE)
      return true as T;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, apiCall };
}