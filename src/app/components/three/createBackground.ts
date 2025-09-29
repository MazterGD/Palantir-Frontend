import * as THREE from "three";

export async function addStarsBackground(scene: THREE.Scene) {
  const loader = new THREE.TextureLoader();
  const texture = await loader.loadAsync("/textures/Stars/8k_stars_milky_way.webp");

  texture.mapping = THREE.EquirectangularReflectionMapping;

  scene.background = texture;
  scene.environment = texture;
  scene.rotateX(60);
}
