// asteroid creation
import * as THREE from "three";
import {
  OrbitGenerator,
  ScaledOrbitGenerator,
  ORBIT_PRESETS,
  Point3D,
} from "../orbitGenerator";
import { AsteroidData } from "@/app/lib/asteroidData";
import { createLabel } from "../objectTextLables";
import { kmToRenderUnits } from "@/app/lib/scalingUtils";
import { addObjectLabel } from "../objectLabel";

export interface Asteroid {
  id: string;
  name: string;
  orbitGenerator: ScaledOrbitGenerator;
  diameter: number;
  color: string;
  mesh: THREE.Points;
  orbitLine?: THREE.Line | THREE.Object3D;
  labelSprite?: THREE.Sprite;
  setLabelHighlight?: (highlighted: boolean) => void;
  updateLOD?: (cameraPosition: THREE.Vector3) => void;
  showOrbit?: () => void;
  hideOrbit?: () => void;
  applyForce?: (force: Point3D, deltaTime: number, currentTime: number) => void;
}

export const createAsteroid = (
  asteroidData: AsteroidData,
  camera: THREE.Camera,
  halos_and_labels: (() => void)[],
  scene: THREE.Scene,
): Asteroid => {
  const { id, name, diameter, color, ...orbitElements } = asteroidData;

  const orbitGenerator = new OrbitGenerator(orbitElements);
  const scaledGenerator = new ScaledOrbitGenerator(orbitGenerator);

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array([0, 0, 0]);
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: new THREE.Color(0x4fc3f7),
    size: 3,
    sizeAttenuation: false,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);

  const texturePath = "/textures/Sprites/asteroid.webp";
  let map: THREE.Texture | undefined;
  if (texturePath) {
    map = new THREE.TextureLoader().load(texturePath);
  }

  const SPRITE_BASE_SIZE = 1;

  const haloResult = addObjectLabel(points as any, camera, {
    texture: map,
    size: SPRITE_BASE_SIZE,
    minDistance: 10,
    maxDistance: 200,
    opacity: 1,
    fadeNear: 10 * 0.9,
    fadeFar: 100,
  });

  halos_and_labels.push(haloResult.update);

  // Create initial orbit line (hidden)
  let orbitLineResult = scaledGenerator.generateOrbitLine(camera, points, {
    color: "#ffffff",
    ...ORBIT_PRESETS.subtle,
    minDistance: 0.01,
    fadeNear: 0,
  });

  orbitLineResult.line.visible = false;
  scene.add(orbitLineResult.line);

  // Store the update function for later use
  let orbitUpdateFunction = orbitLineResult.update;

  let labelSprite: THREE.Sprite | undefined;
  let setLabelHighlight: ((highlighted: boolean) => void) | undefined;

  const updateLOD = (cameraPosition: THREE.Vector3) => {
    const asteroidPosition = new THREE.Vector3();
    points.getWorldPosition(asteroidPosition);
    const distance = cameraPosition.distanceTo(asteroidPosition);

    const labelVisible = distance < 100;

    if (labelVisible) {
      if (!labelSprite) {
        const labelResult = createLabel(points as any, name, camera, {
          fontSize: 20,
          color: "#4fc3f7",
          minDistance: 0.01,
          maxDistance: 1,
          opacity: 1.0,
        });

        labelSprite = labelResult.sprite;
        setLabelHighlight = labelResult.setHighlight;
        halos_and_labels.push(labelResult.update);
      }

      if (labelSprite) {
        labelSprite.visible = true;
      }
    } else {
      if (labelSprite) {
        labelSprite.visible = false;
      }
    }

    if (distance < 50) {
      material.size = 4;
      material.opacity = 1.0;
    } else if (distance < 200) {
      material.size = 3;
      material.opacity = 0.9;
    } else {
      material.size = 5;
      material.opacity = 0.7;
    }
  };

  const showOrbit = () => {
    console.log("Showing orbit for asteroid:", name);
    if (orbitLineResult.line) {
      orbitLineResult.line.visible = true;
      if (orbitLineResult.line.material) {
        orbitLineResult.line.material.needsUpdate = true;
        orbitLineResult.line.material.opacity = ORBIT_PRESETS.standard.opacity;
      }
      // Add update function when showing
      if (!halos_and_labels.includes(orbitUpdateFunction)) {
        halos_and_labels.push(orbitUpdateFunction);
      }
    }
  };

  const hideOrbit = () => {
    console.log("Hiding orbit for asteroid:", name);
    if (orbitLineResult.line) {
      orbitLineResult.line.visible = false;
      // Remove update function when hiding
      const index = halos_and_labels.indexOf(orbitUpdateFunction);
      if (index > -1) {
        halos_and_labels.splice(index, 1);
      }
    }
  };

  const applyForce = (
    forceGN: Point3D,
    deltaTime: number,
    currentTime: number,
  ) => {
    const mass = ((diameter * 1000) ** 3 * Math.PI * 2000) / 6;

    // Compute asteroid mass in kg (realistic approximation)
    const radiusM = (diameter / 2) * 1000;
    const volumeM3 = (4 / 3) * Math.PI * Math.pow(radiusM, 3);
    const density = 2000; // kg/m³
    const asteroidMass = volumeM3 * density;

    // Convert force from Mega Newtons to Newtons (1 MN = 1,000,000 N)
    const force = {
      x: forceGN.x * 1e9,
      y: forceGN.y * 1e9,
      z: forceGN.z * 1e9,
    };

    // If force is zero, skip recalculation entirely to prevent rounding drift
    if (force.x === 0 && force.y === 0 && force.z === 0) {
      return;
    }

    // Convert force to acceleration (m/s²)
    const ax = force.x / asteroidMass;
    const ay = force.y / asteroidMass;
    const az = force.z / asteroidMass;

    // Get current state vectors (position in km, velocity in km/s)
    const julianDate = currentTime / 86400 + 2440587.5;
    const stateVectors = orbitGenerator.getCurrentStateVectors(julianDate);

    const acceleration = {
      x: force.x / mass,
      y: force.y / mass,
      z: force.z / mass,
    };

    const newVelocity = {
      x: stateVectors.velocity.x + acceleration.x * deltaTime,
      y: stateVectors.velocity.y + acceleration.y * deltaTime,
      z: stateVectors.velocity.z + acceleration.z * deltaTime,
    };

    console.log("=== APPLYING FORCE ===");
    console.log("Input Force (N):", force);
    console.log("Delta Time (s):", deltaTime);
    console.log("Asteroid Mass (kg):", asteroidMass);
    console.log("Delta V (km/s):", { x: dvx, y: dvy, z: dvz });

    // Generate new orbital elements from updated state vectors
    const newElements = OrbitGenerator.fromStateVectors(
      stateVectors.position,
      newVelocity,
      julianDate,
    );

    console.log("NEW Orbital Elements:", newElements);
    console.log(
      "OLD Semi-major Axis (km):",
      originalOrbitElements.semiMajorAxis,
    );
    console.log("NEW Semi-major Axis (km):", newElements.semiMajorAxis);

    // Cleanup old orbit visuals
    cleanupOrbit();

    asteroid.orbitGenerator = newScaledGenerator;

    // Remove old force-modified orbit if it exists
    if (asteroid.orbitLine && asteroid.orbitLine.visible) {
      // Remove update function from halos_and_labels
      const oldUpdateIndex = halos_and_labels.indexOf(orbitUpdateFunction);
      if (oldUpdateIndex > -1) {
        halos_and_labels.splice(oldUpdateIndex, 1);
      }
      scene.remove(asteroid.orbitLine);
    }

    const newOrbitLineResult = newScaledGenerator.generateOrbitLine(
      camera,
      points,
      {
        color: "#ffffff",
        ...ORBIT_PRESETS.bright,
        minDistance: 0.01,
        fadeNear: 0,
      },
    );

    newOrbitLineResult.line.visible = true;
    scene.add(newOrbitLineResult.line);

    // Replace the update function
    orbitUpdateFunction = newOrbitLineResult.update;
    halos_and_labels.push(orbitUpdateFunction);

    asteroid.orbitLine = newOrbitLineResult.line;
  };

  const asteroid: Asteroid = {
    id,
    name,
    orbitGenerator: scaledGenerator,
    diameter: kmToRenderUnits(diameter),
    color: "#4fc3f7",
    mesh: points,
    orbitLine: orbitLineResult.line,
    labelSprite,
    setLabelHighlight,
    updateLOD,
    showOrbit,
    hideOrbit,
    applyForce,
    originalOrbitElements,
    resetOrbit,
  };

  return asteroid;
};

// Create multiple asteroids from array
export const createAsteroids = (
  asteroidsData: AsteroidData[],
  camera: THREE.Camera,
  halos_and_labels: (() => void)[],
  scene: THREE.Scene,
): Asteroid[] => {
  return asteroidsData.map((data) =>
    createAsteroid(data, camera, halos_and_labels, scene),
  );
};

export const isAsteroidOrbitVisible = (
  asteroids: Asteroid[],
  asteroidId: string,
): boolean => {
  const asteroid = asteroids.find((a) => a.id === asteroidId);
  return asteroid?.orbitLine?.visible ?? false;
};

export const toggleAsteroidOrbit = (
  asteroids: Asteroid[],
  asteroidId: string,
): void => {
  const asteroid = asteroids.find((a) => a.id === asteroidId);
  if (!asteroid) return;

  if (asteroid.orbitLine?.visible) {
    asteroid.hideOrbit?.();
  } else {
    asteroid.showOrbit?.();
  }
};
