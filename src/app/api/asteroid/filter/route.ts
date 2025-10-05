// app/api/asteroid/filter/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const backendUrl = process.env.BACKEND_API_URL;
  const min = searchParams.get('min');
  const max = searchParams.get('max');
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '100';

  console.log(`Fetching filtered asteroids - min: ${min}, max: ${max}, page: ${page}, limit: ${limit}`);

  if (!min || !max) {
    return NextResponse.json(
      { error: 'Both min and max parameters are required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `${backendUrl}/asteroid/asteroids/filter?min=${min}&max=${max}`
    );

    console.log('Filter backend response status:', response.status);

    if (!response.ok) {
      throw new Error(`Backend API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Filter API response received, data count:', data.data?.length);

    // Transform the filtered response to match your expected format
    const transformedData = {
      asteroids: data.data?.map((asteroid: any) => ({
        id: asteroid.id,
        name: asteroid.name,
        semi_major_axis: asteroid.semi_major_axis,
        eccentricity: asteroid.eccentricity,
        inclination: asteroid.inclination,
        ascending_node_longitude: asteroid.ascending_node_longitude,
        perihelion_argument: asteroid.perihelion_argument,
        mean_anomaly: asteroid.mean_anomaly,
        orbital_period: asteroid.orbital_period,
        epoch_osculation: asteroid.epoch_osculation,
        estimated_diameter_max: asteroid.estimated_diameter_max,
        estimated_diameter_min: asteroid.estimated_diameter_min,
        absolute_magnitude_h: asteroid.absolute_magnitude_h,
        is_potentially_hazardous_asteroid: asteroid.is_potentially_hazardous_asteroid,
        orbit_determination_date: asteroid.orbit_determination_date
      })) || [],
      pagination: {
        page: data.page,
        limit: data.limit,
        total: data.total,
        totalPages: data.total_pages
      }
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error in filtered asteroids API route:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch filtered asteroids data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
