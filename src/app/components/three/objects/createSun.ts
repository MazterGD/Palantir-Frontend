import * as THREE from "three";
import {
  kmToRenderUnits,
  ASTRONOMICAL_CONSTANTS,
} from "@/app/lib/scalingUtils"; // NEW import

export function createSun(camera: THREE.Camera) {
  // Use real sun diameter (km) -> render units (radius)
  const sunDiameterRenderUnits = kmToRenderUnits(
    ASTRONOMICAL_CONSTANTS.SUN_DIAMETER_KM,
  );
  const sunRadiusRU = Math.max(0.5, sunDiameterRenderUnits / 2)*5; // ensure visible minimum
  const geometry = new THREE.SphereGeometry(sunRadiusRU, 64, 64);

  // Load texture
  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load("/textures/sun.jpg");

  // Create Sun material
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    emissive: 0xffff00,
    emissiveIntensity: 1.8,
  });

  // Create Sun mesh
  const sun = new THREE.Mesh(geometry, material);

  // Add point light to simulate sunlight
  // Adjust light intensity and distance for realistic scale
  const light = new THREE.PointLight(0xffffff, 10, 50000, 0.1);
  light.position.set(0, 0, 0);
  light.castShadow = true;
  sun.add(light);

  const glowTexture = textureLoader.load("/textures/PostProcessing/glow.png");
  const glowMaterial = new THREE.SpriteMaterial({
    map: glowTexture,
    color: 0xffb300,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: false, // ignores depth (always visible)
    depthWrite: false, // doesn't block other objects
  });

  const glowSprite = new THREE.Sprite(glowMaterial);
  glowSprite.renderOrder = 9999; // render on top
  sun.add(glowSprite);

  const update = () => {
    sun.rotation.y += 0.002;

    // Auto-scale glow with distance
    const distance = camera.position.distanceTo(sun.position);
    const baseSize = 24;
    const scaleFactor = distance * 0.2;
    glowSprite.scale.set(baseSize + scaleFactor, baseSize + scaleFactor, 1);
  };

  return { sun, update };
}
