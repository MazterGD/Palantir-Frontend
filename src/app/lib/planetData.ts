/**
 * Planetary orbital elements and physical data
 * Orbital angles in degrees - convert to radians using DegreesToRadians()
 * Orbital periods in Earth days - multiply by 24*3600 for seconds
 */

export interface PlanetData {
  name: string;
  semiMajorAxis: number;        // AU
  eccentricity: number;         // 0-1
  inclination: number;          // degrees
  longitudeOfAscendingNode: number;  // degrees (ω)
  rightAscensionOfAscendingNode: number; // degrees (Ω)
  orbitalPeriod: number;        // Earth days
  diameter: number;             // kilometers
}

export const PLANETS: Record<string, PlanetData> = {
  mercury: {
    name: "Mercury",
    semiMajorAxis: 0.387,
    eccentricity: 0.206,
    inclination: 7.005,
    longitudeOfAscendingNode: 77.456,
    rightAscensionOfAscendingNode: 48.331,
    orbitalPeriod: 87.97,
    diameter: 4879
  },
  
  venus: {
    name: "Venus", 
    semiMajorAxis: 0.723,
    eccentricity: 0.007,
    inclination: 3.395,
    longitudeOfAscendingNode: 131.563,
    rightAscensionOfAscendingNode: 76.678,
    orbitalPeriod: 224.70,
    diameter: 12104
  },
  
  earth: {
    name: "Earth",
    semiMajorAxis: 1.000,
    eccentricity: 0.017,
    inclination: 0.000,
    longitudeOfAscendingNode: 102.937,
    rightAscensionOfAscendingNode: 0.000,
    orbitalPeriod: 365.26,
    diameter: 12756
  },
  
  mars: {
    name: "Mars",
    semiMajorAxis: 1.524,
    eccentricity: 0.093,
    inclination: 1.850,
    longitudeOfAscendingNode: 336.041,
    rightAscensionOfAscendingNode: 49.558,
    orbitalPeriod: 686.98,
    diameter: 6792
  },
  
  jupiter: {
    name: "Jupiter",
    semiMajorAxis: 5.203,
    eccentricity: 0.049,
    inclination: 1.303,
    longitudeOfAscendingNode: 14.753,
    rightAscensionOfAscendingNode: 100.464,
    orbitalPeriod: 4332.59,
    diameter: 142984
  },
  
  saturn: {
    name: "Saturn",
    semiMajorAxis: 9.537,
    eccentricity: 0.057,
    inclination: 2.485,
    longitudeOfAscendingNode: 93.057,
    rightAscensionOfAscendingNode: 113.665,
    orbitalPeriod: 10759.22,
    diameter: 120536
  },
  
  uranus: {
    name: "Uranus",
    semiMajorAxis: 19.191,
    eccentricity: 0.046,
    inclination: 0.773,
    longitudeOfAscendingNode: 173.005,
    rightAscensionOfAscendingNode: 74.006,
    orbitalPeriod: 30688.5,
    diameter: 51118
  },
  
  neptune: {
    name: "Neptune",
    semiMajorAxis: 30.069,
    eccentricity: 0.010,
    inclination: 1.770,
    longitudeOfAscendingNode: 48.124,
    rightAscensionOfAscendingNode: 131.784,
    orbitalPeriod: 60182,
    diameter: 49528
  }
};

// Helper function to convert planet data to orbital elements
export function planetToOrbitalElements(planet: PlanetData, degreesToRadians: (deg: number) => number): {
  semiMajorAxis: number;
  eccentricity: number;
  inclination: number;
  longitudeOfAscendingNode: number;
  rightAscensionOfAscendingNode: number;
  orbitalPeriod: number;
  timeOfPeriapsisPassage: number;
} {
  return {
    semiMajorAxis: planet.semiMajorAxis,
    eccentricity: planet.eccentricity,
    inclination: degreesToRadians(planet.inclination),
    longitudeOfAscendingNode: degreesToRadians(planet.longitudeOfAscendingNode),
    rightAscensionOfAscendingNode: degreesToRadians(planet.rightAscensionOfAscendingNode),
    orbitalPeriod: planet.orbitalPeriod * 24 * 3600, // Convert days to seconds
    timeOfPeriapsisPassage: 0
  };
}
