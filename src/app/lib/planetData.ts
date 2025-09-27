/**
 * Planetary Orbital Data (NASA JPL 2025)
 * Simplified constants for orbit generation
 */

import { OrbitElements } from "../components/three/orbitGenerator";

// Current epoch (J2000.0)
export const J2000_EPOCH = 2451545.0;

// Mercury
export const MERCURY: OrbitElements = {
  semiMajorAxis: 0.38709927,
  eccentricity: 0.20563593,
  inclination: 7.00497902,
  ascendingNode: 48.33076593,
  perihelionArgument: 29.12495593,
  orbitalPeriod: 87.969,
  perihelionTime: J2000_EPOCH,
  meanAnomaly: 174.79343350,
  meanMotion: 4.09233445,
  epoch: J2000_EPOCH
};

// Venus
export const VENUS: OrbitElements = {
  semiMajorAxis: 0.72333566,
  eccentricity: 0.00677672,
  inclination: 3.39467605,
  ascendingNode: 76.67984255,
  perihelionArgument: 54.92262463,
  orbitalPeriod: 224.701,
  perihelionTime: J2000_EPOCH,
  meanAnomaly: 50.37663232,
  meanMotion: 1.60213034,
  epoch: J2000_EPOCH
};

// Earth
export const EARTH: OrbitElements = {
  semiMajorAxis: 1.00000261,
  eccentricity: 0.01671123,
  inclination: 0.00001531,
  ascendingNode: 0.0,
  perihelionArgument: 102.93768193,
  orbitalPeriod: 365.25636,
  perihelionTime: J2000_EPOCH,
  meanAnomaly: -2.47311027,
  meanMotion: 0.98560026,
  epoch: J2000_EPOCH
};

// Mars
export const MARS: OrbitElements = {
  semiMajorAxis: 1.52371034,
  eccentricity: 0.09339410,
  inclination: 1.84969142,
  ascendingNode: 49.55953891,
  perihelionArgument: 286.50636141,
  orbitalPeriod: 686.98,
  perihelionTime: J2000_EPOCH,
  meanAnomaly: 19.39019754,
  meanMotion: 0.52402068,
  epoch: J2000_EPOCH
};

// Jupiter
export const JUPITER: OrbitElements = {
  semiMajorAxis: 5.20288700,
  eccentricity: 0.04838624,
  inclination: 1.30439695,
  ascendingNode: 100.47390909,
  perihelionArgument: 274.25457074,
  orbitalPeriod: 4332.59,
  perihelionTime: J2000_EPOCH,
  meanAnomaly: 19.66796068,
  meanMotion: 0.08308530,
  epoch: J2000_EPOCH
};

// Saturn
export const SATURN: OrbitElements = {
  semiMajorAxis: 9.53667594,
  eccentricity: 0.05386179,
  inclination: 2.48599187,
  ascendingNode: 113.66242448,
  perihelionArgument: 338.93645383,
  orbitalPeriod: 10759.22,
  perihelionTime: J2000_EPOCH,
  meanAnomaly: -63.32537025,
  meanMotion: 0.03344414,
  epoch: J2000_EPOCH
};

// Uranus
export const URANUS: OrbitElements = {
  semiMajorAxis: 19.18916464,
  eccentricity: 0.04725744,
  inclination: 0.77263783,
  ascendingNode: 74.01692503,
  perihelionArgument: 96.93735127,
  orbitalPeriod: 30685.4,
  perihelionTime: J2000_EPOCH,
  meanAnomaly: 142.28875948,
  meanMotion: 0.01172834,
  epoch: J2000_EPOCH
};

// Neptune
export const NEPTUNE: OrbitElements = {
  semiMajorAxis: 30.06992276,
  eccentricity: 0.00859048,
  inclination: 1.77004347,
  ascendingNode: 131.78422574,
  perihelionArgument: 273.18631079,
  orbitalPeriod: 60189.0,
  perihelionTime: J2000_EPOCH,
  meanAnomaly: 256.22515642,
  meanMotion: 0.00598103,
  epoch: J2000_EPOCH
};

// Pluto (dwarf planet)
export const PLUTO: OrbitElements = {
  semiMajorAxis: 39.48168677,
  eccentricity: 0.24880766,
  inclination: 17.14175,
  ascendingNode: 110.30347,
  perihelionArgument: 113.76329,
  orbitalPeriod: 90560.0,
  perihelionTime: 2447882.5, // Jan 13, 1990
  meanAnomaly: 14.86343323,
  meanMotion: 0.003973966,
  epoch: J2000_EPOCH
};

// All planets including Pluto
export const ALL_PLANETS = {
  mercury: MERCURY,
  venus: VENUS,
  earth: EARTH,
  mars: MARS,
  jupiter: JUPITER,
  saturn: SATURN,
  uranus: URANUS,
  neptune: NEPTUNE,
  pluto: PLUTO
};

// Traditional 8 planets
export const PLANETS = {
  mercury: MERCURY,
  venus: VENUS,
  earth: EARTH,
  mars: MARS,
  jupiter: JUPITER,
  saturn: SATURN,
  uranus: URANUS,
  neptune: NEPTUNE
};

// Planet names
export const PLANET_NAMES = Object.keys(ALL_PLANETS);

// Get planet data
export function getPlanet(name: keyof typeof ALL_PLANETS): OrbitElements {
  return ALL_PLANETS[name];
}

// Constants
export const AU_TO_KM = 149597870.7;
export const SECONDS_PER_DAY = 86400;
export const DAYS_PER_YEAR = 365.25;

// Planetary color presets for orbit lines
export const PLANET_COLORS = {
  mercury: '#8C7853',
  venus: '#FFC649', 
  earth: '#6B93D6',
  mars: '#CD5C5C',
  jupiter: '#D8CA9D',
  saturn: '#FAD5A5',
  uranus: '#4FD0E7',
  neptune: '#4B70DD',
  pluto: '#9CA6B7'
};

// Planet physical data for scaling
export const PLANET_PHYSICAL_DATA = {
  mercury: { diameter: 4879, color: PLANET_COLORS.mercury },
  venus: { diameter: 12104, color: PLANET_COLORS.venus },
  earth: { diameter: 12756, color: PLANET_COLORS.earth },
  mars: { diameter: 6792, color: PLANET_COLORS.mars },
  jupiter: { diameter: 142984, color: PLANET_COLORS.jupiter },
  saturn: { diameter: 120536, color: PLANET_COLORS.saturn },
  uranus: { diameter: 51118, color: PLANET_COLORS.uranus },
  neptune: { diameter: 49528, color: PLANET_COLORS.neptune },
  pluto: { diameter: 2376, color: PLANET_COLORS.pluto },
};
