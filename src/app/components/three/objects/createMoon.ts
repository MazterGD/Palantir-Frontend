import * as THREE from "three";
import { MOONS, moonToOrbitalElements, getMoonsForPlanet } from "@/app/lib/moonData";
import { EllipticalOrbitGenerator, DegreesToRadians } from "../orbitGenerator";
import {
  getRealisticMoonSize,
  getRealisticMoonElements,
  getSphereDetail,
} from "@/app/lib/scalingUtils";

export interface Moon {
  name: string;
  parentPlanet: string;
  orbitGenerator: EllipticalOrbitGenerator;
  diameter: number; // realistic render units
  radius: number; // realistic render units
  color?: string;
  orbitLine: THREE.Line;
  realDiameterKm: number;
  realOrbitDistanceKm: number;
  isRetrograde: boolean;
}

export function createMoon(moonName: string): Moon | null {
  const moonData = MOONS[moonName.toLowerCase()];
  if (!moonData) {
    return null;
  }

  // Convert to orbital elements and apply realistic scaling
  const orbitalElements = moonToOrbitalElements(moonData, DegreesToRadians);
  const realisticElements = getRealisticMoonElements(orbitalElements);

  // Create orbit generator
  const orbitGenerator = new EllipticalOrbitGenerator(realisticElements);

  // Get realistic physical properties
  const realisticDiameter = getRealisticMoonSize(moonData.diameter);
  const realisticRadius = realisticDiameter / 2;

  // Determine appropriate detail level based on moon size
  // Very small moons (< 0.1 render units diameter) get minimal detail
  const detail = realisticDiameter < 0.1 
    ? { widthSegments: 8, heightSegments: 8 }
    : getSphereDetail(realisticDiameter, realisticElements.semiMajorAxis);

  // Create orbit line - more subtle than planet orbits
  const orbitPointCount = Math.max(20, Math.min(100, Math.floor(realisticElements.semiMajorAxis / 10)));
  const orbitPoints = orbitGenerator.generateOrbitLine(orbitPointCount);
  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
  
  // Moon orbit lines are very subtle and color-coded
  const orbitMaterial = new THREE.LineBasicMaterial({
    color: getMoonColor(moonName),
    transparent: true,
    opacity: 0.2, // Very subtle
  });
  const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);

  return {
    name: moonData.name,
    parentPlanet: moonData.parentPlanet,
    orbitGenerator,
    diameter: realisticDiameter,
    radius: realisticRadius,
    color: getMoonColor(moonName),
    orbitLine,
    realDiameterKm: moonData.diameter,
    realOrbitDistanceKm: moonData.semiMajorAxis,
    isRetrograde: moonData.orbitalPeriod < 0
  };
}

export function createMoonMesh(moon: Moon): THREE.Mesh {
  // Determine sphere detail based on moon size
  const detail = moon.diameter < 0.1 
    ? { widthSegments: 8, heightSegments: 8 }
    : getSphereDetail(moon.diameter, moon.realOrbitDistanceKm / 10000);
  
  const geometry = new THREE.SphereGeometry(
    moon.radius,
    detail.widthSegments,
    detail.heightSegments
  );

  // Load moon texture if available, otherwise use procedural material
  const textureLoader = new THREE.TextureLoader();
  let material: THREE.MeshPhongMaterial;

  try {
    const texture = textureLoader.load(`/textures/moons/${moon.name.toLowerCase()}.jpg`);
    material = new THREE.MeshPhongMaterial({
      map: texture,
      shininess: 1, // Moons are generally not very reflective
    });
  } catch {
    // Fallback to colored material based on moon characteristics
    material = new THREE.MeshPhongMaterial({
      color: moon.color || getMoonDefaultColor(moon.name),
      shininess: 1,
    });
  }

  const mesh = new THREE.Mesh(geometry, material);
  
  // Add moon rotation - most moons are tidally locked (synchronous rotation)
  // Synchronous rotation means rotation period = orbital period
  const orbitalPeriodSeconds = moon.orbitGenerator.getElements().orbitalPeriod;
  const rotationRate = (2 * Math.PI) / orbitalPeriodSeconds;

  // Store rotation info on mesh for animation
  (mesh as any).rotationRate = rotationRate;
  (mesh as any).accumulatedRotation = 0;
  (mesh as any).isRetrograde = moon.isRetrograde;

  // Configure shadows - moons cast and receive shadows
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  return mesh;
}

export function createMoonsForPlanet(planetName: string): Moon[] {
  const moonData = getMoonsForPlanet(planetName);
  return moonData
    .map(moon => createMoon(moon.name.toLowerCase()))
    .filter(moon => moon !== null) as Moon[];
}

export function createAllMoons(): Record<string, Moon[]> {
  const result: Record<string, Moon[]> = {};
  
  // Get unique planet names that have moons
  const planetsWithMoons = [...new Set(Object.values(MOONS).map(moon => moon.parentPlanet))];
  
  planetsWithMoons.forEach(planetName => {
    result[planetName] = createMoonsForPlanet(planetName);
  });

  return result;
}

export function updateMoonRotation(mesh: THREE.Mesh, deltaTimeSeconds: number = 86400) {
  if ((mesh as any).rotationRate) {
    const rotationDirection = (mesh as any).isRetrograde ? -1 : 1;
    (mesh as any).accumulatedRotation += (mesh as any).rotationRate * deltaTimeSeconds * rotationDirection;
    mesh.rotation.y = (mesh as any).accumulatedRotation;
  }
}

// Position moon relative to its parent planet
export function updateMoonPosition(
  moonMesh: THREE.Mesh, 
  moon: Moon, 
  parentPlanetPosition: THREE.Vector3, 
  currentTime: number
): void {
  // Get moon's position relative to parent planet
  const moonOrbitPosition = moon.orbitGenerator.getPositionAtTime(currentTime);
  
  // Add parent planet's position to get absolute position
  moonMesh.position.set(
    parentPlanetPosition.x + moonOrbitPosition.position.x,
    parentPlanetPosition.y + moonOrbitPosition.position.y,
    parentPlanetPosition.z + moonOrbitPosition.position.z
  );
}

function getMoonColor(moonName: string): string {
  const colors: Record<string, string> = {
    // Earth's moon
    luna: "#C0C0C0",
    
    // Mars' moons
    phobos: "#8C6239",
    deimos: "#8C6239",
    
    // Jupiter's moons
    io: "#FFFF99",        // Sulfur yellow
    europa: "#87CEEB",    // Ice blue
    ganymede: "#8B7355",  // Brown-gray
    callisto: "#2F2F2F",  // Dark gray
    
    // Saturn's moons
    mimas: "#D3D3D3",     // Light gray
    titan: "#FFA500",     // Orange (atmosphere)
    iapetus: "#696969",   // Two-tone, using gray
    
    // Uranus' moons
    miranda: "#8B8989",   // Gray
    titania: "#A0A0A0",   // Light gray
    
    // Neptune's moon
    triton: "#FFB6C1",    // Pink (nitrogen ice)
  };

  return colors[moonName.toLowerCase()] || "#CCCCCC";
}

function getMoonDefaultColor(moonName: string): number {
  const colorHex = getMoonColor(moonName);
  return parseInt(colorHex.replace('#', '0x'));
}

// Helper function to get moon information
export function getMoonInfo(moon: Moon) {
  const elements = moon.orbitGenerator.getElements();
  return {
    name: moon.name,
    parentPlanet: moon.parentPlanet,
    realDiameterKm: moon.realDiameterKm,
    renderDiameter: moon.diameter,
    renderRadius: moon.radius,
    realOrbitDistanceKm: moon.realOrbitDistanceKm,
    renderOrbitDistance: elements.semiMajorAxis,
    orbitalPeriodDays: elements.orbitalPeriod / (24 * 3600),
    orbitalPeriodHours: elements.orbitalPeriod / 3600,
    eccentricity: elements.eccentricity,
    isRetrograde: moon.isRetrograde,
    isTidallyLocked: true, // Most moons are tidally locked
  };
}

// Helper to check if a moon is visible at current scale
export function isMoonVisible(moon: Moon, cameraDistance: number): boolean {
  // Moon is visible if its angular size is at least 1 pixel
  const angularSize = moon.diameter / cameraDistance;
  return angularSize > 0.0001; // Roughly 1 pixel at typical screen resolutions
}

// Get recommended camera distance to view a planet's moon system
export function getMoonSystemViewDistance(planetName: string): number {
  const moons = createMoonsForPlanet(planetName);
  if (moons.length === 0) return 1000;

  // Find the farthest moon
  const maxDistance = Math.max(...moons.map(moon => 
    moon.orbitGenerator.getElements().semiMajorAxis
  ));

  // Camera should be 3-5x the farthest moon's distance
  return maxDistance * 4;
}
