import { NextResponse } from 'next/server';

const API_BASE_URL = process.env.BACKEND_API_URL;

/**
 * Generic fetch wrapper with error handling for backend API
 */
export async function fetchFromBackend(
  endpoint: string
): Promise<NextResponse> {
  // Check if API_BASE_URL is configured
  if (!API_BASE_URL) {
    console.error('BACKEND_API_URL environment variable is not set');
    return NextResponse.json(
      { 
        error: 'Backend API URL is not configured',
        message: 'Please set BACKEND_API_URL in your .env.local file',
        names: [] // Return empty array for asteroid names endpoint
      },
      { status: 503 }
    );
  }

  try {
    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log(`Fetching from: ${fullUrl}`);
    
    const response = await fetch(fullUrl, {
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
      { 
        error: 'Failed to fetch data from backend API',
        details: error instanceof Error ? error.message : 'Unknown error',
        names: [] // Return empty array for asteroid names endpoint
      },
      { status: 500 }
    );
  }
}



