// lib/asteroidData.ts
import { OrbitElements } from "../components/three/orbitGenerator";
import { auToKm } from "./scalingUtils";

export interface AsteroidAPIResponse {
  asteroid: {
    id: string;
    name: string;
    semi_major_axis: number;
    eccentricity: number;
    inclination: number;
    ascending_node_longitude: number;
    perihelion_argument: number;
    mean_anomaly: number;
    orbital_period: number;
    epoch_osculation: number;
    estimated_diameter_max: number;
    estimated_diameter_min: number;
    absolute_magnitude_h: number;
    is_potentially_hazardous_asteroid: boolean;
    orbit_determination_date: string;
  };
}

export interface AsteroidData extends OrbitElements {
  id: string;
  name: string;
  diameter: number;
  color: string;
  isPotentiallyHazardous: boolean;
}

export interface AsteroidsBulkAPIResponse {
  asteroids: AsteroidAPIResponse["asteroid"][];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AsteroidsFilterAPIResponse {
  asteroids: AsteroidAPIResponse["asteroid"][];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function transformAsteroidData(
  apiResponse: AsteroidAPIResponse,
): AsteroidData {
  const data = apiResponse.asteroid;

  // Validate required fields
  if (!data.semi_major_axis || !data.eccentricity || !data.orbital_period) {
    throw new Error("Missing required orbital data");
  }

  // Convert semi-major axis from AU -> km (assuming API provides AU)
  const semiMajorKm = auToKm(data.semi_major_axis);

  // Mean motion in radians/day (orbital_period is days)
  const meanMotionRadPerDay = (2 * Math.PI) / data.orbital_period;

  // Average the min and max diameter estimates, provide fallback
  const diameter =
    data.estimated_diameter_max && data.estimated_diameter_min
      ? (data.estimated_diameter_max + data.estimated_diameter_min) / 2
      : 1; // Default diameter if missing

  // Convert Modified Julian Date to Julian Date (MJD + 2400000.5)
  const julianEpoch = data.epoch_osculation + 2400000.5;

  return {
    id: data.id,
    name: data.name || `Asteroid ${data.id}`,
    semiMajorAxis: semiMajorKm,
    eccentricity: data.eccentricity,
    inclination: (data.inclination * Math.PI) / 180,
    ascendingNode: (data.ascending_node_longitude * Math.PI) / 180,
    perihelionArgument: (data.perihelion_argument * Math.PI) / 180,
    meanAnomaly: (data.mean_anomaly * Math.PI) / 180,
    meanMotion: meanMotionRadPerDay,
    orbitalPeriod: data.orbital_period,
    epoch: julianEpoch,
    perihelionTime: julianEpoch,
    diameter: diameter,
    color: data.is_potentially_hazardous_asteroid ? "#ff6b6b" : "#808080",
    isPotentiallyHazardous: data.is_potentially_hazardous_asteroid,
  };
}

// Extended interface for detailed asteroid information
export interface AsteroidDetailedInfo {
  name: string;
  diameter: number;
  rotation_period?: number;
  orbit_period?: number;
  distance_from_sun?: number;
  composition?: string;
  discovery_date?: string;
  discovered_by?: string;
  classification?: string;
}

// Function to fetch asteroid names from the API
export async function fetchAsteroidNames(): Promise<{ names: string[] }> {
  try {
    const response = await fetch('/api/asteroids/names');
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    const data = await response.json();
    
    // Extract names from the response
    let names: string[] = [];
    if (Array.isArray(data)) {
      names = data.map((item: any) => typeof item === 'string' ? item : item.name).filter(Boolean);
    } else if (data.names && Array.isArray(data.names)) {
      names = data.names;
    } else if (data.asteroids && Array.isArray(data.asteroids)) {
      names = data.asteroids.map((a: any) => a.name).filter(Boolean);
    }
    
    console.log(`✓ Loaded ${names.length} asteroid names from API`);
    return { names };
  } catch (error) {
    console.error('Failed to fetch asteroid names:', error);
    // Return empty array on error - SearchUI will show planets only
    return { names: [] };
  }
}

// Function to fetch detailed asteroid information
export async function fetchAsteroidDetails(asteroidName: string): Promise<AsteroidDetailedInfo> {
  try {
    const response = await fetch(`/api/asteroids/details/${encodeURIComponent(asteroidName)}`);
    if (!response.ok) {
      throw new Error(`API returned status ${response.status}`);
    }
    const data = await response.json();
    
    return {
      name: data.name || asteroidName,
      diameter: data.diameter || data.estimated_diameter_max || 10,
      rotation_period: data.rotation_period,
      orbit_period: data.orbital_period || data.orbit_period,
      distance_from_sun: data.semi_major_axis || data.distance_from_sun,
      composition: data.composition || data.spectral_type,
      discovery_date: data.discovery_date,
      discovered_by: data.discovered_by,
      classification: data.classification || data.orbit_class,
    };
  } catch (error) {
    console.error(`Failed to fetch asteroid details for ${asteroidName}:`, error);
    // Return minimal fallback data
    return {
      name: asteroidName,
      diameter: 10,
      classification: "Data unavailable",
    };
  }
}
