import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function moveCamera(
  camera: THREE.Camera,
  controls: OrbitControls,
  targetPosition: THREE.Vector3,
  targetLookAt: THREE.Vector3,
  duration: number = 2000
) {
  const startPosition = camera.position.clone();
  const startTarget = controls.target.clone();
  const startTime = Date.now();

  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    const eased = 1 - Math.pow(1 - progress, 3);
    
    camera.position.lerpVectors(startPosition, targetPosition, eased);
    controls.target.lerpVectors(startTarget, targetLookAt, eased);
    camera.lookAt(controls.target);
    controls.update();
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }
  
  animate();
}
