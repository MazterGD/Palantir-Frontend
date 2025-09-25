/**
 * Planetary moon orbital elements and physical data
 * Orbital angles in degrees - convert to radians using DegreesToRadians()
 * Semi-major axis in kilometers from planet center
 * Orbital periods in Earth days - multiply by 24*3600 for seconds
 */

export interface MoonData {
  name: string;
  parent: string;
  semiMajorAxis: number;        // km from planet center
  eccentricity: number;         // 0-1
  inclination: number;          // degrees (relative to planet's equatorial plane)
  longitudeOfAscendingNode: number;  // degrees (ω)
  rightAscensionOfAscendingNode: number; // degrees (Ω)
  orbitalPeriod: number;        // Earth days
  diameter: number;             // kilometers
}

export const MOONS: Record<string, MoonData[]> = {
  earth: [
    {
      name: "Moon",
      parent: "Earth",
      semiMajorAxis: 384400,
      eccentricity: 0.055,
      inclination: 5.145,
      longitudeOfAscendingNode: 0,
      rightAscensionOfAscendingNode: 0,
      orbitalPeriod: 27.32,
      diameter: 3476
    }
  ],
  
  mars: [
    {
      name: "Phobos",
      parent: "Mars",
      semiMajorAxis: 9376,
      eccentricity: 0.015,
      inclination: 1.093,
      longitudeOfAscendingNode: 0,
      rightAscensionOfAscendingNode: 0,
      orbitalPeriod: 0.319,
      diameter: 22
    },
    {
      name: "Deimos",
      parent: "Mars", 
      semiMajorAxis: 23463,
      eccentricity: 0.000,
      inclination: 0.930,
      longitudeOfAscendingNode: 0,
      rightAscensionOfAscendingNode: 0,
      orbitalPeriod: 1.263,
      diameter: 12
    }
  ],
  
  jupiter: [
    {
      name: "Io",
      parent: "Jupiter",
      semiMajorAxis: 421700,
      eccentricity: 0.004,
      inclination: 2.213,
      longitudeOfAscendingNode: 0,
      rightAscensionOfAscendingNode: 0,
      orbitalPeriod: 1.769,
      diameter: 3643
    },
    {
      name: "Europa",
      parent: "Jupiter",
      semiMajorAxis: 671034,
      eccentricity: 0.009,
      inclination: 1.791,
      longitudeOfAscendingNode: 0,
      rightAscensionOfAscendingNode: 0,
      orbitalPeriod: 3.551,
      diameter: 3122
    },
    {
      name: "Ganymede",
      parent: "Jupiter",
      semiMajorAxis: 1070412,
      eccentricity: 0.013,
      inclination: 2.214,
      longitudeOfAscendingNode: 0,
      rightAscensionOfAscendingNode: 0,
      orbitalPeriod: 7.155,
      diameter: 5268
    },
    {
      name: "Callisto",
      parent: "Jupiter",
      semiMajorAxis: 1882709,
      eccentricity: 0.074,
      inclination: 2.017,
      longitudeOfAscendingNode: 0,
      rightAscensionOfAscendingNode: 0,
      orbitalPeriod: 16.689,
      diameter: 4821
    }
  ],
  
  saturn: [
    {
      name: "Mimas",
      parent: "Saturn",
      semiMajorAxis: 185539,
      eccentricity: 0.020,
      inclination: 1.574,
      longitudeOfAscendingNode: 0,
      rightAscensionOfAscendingNode: 0,
      orbitalPeriod: 0.942,
      diameter: 396
    },
    {
      name: "Enceladus",
      parent: "Saturn",
      semiMajorAxis: 238020,
      eccentricity: 0.005,
      inclination: 0.009,
      longitudeOfAscendingNode: 0,
      rightAscensionOfAscendingNode: 0,
      orbitalPeriod: 1.370,
      diameter: 504
    },
    {
      name: "Tethys",
      parent: "Saturn",
      semiMajorAxis: 294672,
      eccentricity: 0.001,
      inclination: 1.091,
      longitudeOfAscendingNode: 0,
      rightAscensionOfAscendingNode: 0,
      orbitalPeriod: 1.888,
      diameter: 1066
    },
    {
      name: "Dione",
      parent: "Saturn",
      semiMajorAxis: 377415,
      eccentricity: 0.002,
      inclination: 0.019,
      longitudeOfAscendingNode: 0,
      rightAscensionOfAscendingNode: 0,
      orbitalPeriod: 2.737,
      diameter: 1123
    },
    {
      name: "Rhea",
      parent: "Saturn",
      semiMajorAxis: 527108,
      eccentricity: 0.001,
      inclination: 0.345,
      longitudeOfAscendingNode: 0,
      rightAscensionOfAscendingNode: 0,
      orbitalPeriod: 4.518,
      diameter: 1527
    },
    {
      name: "Titan",
      parent: "Saturn",
      semiMajorAxis: 1221830,
      eccentricity: 0.029,
      inclination: 0.312,
      longitudeOfAscendingNode: 0,
      rightAscensionOfAscendingNode: 0,
      orbitalPeriod: 15.945,
      diameter: 5150
    },
    {
      name: "Iapetus",
      parent: "Saturn",
      semiMajorAxis: 3561300,
      eccentricity: 0.028,
      inclination: 15.47,
      longitudeOfAscendingNode: 0,
      rightAscensionOfAscendingNode: 0,
      orbitalPeriod: 79.321,
      diameter: 1469
    }
  ],
  
  uranus: [
    {
      name: "Miranda",
      parent: "Uranus",
      semiMajorAxis: 129390,
      eccentricity: 0.001,
      inclination: 4.338,
      longitudeOfAscendingNode: 0,
      rightAscensionOfAscendingNode: 0,
      orbitalPeriod: 1.413,
      diameter: 472
    },
    {
      name: "Ariel",
      parent: "Uranus",
      semiMajorAxis: 190900,
      eccentricity: 0.001,
      inclination: 0.041,
      longitudeOfAscendingNode: 0,
      rightAscensionOfAscendingNode: 0,
      orbitalPeriod: 2.520,
      diameter: 1158
    },
    {
      name: "Umbriel",
      parent: "Uranus",
      semiMajorAxis: 266000,
      eccentricity: 0.004,
      inclination: 0.128,
      longitudeOfAscendingNode: 0,
      rightAscensionOfAscendingNode: 0,
      orbitalPeriod: 4.144,
      diameter: 1169
    },
    {
      name: "Titania",
      parent: "Uranus",
      semiMajorAxis: 435910,
      eccentricity: 0.001,
      inclination: 0.079,
      longitudeOfAscendingNode: 0,
      rightAscensionOfAscendingNode: 0,
      orbitalPeriod: 8.706,
      diameter: 1578
    },
    {
      name: "Oberon",
      parent: "Uranus",
      semiMajorAxis: 583520,
      eccentricity: 0.001,
      inclination: 0.058,
      longitudeOfAscendingNode: 0,
      rightAscensionOfAscendingNode: 0,
      orbitalPeriod: 13.463,
      diameter: 1523
    }
  ],
  
  neptune: [
    {
      name: "Triton",
      parent: "Neptune",
      semiMajorAxis: 354759,
      eccentricity: 0.000,
      inclination: 156.885, // Retrograde orbit
      longitudeOfAscendingNode: 0,
      rightAscensionOfAscendingNode: 0,
      orbitalPeriod: 5.877,
      diameter: 2707
    }
  ]
};

// All moons in a flat array for easy iteration
export const ALL_MOONS: MoonData[] = Object.values(MOONS).flat();

// Get moons by planet name
export function getMoonsByPlanet(planetName: string): MoonData[] {
  return MOONS[planetName.toLowerCase()] || [];
}

// Get specific moon by name
export function getMoonByName(moonName: string): MoonData | undefined {
  return ALL_MOONS.find(moon => moon.name.toLowerCase() === moonName.toLowerCase());
}

// Helper function to convert moon data to orbital elements
export function moonToOrbitalElements(moon: MoonData, degreesToRadians: (deg: number) => number): {
  semiMajorAxis: number;
  eccentricity: number;
  inclination: number;
  longitudeOfAscendingNode: number;
  rightAscensionOfAscendingNode: number;
  orbitalPeriod: number;
  timeOfPeriapsisPassage: number;
} {
  return {
    semiMajorAxis: moon.semiMajorAxis / 149597870.7, // Convert km to AU for consistency
    eccentricity: moon.eccentricity,
    inclination: degreesToRadians(moon.inclination),
    longitudeOfAscendingNode: degreesToRadians(moon.longitudeOfAscendingNode),
    rightAscensionOfAscendingNode: degreesToRadians(moon.rightAscensionOfAscendingNode),
    orbitalPeriod: moon.orbitalPeriod * 24 * 3600, // Convert days to seconds
    timeOfPeriapsisPassage: 0
  };
}

// Helper to get moon orbital data in kilometers (original scale)
export function moonToOrbitalElementsKm(moon: MoonData, degreesToRadians: (deg: number) => number): {
  semiMajorAxis: number;
  eccentricity: number;
  inclination: number;
  longitudeOfAscendingNode: number;
  rightAscensionOfAscendingNode: number;
  orbitalPeriod: number;
  timeOfPeriapsisPassage: number;
} {
  return {
    semiMajorAxis: moon.semiMajorAxis, // Keep in kilometers
    eccentricity: moon.eccentricity,
    inclination: degreesToRadians(moon.inclination),
    longitudeOfAscendingNode: degreesToRadians(moon.longitudeOfAscendingNode),
    rightAscensionOfAscendingNode: degreesToRadians(moon.rightAscensionOfAscendingNode),
    orbitalPeriod: moon.orbitalPeriod * 24 * 3600, // Convert days to seconds
    timeOfPeriapsisPassage: 0
  };
}
