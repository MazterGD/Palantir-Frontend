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
