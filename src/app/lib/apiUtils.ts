import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.BACKEND_API_URL;

/**
 * Generic fetch wrapper with error handling for backend API
 */
export async function fetchFromBackend(
  endpoint: string
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
    return NextResponse.json(
      { error: 'Failed to fetch data from backend API' },
      { status: 500 }
    );
  }
}


