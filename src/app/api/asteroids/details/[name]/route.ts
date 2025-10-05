import { NextRequest } from 'next/server';
import { fetchFromBackend, generateFallbackAsteroidDetails } from '@/app/lib/apiUtils';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params;
  const asteroidName = decodeURIComponent(name);
  
  return fetchFromBackend(
    `/asteroid/${encodeURIComponent(asteroidName)}`,
    generateFallbackAsteroidDetails(asteroidName)
  );
}
