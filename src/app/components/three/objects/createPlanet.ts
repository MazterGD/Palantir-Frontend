import * as THREE from "three";
import { addMoonsToObject } from "./createMoon";
import { ASTRONOMICAL_DATA } from "@/app/lib/planetData";
import { EllipticalOrbit } from "../orbitalMechanics";
import {
  ScalingUtils,
  prepareMoonDataForVisualization,
} from "@/app/lib/scalingUtils";

export interface PlanetTextures {
  map?: string; // Main texture
  normalMap?: string; // Normal map
  bumpMap?: string; // Bump map
  specularMap?: string; // Specular map
}

export interface PlanetConfig {
  name: string; // Planet name (must match ASTRONOMICAL_DATA key)
  textures: PlanetTextures; // Texture paths
  moonData: any[]; // Moon data array
  orbitColor: number; // Color for orbit line (hex)
  rotationSpeed: number; // Rotation speed
  axialTilt: number; // Axial tilt in degrees
  normalScale?: THREE.Vector2; // Normal map scale (default: 0.7, 0.7)
  bumpScale?: number; // Bump map scale (default: 0.02)
  shininess?: number; // Material shininess (default: 100)
}

export function createPlanet(config: PlanetConfig) {
  const {
    name,
    textures,
    moonData,
    orbitColor,
    rotationSpeed,
    axialTilt,
    normalScale = new THREE.Vector2(0.7, 0.7),
    bumpScale = 0.02,
    shininess = 100,
  } = config;

  // Use realistic radius from astronomical data
  const planetRadius = ScalingUtils.getRealisticRadius(name, ASTRONOMICAL_DATA);
  const geometry = new THREE.SphereGeometry(planetRadius, 64, 64);
  const textureLoader = new THREE.TextureLoader();

  // Load textures
  const materialConfig: any = {};

  if (textures.map) {
    materialConfig.map = textureLoader.load(textures.map);
  }

  if (textures.normalMap) {
    materialConfig.normalMap = textureLoader.load(textures.normalMap);
    materialConfig.normalScale = normalScale;
  }

  if (textures.bumpMap) {
    materialConfig.bumpMap = textureLoader.load(textures.bumpMap);
    materialConfig.bumpScale = bumpScale;
  }

  if (textures.specularMap) {
    materialConfig.specularMap = textureLoader.load(textures.specularMap);
    materialConfig.shininess = shininess;
  }

  // Planet material
  const planetMaterial = new THREE.MeshPhongMaterial(materialConfig);
  const planet = new THREE.Mesh(geometry, planetMaterial);

  // Planet group for axial rotation
  const planetGroup = new THREE.Group();
  planetGroup.add(planet);

  // Prepare moon data with proper scaling
  const scaledMoonData = prepareMoonDataForVisualization(moonData);

  // Add moons with orbital mechanics
  const moonSystem = addMoonsToObject(planetGroup, scaledMoonData, true);

  // Create realistic elliptical orbit using astronomical data
  const orbitData = ASTRONOMICAL_DATA[name].orbital;
  const orbit = new EllipticalOrbit(
    {
      ...orbitData,
      semiMajorAxis: ScalingUtils.scalePlanetOrbit(orbitData.semiMajorAxis),
    },
    1
  ); // Scale factor of 1 since we already scaled semiMajorAxis

  // Planet's axial tilt
  planetGroup.rotation.z = THREE.MathUtils.degToRad(axialTilt);

  // Create orbit path visualization
  const orbitGeometry = orbit.createOrbitPath();
  const orbitMaterial = new THREE.LineBasicMaterial({
    color: orbitColor,
    transparent: true,
    opacity: 0.3,
  });
  const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);

  // Main container group
  const planetContainer = new THREE.Group();
  planetContainer.add(planetGroup);
  planetContainer.add(orbitLine);

  const update = () => {
    // Planet's axial rotation
    planet.rotation.y += rotationSpeed;

    // Update moons with orbital mechanics
    moonSystem.update();

    // Update orbital position (elliptical orbit)
    orbit.update();
    const position = orbit.getPosition();
    planetGroup.position.copy(position);
  };

  return {
    planet: planetContainer,
    planetGroup,
    planetMesh: planet,
    moonSystem,
    orbit,
    orbitLine,
    update,
  };
}
