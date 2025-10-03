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
    fadeNear?: number;
    fadeFar?: number;
  },
) {
  const color = options?.color ?? 0xffffff;
  const scale = options?.scale ?? 1;
  const minDistance = options?.minDistance ?? 500;
  const maxDistance = options?.maxDistance ?? 10000;
  const size = options?.size ?? 1;
  const baseOpacity = options?.opacity ?? 1;
  const fadeNear = options?.fadeNear ?? 200;
  const fadeFar = options?.fadeFar ?? 1500;
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

    const spriteScale = (size * distance) / 35;
    sprite.scale.set(spriteScale, spriteScale, 1);

    let opacity = baseOpacity;

    if (distance < minDistance - fadeNear || distance > maxDistance + fadeFar) {
      opacity = 0;
    } else if (distance < minDistance) {
      opacity =
        THREE.MathUtils.clamp(
          (distance - (minDistance - fadeNear)) / fadeNear,
          0,
          1,
        ) * baseOpacity;
    } else if (distance > maxDistance) {
      opacity =
        THREE.MathUtils.clamp(1 - (distance - maxDistance) / fadeFar, 0, 1) *
        baseOpacity;
    }

    sprite.material.opacity = opacity;
    sprite.visible = opacity > 0.001;
  };

  return {
    update,
    sprite,
    setHighlight: (highlighted: boolean) => {
      sprite.material.opacity = highlighted
        ? Math.min(baseOpacity * 1.5, 1)
        : baseOpacity;
      const baseColor = new THREE.Color(color);
      sprite.material.color.set(highlighted ? 0xffff00 : baseColor);
    },
  };
}
