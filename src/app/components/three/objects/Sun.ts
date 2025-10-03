import * as THREE from "three";

export function createSun(camera: THREE.Camera) {
  const geometry = new THREE.SphereGeometry(2, 64, 64);

  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load("/textures/sun.jpg");

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    emissive: 0xffff00,
    emissiveIntensity: 1.8,
  });

  const sun = new THREE.Mesh(geometry, material);

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
    depthTest: false,
    depthWrite: false,
  });

  const glowSprite = new THREE.Sprite(glowMaterial);
  glowSprite.renderOrder = 9999;
  sun.add(glowSprite);

  const update = () => {
    sun.rotation.y += 0.002;

    const distance = camera.position.distanceTo(sun.position);
    const baseSize = 24;
    const scaleFactor = distance * 0.2;
    glowSprite.scale.set(baseSize + scaleFactor, baseSize + scaleFactor, 1);
  };

  return { sun, update };
}
