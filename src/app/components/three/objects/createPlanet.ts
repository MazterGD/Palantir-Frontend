import * as THREE from "three";
import { PLANETS, planetToOrbitalElements } from "@/app/lib/planetData";
import { EllipticalOrbitGenerator, DegreesToRadians } from "../orbitGenerator";
import {
  scalePlanetSize,
  getScaledPlanetElements,
} from "@/app/lib/scalingUtils";

export interface Planet {
  name: string;
  orbitGenerator: EllipticalOrbitGenerator;
  diameter: number; // scaled render units
  color?: string;
  orbitLine: THREE.Line;
}

export function createPlanet(planetName: string): Planet | null {
  const planetData = PLANETS[planetName.toLowerCase()];
  if (!planetData) {
    return null;
  }

  // Convert to orbital elements and scale
  const orbitalElements = planetToOrbitalElements(planetData, DegreesToRadians);
  const scaledElements = getScaledPlanetElements(orbitalElements);

  // Create orbit generator
  const orbitGenerator = new EllipticalOrbitGenerator(scaledElements);

  // Scale physical properties
  const scaledDiameter = scalePlanetSize(planetData.diameter);

  // Create orbit line
  const orbitPoints = orbitGenerator.generateOrbitLine(100);
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
  const orbitMaterial = new THREE.LineBasicMaterial({
    color: 0x444444,
    transparent: true,
    opacity: 0.3,
  });
  const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);

  return {
    name: planetData.name,
    orbitGenerator,
    diameter: scaledDiameter,
    color: getPlanetColor(planetName),
    orbitLine,
  };
}

export function createAllPlanets(): Planet[] {
  return Object.keys(PLANETS)
    .map((planetName) => createPlanet(planetName))
    .filter((planet) => planet !== null) as Planet[];
}

function getPlanetColor(planetName: string): string {
  const colors: Record<string, string> = {
    mercury: "#8C7853",
    venus: "#FFC649",
    earth: "#6B93D6",
    mars: "#C1440E",
    jupiter: "#D8CA9D",
    saturn: "#FAD5A5",
    uranus: "#4FD0E4",
    neptune: "#4B70DD",
  };

  return colors[planetName.toLowerCase()] || "#CCCCCC";
}
