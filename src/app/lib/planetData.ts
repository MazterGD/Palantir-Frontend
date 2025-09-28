import { OrbitElements } from "../components/three/orbitGenerator";

export const J2000_EPOCH = 2451545.0;

interface PlanetData extends OrbitElements {
  diameter: number;
  color: string;
  rotationPeriod: number; // in hours
  axisTilt: number; // in degrees
}

const createPlanet = (
  data: Omit<PlanetData, "epoch" | "perihelionTime"> & {
    perihelionTime?: number;
  }
): PlanetData => ({
  ...data,
  epoch: J2000_EPOCH,
  perihelionTime: data.perihelionTime ?? J2000_EPOCH,
});

export const PLANETS = {
  mercury: createPlanet({
    semiMajorAxis: 0.38709927,
    eccentricity: 0.20563593,
    inclination: 7.00497902,
    ascendingNode: 48.33076593,
    perihelionArgument: 29.12495593,
    orbitalPeriod: 87.969,
    meanAnomaly: 174.7934335,
    meanMotion: 4.09233445,
    diameter: 4879,
    color: "hsla(0, 0%, 67%, 1.00)",
    rotationPeriod: 1407.5,
    axisTilt: 0.034,
  }),
  venus: createPlanet({
    semiMajorAxis: 0.72333566,
    eccentricity: 0.00677672,
    inclination: 3.39467605,
    ascendingNode: 76.67984255,
    perihelionArgument: 54.92262463,
    orbitalPeriod: 224.701,
    meanAnomaly: 50.37663232,
    meanMotion: 1.60213034,
    diameter: 12104,
    color: "hsla(41, 41%, 62%, 1.00)",
    rotationPeriod: -5832.5,
    axisTilt: 177.4,
  }),
  earth: createPlanet({
    semiMajorAxis: 1.00000261,
    eccentricity: 0.01671123,
    inclination: 0.00001531,
    ascendingNode: 0.0,
    perihelionArgument: 102.93768193,
    orbitalPeriod: 365.25636,
    meanAnomaly: -2.47311027,
    meanMotion: 0.98560026,
    diameter: 12756,
    color: "rgba(127, 157, 209, 1)",
    rotationPeriod: 23.934,
    axisTilt: 23.44,
  }),
  mars: createPlanet({
    semiMajorAxis: 1.52371034,
    eccentricity: 0.0933941,
    inclination: 1.84969142,
    ascendingNode: 49.55953891,
    perihelionArgument: 286.50636141,
    orbitalPeriod: 686.98,
    meanAnomaly: 19.39019754,
    meanMotion: 0.52402068,
    diameter: 6792,
    color: "hsla(24, 47%, 62%, 1.00)",
    rotationPeriod: 24.622,
    axisTilt: 25.19,
  }),
  jupiter: createPlanet({
    semiMajorAxis: 5.202887,
    eccentricity: 0.04838624,
    inclination: 1.30439695,
    ascendingNode: 100.47390909,
    perihelionArgument: 274.25457074,
    orbitalPeriod: 4332.59,
    meanAnomaly: 19.66796068,
    meanMotion: 0.0830853,
    diameter: 142984,
    color: "hsla(13, 49%, 69%, 1.00)",
    rotationPeriod: 9.925,
    axisTilt: 3.13,
  }),
  saturn: createPlanet({
    semiMajorAxis: 9.53667594,
    eccentricity: 0.05386179,
    inclination: 2.48599187,
    ascendingNode: 113.66242448,
    perihelionArgument: 338.93645383,
    orbitalPeriod: 10759.22,
    meanAnomaly: -63.32537025,
    meanMotion: 0.03344414,
    diameter: 120536,
    color: "hsla(34, 50%, 72%, 1.00)",
    rotationPeriod: 10.656,
    axisTilt: 26.73,
  }),
  uranus: createPlanet({
    semiMajorAxis: 19.18916464,
    eccentricity: 0.04725744,
    inclination: 0.77263783,
    ascendingNode: 74.01692503,
    perihelionArgument: 96.93735127,
    orbitalPeriod: 30685.4,
    meanAnomaly: 142.28875948,
    meanMotion: 0.01172834,
    diameter: 51118,
    color: "hsla(187, 36%, 63%, 1.00)",
    rotationPeriod: 17.24,
    axisTilt: 97.77,
  }),
  neptune: createPlanet({
    semiMajorAxis: 30.06992276,
    eccentricity: 0.00859048,
    inclination: 1.77004347,
    ascendingNode: 131.78422574,
    perihelionArgument: 273.18631079,
    orbitalPeriod: 60189.0,
    meanAnomaly: 256.22515642,
    meanMotion: 0.00598103,
    diameter: 49528,
    color: "hsla(225, 55%, 73%, 1.00)",
    rotationPeriod: 16.11,
    axisTilt: 28.32,
  }),
  pluto: createPlanet({
    semiMajorAxis: 39.48168677,
    eccentricity: 0.24880766,
    inclination: 17.14175,
    ascendingNode: 110.30347,
    perihelionArgument: 113.76329,
    orbitalPeriod: 90560.0,
    meanAnomaly: 14.86343323,
    meanMotion: 0.003973966,
    diameter: 2376,
    color: "#9CA6B7",
    perihelionTime: 2447882.5,
    rotationPeriod: 153.3,
    axisTilt: 122.53,
  }),
};

export const getPlanet = (name: keyof typeof PLANETS) => PLANETS[name];

export const PLANET_TEXTURES: Record<string, Partial<{
  color: string;
  bump: string;
  normal: string;
  specular: string;
  cloud: string;
  daymap: string;
}>> = {
  mercury: {
    color: "/textures/mercury/mercury_color.jpg",
    bump: "/textures/mercury/mercury_bump.jpg",
  },
  venus: {
    color: "/textures/venus/venus_color.jpg",
    bump: "/textures/venus/venus_bump.jpg",
  },
  earth: {
    color: "/textures/earth/earth_daymap.png",
    normal: "/textures/earth/earth_normal.png",
    specular: "/textures/earth/earth_specular.png",
    bump: "/textures/earth/earth_bump.png",
    cloud: "/textures/earth/earth_cloud.png",
  },
  mars: {
    color: "/textures/mars/mars_color.jpg",
    normal: "/textures/mars/mars_normal.jpg",
  },
  jupiter: {
    color: "/textures/jupiter/jupiter_color.jpg",
  },
  saturn: {
    color: "/textures/saturn/saturn_color.jpg",
  },
  uranus: {
    color: "/textures/uranus/uranus_color.jpg",
  },
  neptune: {
    color: "/textures/neptune/neptune_color.jpg",
  },
  pluto: {
    color: "/textures/pluto/pluto_color.jpg",
    bump: "/textures/pluto/pluto_bump.jpg",
  }
};
