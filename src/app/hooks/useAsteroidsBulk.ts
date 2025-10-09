// hooks/useAsteroidsBulk.ts
import { useState, useEffect } from 'react';
import { AsteroidData, transformAsteroidData } from '../lib/asteroidData';
import { createQueryCacheKey, getCachedOrFetch } from '../lib/cacheUtils';
import { deduplicatedFetch } from '../lib/requestDeduplication';

interface UseAsteroidsBulkResult {
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

interface BulkResponse {
  asteroids: any[];
  pagination: any;
}

export function useAsteroidsBulk(page: number = 1, limit: number = 10): UseAsteroidsBulkResult {
  const [asteroids, setAsteroids] = useState<AsteroidData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<any>(null);

  useEffect(() => {
    const fetchAsteroids = async () => {
      setLoading(true);
      setError(null);

      try {
        // Create a unique cache key based on query parameters
        const cacheKey = createQueryCacheKey('asteroids-bulk', {
          page,
          limit
        });

        // Use cached data or fetch new data with deduplication
        const data = await getCachedOrFetch<BulkResponse>(
          cacheKey,
          async () => {
            // Use deduplicated fetch to prevent multiple simultaneous requests
            const url = `/api/asteroid/bulk?page=${page}&limit=${limit}`;
            const responseData = await deduplicatedFetch<BulkResponse>(url);
            
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
        console.error('Error fetching asteroids:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch asteroids');
        setAsteroids([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAsteroids();
  }, [page, limit]);

  return { asteroids, loading, error, pagination };
}
