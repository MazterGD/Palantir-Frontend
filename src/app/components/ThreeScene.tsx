"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import type { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { setupScene } from "./three/setupScene";
import { setupControls } from "./three/setupControls";
import { addLights } from "./three/addLights";
import { setupPostProcessing } from "./three/postProcessing";
import type { ScaledOrbitGenerator } from "./three/orbitGenerator";
import { createAllPlanets, type Planet } from "./three/objects/createPlanet";
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

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const sceneInitialized = useRef(false);

  useEffect(() => {
    if (!mountRef.current || sceneInitialized.current) return;

    const Refcurrent = mountRef.current;
    sceneInitialized.current = true;

    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 150);

    // Initialize scene in hidden state
    const { scene, camera, renderer } = setupScene(mountRef.current);

    // Keep renderer hidden initially
    renderer.domElement.style.opacity = "0";
    renderer.domElement.style.pointerEvents = "none";

    const cameraDistance = getRecommendedCameraDistance();
    camera.position.set(0, cameraDistance * 0.065, 0);
    camera.lookAt(0, 0, 0);

    const controls = setupControls(camera, renderer);

    // Create celestial objects
    addStarsBackground(scene);
    const celestialBodies: CelestialBody[] = [];
    let currentTime = 0;

    // Speed control: 1.0 = normal, 0.1 = 10x slower, 0.01 = 100x slower
    const speedMultiplier = 0.1;

    const { sun, update: updateSun } = createSun(camera);
    scene.add(sun);

    // Create Planets using the updated createPlanet helper
    const halos_and_labels: (() => void)[] = [];
    const planets = createAllPlanets(camera, halos_and_labels);
    planets.forEach((planet) => {
      // Use pre-created mesh and orbit line
      scene.add(planet.mesh);
      scene.add(planet.orbitLine);

      // Store for animation
      celestialBodies.push({
        ...planet,
        orbitGenerator: planet.orbitGenerator,
      });
    });

    // Raycaster setup for interactions
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredPlanet: CelestialBody | null = null;

    // Create mapping of interactive objects
    const interactiveObjects: Map<THREE.Object3D, CelestialBody> = new Map();
    planets.forEach((planet) => {
      if (planet.haloSprite) interactiveObjects.set(planet.haloSprite, planet);
      if (planet.labelSprite)
        interactiveObjects.set(planet.labelSprite, planet);
      planet.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          interactiveObjects.set(child, planet);
        }
      });
    });

    // Helper function to highlight planet
    const highlightPlanet = (planet: CelestialBody, highlighted: boolean) => {
      if (planet.setHaloHighlight) {
        planet.setHaloHighlight(highlighted);
      }

      if (planet.setLabelHighlight) {
        planet.setLabelHighlight(highlighted);
      }

      if (planet.orbitLine && planet.orbitLine.material) {
        const lineMaterial = planet.orbitLine.material as LineMaterial;
        lineMaterial.opacity = highlighted ? 1.0 : 0.7;
        lineMaterial.linewidth = highlighted ? 5 : 3;
      }

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

        if (!planet && intersectedObject.parent) {
          planet = interactiveObjects.get(intersectedObject.parent);
        }

        if (planet && planet !== hoveredPlanet) {
          if (hoveredPlanet) {
            highlightPlanet(hoveredPlanet, false);
          }
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

          const viewDistance = planet.diameter * 1;
          const cameraOffset = new THREE.Vector3(viewDistance, 0, viewDistance);
          const cameraPosition = planetPosition.clone().add(cameraOffset);

          // Force "up" to always be +Z (parallel to orbital plane)
          camera.up.set(0, 0, 1);

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

    // Update camera near/far planes for the realistic scale
    camera.near = 1;
    camera.far = sceneBounds.outerBoundary * 2;
    camera.updateProjectionMatrix();

    // Configure controls for large scale
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = cameraDistance * 2;

    let frameCount = 0;
    const framesToWait = 30; // Wait for ~30 frames before showing

    const animate = () => {
      requestAnimationFrame(animate);

      // Update time (speed up significantly for visualization of realistic orbits)
      currentTime += 360 * speedMultiplier;

      // Update all celestial bodies
      celestialBodies.forEach((body) => {
        // Update orbital position
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

      // Rotate sun
      updateSun();

      controls.update();
      renderWithPostProcessing();

      // Show scene after initial frames are rendered
      frameCount++;
      if (frameCount === framesToWait) {
        setLoadingProgress(100);
        setTimeout(() => {
          renderer.domElement.style.transition = "opacity 0.8s ease-in-out";
          renderer.domElement.style.opacity = "1";
          renderer.domElement.style.pointerEvents = "auto";
          setIsReady(true);
        }, 300);
      }
    };
    animate();

    // Cleanup and resize handler
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
      clearInterval(progressInterval);
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
    <>
      {!isReady && (
        <div className="fixed inset-0 bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center z-50">
          <div className="text-center relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse opacity-60"></div>
              <div
                className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-300 rounded-full animate-pulse opacity-40"
                style={{ animationDelay: "0.5s" }}
              ></div>
              <div
                className="absolute bottom-1/4 left-1/3 w-0.5 h-0.5 bg-purple-300 rounded-full animate-pulse opacity-50"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="absolute top-1/2 right-1/4 w-0.5 h-0.5 bg-white rounded-full animate-pulse opacity-70"
                style={{ animationDelay: "1.5s" }}
              ></div>
            </div>

            <div className="relative w-40 h-40 mx-auto mb-8">
              {/* Outer orbit ring */}
              <div className="absolute inset-0 border-2 border-blue-500/20 rounded-full"></div>

              {/* Middle orbit ring with slower rotation */}
              <div
                className="absolute inset-3 border-2 border-purple-500/30 rounded-full animate-spin"
                style={{ animationDuration: "4s" }}
              ></div>

              {/* Inner spinning ring */}
              <div
                className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin"
                style={{ animationDuration: "2s" }}
              ></div>

              {/* Center glow effect */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></div>
              </div>

              {/* Orbiting planet */}
              <div
                className="absolute inset-0 animate-spin"
                style={{ animationDuration: "3s" }}
              >
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full shadow-lg shadow-cyan-400/50"></div>
              </div>
            </div>

            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 animate-pulse">
              Loading Solar System
            </h2>

            <div className="w-80 mx-auto mb-4">
              <div className="relative h-3 bg-gray-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-gray-700/50">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-300 ease-out relative"
                  style={{ width: `${loadingProgress}%` }}
                >
                  {/* Animated shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
                {/* Glow effect */}
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-md opacity-50 transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
            </div>

            <p className="text-lg font-semibold text-gray-300 mb-2">
              {Math.round(loadingProgress)}%
            </p>

            <p className="text-sm text-gray-500 animate-pulse">
              Initializing celestial bodies...
            </p>
          </div>
        </div>
      )}
      <div ref={mountRef} style={{ width: "100%", height: "100vh" }} />
    </>
  );
}
