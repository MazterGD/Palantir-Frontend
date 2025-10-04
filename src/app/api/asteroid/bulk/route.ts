// app/api/asteroid/bulk/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = searchParams.get('page') || '1';
  const limit = searchParams.get('limit') || '10';

  console.log(`Fetching asteroids bulk - page: ${page}, limit: ${limit}`);

  try {
    const response = await fetch(
      `https://4galanor-backend.onrender.com/asteroid/asteroids?page=${page}&limit=${limit}`
    );

    console.log('Bulk backend response status:', response.status);

    if (!response.ok) {
      throw new Error(`Backend API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Bulk API response received, data count:', data.data?.length);

    // Transform the bulk response to match your expected format
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
    console.error('Error in bulk asteroids API route:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch bulk asteroids data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
