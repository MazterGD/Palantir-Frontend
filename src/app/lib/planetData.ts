import { OrbitElements } from "../components/three/orbitGenerator";
import { auToKm } from "./scalingUtils"; // NEW import

export const J2000_EPOCH = 2451545.0;

// Helper to convert degrees -> radians
const degToRad = (d: number) => (d * Math.PI) / 180;

interface PlanetData extends OrbitElements {
  diameter: number; // kilometers
  color: string;
  rotationPeriod: number; // in days (converted)
  axisTilt: number; // in radians
}

const createPlanet = (
  data: Omit<PlanetData, "epoch" | "perihelionTime"> & {
    perihelionTime?: number;
  },
): PlanetData => ({
  ...data,
  epoch: J2000_EPOCH,
  perihelionTime: data.perihelionTime ?? J2000_EPOCH,
});

export const PLANETS = {
  mercury: createPlanet({
    semiMajorAxis: auToKm(0.38709927),
    eccentricity: 0.20563593,
    inclination: degToRad(7.00497902),
    ascendingNode: degToRad(48.33076593),
    perihelionArgument: degToRad(29.12495593),
    orbitalPeriod: 87.969, // days
    meanAnomaly: degToRad(174.7934335),
    meanMotion: (2 * Math.PI) / 87.969, // rad/day
    diameter: 487900,
    color: "hsla(0, 0%, 67%, 1.00)",
    rotationPeriod: 1407.5 / 24, // hours -> days
    axisTilt: degToRad(0.034),
  }),
  venus: createPlanet({
    semiMajorAxis: auToKm(0.72333566),
    eccentricity: 0.00677672,
    inclination: degToRad(3.39467605),
    ascendingNode: degToRad(76.67984255),
    perihelionArgument: degToRad(54.92262463),
    orbitalPeriod: 224.701,
    meanAnomaly: degToRad(50.37663232),
    meanMotion: (2 * Math.PI) / 224.701,
    diameter: 1210400,
    color: "hsla(41, 41%, 62%, 1.00)",
    rotationPeriod: -5832.5 / 24,
    axisTilt: degToRad(177.4),
  }),
  earth: createPlanet({
    semiMajorAxis: auToKm(1.00000261),
    eccentricity: 0.01671123,
    inclination: degToRad(0.00001531),
    ascendingNode: 0.0,
    perihelionArgument: degToRad(102.93768193),
    orbitalPeriod: 365.25636,
    meanAnomaly: degToRad(-2.47311027),
    meanMotion: (2 * Math.PI) / 365.25636,
    diameter: 1275600,
    color: "rgba(127, 157, 209, 1)",
    rotationPeriod: 23.934 / 24,
    axisTilt: degToRad(23.44),
  }),
  mars: createPlanet({
    semiMajorAxis: auToKm(1.52371034),
    eccentricity: 0.0933941,
    inclination: degToRad(1.84969142),
    ascendingNode: degToRad(49.55953891),
    perihelionArgument: degToRad(286.50636141),
    orbitalPeriod: 686.98,
    meanAnomaly: degToRad(19.39019754),
    meanMotion: (2 * Math.PI) / 686.98,
    diameter: 679200,
    color: "hsla(24, 47%, 62%, 1.00)",
    rotationPeriod: 24.622 / 24,
    axisTilt: degToRad(25.19),
  }),
  jupiter: createPlanet({
    semiMajorAxis: auToKm(5.202887),
    eccentricity: 0.04838624,
    inclination: degToRad(1.30439695),
    ascendingNode: degToRad(100.47390909),
    perihelionArgument: degToRad(274.25457074),
    orbitalPeriod: 4332.59,
    meanAnomaly: degToRad(19.66796068),
    meanMotion: (2 * Math.PI) / 4332.59,
    diameter: 14298400,
    color: "hsla(13, 49%, 69%, 1.00)",
    rotationPeriod: 9.925 / 24,
    axisTilt: degToRad(3.13),
  }),
  saturn: createPlanet({
    semiMajorAxis: auToKm(9.53667594),
    eccentricity: 0.05386179,
    inclination: degToRad(2.48599187),
    ascendingNode: degToRad(113.66242448),
    perihelionArgument: degToRad(338.93645383),
    orbitalPeriod: 10759.22,
    meanAnomaly: degToRad(-63.32537025),
    meanMotion: (2 * Math.PI) / 10759.22,
    diameter: 12053600,
    color: "hsla(34, 50%, 72%, 1.00)",
    rotationPeriod: 10.656 / 24,
    axisTilt: degToRad(26.73),
  }),
  uranus: createPlanet({
    semiMajorAxis: auToKm(19.18916464),
    eccentricity: 0.04725744,
    inclination: degToRad(0.77263783),
    ascendingNode: degToRad(74.01692503),
    perihelionArgument: degToRad(96.93735127),
    orbitalPeriod: 30685.4,
    meanAnomaly: degToRad(142.28875948),
    meanMotion: (2 * Math.PI) / 30685.4,
    diameter: 5111800,
    color: "hsla(187, 36%, 63%, 1.00)",
    rotationPeriod: 17.24 / 24,
    axisTilt: degToRad(97.77),
  }),
  neptune: createPlanet({
    semiMajorAxis: auToKm(30.06992276),
    eccentricity: 0.00859048,
    inclination: degToRad(1.77004347),
    ascendingNode: degToRad(131.78422574),
    perihelionArgument: degToRad(273.18631079),
    orbitalPeriod: 60189.0,
    meanAnomaly: degToRad(256.22515642),
    meanMotion: (2 * Math.PI) / 60189.0,
    diameter: 4952800,
    color: "hsla(225, 55%, 73%, 1.00)",
    rotationPeriod: 16.11 / 24,
    axisTilt: degToRad(28.32),
  }),
  pluto: createPlanet({
    semiMajorAxis: auToKm(39.48168677),
    eccentricity: 0.24880766,
    inclination: degToRad(17.14175),
    ascendingNode: degToRad(110.30347),
    perihelionArgument: degToRad(113.76329),
    orbitalPeriod: 90560.0,
    meanAnomaly: degToRad(14.86343323),
    meanMotion: (2 * Math.PI) / 90560.0,
    diameter: 237600,
    color: "#9CA6B7",
    perihelionTime: 2447882.5,
    rotationPeriod: 153.3 / 24,
    axisTilt: degToRad(122.53),
  }),
};

export const getPlanet = (name: keyof typeof PLANETS) => PLANETS[name];

export const PLANET_TEXTURES: Record<
  string,
  Partial<{
    color: string;
    bump: string;
    normal: string;
    specular: string;
    cloud: string;
    daymap: string;
  }>
> = {
  mercury: {
    color: "/textures/Mercury/mercury_color.jpg",
    bump: "/textures/Mercury/mercury_bump.jpg",
  },
  venus: {
    color: "/textures/Venus/venus_color.jpg",
    bump: "/textures/Venus/venus_bump.jpg",
  },
  earth: {
    color: "/textures/Earth/earth_daymap.png",
    normal: "/textures/Earth/earth_normal.png",
    specular: "/textures/Earth/earth_specular.png",
    bump: "/textures/Earth/earth_bump.png",
    cloud: "/textures/Earth/earth_cloud.png",
  },
  mars: {
    color: "/textures/Mars/mars_color.jpg",
    normal: "/textures/Mars/mars_normal.jpg",
  },
  jupiter: {
    color: "/textures/Jupiter/jupiter_color.jpg",
  },
  saturn: {
    color: "/textures/Saturn/saturn_color.jpg",
  },
  uranus: {
    color: "/textures/Uranus/uranus_color.jpg",
  },
  neptune: {
    color: "/textures/Neptune/neptune_color.jpg",
  },
  pluto: {
    color: "/textures/Pluto/pluto_color.jpg",
    bump: "/textures/Pluto/pluto_bump.jpg",
  },
};
