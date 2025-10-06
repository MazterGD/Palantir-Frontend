import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CelestialBody } from '../ThreeScene';

export interface CameraFollowOptions {
  enabled: boolean;
  offsetDistance: number;
  offsetHeight: number;
  smoothness: number; // 0-1, higher = smoother but slower
  lookAhead: number; // seconds to look ahead of object's motion
}

export class CameraFollowController {
  private camera: THREE.Camera;
  private controls: OrbitControls;
  private targetBody: CelestialBody | null = null;
  private options: CameraFollowOptions;
  private targetPosition: THREE.Vector3 = new THREE.Vector3();
  private targetLookAt: THREE.Vector3 = new THREE.Vector3();
  private previousBodyPosition: THREE.Vector3 = new THREE.Vector3();
  private velocity: THREE.Vector3 = new THREE.Vector3();
  private isFirstUpdate: boolean = true;

  constructor(
    camera: THREE.Camera,
    controls: OrbitControls,
    options: Partial<CameraFollowOptions> = {}
  ) {
    this.camera = camera;
    this.controls = controls;
    this.options = {
      enabled: false,
      offsetDistance: 5,
      offsetHeight: 2,
      smoothness: 0.1,
      lookAhead: 0,
      ...options,
    };
  }

  setTarget(body: CelestialBody | null) {
    this.targetBody = body;
    this.isFirstUpdate = true;
    
    if (body) {
      // Get initial position for smooth transition
      const bodyPosition = new THREE.Vector3();
      body.mesh.getWorldPosition(bodyPosition);
      this.previousBodyPosition.copy(bodyPosition);
      
      // Calculate offset based on body size
      const bodyRadius = body.diameter / 2;
      const isAsteroid = body.id && "applyForce" in body;
      const baseDistance = bodyRadius * (isAsteroid ? 10000 : 5);
      
      this.options.offsetDistance = baseDistance;
      this.options.offsetHeight = baseDistance * 0.3;
    }
  }

  setEnabled(enabled: boolean) {
    this.options.enabled = enabled;
    if (enabled) {
      this.isFirstUpdate = true;
      
      // If enabling with a target, initialize camera position smoothly
      if (this.targetBody) {
        const bodyPosition = new THREE.Vector3();
        this.targetBody.mesh.getWorldPosition(bodyPosition);
        
        // Set initial camera position if too close
        const currentDistance = this.camera.position.distanceTo(bodyPosition);
        const minDistance = this.options.offsetDistance * 0.5;
        
        if (currentDistance < minDistance) {
          // Move camera to a better starting position
          const direction = new THREE.Vector3()
            .subVectors(this.camera.position, bodyPosition)
            .normalize();
          
          if (direction.length() < 0.1) {
            // Use default direction if camera is at body position
            direction.set(0.7, 0.7, 0).normalize();
          }
          
          const newPosition = bodyPosition.clone()
            .add(direction.multiplyScalar(this.options.offsetDistance * 1.2));
          
          this.camera.position.copy(newPosition);
          this.controls.target.copy(bodyPosition);
        }
      }
    }
  }

  isEnabled(): boolean {
    return this.options.enabled;
  }

  updateOptions(options: Partial<CameraFollowOptions>) {
    this.options = { ...this.options, ...options };
  }

  getOptions(): CameraFollowOptions {
    return { ...this.options };
  }

  update(deltaTime: number = 0.016) {
    if (!this.options.enabled || !this.targetBody) {
      return;
    }

    // Get current body position
    const bodyPosition = new THREE.Vector3();
    this.targetBody.mesh.getWorldPosition(bodyPosition);

    // Calculate velocity based on actual position change
    if (!this.isFirstUpdate) {
      this.velocity.subVectors(bodyPosition, this.previousBodyPosition);
    }
    this.previousBodyPosition.copy(bodyPosition);
    this.isFirstUpdate = false;

    // Calculate camera offset direction
    // Default to a nice angle if no motion detected
    let offsetDirection: THREE.Vector3;
    
    if (this.velocity.length() > 0.00001) {
      // Position camera behind and slightly to the side of the motion direction
      const behind = this.velocity.clone().normalize().negate();
      const upVector = new THREE.Vector3(0, 0, 1);
      const sideVector = new THREE.Vector3().crossVectors(upVector, behind).normalize();
      
      // Blend behind and side for a more cinematic angle
      offsetDirection = behind.multiplyScalar(0.8).add(sideVector.multiplyScalar(0.2)).normalize();
    } else {
      // Default viewing angle: from above and to the side
      // Use a 45-degree angle that provides good visibility
      offsetDirection = new THREE.Vector3(0.7, 0.7, 0).normalize();
    }

    // Create a stable up vector (Z-axis in your coordinate system)
    const upVector = new THREE.Vector3(0, 0, 1);
    
    // Calculate right vector (perpendicular to offset and up)
    const rightVector = new THREE.Vector3().crossVectors(upVector, offsetDirection);
    if (rightVector.length() < 0.01) {
      // If offset is parallel to up, use a different right vector
      rightVector.set(1, 0, 0);
    }
    rightVector.normalize();
    
    // Recalculate proper up vector
    const properUpVector = new THREE.Vector3().crossVectors(offsetDirection, rightVector).normalize();

    // Calculate desired camera position
    // Position behind and above the object
    this.targetPosition.copy(bodyPosition)
      .add(offsetDirection.multiplyScalar(this.options.offsetDistance))
      .add(properUpVector.multiplyScalar(this.options.offsetHeight));

    // Calculate look-at point
    // Look slightly ahead if look-ahead is enabled
    if (this.options.lookAhead > 0 && this.velocity.length() > 0.00001) {
      const lookAheadOffset = this.velocity.clone().multiplyScalar(this.options.lookAhead * 1000);
      this.targetLookAt.copy(bodyPosition).add(lookAheadOffset);
    } else {
      this.targetLookAt.copy(bodyPosition);
    }

    // Smoothly interpolate camera position and target
    const smoothness = Math.max(0.001, Math.min(1, this.options.smoothness));
    
    this.camera.position.lerp(this.targetPosition, smoothness);
    this.controls.target.lerp(this.targetLookAt, smoothness);

    // Update camera orientation without triggering controls update
    // (controls will be updated in the main animation loop)
    this.camera.lookAt(this.controls.target);
  }

  reset() {
    this.targetBody = null;
    this.options.enabled = false;
    this.isFirstUpdate = true;
    this.velocity.set(0, 0, 0);
  }
}
