import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  id: string;
  title: string;
}

export type SearchType = 'INDUSTRY' | 'LOCATION' | 'COMPANY';

export function useLinkedInSearch(type: SearchType) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (keywords: string) => {
    // Minimum 2 characters required
    if (!keywords.trim() || keywords.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const searchUrl = `https://sofrxfgjptargppbepbi.supabase.co/functions/v1/linkedin-search?keywords=${encodeURIComponent(keywords)}&type=${type}`;
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvZnJ4ZmdqcHRhcmdwcGJlcGJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQzMDMxNzYsImV4cCI6MjA2OTg3OTE3Nn0._xVCMGu8VY2_JSs38wOdL7nG7EKpl3996heMiu33j9A',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('LinkedIn search error:', errorData);
        throw new Error(errorData.error || 'Search failed');
      }

      const result = await response.json();
      setResults(result.items || []);
    } catch (err) {
      console.error('LinkedIn search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [type]);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    isLoading,
    error,
    search,
    clearResults,
  };
}
