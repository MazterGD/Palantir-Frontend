// hooks/useAsteroidsBulk.ts
import { useState, useEffect } from 'react';
import { AsteroidData, transformAsteroidData } from '../lib/asteroidData';

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
        const response = await fetch(`/api/asteroid/bulk?page=${page}&limit=${limit}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch asteroids: ${response.statusText}`);
        }

        const data = await response.json();
        
        if (!data.asteroids) {
          throw new Error('Invalid response format');
        }

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
