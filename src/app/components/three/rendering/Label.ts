import * as THREE from 'three';
import { addObjectLabel } from './Halo';

export function createLabel(
  object: THREE.Mesh,
  text: string,
  camera: THREE.Camera,
  options?: {
    color?: string;
    minDistance?: number;
    maxDistance?: number;
    fontSize?: number;
    offsetY?: number;
    opacity?: number;
    fontFamily?: string;
    alwaysVisible?: boolean;
  },
): { update: () => void; sprite: THREE.Sprite; setHighlight: (highlighted: boolean) => void } {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context not supported');
  }

  const color = options?.color ?? '#ffffff';
  const fontSize = options?.fontSize ?? 16;
  const fontFamily = options?.fontFamily ?? 'League Spartan';
  const alwaysVisible = options?.alwaysVisible ?? false;
  const originalColor = new THREE.Color(color);

  canvas.width = 256;
  canvas.height = 256;

  const loadFont = async () => {
    try {
      await document.fonts.load(`${fontSize * 1.2}px ${fontFamily}`);
      await document.fonts.load(`${fontSize}px ${fontFamily}`);
      return fontFamily;
    } catch (error) {
      console.warn(`Failed to load font ${fontFamily}, falling back to Arial:`, error);
      return 'Arial';
    }
  };

  const drawLabel = (resolvedFont: string) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 10);
    ctx.fill();

    ctx.font = `${fontSize}px ${resolvedFont}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.toLocaleUpperCase(), canvas.width/2, canvas.height / 2-25);
  };

  const texture = new THREE.CanvasTexture(canvas);

  loadFont().then((resolvedFont) => {
    drawLabel(resolvedFont);
    texture.needsUpdate = true;
  });

  const updateResult = addObjectLabel(object, camera, {
    texture,
    size: 10,
    minDistance: options?.minDistance ?? (alwaysVisible ? 1 : 500),
    maxDistance: options?.maxDistance ?? (alwaysVisible ? 100000 : 10000),
    opacity: options?.opacity ?? (alwaysVisible ? 1.0 : 0.8),
  });

  const originalUpdate = updateResult.update;
  const customUpdate = () => {
    if (alwaysVisible) {
      updateResult.sprite.visible = true;
      updateResult.sprite.material.opacity = options?.opacity ?? 1.0;
      
      const worldPos = updateResult.sprite.getWorldPosition(new THREE.Vector3());
      const distance = camera.position.distanceTo(worldPos);
      const spriteScale = (10 * distance) / 35;
      updateResult.sprite.scale.set(spriteScale, spriteScale, 1);
    } else {
      originalUpdate();
    }
  };

  return { 
    update: customUpdate, 
    sprite: updateResult.sprite,
    setHighlight: (highlighted: boolean) => {
      updateResult.setHighlight(highlighted);
      updateResult.sprite.material.color.setHex(highlighted ? 0xffff00 : originalColor.getHex());
    }
  };
}
