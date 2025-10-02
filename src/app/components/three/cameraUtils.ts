import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export function moveCamera(
  camera: THREE.Camera,
  controls: OrbitControls,
  targetPosition: THREE.Vector3,
  targetLookAt: THREE.Vector3,
  targetUp: THREE.Vector3 = new THREE.Vector3(0, 1, 0),
  duration: number = 2000
) {
  const startPosition = camera.position.clone();
  const startTarget = controls.target.clone();
  const startUp = camera.up.clone();
  const startTime = Date.now();

  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Smooth easing
    const eased = 1 - Math.pow(1 - progress, 3);
    
    // Interpolate position
    camera.position.lerpVectors(startPosition, targetPosition, eased);
    
    // Interpolate controls target
    controls.target.lerpVectors(startTarget, targetLookAt, eased);
    
    // Interpolate up vector to align with orbital plane
    if (progress > 0.3) {
      // Start aligning with orbital plane after 30% of animation
      const upProgress = Math.min((progress - 0.3) / 0.7, 1);
      camera.up.lerpVectors(startUp, targetUp, upProgress);
      camera.up.normalize();
    }
    
    // Update camera orientation
    camera.lookAt(controls.target);
    
    controls.update();
    
    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // Final alignment - ensure perfect alignment with orbital plane
      camera.up.copy(targetUp);
      camera.lookAt(controls.target);
      controls.update();
    }
  }
  
  animate();
}
