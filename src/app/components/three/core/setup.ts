import * as THREE from "three";
import { getDeviceScaling } from "@/app/lib/utils/device";

export function setupScene(container: HTMLDivElement) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.01,
    10000,
  );
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  container.appendChild(renderer.domElement);

  const resScaling = getDeviceScaling();

  renderer.setSize(
    container.clientWidth * resScaling,
    container.clientHeight * resScaling,
    false,
  );
  renderer.domElement.style.width = container.clientWidth + "px";
  renderer.domElement.style.height = container.clientHeight + "px";
  renderer.setPixelRatio(window.devicePixelRatio);

  return { scene, camera, renderer };
}
