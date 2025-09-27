/**
 * Planet Creation - Three.js planet objects with meshes and orbit lines
 */

import * as THREE from "three";
import { ALL_PLANETS, PLANET_COLORS, PLANET_PHYSICAL_DATA } from "@/app/lib/planetData";
import { OrbitGenerator, ScaledOrbitGenerator, ORBIT_PRESETS } from "../orbitGenerator";

export interface Planet {
  name: string;
  orbitGenerator: ScaledOrbitGenerator;
  diameter: number;
  color: string;
  orbitLine: THREE.Line;
  mesh: THREE.Mesh;
}

function scalePlanetSize(diameterKm: number): number {
  return diameterKm * 0.0001; // Scale factor for reasonable planet sizes
}

function createPlanetMesh(diameter: number, color: string): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(diameter / 2, 16, 16);
  const material = new THREE.MeshPhongMaterial({ color });
  return new THREE.Mesh(geometry, material);
}

export function createPlanet(planetName: string): Planet | null {
  const lowerName = planetName.toLowerCase() as keyof typeof ALL_PLANETS;
  const orbitalElements = ALL_PLANETS[lowerName];
  const physicalData = PLANET_PHYSICAL_DATA[lowerName];

  if (!orbitalElements || !physicalData) {
    console.warn(`Planet data not found for: ${planetName}`);
    return null;
  }

  const orbitGenerator = new OrbitGenerator(orbitalElements);
  const positionScale = 10; // 10 AU = 10 scene units
  const scaledOrbitGenerator = new ScaledOrbitGenerator(orbitGenerator, positionScale);
  
  const scaledDiameter = scalePlanetSize(physicalData.diameter);
  
  // Generate orbit line directly from orbit generator
  const orbitLine = orbitGenerator.generateOrbitLine({
    color: PLANET_COLORS[lowerName],
    scale: positionScale,
    ...ORBIT_PRESETS.standard
  });
  
  const mesh = createPlanetMesh(scaledDiameter, physicalData.color);

  return {
    name: planetName,
    orbitGenerator: scaledOrbitGenerator,
    diameter: scaledDiameter,
    color: physicalData.color,
    orbitLine,
    mesh,
  };
}

export function createAllPlanets(): Planet[] {
  return Object.keys(ALL_PLANETS)
    .map(planetName => createPlanet(planetName))
    .filter(planet => planet !== null) as Planet[];
}
