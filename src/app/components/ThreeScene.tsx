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
import ForceSimulationPanel from "./ForceSimulationPanel";
import { 
  applyForce, 
  updatePositionWithVelocity, 
  resetPlanetToOriginalOrbit 
} from "../lib/forceSimulation";
import styled from "styled-components";

// Extend Planet interface to include orbitGenerator for celestial bodies
export interface CelestialBody extends Planet {
  orbitGenerator: ScaledOrbitGenerator;
  velocity?: THREE.Vector3;
  isSimulating?: boolean;
  originalPosition?: THREE.Vector3;
  originalVelocity?: THREE.Vector3;
}

const SceneContainer = styled.div`
  width: 100%;
  height: 100vh;
  position: relative;
`;

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [simulationActive, setSimulationActive] = useState(false);
  // Reference to store celestial bodies so we can access them in the UI panel callbacks
  const celestialBodiesRef = useRef<CelestialBody[]>([]);
  const currentTimeRef = useRef(0);

  useEffect(() => {
    if (!mountRef.current) return;
    const Refcurrent = mountRef.current;

    const { scene, camera, renderer } = setupScene(mountRef.current);
    const cameraDistance = getRecommendedCameraDistance();
    camera.position.set(0, cameraDistance * 0.065, 0);
    camera.lookAt(0, 0, 0);
    
    const controls = setupControls(camera, renderer);

    addStarsBackground(scene);
    const celestialBodies: CelestialBody[] = [];
    celestialBodiesRef.current = celestialBodies;
    let currentTime = 0;
    currentTimeRef.current = currentTime;

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
      if (planet.labelSprite) interactiveObjects.set(planet.labelSprite, planet);
      // Map planet mesh to planet
      planet.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          interactiveObjects.set(child, planet);
        }
      });
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
      currentTimeRef.current = currentTime;

      celestialBodies.forEach((body) => {
        if (body.isSimulating && body.velocity) {
          // Update position using physics simulation
          updatePositionWithVelocity(body, body.velocity, 0.1 * speedMultiplier);
          
          // Apply slight damping to eventually return to original orbit
          if (body.velocity.length() > 0.001) {
            body.velocity.multiplyScalar(0.995);
          } else {
            // When velocity is very small, gradually return to original orbit
            body.isSimulating = false;
            body.velocity = undefined;
          }
        } else {
          // Use regular orbital motion for non-simulating bodies
          const position = body.orbitGenerator.getPositionAtTime(currentTime);
          body.mesh.position.set(
            position.position.x,
            position.position.y,
            position.position.z,
          );
        }

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

  // Handle applying force to a planet
  const handleApplyForce = (
    planetName: string,
    forceVector: { x: number; y: number; z: number },
    deltaTime: number,
    duration: number
  ) => {
    const celestialBodies = celestialBodiesRef.current;
    const targetPlanet = celestialBodies.find(
      (body) => body.name.toLowerCase() === planetName.toLowerCase()
    );

    if (targetPlanet) {
      // Apply force and calculate new velocity
      const result = applyForce(targetPlanet, forceVector, deltaTime, duration);
      
      // Store the original state
      targetPlanet.originalPosition = result.originalPosition.clone();
      targetPlanet.originalVelocity = result.originalVelocity.clone();
      
      // Set the new velocity
      targetPlanet.velocity = result.newVelocity;
      targetPlanet.isSimulating = true;
      
      setSimulationActive(true);
    }
  };

  // Handle resetting planets to original orbits
  const handleReset = () => {
    const celestialBodies = celestialBodiesRef.current;
    const currentTime = currentTimeRef.current;
    
    celestialBodies.forEach((body) => {
      if (body.isSimulating) {
        resetPlanetToOriginalOrbit(body, currentTime);
        body.isSimulating = false;
        body.velocity = undefined;
      }
    });
    
    setSimulationActive(false);
  };

  return (
    <>
      <SceneContainer ref={mountRef} />
      <ForceSimulationPanel onApplyForce={handleApplyForce} onReset={handleReset} />
    </>
  );
}
