import { OrbitElements } from "../components/three/orbitGenerator";

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

export function transformAsteroidData(apiResponse: AsteroidAPIResponse): AsteroidData {
  const data = apiResponse.asteroid;
  
  // Calculate mean motion (degrees per day) from orbital period (days)
  const meanMotion = 360 / data.orbital_period;
  
  // Average the min and max diameter estimates
  const diameter = (data.estimated_diameter_max + data.estimated_diameter_min) / 2;
  
  // Convert Modified Julian Date to Julian Date (MJD + 2400000.5)
  const julianEpoch = data.epoch_osculation + 2400000.5;
  
  return {
    id: data.id,
    name: data.name,
    semiMajorAxis: data.semi_major_axis,
    eccentricity: data.eccentricity,
    inclination: data.inclination,
    ascendingNode: data.ascending_node_longitude,
    perihelionArgument: data.perihelion_argument,
    meanAnomaly: data.mean_anomaly,
    meanMotion: meanMotion,
    orbitalPeriod: data.orbital_period,
    epoch: julianEpoch,
    perihelionTime: julianEpoch, // Approximate, can be calculated more precisely if needed
    diameter: diameter,
    color: data.is_potentially_hazardous_asteroid ? "#ff6b6b" : "#808080", // Red for hazardous, gray for normal
    isPotentiallyHazardous: data.is_potentially_hazardous_asteroid,
  };
}
