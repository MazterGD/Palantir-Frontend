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
  kmPerRenderUnit: 100000, // 100,000 km = 1 render unit (updated)
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
  const jupiterOrbit = auToRenderUnits(5.202887);
  return jupiterOrbit * 1.5; // 1.5x Jupiter's orbit distance
}

/**
 * Get scene boundaries for realistic solar system
 */
export function getSceneBoundaries(): {
  innerBoundary: number;
  outerBoundary: number;
  recommendedViewDistance: number;
} {
  const sunRadiusRU = kmToRenderUnits(ASTRONOMICAL_CONSTANTS.SUN_DIAMETER_KM) / 2;
  const neptuneOrbit = auToRenderUnits(30.069);

  return {
    innerBoundary: Math.max(0.5, sunRadiusRU * 2), // Stop at 2x sun's radius (safety margin)
    outerBoundary: neptuneOrbit * 3,
    recommendedViewDistance: neptuneOrbit * 1.5,
  };
}

/**
 * Scale time speed based on slider value
 * 
 * @param sliderValue - Value from the time speed slider (0-100)
 * @param baseSpeed - Base speed factor to scale from
 * @param exponentialFactor - How dramatically speed changes with slider movement
 * @returns Object with scaled time speed value, minutes per second, and formatted time display
 */
export function scaleTimeSpeed(
  sliderValue: number
): { scaledValue: number; minutesPerSecond: number; formattedTime: string } {
  // Map slider: 0=backward (past), 50=real-time (1:1), 100=very fast forward (future)
  // We'll use exponential scaling from the center
  
  // Time constants
  const MINUTES_IN_HOUR = 60;
  const HOURS_IN_DAY = 24;
  const DAYS_IN_YEAR = 365.25; // Account for leap years
  const DAYS_IN_MONTH = 30.44; // Average month length
  const MINUTES_IN_DAY = MINUTES_IN_HOUR * HOURS_IN_DAY;
  
  // Real-time is 1 day per day (converted to days per second in the simulation)
  // At 60 FPS, that's about 1/60/60/24 days per frame
  // But we'll work in days per second for simplicity
  const REAL_TIME_DAYS_PER_SECOND = 1 / (24 * 60 * 60); // ~0.0000115741 days/sec
  
  let daysPerSecond;
  
  if (sliderValue === 50) {
    // Exactly real-time
    daysPerSecond = REAL_TIME_DAYS_PER_SECOND;
  } else if (sliderValue < 50) {
    // Going backward in time (PAST) - negative values (0 to 50)
    // Map 0 = fast backward (-30 days/sec), 50 = real-time
    const normalizedValue = sliderValue / 50; // 0 to 1
    
    if (normalizedValue < 0.2) {
      // Extremely fast backward: -30 to -1 days/sec
      const factor = normalizedValue / 0.2;
      daysPerSecond = -(30 - factor * 29); // -30 to -1 days/sec
    } else if (normalizedValue < 0.5) {
      // Very fast backward: -1 day/sec to -1000x real-time
      const factor = (normalizedValue - 0.2) / 0.3;
      daysPerSecond = -(1 - factor * (1 - REAL_TIME_DAYS_PER_SECOND * 1000));
    } else if (normalizedValue < 0.8) {
      // Fast backward: -1000x to -100x real-time
      const factor = (normalizedValue - 0.5) / 0.3;
      daysPerSecond = -REAL_TIME_DAYS_PER_SECOND * (1000 - factor * 900);
    } else {
      // Slightly backward: -100x to -1x real-time
      const factor = (normalizedValue - 0.8) / 0.2;
      daysPerSecond = -REAL_TIME_DAYS_PER_SECOND * (100 - factor * 99);
    }
  } else {
    // Going forward in time (FUTURE) - positive values (50 to 100)
    // Map 50 = real-time, 100 = extremely fast forward
    const normalizedValue = (sliderValue - 50) / 50; // 0 to 1
    
    if (normalizedValue < 0.2) {
      // Slightly faster: 1x to 100x real-time
      const factor = normalizedValue / 0.2;
      daysPerSecond = REAL_TIME_DAYS_PER_SECOND * (1 + factor * 99);
    } else if (normalizedValue < 0.5) {
      // Fast: 100x to 1000x (can see hours pass quickly)
      const factor = (normalizedValue - 0.2) / 0.3;
      daysPerSecond = REAL_TIME_DAYS_PER_SECOND * (100 + factor * 900);
    } else if (normalizedValue < 0.8) {
      // Very fast: 1000x to 86400x (1 day per second)
      const factor = (normalizedValue - 0.5) / 0.3;
      daysPerSecond = REAL_TIME_DAYS_PER_SECOND * (1000 + factor * 85400);
    } else {
      // Extremely fast: 1 day/sec to 30 days/sec (1 month/sec)
      const factor = (normalizedValue - 0.8) / 0.2;
      daysPerSecond = 1 + factor * 29; // 1 to 30 days per second
    }
  }
  
  // Convert to minutes for display purposes
  const minutesPerSecond = daysPerSecond * MINUTES_IN_DAY;
  
  // Calculate time units for display
  const absDaysPerSecond = Math.abs(daysPerSecond);
  const years = Math.floor(absDaysPerSecond / DAYS_IN_YEAR);
  const months = Math.floor((absDaysPerSecond % DAYS_IN_YEAR) / DAYS_IN_MONTH);
  const days = Math.floor(absDaysPerSecond % DAYS_IN_MONTH);
  const hours = Math.floor(((absDaysPerSecond % 1) * HOURS_IN_DAY));
  
  // Format the time display string
  let timeDisplay = '';
  if (years > 0) {
    timeDisplay = `${years}y ${months}m/s`;
  } else if (months > 0) {
    timeDisplay = `${months}m ${days}d/s`;
  } else if (days > 0) {
    timeDisplay = `${days}d ${hours}h/s`;
  } else if (hours > 0) {
    timeDisplay = `${hours}h/s`;
  } else if (absDaysPerSecond > 0) {
    // For very small values, show minutes
    const minutesPerDay = Math.floor(absDaysPerSecond * MINUTES_IN_DAY);
    timeDisplay = `${minutesPerDay}min/s`;
  } else {
    timeDisplay = `0/s`;
  }
  
  // Add negative sign if time is flowing backward
  const displayPrefix = daysPerSecond < 0 ? '-' : '';
  
  return {
    scaledValue: daysPerSecond,
    minutesPerSecond: minutesPerSecond,
    formattedTime: `${displayPrefix}${timeDisplay}`
  };
}


// Define speed scale options (balanced before and after the event)
export const speedScale = [
  // Past speeds (negative values) - days
  { label: "-30days", value: -30, daysPerSecond: -30 },
  { label: "-28days", value: -28, daysPerSecond: -28 },
  { label: "-21days", value: -21, daysPerSecond: -21 },
  { label: "-14days", value: -14, daysPerSecond: -14 },
  { label: "-7days", value: -7, daysPerSecond: -7 },
  { label: "-5days", value: -5, daysPerSecond: -5 },
  { label: "-3days", value: -3, daysPerSecond: -3 },
  { label: "-2days", value: -2, daysPerSecond: -2 },
  { label: "-1day", value: -1, daysPerSecond: -1 },

  // Past speeds - hours
  { label: "-24h", value: -1440, daysPerSecond: -1 },
  { label: "-12h", value: -720, daysPerSecond: -1 / 2 },
  { label: "-6h", value: -360, daysPerSecond: -1 / 4 },
  { label: "-3h", value: -180, daysPerSecond: -1 / 8 },
  { label: "-1h", value: -60, daysPerSecond: -1 / 24 },

  // Past speeds - minutes
  { label: "-45min", value: -45, daysPerSecond: -45 / 1440 },
  { label: "-30min", value: -30, daysPerSecond: -30 / 1440 },
  { label: "-15min", value: -15, daysPerSecond: -15 / 1440 },
  { label: "-10min", value: -10, daysPerSecond: -10 / 1440 },
  { label: "-5min", value: -5, daysPerSecond: -5 / 1440 },
  { label: "-2min", value: -2, daysPerSecond: -2 / 1440 },
  { label: "-1min", value: -1, daysPerSecond: -1 / 1440 },

  // Real-time
  { label: "Real-time", value: 0, daysPerSecond: 1 / 86400 }, // 1 second per day

  // Future speeds - minutes
  { label: "+1min", value: 1, daysPerSecond: 1 / 1440 },
  { label: "+2min", value: 2, daysPerSecond: 1 / 720 },
  { label: "+5min", value: 5, daysPerSecond: 1 / 288 },
  { label: "+10min", value: 10, daysPerSecond: 1 / 144 },
  { label: "+15min", value: 15, daysPerSecond: 1 / 96 },
  { label: "+30min", value: 30, daysPerSecond: 1 / 48 },
  { label: "+45min", value: 45, daysPerSecond: 1 / 32 },

  // Future speeds - hours
  { label: "+1h", value: 60, daysPerSecond: 1 / 24 },
  { label: "+2h", value: 120, daysPerSecond: 1 / 12 },
  { label: "+3h", value: 180, daysPerSecond: 1 / 8 },
  { label: "+4h", value: 240, daysPerSecond: 1 / 6 },
  { label: "+6h", value: 360, daysPerSecond: 1 / 4 },
  { label: "+12h", value: 720, daysPerSecond: 1 / 2 },
  { label: "+24h", value: 1440, daysPerSecond: 1 },

  // Future speeds - days
  { label: "+1day", value: 1, daysPerSecond: 1 },
  { label: "+2days", value: 2, daysPerSecond: 2 },
  { label: "+3days", value: 3, daysPerSecond: 3 },
  { label: "+5days", value: 5, daysPerSecond: 5 },
  { label: "+7days", value: 7, daysPerSecond: 7 },
  { label: "+14days", value: 14, daysPerSecond: 14 },
  { label: "+21days", value: 21, daysPerSecond: 21 },
  { label: "+28days", value: 28, daysPerSecond: 28 },
  { label: "+30days", value: 30, daysPerSecond: 30 },
];
 