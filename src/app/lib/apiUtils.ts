import { NextResponse } from 'next/server';

const API_BASE_URL = 'https://galanor-backend.onrender.com';

/**
 * Generic fetch wrapper with error handling for backend API
 */
export async function fetchFromBackend<T>(
  endpoint: string,
  fallbackData: T
): Promise<NextResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch (error) {
    console.error(`Failed to fetch from ${endpoint}:`, error);
    return NextResponse.json(fallbackData, { status: 200 });
  }
}

/**
 * Generate simple fallback asteroid details
 */
export function generateFallbackAsteroidDetails(asteroidName: string) {
  return {
    name: asteroidName,
    diameter: 10,
    classification: "API unavailable - using default values"
  };
}

/**
 * Default fallback asteroid names
 */
export const FALLBACK_ASTEROID_NAMES = [
  "Ceres", "Vesta", "Pallas", "Hygiea", "Eros"
];
