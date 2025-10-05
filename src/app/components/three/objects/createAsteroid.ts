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
import { Line2 } from "three/examples/jsm/lines/Line2.js";

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
      if ('geometry' in currentOrbitLine) {
        (currentOrbitLine as any).geometry?.dispose();
      }
      if ('material' in currentOrbitLine) {
        const mat = (currentOrbitLine as any).material;
        if (mat) {
          if (Array.isArray(mat)) {
            mat.forEach(m => m.dispose());
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
      if ('material' in currentOrbitLine) {
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
    force: Point3D,
    deltaTime: number,
    currentTime: number,
  ) => {
    // Use correct gravitational parameter for the Sun (km³/s²)
    const mu = 1.32712440018e11;
    
    // Calculate mass based on asteroid diameter (assuming density of 2000 kg/m³)
    const radiusKm = diameter / 2;
    const volumeKm3 = (4/3) * Math.PI * Math.pow(radiusKm, 3);
    const mass = volumeKm3 * 2e12; // Convert to kg (2000 kg/m³ = 2e12 kg/km³)

    // Convert current time to Julian Date
    const julianDate = currentTime / 86400 + 2440587.5;
    
    // Get current state vectors
    const stateVectors = orbitGenerator.getCurrentStateVectors(julianDate);

    // Calculate acceleration (force/mass) in km/s²
    const acceleration = {
      x: (force.x * 1000) / mass, // Convert force from N to km/s²
      y: (force.y * 1000) / mass,
      z: (force.z * 1000) / mass,
    };

    // Apply force over deltaTime to get new velocity
    const newVelocity = {
      x: stateVectors.velocity.x + acceleration.x * deltaTime,
      y: stateVectors.velocity.y + acceleration.y * deltaTime,
      z: stateVectors.velocity.z + acceleration.z * deltaTime,
    };

    // Calculate new orbital elements from state vectors
    const newElements = OrbitGenerator.fromStateVectors(
      stateVectors.position,
      newVelocity,
      julianDate,
      mu,
    );

    // Clean up old orbit completely
    cleanupOrbit();

    // Create new orbit generator
    orbitGenerator = new OrbitGenerator(newElements);
    scaledGenerator = new ScaledOrbitGenerator(orbitGenerator);

    // Create new orbit line
    const newOrbitLineResult = scaledGenerator.generateOrbitLine(
      camera,
      points,
      {
        color: "#ffff00", // Yellow for modified orbits
        ...ORBIT_PRESETS.bright,
        minDistance: 0.01,
        fadeNear: 0,
      },
    );

    // Set up new orbit line
    currentOrbitLine = newOrbitLineResult.line;
    currentOrbitUpdate = newOrbitLineResult.update;
    
    // Add to scene and make visible
    scene.add(currentOrbitLine);
    currentOrbitLine.visible = true;
    isOrbitVisible = true;
    
    // Add update function to animation loop
    halos_and_labels.push(currentOrbitUpdate);

    // Update asteroid reference
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
