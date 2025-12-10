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
    if (!keywords.trim()) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('linkedin-search', {
        body: null,
        headers: {},
      });

      // Use query params approach via URL
      const searchUrl = `https://sofrxfgjptargppbepbi.supabase.co/functions/v1/linkedin-search?keywords=${encodeURIComponent(keywords)}&type=${type}`;
      
      const { data: { session } } = await supabase.auth.getSession();
      
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('LinkedIn search error:', errorText);
        throw new Error('Search failed');
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
