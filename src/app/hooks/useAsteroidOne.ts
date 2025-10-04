import { useState, useEffect } from "react";

export type AsteroidType = {
  id: string;
  name: string;
  semi_major_axis: number;
  eccentricity: number;
  inclination: number;
  ascending_node_longitude?: number;
  perihelion_argument?: number;
  mean_anomaly?: number;
  orbital_period: number;
  epoch_osculation?: string | number;
  estimated_diameter_max: number;
  estimated_diameter_min: number;
  absolute_magnitude_h: number;
  is_potentially_hazardous_asteroid: boolean;
  orbit_determination_date?: string;
  close_approach_data: Array<{
    close_approach_date: string;
    close_approach_date_full: string;
    epoch_date_close_approach?: number;
    miss_distance: {
      astronomical: number;
      kilometers: number;
      lunar?: number;
      miles: number;
    };
    orbiting_body: string;
    relative_velocity: {
      kilometers_per_hour?: number;
      kilometers_per_second: number;
      miles_per_hour: number;
    };
  }>;
  designation: string;
  estimated_diameter: {
    feet: {
      estimated_diameter_max: number;
      estimated_diameter_min: number;
    };
    kilometers: {
      estimated_diameter_max: number;
      estimated_diameter_min: number;
    };
    meters: {
      estimated_diameter_max: number;
      estimated_diameter_min: number;
    };
    miles: {
      estimated_diameter_max: number;
      estimated_diameter_min: number;
    };
  };
  is_sentry_object: boolean;
  links: {
    self: string;
  };
  name_limited: string;
  nasa_jpl_url: string;
  neo_reference_id: string;
  orbital_data: {
    aphelion_distance: number;
    ascending_node_longitude: number;
    data_arc_in_days: number;
    eccentricity: number;
    epoch_osculation: number | string;
    equinox: string;
    first_observation_date: string;
    inclination: number;
    jupiter_tisserand_invariant: number;
    last_observation_date: string;
    mean_anomaly: number;
    mean_motion: number;
    minimum_orbit_intersection: number;
    observations_used: number;
    orbit_class: {
      orbit_class_description: string;
      orbit_class_range: string;
      orbit_class_type: string;
    };
    orbit_determination_date: string;
    orbit_id: string;
    orbit_uncertainty: string;
    orbital_period: number;
    perihelion_argument: number;
    perihelion_distance: number;
    perihelion_time: number;
    semi_major_axis: number;
  };
};

interface UseAsteroidSingleResult {
  asteroid: AsteroidType | null;
  loading: boolean;
  error: string | null;
}

export function useAsteroidOne(id: string | null): UseAsteroidSingleResult {
  const [asteroid, setAsteroid] = useState<AsteroidType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setAsteroid(null);
      setError("No asteroid id provided");
      return;
    }

    const fetchAsteroid = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/asteroid/one?id=${id}`);
        if (!response.ok) {
          console.error("Failed to fetch asteroid:", response.statusText);
          throw new Error(`Failed to fetch asteroid: ${response.statusText}`);
        }
        const data = await response.json();
        setAsteroid(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch asteroid",
        );
        setAsteroid(null);
      } finally {
        setLoading(false);
      }
    };

    fetchAsteroid();
  }, [id]);

  return { asteroid, loading, error };
}
