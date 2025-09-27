/**
 * Moon orbital elements and physical data for realistic scale
 * All data is in real-world units:
 * - Orbital distances in kilometers (will be converted to render units)
 * - Orbital angles in degrees (convert to radians using DegreesToRadians())
 * - Orbital periods in hours (multiply by 3600 for seconds)
 * - Diameters in kilometers (will be converted to render units)
 */

import { kmToRenderUnits } from "./scalingUtils";

export interface MoonData {
  name: string;
  parentPlanet: string;
  semiMajorAxis: number;        // km from planet center
  eccentricity: number;         // 0-1
  inclination: number;          // degrees relative to planet's equatorial plane
  longitudeOfAscendingNode: number;  // degrees (ω)
  rightAscensionOfAscendingNode: number; // degrees (Ω)
  orbitalPeriod: number;        // hours
  diameter: number;             // kilometers
  mass?: number;                // kg (optional)
}

export const MOONS: Record<string, MoonData> = {
  // Earth's Moon
  luna: {
    name: "Luna",
    parentPlanet: "earth",
    semiMajorAxis: 384400,
    eccentricity: 0.0549,
    inclination: 5.145,
    longitudeOfAscendingNode: 0,
    rightAscensionOfAscendingNode: 0,
    orbitalPeriod: 655.72, // 27.32 days
    diameter: 3474,
    mass: 7.342e22
  },

  // Mars' Moons
  phobos: {
    name: "Phobos",
    parentPlanet: "mars",
    semiMajorAxis: 9376,
    eccentricity: 0.0151,
    inclination: 1.093,
    longitudeOfAscendingNode: 0,
    rightAscensionOfAscendingNode: 0,
    orbitalPeriod: 7.6, // 7.6 hours
    diameter: 22, // Average diameter (irregular shape)
    mass: 1.0659e16
  },

  deimos: {
    name: "Deimos", 
    parentPlanet: "mars",
    semiMajorAxis: 23463,
    eccentricity: 0.00033,
    inclination: 0.93,
    longitudeOfAscendingNode: 0,
    rightAscensionOfAscendingNode: 0,
    orbitalPeriod: 30.3, // 30.3 hours
    diameter: 12, // Average diameter (irregular shape)
    mass: 1.4762e15
  },

  // Jupiter's Major Moons (Galilean moons)
  io: {
    name: "Io",
    parentPlanet: "jupiter",
    semiMajorAxis: 421700,
    eccentricity: 0.0041,
    inclination: 0.05,
    longitudeOfAscendingNode: 0,
    rightAscensionOfAscendingNode: 0,
    orbitalPeriod: 42.5, // 1.77 days
    diameter: 3643,
    mass: 8.932e22
  },

  europa: {
    name: "Europa",
    parentPlanet: "jupiter", 
    semiMajorAxis: 671034,
    eccentricity: 0.009,
    inclination: 0.47,
    longitudeOfAscendingNode: 0,
    rightAscensionOfAscendingNode: 0,
    orbitalPeriod: 85.2, // 3.55 days
    diameter: 3122,
    mass: 4.8e22
  },

  ganymede: {
    name: "Ganymede",
    parentPlanet: "jupiter",
    semiMajorAxis: 1070412,
    eccentricity: 0.0013,
    inclination: 0.2,
    longitudeOfAscendingNode: 0,
    rightAscensionOfAscendingNode: 0,
    orbitalPeriod: 171.7, // 7.15 days
    diameter: 5268,
    mass: 1.482e23
  },

  callisto: {
    name: "Callisto",
    parentPlanet: "jupiter",
    semiMajorAxis: 1882709,
    eccentricity: 0.0074,
    inclination: 0.19,
    longitudeOfAscendingNode: 0,
    rightAscensionOfAscendingNode: 0,
    orbitalPeriod: 400.5, // 16.7 days
    diameter: 4821,
    mass: 1.076e23
  },

  // Saturn's Major Moons
  mimas: {
    name: "Mimas",
    parentPlanet: "saturn",
    semiMajorAxis: 185539,
    eccentricity: 0.0196,
    inclination: 1.574,
    longitudeOfAscendingNode: 0,
    rightAscensionOfAscendingNode: 0,
    orbitalPeriod: 22.6, // 0.94 days
    diameter: 396,
    mass: 3.75e19
  },

  titan: {
    name: "Titan",
    parentPlanet: "saturn",
    semiMajorAxis: 1221830,
    eccentricity: 0.0288,
    inclination: 0.34,
    longitudeOfAscendingNode: 0,
    rightAscensionOfAscendingNode: 0,
    orbitalPeriod: 382.7, // 15.95 days
    diameter: 5150,
    mass: 1.345e23
  },

  iapetus: {
    name: "Iapetus",
    parentPlanet: "saturn",
    semiMajorAxis: 3561300,
    eccentricity: 0.0286,
    inclination: 15.47,
    longitudeOfAscendingNode: 0,
    rightAscensionOfAscendingNode: 0,
    orbitalPeriod: 1903.9, // 79.3 days  
    diameter: 1469,
    mass: 1.806e21
  },

  // Uranus' Major Moons
  miranda: {
    name: "Miranda",
    parentPlanet: "uranus",
    semiMajorAxis: 129390,
    eccentricity: 0.0013,
    inclination: 4.232,
    longitudeOfAscendingNode: 0,
    rightAscensionOfAscendingNode: 0,
    orbitalPeriod: 33.9, // 1.41 days
    diameter: 472,
    mass: 6.59e19
  },

  titania: {
    name: "Titania",
    parentPlanet: "uranus",
    semiMajorAxis: 436300,
    eccentricity: 0.0011,
    inclination: 0.079,
    longitudeOfAscendingNode: 0,
    rightAscensionOfAscendingNode: 0,
    orbitalPeriod: 208.9, // 8.7 days
    diameter: 1578,
    mass: 3.527e21
  },

  // Neptune's Major Moon
  triton: {
    name: "Triton",
    parentPlanet: "neptune",
    semiMajorAxis: 354759,
    eccentricity: 0.000016,
    inclination: 156.865, // Retrograde orbit
    longitudeOfAscendingNode: 0,
    rightAscensionOfAscendingNode: 0,
    orbitalPeriod: -141.0, // Negative for retrograde, 5.88 days
    diameter: 2707,
    mass: 2.139e22
  }
};

// Helper function to convert moon data to orbital elements with realistic scaling
export function moonToOrbitalElements(moon: MoonData, degreesToRadians: (deg: number) => number): {
  semiMajorAxis: number; // Will be in render units after conversion
  eccentricity: number;
  inclination: number; // radians
  longitudeOfAscendingNode: number; // radians
  rightAscensionOfAscendingNode: number; // radians
  orbitalPeriod: number; // seconds
  timeOfPeriapsisPassage: number;
} {
  return {
    // Convert km to render units using realistic scale
    semiMajorAxis: kmToRenderUnits(moon.semiMajorAxis),
    eccentricity: moon.eccentricity,
    inclination: degreesToRadians(moon.inclination),
    longitudeOfAscendingNode: degreesToRadians(moon.longitudeOfAscendingNode),
    rightAscensionOfAscendingNode: degreesToRadians(moon.rightAscensionOfAscendingNode),
    orbitalPeriod: Math.abs(moon.orbitalPeriod) * 3600, // Convert hours to seconds
    timeOfPeriapsisPassage: 0
  };
}

// Get moons for a specific planet
export function getMoonsForPlanet(planetName: string): MoonData[] {
  return Object.values(MOONS).filter(moon => 
    moon.parentPlanet.toLowerCase() === planetName.toLowerCase()
  );
}

// Get all moon names for a planet
export function getMoonNamesForPlanet(planetName: string): string[] {
  return getMoonsForPlanet(planetName).map(moon => moon.name);
}

// Helper to get moon distance information
export function getMoonDistanceInfo(moonName: string): {
  name: string;
  parentPlanet: string;
  distanceKm: number;
  distanceRenderUnits: number;
  orbitalPeriodDays: number;
} | null {
  const moon = MOONS[moonName.toLowerCase()];
  if (!moon) return null;

  const distanceRenderUnits = kmToRenderUnits(moon.semiMajorAxis);
  const orbitalPeriodDays = Math.abs(moon.orbitalPeriod) / 24;

  return {
    name: moon.name,
    parentPlanet: moon.parentPlanet,
    distanceKm: moon.semiMajorAxis,
    distanceRenderUnits,
    orbitalPeriodDays
  };
}

// Get size comparison data for moons
export function getMoonSizeInfo(moonName: string): {
  name: string;
  parentPlanet: string;
  diameterKm: number;
  diameterRenderUnits: number;
  relativeSizeToEarthMoon: number;
} | null {
  const moon = MOONS[moonName.toLowerCase()];
  if (!moon) return null;

  const earthMoonDiameter = MOONS.luna.diameter;
  const relativeSizeToEarthMoon = moon.diameter / earthMoonDiameter;

  return {
    name: moon.name,
    parentPlanet: moon.parentPlanet,
    diameterKm: moon.diameter,
    diameterRenderUnits: kmToRenderUnits(moon.diameter),
    relativeSizeToEarthMoon
  };
}

// Get orbital characteristics for a moon
export function getMoonOrbitalInfo(moonName: string): {
  name: string;
  parentPlanet: string;
  periodHours: number;
  periodDays: number;
  eccentricity: number;
  inclinationDegrees: number;
  isRetrograde: boolean;
} | null {
  const moon = MOONS[moonName.toLowerCase()];
  if (!moon) return null;

  return {
    name: moon.name,
    parentPlanet: moon.parentPlanet,
    periodHours: Math.abs(moon.orbitalPeriod),
    periodDays: Math.abs(moon.orbitalPeriod) / 24,
    eccentricity: moon.eccentricity,
    inclinationDegrees: moon.inclination,
    isRetrograde: moon.orbitalPeriod < 0
  };
}
