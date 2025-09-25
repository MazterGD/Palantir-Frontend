/**
 * Solar System Scaling Utilities
 * 
 * Converts real astronomical data to proportional render units for visualization
 * Scale: 1 render unit = 1000 km in real space
 * 
 * Scaling factors maintain visual proportions while keeping largest distances ~5000 units
 * and smallest visible objects ~0.01 units
 */

export interface ScaleFactors {
  /** A: Planet orbital distance scaling - makes planets closer for visibility */
  planetOrbitScale: number;
  /** B: Planet size scaling - makes planets bigger for visibility */
  planetSizeScale: number;
  /** C: Moon size scaling - makes moons bigger for visibility */
  moonSizeScale: number;
  /** D: Moon orbital distance scaling - makes moon orbits closer for visibility */
  moonOrbitScale: number;
  /** Sun size scaling - makes sun smaller to avoid overwhelming scene */
  sunSizeScale: number;
}

export const SCALE_FACTORS: ScaleFactors = {
  planetOrbitScale: 150,      // A: Planets 150x closer (AU * 150 = render units)
  planetSizeScale: 0.001,     // B: Planets at 1:1000 scale (km * 0.001 = render units)
  moonSizeScale: 0.001,       // C: Moons at 1:1000 scale (km * 0.001 = render units)
  moonOrbitScale: 0.00026,    // D: Moon orbits 3800x closer (km * 0.00026 = render units)
  sunSizeScale: 0.000036      // Sun 28,000x smaller for visibility (km * 0.000036 = render units)
};

/**
 * Real space to render unit conversion
 * 1 render unit = 1000 km in real space
 */
export const KM_PER_RENDER_UNIT = 1000;

/**
 * Scale planet orbital distances from AU to render units
 */
export function scalePlanetOrbit(semiMajorAxisAU: number): number {
  return semiMajorAxisAU * SCALE_FACTORS.planetOrbitScale;
}

/**
 * Scale planet diameter from km to render units
 */
export function scalePlanetSize(diameterKm: number): number {
  return diameterKm * SCALE_FACTORS.planetSizeScale;
}

/**
 * Scale moon orbital distances from km to render units
 */
export function scaleMoonOrbit(semiMajorAxisKm: number): number {
  return semiMajorAxisKm * SCALE_FACTORS.moonOrbitScale;
}

/**
 * Scale moon diameter from km to render units
 */
export function scaleMoonSize(diameterKm: number): number {
  return diameterKm * SCALE_FACTORS.moonSizeScale;
}

/**
 * Scale sun diameter from km to render units
 */
export function scaleSunSize(diameterKm: number): number {
  return diameterKm * SCALE_FACTORS.sunSizeScale;
}

/**
 * Convert render units back to real kilometers
 */
export function renderUnitsToKm(renderUnits: number): number {
  return renderUnits * KM_PER_RENDER_UNIT;
}

/**
 * Get scaled orbital elements for planets
 */
export function getScaledPlanetElements(planetData: {
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
    semiMajorAxis: scalePlanetOrbit(planetData.semiMajorAxis)
  };
}

/**
 * Get scaled orbital elements for moons
 */
export function getScaledMoonElements(moonData: {
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
    semiMajorAxis: scaleMoonOrbit(moonData.semiMajorAxis)
  };
}

/**
 * Scaling reference data for documentation and debugging
 */
export const SCALING_REFERENCE = {
  // Real distances that become our reference points
  neptune_orbit_au: 30.069,
  neptune_orbit_km: 30.069 * 149597870.7, // ~4.5 billion km
  earth_moon_distance_km: 384400,
  
  // Scaled distances in render units
  neptune_orbit_scaled: scalePlanetOrbit(30.069), // ~4510 units
  mercury_orbit_scaled: scalePlanetOrbit(0.387), // ~58 units
  earth_moon_scaled: scaleMoonOrbit(384400), // ~100 units
  phobos_orbit_scaled: scaleMoonOrbit(9376), // ~2.4 units
  
  // Real sizes
  jupiter_diameter_km: 142984,
  mercury_diameter_km: 4879,
  sun_diameter_km: 1392700,
  
  // Scaled sizes in render units
  jupiter_diameter_scaled: scalePlanetSize(142984), // ~143 units
  mercury_diameter_scaled: scalePlanetSize(4879), // ~5 units
  sun_diameter_scaled: scaleSunSize(1392700), // ~50 units
  
  // Moon sizes
  titan_diameter_km: 5150,
  deimos_diameter_km: 12,
  titan_diameter_scaled: scaleMoonSize(5150), // ~5.2 units
  deimos_diameter_scaled: scaleMoonSize(12), // ~0.012 units
  
  // Conversion
  km_per_render_unit: KM_PER_RENDER_UNIT
};

/**
 * Get human readable scale info
 */
export function getScaleInfo(): string {
  return `
Solar System Scaling Information:
- 1 render unit = ${KM_PER_RENDER_UNIT.toLocaleString()} km in real space
- Planets are ${SCALE_FACTORS.planetOrbitScale}x closer than reality
- Planet sizes are ${1/SCALE_FACTORS.planetSizeScale}x smaller than 1:1 scale
- Moon orbits are ${Math.round(1/SCALE_FACTORS.moonOrbitScale)}x closer than reality
- Moon sizes are ${1/SCALE_FACTORS.moonSizeScale}x smaller than 1:1 scale
- Sun is ${Math.round(1/SCALE_FACTORS.sunSizeScale)}x smaller than 1:1 scale

Example scaled sizes:
- Neptune orbit: ${SCALING_REFERENCE.neptune_orbit_scaled.toFixed(0)} units
- Jupiter diameter: ${SCALING_REFERENCE.jupiter_diameter_scaled.toFixed(1)} units
- Sun diameter: ${SCALING_REFERENCE.sun_diameter_scaled.toFixed(0)} units
- Earth-Moon distance: ${SCALING_REFERENCE.earth_moon_scaled.toFixed(0)} units
  `.trim();
}

/**
 * Validate if an object will be visible with current scaling
 */
export function isVisibleSize(sizeInRenderUnits: number): boolean {
  return sizeInRenderUnits >= 0.01; // Minimum visible size
}

/**
 * Custom scaling for specific visualization needs
 */
export function createCustomScale(maxDistance: number, minVisibleSize: number): ScaleFactors {
  // Calculate scales to fit Neptune orbit within maxDistance
  const neptuneOrbitKm = 30.069 * 149597870.7;
  const planetOrbitScale = maxDistance / (neptuneOrbitKm / KM_PER_RENDER_UNIT);
  
  // Scale sizes so smallest moon is at least minVisibleSize
  const smallestMoonKm = 12; // Deimos
  const sizeScale = minVisibleSize / smallestMoonKm;
  
  return {
    planetOrbitScale,
    planetSizeScale: sizeScale,
    moonSizeScale: sizeScale,
    moonOrbitScale: SCALE_FACTORS.moonOrbitScale, // Keep proportional to planet orbits
    sunSizeScale: sizeScale * 0.036 // Keep sun reasonable
  };
}
