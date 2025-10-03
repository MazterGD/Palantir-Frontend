import * as THREE from "three";

export function setupScene(container: HTMLDivElement) {
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.01,
    10000,
  );
  camera.position.z = 5;
  camera.up = new THREE.Vector3(0,0,1);

  const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
  container.appendChild(renderer.domElement);

  // --- Detect mobile ---
  const isMobile =
    /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    (window.matchMedia && window.matchMedia("(max-width: 768px)").matches);

  // --- Set scaling ---
  const ResScalling = isMobile ? 1 : 2;

  renderer.setSize(
    container.clientWidth * ResScalling,
    container.clientHeight * ResScalling,
    false,
  );
  renderer.domElement.style.width = container.clientWidth + "px";
  renderer.domElement.style.height = container.clientHeight + "px";

  renderer.setPixelRatio(window.devicePixelRatio);

      const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

  return { scene, camera, renderer };
}
