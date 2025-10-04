/**
 * Realistic Solar System Scaling Utilities
 *
 * Scale: 100,000 km = 1 render unit
 * All distances use this scale, angles remain unchanged
 * All celestial bodies rendered at 1 unit diameter for visibility
 */

export interface RealisticScaleFactors {
  /** Kilometers per render unit */
  kmPerRenderUnit: number;
  /** Minimum render units to prevent extremely small objects/lines */
  minRenderUnits: number;
}

export const REALISTIC_SCALE: RealisticScaleFactors = {
  kmPerRenderUnit: 1000000, // 1,000,000 km = 1 render unit (updated)
  minRenderUnits: 0.005, // Minimal render-unit size applied when conversion yields smaller
};

/**
 * Astronomical constants
 */
export const ASTRONOMICAL_CONSTANTS = {
  /** 1 Astronomical Unit in kilometers */
  AU_TO_KM: 149597870.7,
  /** Earth's orbital radius for reference */
  EARTH_ORBIT_KM: 149597870.7,
  /** Sun's actual diameter in km */
  SUN_DIAMETER_KM: 1392700,
};

/**
 * Convert Astronomical Units to kilometers
 */
export function auToKm(au: number): number {
  return au * ASTRONOMICAL_CONSTANTS.AU_TO_KM;
}

/**
 * Convert kilometers to render units
 */
export function kmToRenderUnits(km: number): number {
  const ru = km / REALISTIC_SCALE.kmPerRenderUnit;
  // Enforce minimum render-unit size so tiny real distances are still visible
  if (Math.abs(ru) > 0 && Math.abs(ru) < REALISTIC_SCALE.minRenderUnits) {
    return Math.sign(ru) * REALISTIC_SCALE.minRenderUnits;
  }
  return ru;
}

/**
 * Convert Astronomical Units directly to render units
 */
export function auToRenderUnits(au: number): number {
  return kmToRenderUnits(auToKm(au));
}

/**
 * Convert render units back to kilometers
 */
export function renderUnitsToKm(renderUnits: number): number {
  return renderUnits * REALISTIC_SCALE.kmPerRenderUnit;
}

/**
 * Convert render units back to AU
 */
export function renderUnitsToAu(renderUnits: number): number {
  return renderUnitsToKm(renderUnits) / ASTRONOMICAL_CONSTANTS.AU_TO_KM;
}

/**
 * Get scaled orbital elements for planets (distances in render units)
 */
export function getRealisticPlanetElements(planetData: {
  semiMajorAxis: number; // AU
  eccentricity: number;
  inclination: number; // radians
  longitudeOfAscendingNode: number; // radians
  rightAscensionOfAscendingNode: number; // radians
  orbitalPeriod: number; // seconds
  timeOfPeriapsisPassage: number;
}): typeof planetData {
  return {
    ...planetData,
    semiMajorAxis: auToRenderUnits(planetData.semiMajorAxis),
  };
}

/**
 * Get scaled orbital elements for moons (distances in render units)
 */
export function getRealisticMoonElements(moonData: {
  semiMajorAxis: number; // km
  eccentricity: number;
  inclination: number; // radians
  longitudeOfAscendingNode: number; // radians
  rightAscensionOfAscendingNode: number; // radians
  orbitalPeriod: number; // seconds
  timeOfPeriapsisPassage: number;
}): typeof moonData {
  return {
    ...moonData,
    semiMajorAxis: kmToRenderUnits(moonData.semiMajorAxis),
  };
}

/**
 * Get recommended camera distance for the realistic scale
 */
export function getRecommendedCameraDistance(): number {
  // Position camera to see most of the solar system
  const neptuneOrbit = auToRenderUnits(30.069);
  return neptuneOrbit * 1.5; // 1.5x Neptune's orbit distance
}

/**
 * Get scene boundaries for realistic solar system
 */
export function getSceneBoundaries(): {
  innerBoundary: number;
  outerBoundary: number;
  recommendedViewDistance: number;
} {
  const mercuryOrbit = auToRenderUnits(0.387);
  const neptuneOrbit = auToRenderUnits(30.069);

  return {
    innerBoundary: mercuryOrbit * 0.5,
    outerBoundary: neptuneOrbit * 3,
    recommendedViewDistance: neptuneOrbit * 1.5,
  };
}
