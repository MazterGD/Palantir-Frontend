// This file will contain functions to apply forces to planets
import * as THREE from "three";
import { CelestialBody } from "@/app/components/ThreeScene";

// Calculate acceleration from force using F = ma
// a = F/m, where m is mass of the planet
const calculateAcceleration = (
  force: { x: number; y: number; z: number },
  mass: number
): THREE.Vector3 => {
  return new THREE.Vector3(
    force.x / mass,
    force.y / mass,
    force.z / mass
  );
};

// Apply force to a celestial body
export const applyForce = (
  celestialBody: CelestialBody,
  forceVector: { x: number; y: number; z: number },
  deltaTime: number,
  duration: number
): {
  newVelocity: THREE.Vector3;
  originalPosition: THREE.Vector3;
  originalVelocity: THREE.Vector3;
} => {
  // Estimate mass based on planet diameter (assuming uniform density for simplicity)
  // This is a very simplified model - in reality mass distribution would be more complex
  const mass = Math.pow(celestialBody.diameter, 3) * 1000; // Approximate mass based on volume
  
  // Calculate acceleration (a = F/m)
  const acceleration = calculateAcceleration(forceVector, mass);
  
  // Store the original position and velocity
  const originalPosition = celestialBody.mesh.position.clone();
  
  // Get current velocity from the orbit generator (approximation)
  const originalVelocity = celestialBody.orbitGenerator.getVelocityAtPosition(
    celestialBody.mesh.position
  );
  
  // Calculate new velocity (v = v0 + a*t)
  const newVelocity = originalVelocity.clone().add(
    acceleration.multiplyScalar(duration)
  );
  
  // Return the calculated values
  return {
    newVelocity,
    originalPosition,
    originalVelocity,
  };
};

// Update position based on new velocity
export const updatePositionWithVelocity = (
  celestialBody: CelestialBody,
  velocity: THREE.Vector3,
  deltaTime: number
): void => {
  // Update position (p = p0 + v*dt)
  celestialBody.mesh.position.add(velocity.clone().multiplyScalar(deltaTime));
};

// Reset planet to original orbit
export const resetPlanetToOriginalOrbit = (
  celestialBody: CelestialBody,
  currentTime: number
): void => {
  // Get position based on original orbit parameters
  const position = celestialBody.orbitGenerator.getPositionAtTime(currentTime);
  celestialBody.mesh.position.set(
    position.position.x,
    position.position.y,
    position.position.z
  );
};