import * as THREE from "three";
import { JUPITER_MOONS, MARS_MOONS } from "@/app/lib/moonData";
import { createPlanet, PlanetConfig } from "./createPlanet";

// Mercury configuration
export function createMercury() {
  const mercuryConfig: PlanetConfig = {
    name: 'mercury',
    textures: {
      map: '/textures/mercury/mercury_color.jpg',
      bumpMap: '/textures/mercury/mercury_bump.jpg',
    },
    moonData: [], // Mercury has no moons
    orbitColor: 0x8c7853,        // Gray-brown orbit
    rotationSpeed: 0.0017,       // Very slow rotation (59 Earth days)
    axialTilt: 0.034,            // Almost no tilt
    bumpScale: 0.05,             // Pronounced crater bumps
  };

  return createPlanet(mercuryConfig);
}

// Venus configuration
export function createVenus() {
  const venusConfig: PlanetConfig = {
    name: 'venus',
    textures: {
      map: '/textures/venus/venus_color.jpg',
      bumpMap: '/textures/venus/venus_bump.jpg',
    },
    moonData: [], // Venus has no moons
    orbitColor: 0xffc649,        // Yellow-orange orbit
    rotationSpeed: -0.00006,     // Venus rotates backwards very slowly (243 Earth days)
    axialTilt: 177.4,            // Nearly upside down
  };

  return createPlanet(venusConfig);
}

// Mars configuration
export function createMars() {
  const marsConfig: PlanetConfig = {
    name: 'mars',
    textures: {
      map: '/textures/mars/mars_color.jpg',
      normalMap: '/textures/mars/mars_normal.jpg',
    },
    moonData: MARS_MOONS,
    orbitColor: 0xff4444,        // Red orbit line
    rotationSpeed: 0.0097,       // Mars day is ~24.6 hours
    axialTilt: 25.2,             // Mars's axial tilt in degrees
  };

  return createPlanet(marsConfig);
}

// Jupiter configuration (gas giant)
export function createJupiter() {
  const jupiterConfig: PlanetConfig = {
    name: 'jupiter',
    textures: {
      map: '/textures/jupiter/jupiter_color.jpg',
    },
    moonData: JUPITER_MOONS,     // Io, Europa, Ganymede, Callisto
    orbitColor: 0xd8ca9d,        // Tan orbit line
    rotationSpeed: 0.024,        // Jupiter rotates very fast (~10 hours)
    axialTilt: 3.1,              // Small axial tilt
    normalScale: new THREE.Vector2(0.5, 0.5), // Subtle normal mapping for gas bands
  };

  return createPlanet(jupiterConfig);
}

// Saturn configuration (with rings - would need additional ring geometry)
export function createSaturn() {
  const saturnConfig: PlanetConfig = {
    name: 'saturn',
    textures: {
      map: '/textures/saturn/saturn_color.jpg',
    },
    moonData: [], // Can add major moons like Titan, Enceladus
    orbitColor: 0xfad5a5,        // Pale yellow orbit
    rotationSpeed: 0.023,        // Fast rotation (~10.7 hours)
    axialTilt: 26.7,             // Similar tilt to Earth
    normalScale: new THREE.Vector2(0.3, 0.3), // Subtle banding
  };

  return createPlanet(saturnConfig);
}
