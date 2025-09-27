import * as THREE from "three";
import { getStandardBodyDiameter } from "@/app/lib/scalingUtils";

export function createSun() {
  const geometry = new THREE.SphereGeometry(20, 64, 64);

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

  // Animation function
  const update = () => {
    sun.rotation.y += 0.002;
  };

  return { sun, update };
}
