"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
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
  speedScale,
} from "../lib/scalingUtils";
import { addStarsBackground } from "./three/createBackground";
import { moveCamera } from "./three/cameraUtils";
import { RiResetRightLine } from "react-icons/ri";
import { IoIosPause } from "react-icons/io";
import { FaPlay } from "react-icons/fa";
import { League_Spartan } from "next/font/google";

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

// Extend Planet interface to include orbitGenerator for celestial bodies
interface CelestialBody extends Planet {
  orbitGenerator: ScaledOrbitGenerator;
}

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [speedMultiplier, setSpeedMultiplier] = useState(21); // Default to real-time (index 21 in speedScale)
  const [isPaused, setIsPaused] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<string>("");
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);

  // Find current speed option
  const currentSpeedOption = speedScale[speedMultiplier] || speedScale[21]; // Default to real-time

  // Use refs to access the latest values in animation loop
  const speedMultiplierRef = useRef(speedMultiplier);
  const isPausedRef = useRef(isPaused);
  const currentTimeRef = useRef(0);
  const celestialBodiesRef = useRef<CelestialBody[]>([]);
  const startDateRef = useRef(new Date());

  // Handle slider change with debounce for smoother updates
  const handleSliderChange = useCallback((value: number) => {
    setSpeedMultiplier(value);
  }, []);

  // Get current speed display
  const getCurrentSpeedDisplay = useCallback(() => {
    return currentSpeedOption.label;
  }, [currentSpeedOption]);

  // Format date for display
  const formatSimulationDate = useCallback((date: Date) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    const seconds = date.getSeconds().toString().padStart(2, "0");

    return `${month} ${day}, ${year} ${hours}:${minutes}:${seconds}`;
  }, []);

  // Update the refs whenever the states change
  useEffect(() => {
    speedMultiplierRef.current = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  // Initialize dates on client side to prevent hydration mismatch
  useEffect(() => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateTime(now.toISOString().slice(0, 16));
  }, []);

  // Update date display based on simulation time
  useEffect(() => {
    if (!currentDate) return; // Don't start updating until date is initialized

    const interval = setInterval(() => {
      if (!isPausedRef.current) {
        const days = currentTimeRef.current;
        const newDate = new Date(
          startDateRef.current.getTime() + days * 24 * 60 * 60 * 1000,
        );
        setCurrentDate(newDate);
      }
    }, 100); // Update 10 times per second for smooth display

    return () => clearInterval(interval);
  }, [currentDate]);

  // Toggle pause state
  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  // Reset time and positions
  const resetTime = useCallback(() => {
    currentTimeRef.current = 0;
    setSpeedMultiplier(21); // Reset to real-time (index 21)
    setIsPaused(false); // Unpause if paused
    const now = new Date();
    startDateRef.current = now;
    setCurrentDate(now);

    // Reset all celestial body positions
    celestialBodiesRef.current.forEach((body) => {
      const position = body.orbitGenerator.getPositionAtTime(0);
      body.mesh.position.set(
        position.position.x,
        position.position.y,
        position.position.z,
      );
    });
  }, []);

  // Set simulation to specific date/time
  const setSimulationDateTime = useCallback(() => {
    const selectedDate = new Date(selectedDateTime);
    const now = new Date();
    const timeDiff =
      (selectedDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24); // Convert to days

    currentTimeRef.current = timeDiff;
    startDateRef.current = now;
    setCurrentDate(selectedDate);
    setSpeedMultiplier(21); // Reset to real-time when jumping to new date

    // Update all celestial body positions to the selected time
    celestialBodiesRef.current.forEach((body) => {
      const position = body.orbitGenerator.getPositionAtTime(timeDiff);
      body.mesh.position.set(
        position.position.x,
        position.position.y,
        position.position.z,
      );
    });
  }, [selectedDateTime]);

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
    currentTimeRef.current = 0;

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

    // Update ref after all planets are added
    celestialBodiesRef.current = celestialBodies;

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
            if (
              material instanceof THREE.MeshPhongMaterial ||
              material instanceof THREE.MeshStandardMaterial
            ) {
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
        renderer.domElement.style.cursor = "pointer";
      } else {
        if (hoveredPlanet) {
          highlightPlanet(hoveredPlanet, false);
          hoveredPlanet = null;
        }
        renderer.domElement.style.cursor = "default";
      }
    };

    // Click handler
    const onClick = () => {
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

    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("click", onClick);

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

      // Only update time if not paused
      if (!isPausedRef.current) {
        // Get current speed option using index
        const currentSpeed = speedScale[speedMultiplierRef.current];
        const daysPerSecond = currentSpeed
          ? currentSpeed.daysPerSecond
          : 1 / 86400; // Default to real-time

        // Use daysPerSecond for time advancement (assuming 60fps)
        currentTimeRef.current += daysPerSecond / 60; // Convert days-per-second to days-per-frame

        // Debug: Log time progression every 60 frames (once per second at 60fps)
        if (Math.random() < 0.016) {
          // ~1 in 60 chance
          const speedLabel = currentSpeed ? currentSpeed.label : "Real-time";
          console.log(
            `Time: ${currentTimeRef.current.toFixed(2)} days, Speed: ${speedLabel}, Days/sec: ${daysPerSecond.toFixed(6)}`,
          );
        }

        celestialBodies.forEach((body) => {
          const position = body.orbitGenerator.getPositionAtTime(
            currentTimeRef.current,
          );
          body.mesh.position.set(
            position.position.x,
            position.position.y,
            position.position.z,
          );

          if (body.rotationSpeed) {
            const planetMesh = body.mesh.children[0] as THREE.Mesh;
            // Use absolute value for rotation speed to always rotate in the proper direction
            // Scale by 0.01 to make rotation speed appropriate for day-based time units
            const rotationAmount =
              body.rotationSpeed * Math.abs(daysPerSecond) * 0.01;

            // Determine rotation direction based on time direction
            if (daysPerSecond >= 0) {
              planetMesh.rotation.y += rotationAmount;
            } else {
              planetMesh.rotation.y -= rotationAmount;
            }
          }
        });
      }

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
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("click", onClick);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      if (Refcurrent) {
        Refcurrent.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className={`relative w-full h-screen ${leagueSpartan.className}`}>
      <div ref={mountRef} className="w-full h-full" />

      {/* Time travel slider */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center p-8 rounded-4xl w-[90%] sm:w-[600px] max-w-[95vw] backdrop-blur-sm">
        <div className="flex items-center w-full mb-4">
          <input
            type="range"
            min="0"
            max={speedScale.length - 1}
            value={speedMultiplier}
            onChange={(e) => handleSliderChange(parseInt(e.target.value))}
            className="w-full h-1 appearance-none bg-gray-800 rounded-lg outline-none time-slider"
            title="Time Speed Slider"
            aria-label="Time Speed Control"
            style={{
              accentColor: "white",
              border: "2px solid #4b5563",
              borderRadius: "100px",
            }}
          />
        </div>

        <div className="flex place-content-between justify-center gap-3 w-full">
          <div className="hover:bg-gray-500/50 p-2 rounded-xl w-[12vw] text-center">
            <span
              className="text-gray-300  font-medium text-lg cursor-pointer hover:text-gray-100 duration-300 mt-2"
              onClick={() => setShowDateTimePicker(true)}
              title="Click to jump to specific date and time"
            >
              {currentDate ? formatSimulationDate(currentDate) : "Loading..."}
            </span>
          </div>
          <button
            onClick={togglePause}
            className={`px-6 py-2 rounded-xl font-bold transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 bg-gray-500/40 hover:bg-gray-500/60 text-white pause-button ${isPaused ? "pause-button-paused" : "pause-button-playing"}`}
            title={isPaused ? "Resume" : "Pause"}
          >
            {isPaused ? <FaPlay /> : <IoIosPause />}
          </button>
          <button
            onClick={resetTime}
            className="px-6 py-2 rounded-xl font-bold transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 bg-gray-500/40 hover:bg-red-500/60 text-white"
            title="Reset to current time and positions"
          >
            <RiResetRightLine />
          </button>
          <span className="text-gray-300  font-medium text-lg cursor-pointer duration-300 m-2 mx-4">
            {isPaused ? "--" : getCurrentSpeedDisplay()}
          </span>
        </div>

        {/* Date/Time Picker Modal */}
        {showDateTimePicker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-600 max-w-md w-full mx-4">
              <h3 className="text-white text-lg font-bold mb-4 text-center">
                Jump to Date & Time
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    Select Date and Time:
                  </label>
                  <input
                    type="datetime-local"
                    value={selectedDateTime}
                    onChange={(e) => setSelectedDateTime(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-700 text-white rounded-md border border-gray-600 focus:border-cyan-400 focus:outline-none"
                    title="Select date and time to jump to"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDateTimePicker(false)}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setSimulationDateTime();
                      setShowDateTimePicker(false);
                    }}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-md font-medium transition-colors duration-200"
                  >
                    🚀 Jump
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
