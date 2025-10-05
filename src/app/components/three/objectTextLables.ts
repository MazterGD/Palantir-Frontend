import * as THREE from "three";
import { addObjectLabel } from "./objectLabel";
import { League_Spartan } from "next/font/google";

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

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
    fontFamily?: string; // New option for Google Font
  },
): {
  update: () => void;
  sprite: THREE.Sprite;
  setHighlight: (highlighted: boolean) => void;
} {
  const canvas: HTMLCanvasElement = document.createElement("canvas");
  const ctx: CanvasRenderingContext2D | null = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context not supported");
  }

  // Default options
  const color = "#ffffff";
  const fontSize = options?.fontSize ?? 16;
  const fontFamily = options?.fontFamily ?? "League Spartan"; // Default to Orbitron
  const originalColor = new THREE.Color(color);

  canvas.width = 256;
  canvas.height = 256;

  // Ensure font is loaded before drawing
  const loadFont = async () => {
    try {
      await document.fonts.load(`${fontSize * 1.2}px ${fontFamily}`);
      await document.fonts.load(`${fontSize}px ${fontFamily}`);
      return fontFamily;
    } catch (error) {
      console.warn(
        `Failed to load font ${fontFamily}, falling back to Arial:`,
        error,
      );
      return "Arial";
    }
  };

  // Draw label
  const drawLabel = (resolvedFont: string) => {
    ctx.fillStyle = "rgba(0, 0, 0, 1)";
    ctx.beginPath();
    ctx.roundRect(10, 10, canvas.width - 20, canvas.height - 20, 10);
    ctx.fill();

    // Draw text
    ctx.font = `${fontSize}px ${resolvedFont}`;
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      text.toLocaleUpperCase(),
      canvas.width / 2,
      canvas.height / 2 - 25,
    );
  };

  // Create texture
  const texture: THREE.CanvasTexture = new THREE.CanvasTexture(canvas);

  // Load font and draw
  loadFont().then((resolvedFont) => {
    drawLabel(resolvedFont);
    texture.needsUpdate = true; // Update texture after drawing
  });

  // Create update function using addObjectHalo
  const updateResult = addObjectLabel(object, camera, {
    texture,
    size: 10,
    minDistance: options?.minDistance,
    maxDistance: options?.maxDistance,
    opacity: options?.opacity,
});

  return {
    update: updateResult.update,
    sprite: updateResult.sprite,
    setHighlight: (highlighted: boolean) => {
      updateResult.setHighlight(highlighted);
      updateResult.sprite.material.color.setHex(
        highlighted ? 0xffff00 : originalColor.getHex(),
      );
    },
  };
}
