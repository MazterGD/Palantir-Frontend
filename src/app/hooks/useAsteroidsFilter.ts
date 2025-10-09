// hooks/useAsteroidsFilter.ts
import { useState, useEffect } from 'react';
import { AsteroidData, transformAsteroidData } from '../lib/asteroidData';
import { createQueryCacheKey, getCachedOrFetch } from '../lib/cacheUtils';
import { deduplicatedFetch } from '../lib/requestDeduplication';

interface UseAsteroidsFilterResult {
  asteroids: AsteroidData[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  } | null;
}

interface FilterResponse {
  asteroids: any[];
  pagination: any;
}

export function useAsteroidsFilter(
  min: number,
  max: number,
  page: number = 1,
  limit: number = 100
): UseAsteroidsFilterResult {
  const [asteroids, setAsteroids] = useState<AsteroidData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    if (min === undefined || max === undefined) return;

    const fetchAsteroids = async () => {
      setLoading(true);
      setError(null);

      try {
        // Create a unique cache key based on query parameters
        const cacheKey = createQueryCacheKey('asteroids-filter', {
          min,
          max,
          page,
          limit
        });

        // Use cached data or fetch new data with deduplication
        const data = await getCachedOrFetch<FilterResponse>(
          cacheKey,
          async () => {
            // Use deduplicated fetch to prevent multiple simultaneous requests
            const url = `/api/asteroid/filter?min=${min}&max=${max}&page=${page}&limit=${limit}`;
            const responseData = await deduplicatedFetch<FilterResponse>(url);
            
            if (!responseData.asteroids) {
              throw new Error('Invalid response format');
            }

            return responseData;
          },
          { ttl: 60 * 60 * 1000 } // Cache for 1 hour
        );

        const transformedAsteroids = data.asteroids.map((asteroid: any) => 
          transformAsteroidData({ asteroid })
        );
        
        setAsteroids(transformedAsteroids);
        setPagination(data.pagination);
      } catch (err) {
        console.error('Error fetching filtered asteroids:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch filtered asteroids');
        setAsteroids([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAsteroids();
  }, [min, max, page, limit]);

  return { asteroids, loading, error, pagination };
}
