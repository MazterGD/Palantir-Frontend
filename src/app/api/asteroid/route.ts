// app/api/asteroid/route.ts
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  
  if (!id) {
    return NextResponse.json({ error: 'Asteroid ID required' }, { status: 400 });
  }
  
  try {
    const response = await fetch(`https://galanor-backend.onrender.com/asteroid/one?id=${id}`);
    
    if (!response.ok) {
      throw new Error(`Backend API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if we have the expected data structure
    if (!data.orbital_data) {
      throw new Error('Invalid asteroid data structure from backend');
    }
    
    // Transform the data to match your expected format
    const transformedData = {
      asteroid: {
        id: data.id || data._id,
        name: data.name || data.designation,
        semi_major_axis: data.orbital_data.semi_major_axis,
        eccentricity: data.orbital_data.eccentricity,
        inclination: data.orbital_data.inclination,
        ascending_node_longitude: data.orbital_data.ascending_node_longitude,
        perihelion_argument: data.orbital_data.perihelion_argument,
        mean_anomaly: data.orbital_data.mean_anomaly,
        orbital_period: data.orbital_data.orbital_period,
        epoch_osculation: data.orbital_data.epoch_osculation,
        estimated_diameter_max: data.estimated_diameter?.kilometers?.estimated_diameter_max,
        estimated_diameter_min: data.estimated_diameter?.kilometers?.estimated_diameter_min,
        absolute_magnitude_h: data.absolute_magnitude_h,
        is_potentially_hazardous_asteroid: data.is_potentially_hazardous_asteroid,
        orbit_determination_date: data.orbital_data.orbit_determination_date
      }
    };
    
    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Error fetching asteroid data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch asteroid data' }, 
      { status: 500 }
    );
  }
}
