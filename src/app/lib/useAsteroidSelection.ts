import { useCallback } from 'react';
import * as THREE from 'three';
import { moveCamera } from '../components/three/cameraUtils';
import { AsteroidDetailedInfo } from './asteroidData';

interface UseAsteroidSelectionProps {
  camera: THREE.PerspectiveCamera | null;
  controls: any;
  celestialBodiesMap: Map<string, any>;
  onAsteroidDetailsLoaded?: (details: AsteroidDetailedInfo) => void;
}

export function useAsteroidSelection({
  camera,
  controls,
  celestialBodiesMap,
  onAsteroidDetailsLoaded,
}: UseAsteroidSelectionProps) {
  
  const handleCelestialBodySelection = useCallback(async (bodyId: string, type: string) => {
    if (!camera || !controls) return;
    
    // Handle known celestial bodies (planets)
    const selectedBody = celestialBodiesMap.get(bodyId);
    
    if (selectedBody) {
      const planetPosition = new THREE.Vector3();
      selectedBody.mesh.getWorldPosition(planetPosition);

      const viewDistance = selectedBody.diameter * 2;
      const cameraOffset = new THREE.Vector3(viewDistance, 0, viewDistance);
      const cameraPosition = planetPosition.clone().add(cameraOffset);

      camera.up.set(0, 0, 1);
      moveCamera(camera, controls, cameraPosition, planetPosition);
      return;
    }
    
    // Handle asteroids
    if (type === "asteroid") {
      await handleAsteroidSelection(bodyId);
    }
  }, [camera, controls, celestialBodiesMap, onAsteroidDetailsLoaded]);

  const handleAsteroidSelection = useCallback(async (bodyId: string) => {
    if (!camera || !controls) return;
    
    const asteroidName = bodyId.replace('asteroid_', '').replace(/_/g, ' ');
    
    try {
      console.log(`Loading data for ${asteroidName}...`);
      
      // Import and fetch asteroid details
      const { fetchAsteroidDetails } = await import('./asteroidData');
      const asteroidDetails = await fetchAsteroidDetails(asteroidName);
      
      // Log if using fallback data
      if (asteroidDetails.classification?.includes("Error")) {
        console.warn(`Using estimated data for ${asteroidName}`);
      }
      
      // Notify parent component to show asteroid details (if callback provided)
      if (onAsteroidDetailsLoaded) {
        onAsteroidDetailsLoaded(asteroidDetails);
      }
      
      // Navigate camera to asteroid belt position
      navigateToAsteroidBelt(asteroidName, asteroidDetails.diameter);
      
    } catch (error) {
      console.error(`Unable to load data for ${asteroidName}:`, error);
    }
  }, [camera, controls, celestialBodiesMap, onAsteroidDetailsLoaded]);

  const navigateToAsteroidBelt = useCallback((asteroidName: string, diameter: number) => {
    if (!camera || !controls) return;
    
    // Get Mars and Jupiter positions
    const mars = celestialBodiesMap.get('mars');
    const jupiter = celestialBodiesMap.get('jupiter');
    
    let asteroidBeltPosition = new THREE.Vector3(0, 0, 0);
    
    if (mars && jupiter) {
      const marsPosition = new THREE.Vector3();
      const jupiterPosition = new THREE.Vector3();
      mars.mesh.getWorldPosition(marsPosition);
      jupiter.mesh.getWorldPosition(jupiterPosition);
      
      // Use name hash for deterministic positioning
      const nameHash = asteroidName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const positionRatio = 0.2 + (nameHash % 60) / 100;
      
      const direction = new THREE.Vector3().subVectors(jupiterPosition, marsPosition).normalize();
      const distance = marsPosition.distanceTo(jupiterPosition) * positionRatio;
      asteroidBeltPosition = marsPosition.clone().add(direction.multiplyScalar(distance));
    }
    
    // Calculate camera position
    const scaleFactor = 0.05;
    const minDistance = 15;
    const viewDistance = Math.max(minDistance, diameter * scaleFactor);
    
    const cameraPosition = new THREE.Vector3(
      asteroidBeltPosition.x + viewDistance,
      asteroidBeltPosition.y + viewDistance * 0.5,
      asteroidBeltPosition.z + viewDistance * 0.8
    );
    
    camera.up.set(0, 0, 1);
    moveCamera(camera, controls, cameraPosition, asteroidBeltPosition);
  }, [camera, controls, celestialBodiesMap]);

  return { handleCelestialBodySelection };
}
