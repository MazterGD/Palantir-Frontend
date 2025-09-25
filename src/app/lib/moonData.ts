import { MoonData } from "../components/three/objects/createMoon";

export const EARTH_MOONS: MoonData[] = [
  {
    name: "Moon",
    radius: 1737, // km (actual radius)
    orbitRadius: 384400, // km (average distance from Earth)
    orbitPeriod: 27.3, // days (27.3 days)
    rotationPeriod: 27.3, // days (tidally locked)
    texture: "/textures/moons/moon.jpg",
    inclination: 5.1, // degrees to Earth's orbital plane
    eccentricity: 0.0549,
  },
];

export const MARS_MOONS: MoonData[] = [
  {
    name: "Phobos",
    radius: 11.3, // km (average radius)
    orbitRadius: 9376, // km from Mars
    orbitPeriod: 0.32, // days (7.6 hours)
    rotationPeriod: 0.32, // days (tidally locked)
    texture: "/textures/moons/phobos.jpg",
    color: 0x8b4513,
    inclination: 1.1, // degrees
    eccentricity: 0.0151,
  },
  {
    name: "Deimos",
    radius: 6.2, // km (average radius)
    orbitRadius: 23463, // km from Mars
    orbitPeriod: 1.26, // days (30.3 hours)
    rotationPeriod: 1.26, // days (tidally locked)
    texture: "/textures/moons/deimos.jpg",
    color: 0x696969,
    inclination: 1.8, // degrees
    eccentricity: 0.0002,
  },
];

export const JUPITER_MOONS: MoonData[] = [
  {
    name: "Io",
    radius: 1821.6, // km
    orbitRadius: 421700, // km from Jupiter
    orbitPeriod: 1.77, // days
    rotationPeriod: 1.77, // days
    texture: "/textures/moons/io.jpg",
    color: 0xffff80,
    inclination: 0.036, // degrees
    eccentricity: 0.0041,
  },
  {
    name: "Europa",
    radius: 1560.8, // km
    orbitRadius: 671034, // km from Jupiter
    orbitPeriod: 3.55, // days
    rotationPeriod: 3.55, // days
    texture: "/textures/moons/europa.jpg",
    color: 0xe0e0e0,
    inclination: 0.466, // degrees
    eccentricity: 0.009,
  },
  {
    name: "Ganymede",
    radius: 2634.1, // km
    orbitRadius: 1070412, // km from Jupiter
    orbitPeriod: 7.15, // days
    rotationPeriod: 7.15, // days
    texture: "/textures/moons/ganymede.jpg",
    color: 0xa0a0a0,
    inclination: 0.177, // degrees
    eccentricity: 0.0013,
  },
  {
    name: "Callisto",
    radius: 2410.3, // km
    orbitRadius: 1882709, // km from Jupiter
    orbitPeriod: 16.69, // days
    rotationPeriod: 16.69, // days
    texture: "/textures/moons/callisto.jpg",
    color: 0x404040,
    inclination: 0.192, // degrees
    eccentricity: 0.0074,
  },
];
