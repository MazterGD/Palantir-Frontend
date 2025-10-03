import * as THREE from "three";
import { createSun } from "../objects/Sun";
import { createAllPlanets } from "../objects/Planet";
import { createAsteroid } from "../objects/Asteroid";
import { addStarsBackground } from "../objects/Background";
import { addLights } from "./lights";
import { CelestialBody } from "../types";
import { AsteroidData } from "@/app/lib/data/asteroid";

export function createSceneObjects(
  scene: THREE.Scene,
  camera: THREE.Camera,
  asteroidData: AsteroidData | null
) {
  const celestialBodies: CelestialBody[] = [];
  const halosAndLabels: (() => void)[] = [];

  addStarsBackground(scene);

  const { sun, update: updateSun } = createSun(camera);
  scene.add(sun);

  const planets = createAllPlanets(camera, halosAndLabels);
  planets.forEach((planet) => {
    scene.add(planet.mesh);
    scene.add(planet.orbitLine);

    celestialBodies.push({
      mesh: planet.mesh,
      orbitGenerator: planet.orbitGenerator,
      rotationSpeed: planet.rotationSpeed,
      diameter: planet.diameter,
      color: planet.color,
      name: planet.name,
      haloSprite: planet.haloSprite,
      labelSprite: planet.labelSprite,
      setHaloHighlight: planet.setHaloHighlight,
      setLabelHighlight: planet.setLabelHighlight,
      orbitLine: planet.orbitLine,
    });
  });

  if (asteroidData) {
    const asteroid = createAsteroid(asteroidData, camera, halosAndLabels);
    scene.add(asteroid.mesh);
    scene.add(asteroid.orbitLine);

    const asteroidBody: CelestialBody = {
      mesh: asteroid.mesh,
      orbitGenerator: asteroid.orbitGenerator,
      diameter: asteroid.diameter,
      color: asteroid.color,
      name: asteroid.name,
      haloSprite: asteroid.haloSprite,
      labelSprite: asteroid.labelSprite,
      setHaloHighlight: asteroid.setHaloHighlight,
      setLabelHighlight: asteroid.setLabelHighlight,
      orbitLine: asteroid.orbitLine,
    };

    celestialBodies.push(asteroidBody);
  }

  addLights(scene);

  return {
    celestialBodies,
    halosAndLabels,
    updateSun,
  };
}
