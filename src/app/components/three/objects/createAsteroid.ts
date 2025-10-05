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

  const orbitLineResult = scaledGenerator.generateOrbitLine(camera, points, {
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
    force: Point3D,
    deltaTime: number,
    currentTime: number,
  ) => {
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
