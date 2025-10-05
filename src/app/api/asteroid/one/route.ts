// app/api/asteroid/filter/route.ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  console.log(`Fetching filtered asteroids - id: ${id}`);

  if (!id) {
    return NextResponse.json(
      { error: "id parameter is required" },
      { status: 400 },
    );
  }

  try {
    const response = await fetch(
      `https://galanor-backend-production.up.railway.app/asteroid/one?id=${id}`,
    );

    console.log("Filter backend response status:", response.status);

    if (!response.ok) {
      throw new Error(
        `Backend API returned ${response.status}: ${response.statusText}`,
      );
    }

    const asteroid = await response.json();
    console.log(asteroid);
    console.log("Filter API response received, data id:", asteroid.id);

    // The API now returns the asteroid object directly, not wrapped in data.data[0]
    const transformedData = {
      id: asteroid.id,
      neo_reference_id: asteroid.neo_reference_id,
      designation: asteroid.designation,
      name: asteroid.name,
      name_limited: asteroid.name_limited,
      nasa_jpl_url: asteroid.nasa_jpl_url,
      links: asteroid.links,
      absolute_magnitude_h: asteroid.absolute_magnitude_h,
      estimated_diameter: asteroid.estimated_diameter,
      estimated_diameter_max:
        asteroid.estimated_diameter?.kilometers?.estimated_diameter_max,
      estimated_diameter_min:
        asteroid.estimated_diameter?.kilometers?.estimated_diameter_min,
      is_potentially_hazardous_asteroid:
        asteroid.is_potentially_hazardous_asteroid,
      is_sentry_object: asteroid.is_sentry_object,
      orbital_data: asteroid.orbital_data,
      semi_major_axis: asteroid.orbital_data?.semi_major_axis,
      eccentricity: asteroid.orbital_data?.eccentricity,
      inclination: asteroid.orbital_data?.inclination,
      ascending_node_longitude: asteroid.orbital_data?.ascending_node_longitude,
      perihelion_argument: asteroid.orbital_data?.perihelion_argument,
      mean_anomaly: asteroid.orbital_data?.mean_anomaly,
      orbital_period: asteroid.orbital_data?.orbital_period,
      epoch_osculation: asteroid.orbital_data?.epoch_osculation,
      aphelion_distance: asteroid.orbital_data?.aphelion_distance,
      perihelion_distance: asteroid.orbital_data?.perihelion_distance,
      mean_motion: asteroid.orbital_data?.mean_motion,
      minimum_orbit_intersection:
        asteroid.orbital_data?.minimum_orbit_intersection,
      orbit_class: asteroid.orbital_data?.orbit_class,
      orbit_id: asteroid.orbital_data?.orbit_id,
      orbit_uncertainty: asteroid.orbital_data?.orbit_uncertainty,
      data_arc_in_days: asteroid.orbital_data?.data_arc_in_days,
      observations_used: asteroid.orbital_data?.observations_used,
      first_observation_date: asteroid.orbital_data?.first_observation_date,
      last_observation_date: asteroid.orbital_data?.last_observation_date,
      orbit_determination_date: asteroid.orbital_data?.orbit_determination_date,
      equinox: asteroid.orbital_data?.equinox,
      jupiter_tisserand_invariant:
        asteroid.orbital_data?.jupiter_tisserand_invariant,
      perihelion_time: asteroid.orbital_data?.perihelion_time,
      close_approach_data:
        asteroid.close_approach_data?.map((approach: any) => ({
          close_approach_date: approach.close_approach_date,
          close_approach_date_full: approach.close_approach_date_full,
          epoch_date_close_approach: approach.epoch_date_close_approach,
          miss_distance: {
            astronomical: approach.miss_distance?.astronomical,
            kilometers: approach.miss_distance?.kilometers,
            lunar: approach.miss_distance?.lunar,
            miles: approach.miss_distance?.miles,
          },
          orbiting_body: approach.orbiting_body,
          relative_velocity: {
            kilometers_per_hour:
              approach.relative_velocity?.kilometers_per_hour,
            kilometers_per_second:
              approach.relative_velocity?.kilometers_per_second,
            miles_per_hour: approach.relative_velocity?.miles_per_hour,
          },
        })) || [],
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error in filtered asteroids API route:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch filtered asteroids data",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
