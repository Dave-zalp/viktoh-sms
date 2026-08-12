import { useState, useEffect } from 'react';
import { cache, CACHE_KEYS } from './cache';

/**
 * Hook to check if data exists in cache and show indicators
 */
export function useCacheIndicator(cacheKey: string) {
  const [hasCachedData, setHasCachedData] = useState(false);
  const [cacheAge, setCacheAge] = useState<number | null>(null);

  useEffect(() => {
    const hasData = cache.has(cacheKey);
    const age = cache.getAge(cacheKey);
    
    setHasCachedData(hasData);
    setCacheAge(age);
  }, [cacheKey]);

  const formatCacheAge = (ageMs: number | null): string => {
    if (!ageMs) return '';
    
    const seconds = Math.floor(ageMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return `${seconds}s ago`;
    }
  };

  return {
    hasCachedData,
    cacheAge,
    cacheAgeFormatted: formatCacheAge(cacheAge),
  };
}
