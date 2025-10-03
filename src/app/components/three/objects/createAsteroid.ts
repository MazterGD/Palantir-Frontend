import * as THREE from "three";
import { OrbitGenerator, ScaledOrbitGenerator, ORBIT_PRESETS } from "../orbitGenerator";
import { AsteroidData } from "@/app/lib/asteroidData";
import { addObjectLabel } from "../objectLabel";
import { createLabel } from "../objectTextLables";

export interface Asteroid {
  id: string;
  name: string;
  orbitGenerator: ScaledOrbitGenerator;
  diameter: number;
  color: string;
  orbitLine: THREE.Object3D;
  mesh: THREE.Group;
  haloSprite?: THREE.Sprite;
  labelSprite?: THREE.Sprite;
  setHaloHighlight?: (highlighted: boolean) => void;
  setLabelHighlight?: (highlighted: boolean) => void;
}

export const createAsteroid = (
  asteroidData: AsteroidData,
  camera: THREE.Camera,
  halos_and_labels: (() => void)[]
): Asteroid => {
  const { id, name, diameter, color, ...orbitElements } = asteroidData;
  
  const orbitGenerator = new OrbitGenerator(orbitElements);
  const positionScale = 100;
  
  // Create orbit line using subtle preset
  const orbitLine = orbitGenerator.generateOrbitLine({
    color: "#ffffff", // White color for orbit
    scale: positionScale,
    ...ORBIT_PRESETS.subtle, // Spread the subtle preset properties
  });

  // Store original orbit line properties for highlighting
  (orbitLine as any).originalOpacity = ORBIT_PRESETS.subtle.opacity;
  (orbitLine as any).originalLineWidth = ORBIT_PRESETS.subtle.lineWidth;
  (orbitLine as any).originalEmissiveIntensity = ORBIT_PRESETS.subtle.emissiveIntensity;

  // Make orbit line emissive
  if (orbitLine.material) {
    (orbitLine.material as any).emissive = new THREE.Color(0xffffff);
    (orbitLine.material as any).emissiveIntensity = 0.3;
  }
  
  // Create asteroid as OctahedronGeometry with white emissive material
  const geometry = new THREE.OctahedronGeometry(0.05, 0);
  const material = new THREE.MeshPhongMaterial({
    color: color,
    shininess: 50,
    specular: new THREE.Color(0x333333),
    emissive: new THREE.Color(0xffffff), // White emissive
    emissiveIntensity: 0.2, // Moderate emissive intensity
    transparent: true,
    opacity: 0.9,
  });
  
  const mesh = new THREE.Mesh(geometry, material);
  
  // Create a group for the asteroid
  const asteroidGroup = new THREE.Group();
  asteroidGroup.add(mesh);
  
  // Load the same texture used by planets for consistency
  const haloTexture = new THREE.TextureLoader().load("/textures/Sprites/circle.png");
  
  // Add white halo to the asteroid mesh
  const haloResult = addObjectLabel(mesh as any, camera, {
    texture: haloTexture,
    color: 0xffffff, // White color for halo
    size: 0.4,
    opacity: 0.7, // Slightly more opaque
    minDistance: 50,
    maxDistance: 5000,
    fadeNear: 10,
    fadeFar: 1500,
  });
  
  // Add label to the asteroid group - ALWAYS VISIBLE
  const labelResult = createLabel(asteroidGroup as any, name, camera, {
    fontSize: 16,
    color: "#ffffff", // White color for label
    minDistance: 1,    // Always visible even when very close
    maxDistance: 100000, // Very large max distance to ensure it's always visible
    opacity: 1.0,      // Full opacity
  });
  
  halos_and_labels.push(haloResult.update);
  halos_and_labels.push(labelResult.update);
  
  return {
    id,
    name,
    orbitGenerator: new ScaledOrbitGenerator(orbitGenerator, positionScale),
    diameter: diameter * 0.00001,
    color,
    orbitLine,
    mesh: asteroidGroup,
    haloSprite: haloResult.sprite,
    labelSprite: labelResult.sprite,
    setHaloHighlight: haloResult.setHighlight,
    setLabelHighlight: labelResult.setHighlight,
  };
};

// Create multiple asteroids from array
export const createAsteroids = (
  asteroidsData: AsteroidData[],
  camera: THREE.Camera,
  halos_and_labels: (() => void)[]
): Asteroid[] => {
  return asteroidsData.map(data => createAsteroid(data, camera, halos_and_labels));
};
