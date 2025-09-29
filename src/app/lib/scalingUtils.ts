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
  /** Standard diameter for all celestial bodies in render units */
  standardBodyDiameter: number;
}

export const REALISTIC_SCALE: RealisticScaleFactors = {
  kmPerRenderUnit: 100000, // 100,000 km = 1 render unit
  standardBodyDiameter: 1, // All bodies rendered at 1 unit diameter
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
  return km / REALISTIC_SCALE.kmPerRenderUnit;
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
 * Get standard body diameter (all bodies same size for visibility)
 */
export function getStandardBodyDiameter(): number {
  return REALISTIC_SCALE.standardBodyDiameter;
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
 * Realistic scaling reference data for documentation and debugging
 */
export const REALISTIC_SCALING_REFERENCE = {
  // Real distances in km
  mercury_orbit_km: auToKm(0.387), // ~57.9 million km
  earth_orbit_km: auToKm(1.0), // ~149.6 million km
  mars_orbit_km: auToKm(1.524), // ~227.9 million km
  jupiter_orbit_km: auToKm(5.203), // ~778.5 million km
  saturn_orbit_km: auToKm(9.537), // ~1.43 billion km
  neptune_orbit_km: auToKm(30.069), // ~4.5 billion km

  // Scaled distances in render units
  mercury_orbit_units: auToRenderUnits(0.387), // ~579 units
  earth_orbit_units: auToRenderUnits(1.0), // ~1496 units
  mars_orbit_units: auToRenderUnits(1.524), // ~2279 units
  jupiter_orbit_units: auToRenderUnits(5.203), // ~7785 units
  saturn_orbit_units: auToRenderUnits(9.537), // ~14270 units
  neptune_orbit_units: auToRenderUnits(30.069), // ~45001 units

  // Real sizes in km (for reference, but all rendered at 1 unit)
  sun_diameter_km: ASTRONOMICAL_CONSTANTS.SUN_DIAMETER_KM,
  jupiter_diameter_km: 142984,
  earth_diameter_km: 12756,
  mercury_diameter_km: 4879,

  // All rendered diameters
  standard_body_diameter: REALISTIC_SCALE.standardBodyDiameter,

  // Scale conversion
  km_per_render_unit: REALISTIC_SCALE.kmPerRenderUnit,
};

/**
 * Get human readable scale information
 */
export function getRealisticScaleInfo(): string {
  return `
Realistic Solar System Scaling Information:
- 1 render unit = ${REALISTIC_SCALE.kmPerRenderUnit.toLocaleString()} km
- 1 AU = ${ASTRONOMICAL_CONSTANTS.AU_TO_KM.toLocaleString()} km = ${auToRenderUnits(1).toFixed(1)} render units
- All celestial bodies rendered at ${REALISTIC_SCALE.standardBodyDiameter} unit diameter

Orbital distances in render units:
- Mercury: ${REALISTIC_SCALING_REFERENCE.mercury_orbit_units.toFixed(0)} units
- Earth: ${REALISTIC_SCALING_REFERENCE.earth_orbit_units.toFixed(0)} units  
- Mars: ${REALISTIC_SCALING_REFERENCE.mars_orbit_units.toFixed(0)} units
- Jupiter: ${REALISTIC_SCALING_REFERENCE.jupiter_orbit_units.toFixed(0)} units
- Saturn: ${REALISTIC_SCALING_REFERENCE.saturn_orbit_units.toFixed(0)} units
- Neptune: ${REALISTIC_SCALING_REFERENCE.neptune_orbit_units.toFixed(0)} units

Scene extents: ~${REALISTIC_SCALING_REFERENCE.neptune_orbit_units.toFixed(0)} units radius
  `.trim();
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
    outerBoundary: neptuneOrbit * 1.2,
    recommendedViewDistance: neptuneOrbit * 1.5,
  };
}
