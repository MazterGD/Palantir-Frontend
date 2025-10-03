"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { setupScene } from "./three/setupScene";
import { setupControls } from "./three/setupControls";
import { addLights } from "./three/addLights";
import { setupPostProcessing } from "./three/postProcessing";
import { ORBIT_PRESETS, ScaledOrbitGenerator } from "./three/orbitGenerator";
import { createAllPlanets } from "./three/objects/createPlanet";
import { createSun } from "./three/objects/createSun";
import { createAsteroid, Asteroid } from "./three/objects/createAsteroid";
import { moveCamera } from "./three/cameraUtils";
import { useAsteroid } from "../hooks/useAsteroid";
import {
  getRecommendedCameraDistance,
  getSceneBoundaries,
} from "../lib/scalingUtils";
import { addStarsBackground } from "./three/createBackground";

interface CelestialBody {
  mesh: THREE.Group | THREE.Points;
  orbitGenerator: ScaledOrbitGenerator;
  orbitLine?: THREE.Line | THREE.Object3D;
  rotationSpeed?: number;
  diameter: number;
  color: string;
  name: string;
  haloSprite?: THREE.Sprite;
  labelSprite?: THREE.Sprite;
  setHaloHighlight?: (highlighted: boolean) => void;
  setLabelHighlight?: (highlighted: boolean) => void;
}

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load asteroid data
  const { asteroid: asteroidData } = useAsteroid("3297389");

  useEffect(() => {
    // When asteroid data is loaded, hide loading screen
    if (asteroidData) {
      setIsLoading(false);
    }
  }, [asteroidData]);

  useEffect(() => {
    if (!mountRef.current) return;
    const Refcurrent = mountRef.current;

    const { scene, camera, renderer } = setupScene(mountRef.current);
    // Set camera position for realistic scale
    const cameraDistance = getRecommendedCameraDistance();
    camera.position.set(0, cameraDistance * 0.065, 0);
    camera.lookAt(0, 0, 0);

    const controls = setupControls(camera, renderer);

    // Create celestial objects
    addStarsBackground(scene);
    const celestialBodies: CelestialBody[] = [];
    const asteroids: Asteroid[] = [];
    let currentTime = 0;

    // Speed control: 1.0 = normal, 0.1 = 10x slower, 0.01 = 100x slower
    const speedMultiplier = 0.1;

    // Create Sun
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
        mesh: planet.mesh,
        orbitGenerator: planet.orbitGenerator,
        rotationSpeed: planet.rotationSpeed,
        diameter: planet.diameter,
        color: planet.color,
        name: planet.name,
        haloSprite: planet.haloSprite,
        labelSprite: planet.labelSprite,
        setHaloHighlight: planet.setHaloHighlight,
        setLabelHighlight: planet.setLabelHighlight,
      });
    });

    // Raycaster setup for interactions
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredObject: CelestialBody | null = null;

    // Create mapping of interactive objects
    const interactiveObjects: Map<THREE.Object3D, CelestialBody> = new Map();

    // Map planet sprites and meshes
    planets.forEach((planet) => {
      if (planet.haloSprite) {
        interactiveObjects.set(planet.haloSprite, {
          mesh: planet.mesh,
          orbitGenerator: planet.orbitGenerator,
          rotationSpeed: planet.rotationSpeed,
          diameter: planet.diameter,
          color: planet.color,
          name: planet.name,
          haloSprite: planet.haloSprite,
          labelSprite: planet.labelSprite,
          orbitLine: planet.orbitLine,
          setHaloHighlight: planet.setHaloHighlight,
          setLabelHighlight: planet.setLabelHighlight,
        });
      }
      if (planet.labelSprite) {
        interactiveObjects.set(planet.labelSprite, {
          mesh: planet.mesh,
          orbitGenerator: planet.orbitGenerator,
          rotationSpeed: planet.rotationSpeed,
          diameter: planet.diameter,
          color: planet.color,
          name: planet.name,
          haloSprite: planet.haloSprite,
          labelSprite: planet.labelSprite,
          orbitLine: planet.orbitLine,
          setHaloHighlight: planet.setHaloHighlight,
          setLabelHighlight: planet.setLabelHighlight,
        });
      }
      // Map planet mesh for direct clicking
      planet.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          interactiveObjects.set(child, {
            mesh: planet.mesh,
            orbitGenerator: planet.orbitGenerator,
            rotationSpeed: planet.rotationSpeed,
            diameter: planet.diameter,
            color: planet.color,
            name: planet.name,
            haloSprite: planet.haloSprite,
            labelSprite: planet.labelSprite,
            orbitLine: planet.orbitLine,
            setHaloHighlight: planet.setHaloHighlight,
            setLabelHighlight: planet.setLabelHighlight,
          });
        }
      });

      // Map orbit line to the planet
      interactiveObjects.set(planet.orbitLine, {
        mesh: planet.mesh,
        orbitGenerator: planet.orbitGenerator,
        rotationSpeed: planet.rotationSpeed,
        diameter: planet.diameter,
        color: planet.color,
        name: planet.name,
        haloSprite: planet.haloSprite,
        labelSprite: planet.labelSprite,
        orbitLine: planet.orbitLine,
        setHaloHighlight: planet.setHaloHighlight,
        setLabelHighlight: planet.setLabelHighlight,
      });
    });

    // Helper function to highlight celestial objects
    const highlightObject = (object: CelestialBody, highlighted: boolean) => {
      // Highlight halo with yellow color
      if (object.setHaloHighlight) {
        object.setHaloHighlight(highlighted);
      }

      // Highlight label with yellow color
      if (object.setLabelHighlight) {
        object.setLabelHighlight(highlighted);
      }

      // Highlight orbit line - FIXED: Use bright preset when highlighted
      if (object.orbitLine && "material" in object.orbitLine) {
        const orbitLine = object.orbitLine as any;
        if (orbitLine.material) {
          if (highlighted) {
            // Apply bright preset
            orbitLine.material.opacity = ORBIT_PRESETS.bright.opacity;
            if (orbitLine.material.linewidth !== undefined) {
              orbitLine.material.linewidth = ORBIT_PRESETS.bright.lineWidth;
            }
            if (orbitLine.material.emissiveIntensity !== undefined) {
              orbitLine.material.emissiveIntensity =
                ORBIT_PRESETS.bright.emissiveIntensity;
            }
          } else {
            // Restore to original state based on object type
            if (object.name.toLowerCase().includes("asteroid")) {
              // For asteroids, use subtle preset
              orbitLine.material.opacity = ORBIT_PRESETS.subtle.opacity;
              if (orbitLine.material.linewidth !== undefined) {
                orbitLine.material.linewidth = ORBIT_PRESETS.subtle.lineWidth;
              }
              if (orbitLine.material.emissiveIntensity !== undefined) {
                orbitLine.material.emissiveIntensity =
                  ORBIT_PRESETS.subtle.emissiveIntensity;
              }
            } else {
              // For planets, use standard preset
              orbitLine.material.opacity = ORBIT_PRESETS.standard.opacity;
              if (orbitLine.material.linewidth !== undefined) {
                orbitLine.material.linewidth = ORBIT_PRESETS.standard.lineWidth;
              }
              if (orbitLine.material.emissiveIntensity !== undefined) {
                orbitLine.material.emissiveIntensity =
                  ORBIT_PRESETS.standard.emissiveIntensity;
              }
            }
          }

          // Ensure material is updated
          orbitLine.material.needsUpdate = true;
        }
      }

      // Handle planet mesh (Group)
      if (object.mesh instanceof THREE.Group) {
        object.mesh.traverse((child: any) => {
          if (child instanceof THREE.Mesh && child.material) {
            const materials = Array.isArray(child.material)
              ? child.material
              : [child.material];

            materials.forEach((material) => {
              if (
                material instanceof THREE.MeshPhongMaterial ||
                material instanceof THREE.MeshStandardMaterial
              ) {
                material.emissive = new THREE.Color(object.color);
                material.emissiveIntensity = highlighted ? 0.3 : 0;
              }
            });
          }
        });
      }

      // Handle asteroid point (Points)
      if (object.mesh instanceof THREE.Points) {
        const material = object.mesh.material as THREE.PointsMaterial;
        const baseSize = object.diameter * 5;
        material.size = highlighted ? baseSize * 1.5 : baseSize;
        material.opacity = highlighted ? 1.0 : 0.9;
      }
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
        let object = interactiveObjects.get(intersectedObject);

        // Check parent objects if direct mapping not found
        if (!object && intersectedObject.parent) {
          object = interactiveObjects.get(intersectedObject.parent);
        }

        if (object && object !== hoveredObject) {
          // Unhighlight previous object
          if (hoveredObject) {
            highlightObject(hoveredObject, false);
          }
          // Highlight new object
          highlightObject(object, true);
          hoveredObject = object;
        }
        renderer.domElement.style.cursor = "pointer";
      } else {
        if (hoveredObject) {
          highlightObject(hoveredObject, false);
          hoveredObject = null;
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
        let object = interactiveObjects.get(intersectedObject);

        if (!object && intersectedObject.parent) {
          object = interactiveObjects.get(intersectedObject.parent);
        }

        if (object) {
          const objectPosition = new THREE.Vector3();
          object.mesh.getWorldPosition(objectPosition);

          // Camera offset (from above and slightly back)
          const viewDistance = object.diameter; // Adjust multiplier as needed
          const cameraOffset = new THREE.Vector3(
            viewDistance,
            viewDistance * 0.5,
            viewDistance,
          );
          const cameraPosition = objectPosition.clone().add(cameraOffset);

          // Force "up" to always be +Z (parallel to orbital plane)
          camera.up.set(0, 0, 1);

          // Smoothly animate camera
          moveCamera(camera, controls, cameraPosition, objectPosition);
        }
      }
    };

    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("click", onClick);

    // Add asteroid when data is loaded
    if (asteroidData) {
      const asteroid = createAsteroid(asteroidData, camera, halos_and_labels);

      // Add to scene
      scene.add(asteroid.mesh);
      scene.add(asteroid.orbitLine);

      // Create asteroid celestial body
      const asteroidBody: CelestialBody = {
        mesh: asteroid.mesh,
        orbitGenerator: asteroid.orbitGenerator,
        diameter: asteroid.diameter,
        color: asteroid.color,
        name: asteroid.name,
        haloSprite: asteroid.haloSprite,
        labelSprite: asteroid.labelSprite,
        setHaloHighlight: asteroid.setHaloHighlight,
        setLabelHighlight: asteroid.setLabelHighlight,
      };

      // Add to animation loop
      celestialBodies.push(asteroidBody);

      // Add to interactive objects
      if (asteroid.haloSprite) {
        interactiveObjects.set(asteroid.haloSprite, asteroidBody);
      }
      if (asteroid.labelSprite) {
        interactiveObjects.set(asteroid.labelSprite, asteroidBody);
      }
      if (asteroid.orbitLine) {
        interactiveObjects.set(asteroid.orbitLine, asteroidBody);
      }
      // Map asteroid point for direct clicking
      asteroid.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.Points) {
          interactiveObjects.set(child, asteroidBody);
        }
      });

      asteroids.push(asteroid);
    }

    // Add lights
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

    // Animation loop
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

        // Update planetary rotation (only for planets)
        if (body.rotationSpeed && body.mesh instanceof THREE.Group) {
          const planetMesh = body.mesh.children[0] as THREE.Mesh;
          planetMesh.rotation.y += body.rotationSpeed * speedMultiplier;
        }

        // Update asteroid LOD if applicable
        if ((body as any).updateLOD) {
          (body as any).updateLOD(camera.position);
        }
      });

      halos_and_labels.forEach((updateHalo) => updateHalo());

      // Rotate sun
      updateSun();

      controls.update();
      renderWithPostProcessing();
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
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("mousemove", onMouseMove);
      renderer.domElement.removeEventListener("click", onClick);
      controls.dispose();
      renderer.dispose();
      if (Refcurrent) {
        Refcurrent.removeChild(renderer.domElement);
      }
    };
  }, [asteroidData]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

      {/* Loading Screen */}
      {isLoading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "#000000",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            color: "white",
            fontSize: "18px",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "5px solid #f3f3f3",
              borderTop: "5px solid #3498db",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "20px",
            }}
          />
          <p>Loading asteroid data...</p>

          <style jsx>{`
            @keyframes spin {
              0% {
                transform: rotate(0deg);
              }
              100% {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
