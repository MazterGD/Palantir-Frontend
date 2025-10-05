import * as THREE from "three";

export function addLights(scene: THREE.Scene) {
  const ambientLight = new THREE.AmbientLight(
    new THREE.Color(0.13, 0.13, 0.13),
    7,
  );
  scene.add(ambientLight);

  const fillLight = new THREE.PointLight(
    new THREE.Color(0.2, 0.4, 1.0),
    2.0,
    100,
    1,
  );
  fillLight.position.set(50, 50, -100);
  scene.add(fillLight);

  // const light = new THREE.PointLight(0xffffff, 100, 1000, 0.5);
  // light.position.set(0, 0, 0);
  // light.castShadow = true;
  // scene.add(light);
}
