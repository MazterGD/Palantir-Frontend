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
  // Store original orbit data for physics calculations
  originalOrbitElements?: any;
  resetOrbit?: () => void;
}

export const createAsteroid = (
  asteroidData: AsteroidData,
  camera: THREE.Camera,
  halos_and_labels: (() => void)[],
  scene: THREE.Scene,
): Asteroid => {
  const { id, name, diameter, color, ...orbitElements } = asteroidData;

  // Store original orbit elements
  const originalOrbitElements = { ...orbitElements };

  let orbitGenerator = new OrbitGenerator(orbitElements);
  let scaledGenerator = new ScaledOrbitGenerator(orbitGenerator);

  const initialStateVectors = orbitGenerator.getCurrentStateVectors(
    orbitGenerator.epoch,
  );
  const initialOrbitElements = { ...orbitElements };

  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array([0, 0, 0]);
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  const material = new THREE.PointsMaterial({
    color: new THREE.Color(0x4fc3f7),
    size: 8, // Increased size for better visibility and easier clicking
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

  // Store references for cleanup
  let currentOrbitLine: THREE.Object3D | undefined = orbitLineResult.line;
  let currentOrbitUpdate = orbitLineResult.update;
  let isOrbitVisible = false;

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
      material.size = 3;
      material.opacity = 0.8;
    }
  };

  const cleanupOrbit = () => {
    if (currentOrbitLine) {
      // Remove from update loop
      const index = halos_and_labels.indexOf(currentOrbitUpdate);
      if (index > -1) {
        halos_and_labels.splice(index, 1);
      }

      // Remove from scene
      scene.remove(currentOrbitLine);

      // Dispose of geometry and material
      if ("geometry" in currentOrbitLine) {
        (currentOrbitLine as any).geometry?.dispose();
      }
      if ("material" in currentOrbitLine) {
        const mat = (currentOrbitLine as any).material;
        if (mat) {
          if (Array.isArray(mat)) {
            mat.forEach((m) => m.dispose());
          } else {
            mat.dispose();
          }
        }
      }

      currentOrbitLine = undefined;
    }
  };

  const showOrbit = () => {
    if (currentOrbitLine && !isOrbitVisible) {
      currentOrbitLine.visible = true;
      isOrbitVisible = true;

      // Add to update loop if not already there
      if (!halos_and_labels.includes(currentOrbitUpdate)) {
        halos_and_labels.push(currentOrbitUpdate);
      }

      // Update material properties
      if ("material" in currentOrbitLine) {
        const line = currentOrbitLine as any;
        if (line.material) {
          line.material.opacity = ORBIT_PRESETS.bright.opacity;
          line.material.linewidth = ORBIT_PRESETS.bright.lineWidth;
          line.material.needsUpdate = true;
        }
      }
    }
  };

  const hideOrbit = () => {
    if (currentOrbitLine && isOrbitVisible) {
      currentOrbitLine.visible = false;
      isOrbitVisible = false;

      // Remove from update loop
      const index = halos_and_labels.indexOf(currentOrbitUpdate);
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
    const mu = 1.32712440018e11; // km³/s² for the Sun

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
    const state = orbitGenerator.getCurrentStateVectors(julianDate);

    // Convert acceleration from m/s² → km/s²
    const ax_km = ax / 1000;
    const ay_km = ay / 1000;
    const az_km = az / 1000;

    // Δv = a * Δt
    const dvx = ax_km * deltaTime;
    const dvy = ay_km * deltaTime;
    const dvz = az_km * deltaTime;

    // Apply Δv to the current velocity
    const newVelocity = {
      x: state.velocity.x + dvx,
      y: state.velocity.y + dvy,
      z: state.velocity.z + dvz,
    };

    console.log("=== APPLYING FORCE ===");
    console.log("Input Force (N):", force);
    console.log("Delta Time (s):", deltaTime);
    console.log("Asteroid Mass (kg):", asteroidMass);
    console.log("Delta V (km/s):", { x: dvx, y: dvy, z: dvz });

    // Generate new orbital elements from updated state vectors
    const newElements = OrbitGenerator.fromStateVectors(
      state.position,
      newVelocity,
      julianDate,
      mu,
    );

    console.log("NEW Orbital Elements:", newElements);
    console.log(
      "OLD Semi-major Axis (km):",
      originalOrbitElements.semiMajorAxis,
    );
    console.log("NEW Semi-major Axis (km):", newElements.semiMajorAxis);

    // Cleanup old orbit visuals
    cleanupOrbit();

    // Create new orbit generator
    orbitGenerator = new OrbitGenerator(newElements);
    scaledGenerator = new ScaledOrbitGenerator(orbitGenerator);

    // Generate new orbit line
    const newOrbitLineResult = scaledGenerator.generateOrbitLine(
      camera,
      points,
      {
        color: "#ffff00",
        ...ORBIT_PRESETS.bright,
      },
    );

    currentOrbitLine = newOrbitLineResult.line;
    currentOrbitUpdate = newOrbitLineResult.update;
    scene.add(currentOrbitLine);
    currentOrbitLine.visible = true;
    isOrbitVisible = true;

    halos_and_labels.push(currentOrbitUpdate);

    asteroid.orbitGenerator = scaledGenerator;
    asteroid.orbitLine = currentOrbitLine;
  };

  const resetOrbit = () => {
    cleanupOrbit(); // Reuse your existing cleanup function

    // Recreate the orbit generator from the saved initial state
    orbitGenerator = new OrbitGenerator(initialOrbitElements);
    scaledGenerator = new ScaledOrbitGenerator(orbitGenerator);

    // Generate a new orbit line for the initial orbit
    const newOrbitLineResult = scaledGenerator.generateOrbitLine(
      camera,
      points,
      {
        color: "#ffff00",
        ...ORBIT_PRESETS.bright,
      },
    );

    currentOrbitLine = newOrbitLineResult.line;
    currentOrbitUpdate = newOrbitLineResult.update;
    scene.add(currentOrbitLine);
    currentOrbitLine.visible = true;
    isOrbitVisible = true;

    halos_and_labels.push(currentOrbitUpdate);

    // Update the asteroid's reference
    asteroid.orbitGenerator = scaledGenerator;
    asteroid.orbitLine = currentOrbitLine;
  };

  const asteroid: Asteroid = {
    id,
    name,
    orbitGenerator: scaledGenerator,
    diameter: kmToRenderUnits(diameter),
    color: "#4fc3f7",
    mesh: points,
    orbitLine: currentOrbitLine,
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
