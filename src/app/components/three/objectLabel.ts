import * as THREE from "three";

export function addObjectLabel(
  object: THREE.Mesh,
  camera: THREE.Camera,
  options?: {
    color?: string | number;
    minDistance?: number;
    maxDistance?: number;
    size?: number;
    scale?: number;
    opacity?: number;
    texture?: THREE.Texture;
    fadeNear?: number; // how wide is the fade near minDistance
    fadeFar?: number;  // how wide is the fade near maxDistance
  },
) {
  const color = options?.color ?? 0xffffff;
  const scale = options?.scale ?? 1;
  const minDistance = options?.minDistance ?? 500;
  const maxDistance = options?.maxDistance ?? 10000;
  const size = options?.size ?? 1;
  const baseOpacity = options?.opacity ?? 1;
  const fadeNear = options?.fadeNear ?? 200; // start fading in this range
  const fadeFar = options?.fadeFar ?? 1500;   // start fading out this range
  const map = options?.texture;

  const spriteMaterial = new THREE.SpriteMaterial({
    map,
    color,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    depthWrite: false,
    opacity: baseOpacity,
  });

  const sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(scale, scale, 1);
  sprite.renderOrder = 9999;
  object.add(sprite);

  const update = () => {
    const worldPos = sprite.getWorldPosition(new THREE.Vector3());
    const distance = camera.position.distanceTo(worldPos);

    // Auto-scale glow with distance
    const spriteScale = (size * distance) / 35;
    sprite.scale.set(spriteScale, spriteScale, 1);

    // Compute opacity fade
    let opacity = baseOpacity;

    if (distance < minDistance - fadeNear || distance > maxDistance + fadeFar) {
      // fully invisible outside extended bounds
      opacity = 0;
    } else if (distance < minDistance) {
      // fade in as approaching minDistance
      opacity = THREE.MathUtils.clamp(
        (distance - (minDistance - fadeNear)) / fadeNear,
        0,
        1
      ) * baseOpacity;
    } else if (distance > maxDistance) {
      // fade out past maxDistance
      opacity = THREE.MathUtils.clamp(
        1 - (distance - maxDistance) / fadeFar,
        0,
        1
      ) * baseOpacity;
    }

    sprite.material.opacity = opacity;
    sprite.visible = opacity > 0.001; // hide if nearly transparent
  };

  return update;
}
