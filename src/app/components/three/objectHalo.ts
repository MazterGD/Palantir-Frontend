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
  const minDistance = options?.minDistance ?? 500; // disappear when too close
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
  sprite.scale.set(scale, scale, 1);
  sprite.renderOrder = 9999; // render on top
  object.add(sprite);

  const update = () => {
    // Auto-scale glow with distance
    const distance = camera.position.distanceTo(
      sprite.getWorldPosition(new THREE.Vector3()),
    );
    const scale = distance / 35; // Adjust scale to counteract distance
    sprite.scale.set(scale, scale, 1); // Maintain aspect ratio

    if (distance < minDistance || distance > maxDistance) {
      sprite.visible = false;
      return;
    } else {
      sprite.visible = true;
    }

    const vFOV = THREE.MathUtils.degToRad(
      (camera as THREE.PerspectiveCamera).fov,
    );
  };

  return update;
}
