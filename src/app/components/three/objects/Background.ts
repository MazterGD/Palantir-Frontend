import * as THREE from "three";
import { isMobileDevice } from "@/app/lib/utils/device";

export async function addStarsBackground(scene: THREE.Scene) {
  const loader = new THREE.TextureLoader();
  const texturePath = isMobileDevice() 
    ? "/textures/Stars/4k_stars_milky_way.webp" 
    : "/textures/Stars/8k_stars_milky_way.webp";
  
  const texture = await loader.loadAsync(texturePath);
  texture.mapping = THREE.EquirectangularReflectionMapping;

  scene.background = texture;
  scene.environment = texture;
  scene.rotateX(60);
}
