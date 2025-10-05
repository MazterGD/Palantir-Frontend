import * as THREE from "three";
import { PLANET_TEXTURES, PLANETS } from "@/app/lib/planetData";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import {
  OrbitGenerator,
  ScaledOrbitGenerator,
  ORBIT_PRESETS,
} from "../orbitGenerator";
import { addObjectLabel } from "../objectLabel";
import { createLabel } from "../objectTextLables";
import { getSceneBoundaries, kmToRenderUnits } from "@/app/lib/scalingUtils"; // NEW import
import { min } from "three/tsl";

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
  haloSprite?: THREE.Sprite;
  labelSprite?: THREE.Sprite;
  setHaloHighlight?: (highlighted: boolean) => void;
  setLabelHighlight?: (highlighted: boolean) => void;
  rings?: THREE.Group; // NEW: Optional rings group
}

type HaloUpdate = () => void;

const textureLoader = new THREE.TextureLoader();

// Function to create planet rings
// NEW: Function to create planet rings
const createPlanetRings = (
  planetName: string,
  planetDiameterRenderUnits: number, // now expects diameter in render units
  axisTilt: number,
) => {
  // Define ring properties for different planets
  const ringConfigs: {
    [key: string]: {
      innerRadius: number;
      outerRadius: number;
      color?: string;
      texture?: string;
    };
  } = {
    saturn: {
      innerRadius: 1.2,
      outerRadius: 2.3,
      texture: "/textures/Saturn/saturn_rings.jpg",
    },
    uranus: {
      innerRadius: 1.4,
      outerRadius: 2.0,
      texture: "/textures/Uranus/uranus_rings.jpg",
    },
    jupiter: {
      innerRadius: 1.2,
      outerRadius: 1.8,
      color: "#d4a574",
    },
    neptune: {
      innerRadius: 1.3,
      outerRadius: 1.9,
      color: "#5b9bd1",
    },
  };

  const config = ringConfigs[planetName.toLowerCase()];
  if (!config) return null;

  // Use planet diameter already converted to render units
  const innerRadius = planetDiameterRenderUnits * config.innerRadius;
  const outerRadius = planetDiameterRenderUnits * config.outerRadius;

  // Create ring geometry
  const ringGeometry = new THREE.RingGeometry(innerRadius, outerRadius, 256, 1);

  // Fix the UV mapping: radial unwrap
  const uv = ringGeometry.attributes.uv;
  for (let i = 0; i < uv.count; i++) {
    const x = ringGeometry.attributes.position.getX(i);
    const y = ringGeometry.attributes.position.getY(i);

    // radius from center
    const r = Math.sqrt(x * x + y * y);
    // normalized radius (inner → outer maps to 0 → 1)
    const u = (r - innerRadius) / (outerRadius - innerRadius);

    // angle around the circle (not really needed if texture is just radial gradient)
    const angle = Math.atan2(y, x);
    const v = (angle + Math.PI) / (2 * Math.PI); // 0 → 1

    uv.setXY(i, u, v);
  }

  let ringMaterial: THREE.Material;

  // Use the texture from config if available, otherwise use color
  if (config.texture) {
    const ringTexture = textureLoader.load(config.texture);
    ringTexture.wrapS = THREE.ClampToEdgeWrapping;
    ringTexture.wrapT = THREE.ClampToEdgeWrapping;
    ringTexture.minFilter = THREE.LinearFilter;

    ringMaterial = new THREE.MeshPhongMaterial({
      map: ringTexture,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.9,
    });
  } else {
    // Use colored material as fallback for planets without specific ring textures
    ringMaterial = new THREE.MeshPhongMaterial({
      color: config.color || 0xffffff,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
  }

  const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);

  // Rotate rings 90° around Z-axis to put them in XZ plane (perpendicular to Y-axis)
  ringMesh.rotation.z = Math.PI / 2;

  const ringsGroup = new THREE.Group();
  ringsGroup.add(ringMesh);

  return ringsGroup;
};

const createPlanetMesh = (
  planetName: string,
  diameterRenderUnits: number, // now receives render units
  fallbackColor: string,
) => {
  // geometry expects units in render units (diameterRenderUnits)
  const geometry = new THREE.SphereGeometry(diameterRenderUnits / 2, 64, 64);
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

  // add a separate transparent cloud layer (scale relative to render-units)
  if (texConfig.cloud) {
    const cloudGeometry = new THREE.SphereGeometry(
      (diameterRenderUnits / 2) * 1.01,
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
  halos_and_labels: HaloUpdate[],
) => {
  const name = planetName.toLowerCase() as keyof typeof PLANETS;
  const planetData = PLANETS[name];
  if (!planetData) return null;

  const { diameter, color, rotationPeriod, axisTilt, ...orbitElements } =
    planetData;
  const orbitGenerator = new OrbitGenerator(orbitElements);
  const scaledOrbitGenerator = new ScaledOrbitGenerator(orbitGenerator);

  const renderDiameter = kmToRenderUnits(diameter);

  const mesh = createPlanetMesh(name, renderDiameter, color);
  const rings = createPlanetRings(name, renderDiameter, axisTilt);

  mesh.rotation.x = Math.PI / 2;

  const planetGroup = new THREE.Group();
  planetGroup.add(mesh);

  if (rings) {
    planetGroup.add(rings);
  }

  planetGroup.rotation.x = axisTilt;

  const { outerBoundary } = getSceneBoundaries();
  const minDistance = kmToRenderUnits(planetData.diameter) * 200;

  const orbitLineResult = scaledOrbitGenerator.generateOrbitLine(
    camera,
    planetGroup,
    {
      color,
      ...ORBIT_PRESETS.standard,
      minDistance: minDistance * 0.1,
      fadeNear: minDistance * 0.9,
    },
  );

  halos_and_labels.push(orbitLineResult.update);

  const texturePath = "/textures/Sprites/circle.png";
  let map: THREE.Texture | undefined;
  if (texturePath) {
    map = new THREE.TextureLoader().load(texturePath);
  }

  const SPRITE_BASE_SIZE = 1;

  const haloResult = addObjectLabel(mesh, camera, {
    texture: map,
    color: planetData.color,
    size: SPRITE_BASE_SIZE,
    minDistance: minDistance,
    maxDistance: outerBoundary / 1.5,
    opacity: 1,
    fadeNear: minDistance * 0.9,
    fadeFar: 100000,
  });

  const labelResult = createLabel(mesh, planetName, camera, {
    fontSize: 20,
    minDistance: minDistance - minDistance * 0.7,
    maxDistance: outerBoundary * 2,
    opacity: 1,
  });

  halos_and_labels.push(haloResult.update);
  halos_and_labels.push(labelResult.update);

  const rotationSpeed =
    rotationPeriod !== 0 ? (2 * Math.PI) / rotationPeriod : 0;

  return {
    name: planetName,
    orbitGenerator: scaledOrbitGenerator,
    diameter: renderDiameter,
    color,
    orbitLine: orbitLineResult.line,
    mesh: planetGroup,
    rotationPeriod,
    axisTilt,
    rotationSpeed,
    haloSprite: haloResult.sprite,
    labelSprite: labelResult.sprite,
    setHaloHighlight: haloResult.setHighlight,
    setLabelHighlight: labelResult.setHighlight,
    rings: rings,
  };
};

export const createAllPlanets = (
  camera: THREE.Camera,
  halos_and_labels: HaloUpdate[],
) =>
  Object.keys(PLANETS)
    .map((name) => createPlanet(name, camera, halos_and_labels))
    .filter(Boolean) as Planet[];
