import * as THREE from "three";
import { PLANET_TEXTURES, PLANETS } from "@/app/lib/planetData";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import {
  OrbitGenerator,
  ScaledOrbitGenerator,
  ORBIT_PRESETS,
} from "../orbitGenerator";
import { addObjectHalo } from "../objectHalo";

export interface Planet {
  name: string;
  orbitGenerator: ScaledOrbitGenerator;
  diameter: number;
  color: string;
  orbitLine: Line2;
  mesh: THREE.Group; // Changed to Group to handle axis tilt
  rotationPeriod: number; // in hours
  axisTilt: number; // in degrees
  rotationSpeed: number; // radians per day
}

type HaloUpdate = () => void;

const textureLoader = new THREE.TextureLoader();

const createPlanetMesh = (
  planetName: string,
  diameter: number,
  fallbackColor: string,
) => {
  const geometry = new THREE.SphereGeometry(diameter / 2, 64, 64);
  const texConfig = PLANET_TEXTURES[planetName] || {};
  const materialOptions: THREE.MeshPhongMaterialParameters = {};

  if (texConfig.color)
    materialOptions.map = textureLoader.load(texConfig.color);
  if (texConfig.bump)
    materialOptions.bumpMap = textureLoader.load(texConfig.bump);
  if (texConfig.normal)
    materialOptions.normalMap = textureLoader.load(texConfig.normal);
  if (texConfig.specular)
    materialOptions.specularMap = textureLoader.load(texConfig.specular);

  // Fallback if no color texture
  if (!materialOptions.map) materialOptions.color = fallbackColor;

  const material = new THREE.MeshPhongMaterial(materialOptions);
  const mesh = new THREE.Mesh(geometry, material);

  // Optional: add a separate transparent cloud layer
  if (texConfig.cloud) {
    const cloudGeometry = new THREE.SphereGeometry(
      (diameter / 2) * 1.01,
      64,
      64,
    );
    const cloudMaterial = new THREE.MeshPhongMaterial({
      map: textureLoader.load(texConfig.cloud),
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });
    const cloudMesh = new THREE.Mesh(cloudGeometry, cloudMaterial);
    mesh.add(cloudMesh);
  }

  return mesh;
};

export const createPlanet = (
  planetName: string,
  camera: THREE.Camera,
  halos: HaloUpdate[],
) => {
  const name = planetName.toLowerCase() as keyof typeof PLANETS;
  const planetData = PLANETS[name];
  if (!planetData) return null;

  const { diameter, color, rotationPeriod, axisTilt, ...orbitElements } =
    planetData;
  const orbitGenerator = new OrbitGenerator(orbitElements);
  const positionScale = 100;

  const orbitLine = orbitGenerator.generateOrbitLine({
    color,
    scale: positionScale,
    ...ORBIT_PRESETS.standard,
  });

  const mesh = createPlanetMesh(name, diameter * 0.0001, color);

  const updateHalo = addObjectHalo(mesh, camera, {
    texture: "/textures/Sprites/circle.png",
    color: planetData.color,
  });
  halos.push(updateHalo);
  // Rotate mesh so its Y-axis (rotation axis) is perpendicular to orbital plane
  mesh.rotation.x = Math.PI / 2; // 90 degrees

  // Create a group to handle axis tilt separately from rotation
  const planetGroup = new THREE.Group();
  planetGroup.add(mesh);

  // Apply axis tilt to the group, not the mesh
  planetGroup.rotation.x = THREE.MathUtils.degToRad(axisTilt);

  // Calculate rotation speed (radians per day)
  const rotationSpeed =
    rotationPeriod !== 0 ? (2 * Math.PI) / (rotationPeriod / 24) : 0;

  return {
    name: planetName,
    orbitGenerator: new ScaledOrbitGenerator(orbitGenerator, positionScale),
    diameter: diameter * 0.0001,
    color,
    orbitLine,
    mesh: planetGroup,
    rotationPeriod,
    axisTilt,
    rotationSpeed,
  };
};

export const createAllPlanets = (camera: THREE.Camera, halos: HaloUpdate[]) =>
  Object.keys(PLANETS)
    .map((name) => createPlanet(name, camera, halos))
    .filter(Boolean) as Planet[];
