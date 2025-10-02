import { useState, useEffect } from 'react';
import { AsteroidData, transformAsteroidData, AsteroidAPIResponse } from '../lib/asteroidData';

export function useAsteroid(id: string | null) {
  const [asteroid, setAsteroid] = useState<AsteroidData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!id) return;
    
    const fetchAsteroid = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/asteroid?id=${id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch asteroid: ${response.statusText}`);
        }
        
        const data: AsteroidAPIResponse = await response.json();
        
        if (!data.asteroid) {
          throw new Error('Invalid response format');
        }
        
        const transformedData = transformAsteroidData(data);
        setAsteroid(transformedData);
      } catch (err) {
        console.error('Error fetching asteroid:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch asteroid');
        setAsteroid(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAsteroid();
  }, [id]);
  
  return { asteroid, loading, error };
}
