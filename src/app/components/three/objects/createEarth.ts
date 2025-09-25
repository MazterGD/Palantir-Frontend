import * as THREE from "three";
import { addMoonsToObject } from "./createMoon";
import { EARTH_MOONS } from "@/app/lib/moonData";
import { ASTRONOMICAL_DATA } from "@/app/lib/planetData";
import { EllipticalOrbit } from "../orbitalMechanics";
import {
  ScalingUtils,
  prepareMoonDataForVisualization,
} from "@/app/lib/scalingUtils";

export function createEarth() {
  // Use realistic radius from astronomical data
  const earthRadius = ScalingUtils.getRealisticRadius(
    "earth",
    ASTRONOMICAL_DATA
  );
  const geometry = new THREE.SphereGeometry(earthRadius, 64, 64);
  const textureLoader = new THREE.TextureLoader();

  // Load textures
  const dayTexture = textureLoader.load("/textures/earth/earth_daymap.png");
  const normalTexture = textureLoader.load(
    "/textures/earth/earth_normalmap.png"
  );
  const specularTexture = textureLoader.load(
    "/textures/earth/earth_specularmap.png"
  );
  const bumpTexture = textureLoader.load("/textures/earth/earth_bump.png");
  const cloudTexture = textureLoader.load("/textures/earth/earth_cloud.png");

  // Earth material
  const earthMaterial = new THREE.MeshPhongMaterial({
    map: dayTexture,
    normalMap: normalTexture,
    normalScale: new THREE.Vector2(0.7, 0.7),
    specularMap: specularTexture,
    shininess: 100,
    bumpMap: bumpTexture,
    bumpScale: 0.02,
  });

  const earth = new THREE.Mesh(geometry, earthMaterial);

  // Clouds (slightly larger than Earth)
  const cloudGeometry = new THREE.SphereGeometry(earthRadius * 1.01, 64, 64);
  const cloudMaterial = new THREE.MeshLambertMaterial({
    map: cloudTexture,
    transparent: true,
    opacity: 0.3,
    alphaMap: cloudTexture,
  });

  const clouds = new THREE.Mesh(cloudGeometry, cloudMaterial);

  // Group for Earth and clouds (handles axial rotation)
  const earthGroup = new THREE.Group();
  earthGroup.add(earth);
  earthGroup.add(clouds);

  // Prepare moon data with proper scaling
  const scaledMoonData = prepareMoonDataForVisualization(EARTH_MOONS);

  // Add moons to Earth with orbital mechanics
  const moonSystem = addMoonsToObject(earthGroup, scaledMoonData, true);

  // Create realistic elliptical orbit using astronomical data
  const orbitData = ASTRONOMICAL_DATA.earth.orbital;
  const orbit = new EllipticalOrbit(
    {
      ...orbitData,
      semiMajorAxis: ScalingUtils.scalePlanetOrbit(orbitData.semiMajorAxis),
    },
    1
  ); // Scale factor of 1 since we already scaled semiMajorAxis

  // Earth's axial tilt
  earthGroup.rotation.z = THREE.MathUtils.degToRad(23.5);

  // Create orbit path visualization
  const orbitGeometry = orbit.createOrbitPath();
  const orbitMaterial = new THREE.LineBasicMaterial({
    color: 0x4488ff,
    transparent: true,
    opacity: 0.3,
  });
  const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);

  // Main container group
  const earthContainer = new THREE.Group();
  earthContainer.add(earthGroup);
  earthContainer.add(orbitLine);

  const rotationSpeed = 0.01; // Earth's rotation (24 hours)

  const update = () => {
    // Earth's axial rotation (day/night cycle)
    earth.rotation.y += rotationSpeed;
    clouds.rotation.y += rotationSpeed * 1.5; // Clouds move slightly faster

    // Update moons with orbital mechanics
    moonSystem.update();

    // Update orbital position (elliptical orbit)
    orbit.update();
    const position = orbit.getPosition();
    earthGroup.position.copy(position);
  };

  return {
    earth: earthContainer,
    earthGroup,
    earthMesh: earth,
    clouds,
    moonSystem,
    orbit,
    orbitLine,
    update,
  };
}
