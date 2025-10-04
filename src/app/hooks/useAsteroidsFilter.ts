// hooks/useAsteroidsFilter.ts
import { useState, useEffect } from 'react';
import { AsteroidData, transformAsteroidData } from '../lib/asteroidData';

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
        const response = await fetch(
          `/api/asteroid/filter?min=${min}&max=${max}&page=${page}&limit=${limit}`
        );
        
        if (!response.ok) {
          throw new Error(`Failed to fetch filtered asteroids: ${response.statusText}`);
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
