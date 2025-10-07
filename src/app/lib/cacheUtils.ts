/**
 * Cache utility for storing and retrieving asteroid data
 * Uses localStorage for persistent caching across sessions
 */

const CACHE_PREFIX = 'galanor_cache_';
const CACHE_VERSION = 'v2'; // Bumped version for new features

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  version: string;
}

interface CacheOptions {
  /** Time in milliseconds before cache expires (default: 24 hours) */
  ttl?: number;
  /** Whether to force refresh regardless of cache validity */
  forceRefresh?: boolean;
}

const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Generate a simple hash from a string (for cache keys)
 */
const hashString = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
};

/**
 * Create a cache key from query parameters
 */
export const createQueryCacheKey = (baseKey: string, params: Record<string, any>): string => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  const hash = hashString(sortedParams);
  return `${baseKey}_${hash}`;
};

/**
 * Check if we're in a browser environment
 */
const isBrowser = (): boolean => {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
};

/**
 * Generate a cache key with prefix and version
 */
const getCacheKey = (key: string): string => {
  return `${CACHE_PREFIX}${CACHE_VERSION}_${key}`;
};

/**
 * Save data to cache
 */
export const saveToCache = <T>(key: string, data: T): boolean => {
  if (!isBrowser()) {
    console.warn('Cache unavailable: Not in browser environment');
    return false;
  }

  try {
    const cacheEntry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    };

    const cacheKey = getCacheKey(key);
    localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
    console.log(`✓ Saved to cache: ${key}`);
    return true;
  } catch (error) {
    console.error(`Failed to save to cache (${key}):`, error);
    return false;
  }
};

/**
 * Load data from cache
 */
export const loadFromCache = <T>(
  key: string,
  options: CacheOptions = {}
): T | null => {
  if (!isBrowser()) {
    return null;
  }

  const { ttl = DEFAULT_TTL, forceRefresh = false } = options;

  if (forceRefresh) {
    console.log(`Force refresh requested for: ${key}`);
    return null;
  }

  try {
    const cacheKey = getCacheKey(key);
    const cached = localStorage.getItem(cacheKey);

    if (!cached) {
      console.log(`Cache miss: ${key}`);
      return null;
    }

    const cacheEntry: CacheEntry<T> = JSON.parse(cached);

    // Check version compatibility
    if (cacheEntry.version !== CACHE_VERSION) {
      console.log(`Cache version mismatch for ${key}, clearing...`);
      localStorage.removeItem(cacheKey);
      return null;
    }

    // Check if cache has expired
    const age = Date.now() - cacheEntry.timestamp;
    if (age > ttl) {
      console.log(`Cache expired for ${key} (age: ${Math.round(age / 1000)}s)`);
      localStorage.removeItem(cacheKey);
      return null;
    }

    console.log(`✓ Cache hit: ${key} (age: ${Math.round(age / 1000)}s)`);
    return cacheEntry.data;
  } catch (error) {
    console.error(`Failed to load from cache (${key}):`, error);
    return null;
  }
};

/**
 * Remove specific item from cache
 */
export const clearCacheItem = (key: string): void => {
  if (!isBrowser()) return;

  try {
    const cacheKey = getCacheKey(key);
    localStorage.removeItem(cacheKey);
    console.log(`Cleared cache: ${key}`);
  } catch (error) {
    console.error(`Failed to clear cache item (${key}):`, error);
  }
};

/**
 * Clear all Galanor cache entries
 */
export const clearAllCache = (): void => {
  if (!isBrowser()) return;

  try {
    const keys = Object.keys(localStorage);
    const galanorKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));

    galanorKeys.forEach(key => {
      localStorage.removeItem(key);
    });

    console.log(`Cleared ${galanorKeys.length} cache entries`);
  } catch (error) {
    console.error('Failed to clear all cache:', error);
  }
};

/**
 * Get cache statistics
 */
export const getCacheStats = (): {
  totalEntries: number;
  totalSize: number;
  entries: Array<{ key: string; age: number; size: number }>;
} => {
  if (!isBrowser()) {
    return { totalEntries: 0, totalSize: 0, entries: [] };
  }

  try {
    const keys = Object.keys(localStorage);
    const galanorKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));

    const entries = galanorKeys.map(key => {
      const value = localStorage.getItem(key) || '';
      const size = new Blob([value]).size;

      try {
        const cacheEntry = JSON.parse(value) as CacheEntry<any>;
        const age = Date.now() - cacheEntry.timestamp;

        return {
          key: key.replace(CACHE_PREFIX, ''),
          age: Math.round(age / 1000), // in seconds
          size,
        };
      } catch {
        return {
          key: key.replace(CACHE_PREFIX, ''),
          age: 0,
          size,
        };
      }
    });

    const totalSize = entries.reduce((sum, entry) => sum + entry.size, 0);

    return {
      totalEntries: entries.length,
      totalSize,
      entries,
    };
  } catch (error) {
    console.error('Failed to get cache stats:', error);
    return { totalEntries: 0, totalSize: 0, entries: [] };
  }
};

/**
 * Check if cache exists for a key
 */
export const hasCachedData = (key: string): boolean => {
  if (!isBrowser()) return false;

  try {
    const cacheKey = getCacheKey(key);
    return localStorage.getItem(cacheKey) !== null;
  } catch (error) {
    return false;
  }
};

/**
 * Get or fetch data with caching
 * This is a higher-order function that handles cache logic automatically
 */
export const getCachedOrFetch = async <T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> => {
  // Try to get from cache first
  const cached = loadFromCache<T>(cacheKey, options);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetchFn();
  
  // Save to cache
  saveToCache(cacheKey, data);
  
  return data;
};

/**
 * Prefetch and cache data in the background
 */
export const prefetchAndCache = async <T>(
  cacheKey: string,
  fetchFn: () => Promise<T>
): Promise<void> => {
  try {
    const data = await fetchFn();
    saveToCache(cacheKey, data);
  } catch (error) {
    console.warn(`Failed to prefetch data for ${cacheKey}:`, error);
  }
};

/**
 * Clear expired cache entries (cleanup utility)
 */
export const clearExpiredCache = (ttl: number = DEFAULT_TTL): number => {
  if (!isBrowser()) return 0;

  try {
    const keys = Object.keys(localStorage);
    const galanorKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    let clearedCount = 0;

    galanorKeys.forEach(key => {
      try {
        const value = localStorage.getItem(key);
        if (!value) return;

        const cacheEntry = JSON.parse(value) as CacheEntry<any>;
        const age = Date.now() - cacheEntry.timestamp;

        if (age > ttl) {
          localStorage.removeItem(key);
          clearedCount++;
        }
      } catch (error) {
        // If parsing fails, remove the corrupted entry
        localStorage.removeItem(key);
        clearedCount++;
      }
    });

    if (clearedCount > 0) {
      console.log(`Cleared ${clearedCount} expired cache entries`);
    }

    return clearedCount;
  } catch (error) {
    console.error('Failed to clear expired cache:', error);
    return 0;
  }
};
