"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  scaleTimeSpeed,
} from "../lib/scalingUtils";
import { addStarsBackground } from "./three/createBackground";
import { moveCamera } from "./three/cameraUtils";

// Extend Planet interface to include orbitGenerator for celestial bodies
interface CelestialBody extends Planet {
  orbitGenerator: ScaledOrbitGenerator;
}

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [speedMultiplier, setSpeedMultiplier] = useState(50); // Default to middle value
  
  // Configuration for time speed scaling
  const timeSpeedConfig = {
    baseSpeed: 1,           // Not used in the new scaling system
    exponentialFactor: 2.5  // Higher exponent provides finer control in center, faster at edges
  };
  
  // Use a ref to access the latest speed multiplier in animation loop
  const speedMultiplierRef = useRef(speedMultiplier);

  // Function to debounce slider updates for smoother experience
  const debounce = useCallback((func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }, []);

  // Handle slider change with debounce for smoother updates
  const handleSliderChange = useCallback(
    debounce((value: number) => {
      setSpeedMultiplier(value);
    }, 10),
    []
  );

  // Calculate the scaled time speed value and minutes per second for display
  const getScaledTimeSpeed = useCallback((value: number) => {
    return scaleTimeSpeed(value, timeSpeedConfig.baseSpeed, timeSpeedConfig.exponentialFactor);
  }, [timeSpeedConfig.baseSpeed, timeSpeedConfig.exponentialFactor]);
  
  // Get a CSS class for the time scale indicator based on slider value
  const getTimeScaleClass = useCallback((value: number) => {
    const normalizedValue = Math.abs(value - 50) / 50; // 0 to 1, from center to edges
    
    if (normalizedValue > 0.9) {
      return "scale-month"; // Month level
    } else if (normalizedValue > 0.7) {
      return "scale-week"; // Week level 
    } else if (normalizedValue > 0.5) {
      return "scale-days"; // Days level
    } else if (normalizedValue > 0.3) {
      return "scale-day"; // Day level
    } else {
      return "scale-hours"; // Hours level
    }
  }, []);

  // Update the ref whenever the state changes
  useEffect(() => {
    speedMultiplierRef.current = speedMultiplier;
  }, [speedMultiplier]);

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
      
      // Calculate the time advancement based on slider position using scaling utility
      const timeSpeed = scaleTimeSpeed(
        speedMultiplierRef.current, 
        timeSpeedConfig.baseSpeed, 
        timeSpeedConfig.exponentialFactor
      );
      
      // Use scaled value for time advancement (handles up to 1 month)
      const { scaledValue } = timeSpeed;
      currentTime += scaledValue;

      celestialBodies.forEach((body) => {
        const position = body.orbitGenerator.getPositionAtTime(currentTime);
        body.mesh.position.set(
          position.position.x,
          position.position.y,
          position.position.z,
        );

        if (body.rotationSpeed) {
          const planetMesh = body.mesh.children[0] as THREE.Mesh;
          // Use absolute value for rotation speed to always rotate in the proper direction
          // Scale by 0.01 to make rotation speed appropriate for day-based time units
          const rotationAmount = body.rotationSpeed * Math.abs(scaledValue) * 0.01;
          
          // Determine rotation direction based on time direction
          if (scaledValue >= 0) {
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
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center bg-black bg-opacity-60 p-4 rounded-lg w-[90%] sm:w-[600px] max-w-[95vw]">
        <style jsx>{`
          .time-slider {
            -webkit-appearance: none;
            background: linear-gradient(to right, #3b82f6 0%, #3b82f6 10%, #6b7280 50%, #f59e0b 90%, #f59e0b 100%);
            cursor: pointer;
          }
          
          input[type="range"]::-webkit-slider-thumb {
            -webkit-appearance: none;
            appearance: none;
            width: 20px;
            height: 20px;
            background: white;
            border: 2px solid #4b5563;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.15s ease-in-out;
          }
          
          input[type="range"]::-webkit-slider-thumb:hover,
          input[type="range"]:active::-webkit-slider-thumb {
            transform: scale(1.2);
            box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
          }
          
          input[type="range"]::-moz-range-thumb {
            width: 20px;
            height: 20px;
            background: white;
            border: 2px solid #4b5563;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.15s ease-in-out;
          }
          
          input[type="range"]::-moz-range-thumb:hover,
          input[type="range"]:active::-moz-range-thumb {
            transform: scale(1.2);
            box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
          }
        `}</style>
        <div className="text-white text-sm mb-4 flex flex-wrap sm:flex-nowrap items-center justify-between w-full">
          <strong className="text-lg">Time Speed:</strong> 
          <span className={`ml-2 font-mono ${speedMultiplier < 50 ? "text-blue-300" : speedMultiplier > 50 ? "text-amber-300" : "text-white"}`}>
            {speedMultiplier < 50 ? "Past" : speedMultiplier > 50 ? "Future" : "Present"} 
            <span className="bg-gray-800 px-3 py-1 rounded-md ml-2 font-bold text-lg shadow-inner shadow-white/10">
              {getScaledTimeSpeed(speedMultiplier).formattedTime}
            </span>
          </span>
        </div>
        
        <div className="flex items-center w-full">
          <span className="text-blue-300 text-xs mr-2 font-bold">Past</span>
          <input
            type="range"
            min="0"
            max="100"
            value={speedMultiplier}
            onChange={(e) => handleSliderChange(parseInt(e.target.value))}
            className="w-full h-5 appearance-none bg-gray-800 rounded-lg outline-none time-slider"
            title="Time Travel Slider"
            aria-label="Time Travel Control"
          />
          <span className="text-amber-300 text-xs ml-2 font-bold">Future</span>
        </div>
        
        {/* Time scale indicators */}
        <div className="flex justify-between w-full px-1 mt-3 relative">
          {/* Removed the individual segments in favor of the gradient background on the slider */}
          
          <span className="text-blue-200 text-xs font-semibold">-1 Month</span>
          <span className="text-blue-200 text-xs">-1 Week</span>
          <span className="text-white text-xs font-medium">Paused</span>
          <span className="text-amber-200 text-xs">+1 Week</span>
          <span className="text-amber-200 text-xs font-semibold">+1 Month</span>
        </div>
        
        <div className="text-white text-xs mt-2 opacity-70 text-center">
          Drag the slider to adjust simulation speed — values show simulated time per real second
        </div>
      </div>
    </div>
  );
}
