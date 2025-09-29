import * as THREE from "three";

export async function addStarsBackground(scene: THREE.Scene) {
  const loader = new THREE.TextureLoader();
        const isMobile =
    /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (window.matchMedia && window.matchMedia("(max-width: 768px)").matches);

    const texturePath = isMobile ? "/textures/Stars/4k_stars_milky_way.webp" : "/textures/Stars/8k_stars_milky_way.webp";
  const texture = await loader.loadAsync(texturePath);

  texture.mapping = THREE.EquirectangularReflectionMapping;

  scene.background = texture;
  scene.environment = texture;
  scene.rotateX(60);
}
