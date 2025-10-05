import { fetchFromBackend, FALLBACK_ASTEROID_NAMES } from '@/app/lib/apiUtils';

export async function GET() {
  return fetchFromBackend(
    '/asteroid/asteroids/names',
    { names: FALLBACK_ASTEROID_NAMES }
  );
}
