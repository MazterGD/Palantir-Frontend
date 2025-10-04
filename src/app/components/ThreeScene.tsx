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

// Extend Planet interface to include orbitGenerator for celestial bodies
interface CelestialBody extends Planet {
  orbitGenerator: ScaledOrbitGenerator;
}

// Define time multiplier presets
interface TimeMultiplier {
  label: string;
  value: number; // Seconds per animation frame
  description: string;
}

const TIME_MULTIPLIERS: TimeMultiplier[] = [
  { label: "-1 Month/s", value: -2592000, description: "Past: 1 month per second" },
  { label: "-1 Week/s", value: -604800, description: "Past: 1 week per second" },
  { label: "-1 Day/s", value: -86400, description: "Past: 1 day per second" },
  { label: "-1 Hour/s", value: -3600, description: "Past: 1 hour per second" },
  { label: "-10 Min/s", value: -600, description: "Past: 10 minutes per second" },
  { label: "-1 Min/s", value: -60, description: "Past: 1 minute per second" },
  { label: "Real Time", value: 1, description: "Real time: 1 second per second" },
  { label: "+1 Min/s", value: 60, description: "Future: 1 minute per second" },
  { label: "+10 Min/s", value: 600, description: "Future: 10 minutes per second" },
  { label: "+1 Hour/s", value: 3600, description: "Future: 1 hour per second" },
  { label: "+1 Day/s", value: 86400, description: "Future: 1 day per second" },
  { label: "+1 Week/s", value: 604800, description: "Future: 1 week per second" },
  { label: "+1 Month/s", value: 2592000, description: "Future: 1 month per second" },
];

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [timeMultiplierIndex, setTimeMultiplierIndex] = useState(6); // Default to "Real Time"
  const lastFrameTimeRef = useRef(Date.now());
  const timeMultiplierRef = useRef<number>(TIME_MULTIPLIERS[6].value); // Store the actual value
  
  // Update the multiplier ref when the index changes
  useEffect(() => {
    timeMultiplierRef.current = TIME_MULTIPLIERS[timeMultiplierIndex].value;
  }, [timeMultiplierIndex]);

  useEffect(() => {
    if (!mountRef.current) return;
    const Refcurrent = mountRef.current;

    const { scene, camera, renderer } = setupScene(mountRef.current);
    const cameraDistance = getRecommendedCameraDistance();
    camera.position.set(0, cameraDistance * 0.065, cameraDistance * 0.045);
    camera.lookAt(0, 0, 0);
    
    const controls = setupControls(camera, renderer);

    addStarsBackground(scene);
    const celestialBodies: CelestialBody[] = [];
    let currentTime = 0;
    
    // Update the reference time to current time
    lastFrameTimeRef.current = Date.now();

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
      
      // Calculate delta time in seconds since last frame
      const now = Date.now();
      const deltaSeconds = (now - lastFrameTimeRef.current) / 1000;
      lastFrameTimeRef.current = now;
      
      // Use the timeMultiplierRef for time advancement
      // Convert to a Julian date increment (days)
      const timeAdvance = timeMultiplierRef.current * deltaSeconds / 86400; // Convert seconds to days
      
      // Update current time (in days)
      currentTime += timeAdvance;

      celestialBodies.forEach((body) => {
        const position = body.orbitGenerator.getPositionAtTime(currentTime);
        body.mesh.position.set(
          position.position.x,
          position.position.y,
          position.position.z,
        );

        if (body.rotationSpeed) {
          // Scale rotation by time multiplier for realistic day/night cycles
          const rotationAmount = body.rotationSpeed * Math.abs(timeAdvance);
          const planetMesh = body.mesh.children[0] as THREE.Mesh;
          
          // Apply rotation in the correct direction
          if (timeAdvance >= 0) {
            planetMesh.rotation.y += rotationAmount;
          } else {
            planetMesh.rotation.y -= rotationAmount;
          }
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

  return (
    <div className="relative w-full h-screen">
      <div ref={mountRef} className="w-full h-full" />
      
      {/* Time travel slider */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center bg-black bg-opacity-50 p-4 rounded-lg">
        <div className="text-white text-sm mb-2">
          <strong>Time Speed:</strong> {TIME_MULTIPLIERS[timeMultiplierIndex].label}
        </div>
        <div className="text-white text-xs mb-2">
          {TIME_MULTIPLIERS[timeMultiplierIndex].description}
        </div>
        
        <div className="flex items-center">
          <span className="text-white text-xs mr-2">Past</span>
          <input
            type="range"
            min="0"
            max={TIME_MULTIPLIERS.length - 1}
            value={timeMultiplierIndex}
            onChange={(e) => setTimeMultiplierIndex(parseInt(e.target.value))}
            className="w-64 h-4"
            title="Time Travel Slider"
            aria-label="Time Travel Control"
          />
          <span className="text-white text-xs ml-2">Future</span>
        </div>
        <div className="text-white text-xs mt-2 opacity-70">
          Drag to control time flow - planets will move along their orbits accordingly
        </div>
      </div>
    </div>
  );
}
