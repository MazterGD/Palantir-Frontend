import * as THREE from "three";
import {
  OrbitGenerator,
  ScaledOrbitGenerator,
  ORBIT_PRESETS,
  Point3D,
} from "../orbitGenerator";
import { AsteroidData } from "@/app/lib/asteroidData";
import { createLabel } from "../objectTextLables";
import { kmToRenderUnits } from "@/app/lib/scalingUtils"; // NEW import

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

  // Create orbit line and add to scene immediately (in render units)
  const orbitLine = scaledGenerator.generateOrbitLine({
    color: "#4fc3f7", // Light blue orbit
    ...ORBIT_PRESETS.subtle,
  });
  orbitLine.visible = false; // Hidden by default
  scene.add(orbitLine); // Add to scene immediately

  // Create asteroid as Points with a single vertex
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array([0, 0, 0]); // Single point at origin
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));

  // Create points material that maintains size regardless of distance - LIGHT BLUE
  const material = new THREE.PointsMaterial({
    color: new THREE.Color(0x4fc3f7), // Light blue color
    size: 3, // Fixed size in pixels
    sizeAttenuation: false, // This makes the size constant regardless of distance
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending, // Makes points glow nicely
    depthWrite: false, // Helps with rendering order
  });

  const points = new THREE.Points(geometry, material);

  // Create label but don't add it to the update array yet - we'll handle it in LOD
  let labelSprite: THREE.Sprite | undefined;
  let setLabelHighlight: ((highlighted: boolean) => void) | undefined;

  // LOD update function to handle label visibility based on distance
  const updateLOD = (cameraPosition: THREE.Vector3) => {
    const asteroidPosition = new THREE.Vector3();
    points.getWorldPosition(asteroidPosition);
    const distance = cameraPosition.distanceTo(asteroidPosition);

    // Show label only when zoomed in (close to asteroid)
    const labelVisible = distance < 100;

    if (labelVisible) {
      // Create label if it doesn't exist and we're close enough
      if (!labelSprite) {
        const labelResult = createLabel(points as any, name, camera, {
          fontSize: 20,
          color: "#4fc3f7", // Light blue label
          minDistance: 1,
          maxDistance: 50,
          opacity: 1.0,
        });

        labelSprite = labelResult.sprite;
        setLabelHighlight = labelResult.setHighlight;

        // Add to update array only when created
        halos_and_labels.push(labelResult.update);
      }

      // Ensure label is visible
      if (labelSprite) {
        labelSprite.visible = true;
      }
    } else {
      // Hide label when far away
      if (labelSprite) {
        labelSprite.visible = false;
      }
    }

    // Adjust point appearance based on distance for better visual feedback
    if (distance < 50) {
      // Close up: slightly larger and more opaque
      material.size = 4;
      material.opacity = 1.0;
    } else if (distance < 200) {
      // Medium distance: normal size
      material.size = 3;
      material.opacity = 0.9;
    } else {
      // Far away: slightly smaller but still visible
      material.size = 5;
      material.opacity = 0.7;
    }
  };

  // Function to show orbit - IMPROVED
  const showOrbit = () => {
    console.log("Showing orbit for asteroid:", name);
    if (orbitLine) {
      orbitLine.visible = true;
      // Force material update to ensure it renders
      if (orbitLine.material) {
        orbitLine.material.needsUpdate = true;
        orbitLine.material.opacity = ORBIT_PRESETS.standard.opacity;
      }
    }
  };

  // Function to hide orbit - IMPROVED
  const hideOrbit = () => {
    console.log("Hiding orbit for asteroid:", name);
    if (orbitLine) {
      orbitLine.visible = false;
    }
  };

  const applyForce = (
    force: Point3D,
    deltaTime: number,
    currentTime: number,
  ) => {
    // diameter here is in kilometers (from AsteroidData) for mass calc
    const mass = ((diameter * 1000) ** 3 * Math.PI * 2000) / 6;

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

    const newElements = OrbitGenerator.fromStateVectors(
      stateVectors.position,
      newVelocity,
      julianDate,
    );

    const newOrbitGenerator = new OrbitGenerator(newElements);
    const newScaledGenerator = new ScaledOrbitGenerator(newOrbitGenerator);

    // Replace orbit generator on asteroid with scaled version
    asteroid.orbitGenerator = newScaledGenerator;

    // Update orbit line in scene (render units)
    if (asteroid.orbitLine) {
      scene.remove(asteroid.orbitLine);
    }
    const newOrbitLine = newScaledGenerator.generateOrbitLine({
      color: "#4fc3f7",
      ...ORBIT_PRESETS.bright,
    });
    newOrbitLine.visible = true;
    scene.add(newOrbitLine);
    asteroid.orbitLine = newOrbitLine;
  };

  const asteroid: Asteroid = {
    id,
    name,
    orbitGenerator: scaledGenerator,
    diameter: kmToRenderUnits(diameter), // converted to render units
    color: "#4fc3f7",
    mesh: points,
    orbitLine,
    labelSprite,
    setLabelHighlight,
    updateLOD,
    showOrbit,
    hideOrbit,
    applyForce,
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
