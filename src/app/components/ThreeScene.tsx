"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { setupScene } from "./three/setupScene";
import { setupControls } from "./three/setupControls";
import { addLights } from "./three/addLights";
import { setupPostProcessing } from "./three/postProcessing";
import { ScaledOrbitGenerator } from "./three/orbitGenerator";
import { createAllPlanets, Planet } from "./three/objects/createPlanet";
import { createSun } from "./three/objects/createSun";
import {
  getRecommendedCameraDistance,
  getSceneBoundaries,
} from "../lib/scalingUtils";
import { addStarsBackground } from "./three/createBackground";
import { moveCamera } from "./three/cameraUtils";
import ControlPanel from "./ControlPanel";
import styles from "./ThreeScene.module.css";

// Extend Planet interface to include orbitGenerator for celestial bodies
interface CelestialBody extends Planet {
  orbitGenerator: ScaledOrbitGenerator;
}

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [controlsRef, setControlsRef] = useState<any>(null);
  const [cameraRef, setCameraRef] = useState<THREE.Camera | null>(null);
  const [initialCameraPosition, setInitialCameraPosition] = useState<THREE.Vector3 | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const Refcurrent = mountRef.current;

    const { scene, camera, renderer } = setupScene(mountRef.current);
    const cameraDistance = getRecommendedCameraDistance();
    
    // Set camera at approximately 40 degrees from the z-axis
    const angleFromY = 50 * (Math.PI / 180); // Convert to radians (90 - 40 = 50)
    const azimuthalAngle = 45 * (Math.PI / 180); // 45 degrees around the y-axis
    
    // Calculate position based on spherical coordinates
    const x = cameraDistance * 0.065 * Math.sin(angleFromY) * Math.cos(azimuthalAngle);
    const y = cameraDistance * 0.065 * Math.cos(angleFromY);
    const z = cameraDistance * 0.065 * Math.sin(angleFromY) * Math.sin(azimuthalAngle);
    
    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1); // Ensure z-up orientation
    
    setCameraRef(camera);
    
    const controls = setupControls(camera, renderer);
    setControlsRef(controls);

    addStarsBackground(scene);
    const celestialBodies: CelestialBody[] = [];
    let currentTime = 0;

    const speedMultiplier = 0.1;

    const { sun, update: updateSun } = createSun(camera);
    scene.add(sun);

    const halos_and_labels: (() => void)[] = [];
    const planets = createAllPlanets(camera, halos_and_labels);
    planets.forEach((planet) => {
      scene.add(planet.mesh);
      scene.add(planet.orbitLine);

      celestialBodies.push({
        ...planet,
        orbitGenerator: planet.orbitGenerator,
      });
    });

    // Raycaster setup for interactions
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredPlanet: CelestialBody | null = null;

    // Create mapping of interactive objects to planets
    const interactiveObjects: Map<THREE.Object3D, CelestialBody> = new Map();
    planets.forEach((planet) => {
      // Map sprites to planet
      if (planet.haloSprite) interactiveObjects.set(planet.haloSprite, planet);
    });

    // Helper function to highlight planet
    const highlightPlanet = (planet: CelestialBody, highlighted: boolean) => {
      // Highlight halo
      if (planet.setHaloHighlight) {
        planet.setHaloHighlight(highlighted);
      }
      
      // Highlight label
      if (planet.setLabelHighlight) {
        planet.setLabelHighlight(highlighted);
      }
      
      // Highlight orbit line
      if (planet.orbitLine && planet.orbitLine.material) {
        const lineMaterial = planet.orbitLine.material as LineMaterial;
        lineMaterial.opacity = highlighted ? 1.0 : 0.7;
        lineMaterial.linewidth = highlighted ? 5 : 3;
      }
      
      // Highlight planet mesh
      planet.mesh.traverse((child: THREE.Object3D) => {
        if (child instanceof THREE.Mesh) {
          const materials = Array.isArray(child.material) 
            ? child.material 
            : [child.material];
          
          materials.forEach((material) => {
            if (material instanceof THREE.MeshPhongMaterial || 
                material instanceof THREE.MeshStandardMaterial) {
              material.emissive = new THREE.Color(planet.color);
              material.emissiveIntensity = highlighted ? 0.3 : 0;
            }
          });
        }
      });
    };

    // Mouse move handler
    const onMouseMove = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      
      // Get all interactive objects
      const checkObjects = Array.from(interactiveObjects.keys());
      const intersects = raycaster.intersectObjects(checkObjects, true);

      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        let planet = interactiveObjects.get(intersectedObject);
        
        // Check parent objects if direct mapping not found
        if (!planet && intersectedObject.parent) {
          planet = interactiveObjects.get(intersectedObject.parent);
        }
        
        if (planet && planet !== hoveredPlanet) {
          // Unhighlight previous planet
          if (hoveredPlanet) {
            highlightPlanet(hoveredPlanet, false);
          }
          // Highlight new planet
          highlightPlanet(planet, true);
          hoveredPlanet = planet;
        }
        renderer.domElement.style.cursor = 'pointer';
      } else {
        if (hoveredPlanet) {
          highlightPlanet(hoveredPlanet, false);
          hoveredPlanet = null;
        }
        renderer.domElement.style.cursor = 'default';
      }
    };

    // Click handler
    const onClick = (event: MouseEvent) => {
      raycaster.setFromCamera(mouse, camera);
      const checkObjects = Array.from(interactiveObjects.keys());
      const intersects = raycaster.intersectObjects(checkObjects, true);

      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
        let planet = interactiveObjects.get(intersectedObject);
        
        if (!planet && intersectedObject.parent) {
          planet = interactiveObjects.get(intersectedObject.parent);
        }
        
        if (planet) {
          const planetPosition = new THREE.Vector3();
          planet.mesh.getWorldPosition(planetPosition);

          // Camera offset (from above and slightly back)
          const viewDistance = planet.diameter * 1;
          const cameraOffset = new THREE.Vector3(viewDistance, 0, viewDistance); // stays in XZ plane
          const cameraPosition = planetPosition.clone().add(cameraOffset);

          // Force "up" to always be +Z (parallel to orbital plane)
          camera.up.set(0, 0, 1);

          // Smoothly animate camera
          moveCamera(camera, controls, cameraPosition, planetPosition);
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);

    addLights(scene);
    const { update: renderWithPostProcessing, resize: resizePostProcessing } =
      setupPostProcessing(scene, camera, renderer);

    const sceneBounds = getSceneBoundaries();

    camera.near = 1;
    camera.far = sceneBounds.outerBoundary * 2;
    camera.updateProjectionMatrix();

    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = cameraDistance * 2;

    const animate = () => {
      requestAnimationFrame(animate);

      currentTime += 360 * speedMultiplier;

      celestialBodies.forEach((body) => {
        const position = body.orbitGenerator.getPositionAtTime(currentTime);
        body.mesh.position.set(
          position.position.x,
          position.position.y,
          position.position.z,
        );

        if (body.rotationSpeed) {
          const planetMesh = body.mesh.children[0] as THREE.Mesh;
          planetMesh.rotation.y += body.rotationSpeed * speedMultiplier;
        }
      });

      halos_and_labels.forEach((updateHalo) => updateHalo());

      updateSun();

      controls.update();
      renderWithPostProcessing();
    };
    animate();

    const handleResize = () => {
      camera.aspect =
        mountRef.current!.clientWidth / mountRef.current!.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(
        mountRef.current!.clientWidth,
        mountRef.current!.clientHeight,
      );
      resizePostProcessing();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('click', onClick);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      if (Refcurrent) {
        Refcurrent.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleZoomIn = () => {
    if (controlsRef && cameraRef) {
      const zoomFactor = 0.8; // Zoom in by 20%
      const currentDistance = cameraRef.position.distanceTo(controlsRef.target);
      const newDistance = Math.max(controlsRef.minDistance, currentDistance * zoomFactor);
      
      // Create a new position that's closer to the target
      const direction = new THREE.Vector3().subVectors(cameraRef.position, controlsRef.target).normalize();
      const newPosition = new THREE.Vector3().copy(controlsRef.target).add(direction.multiplyScalar(newDistance));
      
      moveCamera(cameraRef, controlsRef, newPosition, controlsRef.target, 500);
    }
  };

  const handleZoomOut = () => {
    if (controlsRef && cameraRef) {
      const zoomFactor = 1.25; // Zoom out by 25%
      const currentDistance = cameraRef.position.distanceTo(controlsRef.target);
      const newDistance = Math.min(controlsRef.maxDistance, currentDistance * zoomFactor);
      
      // Create a new position that's further from the target
      const direction = new THREE.Vector3().subVectors(cameraRef.position, controlsRef.target).normalize();
      const newPosition = new THREE.Vector3().copy(controlsRef.target).add(direction.multiplyScalar(newDistance));
      
      moveCamera(cameraRef, controlsRef, newPosition, controlsRef.target, 500);
    }
  };

  const handleResetView = () => {
    if (controlsRef && cameraRef) {
      // Reset to a view at approximately 40 degrees from the z-axis
      const cameraDistance = getRecommendedCameraDistance();
      
      // Calculate position using spherical coordinates
      // 40 degrees from z-axis means 50 degrees from y-axis in this coordinate system
      const angleFromY = 50 * (Math.PI / 180); // Convert to radians
      const azimuthalAngle = 45 * (Math.PI / 180); // 45 degrees around the y-axis
      
      // Calculate position based on spherical coordinates
      const x = cameraDistance * 0.065 * Math.sin(angleFromY) * Math.cos(azimuthalAngle);
      const y = cameraDistance * 0.065 * Math.cos(angleFromY);
      const z = cameraDistance * 0.065 * Math.sin(angleFromY) * Math.sin(azimuthalAngle);
      
      const newPosition = new THREE.Vector3(x, y, z);
      const originTarget = new THREE.Vector3(0, 0, 0);
      
      // Reset camera up vector to ensure proper orientation
      cameraRef.up.set(0, 0, 1);
      
      moveCamera(cameraRef, controlsRef, newPosition, originTarget, 1000);
    }
  };

  return (
    <div className={styles.solarSystemContainer}>
      <div ref={mountRef} className={styles.canvasContainer} />
      <ControlPanel 
        onZoomIn={handleZoomIn} 
        onZoomOut={handleZoomOut} 
        onResetView={handleResetView} 
      />
    </div>
  );
}
