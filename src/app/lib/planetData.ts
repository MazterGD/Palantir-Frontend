import { OrbitalData } from "../components/three/orbitalMechanics";

export interface PlanetSizeData {
  radius: number; // Planet radius in km
}

export const ASTRONOMICAL_DATA: {
  [key: string]: { orbital: OrbitalData; size: PlanetSizeData };
} = {
  sun: {
    orbital: {
      semiMajorAxis: 0,
      eccentricity: 0,
      orbitalPeriod: 0,
      inclination: 0,
      longitudeOfAscendingNode: 0,
      argumentOfPeriapsis: 0,
    },
    size: { radius: 695700 }, // Sun radius in km
  },
  mercury: {
    orbital: {
      semiMajorAxis: 0.387, // AU
      eccentricity: 0.2056,
      orbitalPeriod: 0.241, // Earth years (88 days)
      inclination: 7.0, // degrees to ecliptic
      longitudeOfAscendingNode: 48.3,
      argumentOfPeriapsis: 29.1,
    },
    size: { radius: 2439.7 }, // km
  },
  venus: {
    orbital: {
      semiMajorAxis: 0.723, // AU
      eccentricity: 0.0068,
      orbitalPeriod: 0.615, // Earth years (225 days)
      inclination: 3.4, // degrees to ecliptic
      longitudeOfAscendingNode: 76.7,
      argumentOfPeriapsis: 54.9,
    },
    size: { radius: 6051.8 }, // km
  },
  earth: {
    orbital: {
      semiMajorAxis: 1.0, // 1 AU by definition (149.6 million km)
      eccentricity: 0.0167,
      orbitalPeriod: 1.0, // 1 Earth year (365.25 days)
      inclination: 0.0, // Reference plane
      longitudeOfAscendingNode: 0.0,
      argumentOfPeriapsis: 102.9,
    },
    size: { radius: 6371 }, // km
  },
  mars: {
    orbital: {
      semiMajorAxis: 1.524, // AU
      eccentricity: 0.0935,
      orbitalPeriod: 1.881, // Earth years (687 days)
      inclination: 1.85, // degrees to ecliptic
      longitudeOfAscendingNode: 49.6,
      argumentOfPeriapsis: 286.5,
    },
    size: { radius: 3390 }, // km
  },
  jupiter: {
    orbital: {
      semiMajorAxis: 5.203, // AU
      eccentricity: 0.0489,
      orbitalPeriod: 11.86, // Earth years
      inclination: 1.3, // degrees to ecliptic
      longitudeOfAscendingNode: 100.5,
      argumentOfPeriapsis: 273.9,
    },
    size: { radius: 69911 }, // km
  },
  saturn: {
    orbital: {
      semiMajorAxis: 9.537, // AU
      eccentricity: 0.0565,
      orbitalPeriod: 29.45, // Earth years
      inclination: 2.5, // degrees to ecliptic
      longitudeOfAscendingNode: 113.7,
      argumentOfPeriapsis: 339.4,
    },
    size: { radius: 58232 }, // km
  },
  uranus: {
    orbital: {
      semiMajorAxis: 19.191, // AU
      eccentricity: 0.0457,
      orbitalPeriod: 84.02, // Earth years
      inclination: 0.8, // degrees to ecliptic
      longitudeOfAscendingNode: 74.0,
      argumentOfPeriapsis: 96.5,
    },
    size: { radius: 25362 }, // km
  },
  neptune: {
    orbital: {
      semiMajorAxis: 30.069, // AU
      eccentricity: 0.0113,
      orbitalPeriod: 164.8, // Earth years
      inclination: 1.8, // degrees to ecliptic
      longitudeOfAscendingNode: 131.8,
      argumentOfPeriapsis: 273.2,
    },
    size: { radius: 24622 }, // km
  },
};
