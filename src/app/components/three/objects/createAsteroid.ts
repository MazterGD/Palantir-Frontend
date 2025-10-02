import * as THREE from "three";
import { OrbitGenerator, ScaledOrbitGenerator } from "../orbitGenerator";
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
  point: THREE.Points;
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
  
  // Create orbit line
  const orbitLine = orbitGenerator.generateOrbitLine({
  color: color,
  scale: positionScale,
  opacity: asteroidData.isPotentiallyHazardous ? 0.7 : 0.5,
  lineWidth: asteroidData.isPotentiallyHazardous ? 2 : 1,
  segments: 180,
});
  
  // Create asteroid as point
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array([0, 0, 0]);
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  
  const material = new THREE.PointsMaterial({
  color: color,
  size: Math.max(diameter * 0.00005, asteroidData.isPotentiallyHazardous ? 4 : 2),
  sizeAttenuation: true,
  transparent: true,
  opacity: asteroidData.isPotentiallyHazardous ? 1.0 : 0.9,
  map: new THREE.TextureLoader().load('/textures/Sprites/circle.png'),
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
  
  const point = new THREE.Points(geometry, material);
  
  // Create invisible mesh for label attachment
  const helperMesh = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 4, 4),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  point.add(helperMesh);
  
  // Add halo and label to helper mesh
  const haloResult = addObjectLabel(helperMesh as any, camera, {
    color: color,
    size: 0.5,
    opacity: 0.6,
    minDistance: 50,
    maxDistance: 5000,
  });
  
  const labelResult = createLabel(helperMesh as any, name, camera, {
    fontSize: 12,
    color: "#cccccc",
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
    point,
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
