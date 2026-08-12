// Cache utility for storing API responses with TTL
const CACHE_PREFIX = 'smslegit_cache_';
const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const COUNTRIES_TTL = 30 * 60 * 1000; // 30 minutes for countries (rarely change)
const SERVICES_TTL = 10 * 60 * 1000; // 10 minutes for services
const PRICE_TTL = 2 * 60 * 1000; // 2 minutes for prices (can change frequently)

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheManager {
  /**
   * Store data in cache with a TTL
   */
  set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
    try {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        ttl,
      };
      localStorage.setItem(
        `${CACHE_PREFIX}${key}`,
        JSON.stringify(entry)
      );
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  }

  /**
   * Get data from cache if it exists and is still valid
   */
  get<T>(key: string): T | null {
    try {
      const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!cached) {
        return null;
      }

      const entry: CacheEntry<T> = JSON.parse(cached);
      const now = Date.now();
      const age = now - entry.timestamp;

      // Check if cache has expired
      if (age > entry.ttl) {
        this.remove(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      return null;
    }
  }

  /**
   * Remove a specific cache entry
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } catch (error) {
      console.warn('Failed to remove cached data:', error);
    }
  }

  /**
   * Clear all cache entries
   */
  clearAll(): void {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith(CACHE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  /**
   * Clear expired cache entries
   */
  clearExpired(): void {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();

      keys.forEach((key) => {
        if (key.startsWith(CACHE_PREFIX)) {
          try {
            const cached = localStorage.getItem(key);
            if (cached) {
              const entry: CacheEntry<any> = JSON.parse(cached);
              const age = now - entry.timestamp;

              if (age > entry.ttl) {
                localStorage.removeItem(key);
              }
            }
          } catch {
            // If parsing fails, remove the invalid entry
            localStorage.removeItem(key);
          }
        }
      });
    } catch (error) {
      console.warn('Failed to clear expired cache:', error);
    }
  }

  /**
   * Check if a cache entry exists and is valid
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Get cache age in milliseconds
   */
  getAge(key: string): number | null {
    try {
      const cached = localStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!cached) {
        return null;
      }

      const entry: CacheEntry<any> = JSON.parse(cached);
      return Date.now() - entry.timestamp;
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const cache = new CacheManager();

// Cache keys for type safety
export const CACHE_KEYS = {
  COUNTRIES: 'countries',
  SERVICES: (countryId: number) => `services_${countryId}`,
  PRICES: (serviceId: number) => `prices_${serviceId}`,
} as const;