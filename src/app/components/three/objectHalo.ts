import * as THREE from "three";

export function addObjectHalo(
  object: THREE.Mesh,
  camera: THREE.Camera,
  options?: {
    color?: string;
    minDistance?: number;
    maxDistance?: number;
    size?: number;
    scale?: number;
    opacity?: number;
    texture?: string;
  },
) {
  const color = options?.color ?? 0xffffff;
  const scale = options?.scale ?? 1; // base screen-space scale
  const minDistance = options?.minDistance ?? 5; // disappear when too close
  const maxDistance = options?.maxDistance ?? 10000; // disappear when too far
  const size = options?.size ?? 0.1;
  const texturePath = options?.texture;

  let map: THREE.Texture | undefined;
  if (texturePath) {
    map = new THREE.TextureLoader().load(texturePath);
  }

  const spriteMaterial = new THREE.SpriteMaterial({
    map,
    color,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: false, // ignores depth (always visible)
    depthWrite: false, // doesn't block other objects
  });

  const sprite = new THREE.Sprite(spriteMaterial);

  // Scale relative to object size
  const radius =
    (object.geometry as THREE.SphereGeometry)?.parameters?.radius ?? 1;
  sprite.scale.set(radius * scale, radius * scale, 1);
  sprite.renderOrder = 9999; // render on top
  object.add(sprite);

  const update = () => {
    // Auto-scale glow with distance
    const distance = camera.position.distanceTo(object.position);

    if (distance < minDistance || distance > maxDistance) {
      sprite.visible = false;
      return;
    } else {
      sprite.visible = true;
    }

    const vFOV = THREE.MathUtils.degToRad(
      (camera as THREE.PerspectiveCamera).fov,
    ); // vertical fov in radians
    const height = 2 * Math.tan(vFOV / 2) * distance; // visible height at distance
    const worldScale = (height / window.innerHeight) * size * 100; // scale relative to screen
    sprite.scale.set(worldScale, worldScale, 1);
  };

  return update;
}
