import { fetchFromBackend } from '@/app/lib/apiUtils';

export async function GET() {
  return fetchFromBackend('/asteroid/asteroids/names');
}
