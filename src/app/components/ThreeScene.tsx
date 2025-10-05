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
import { createAsteroids } from "./three/objects/createAsteroid";
import { moveCamera } from "./three/cameraUtils";
import { useAsteroidsBulk } from "../hooks/useAsteroidsBulk";
import {
  getRecommendedCameraDistance,
  getSceneBoundaries,
} from "../lib/scalingUtils";
import { addStarsBackground } from "./three/createBackground";
import AsteroidVisualizer from "./dataBox";
import SelectedBodyPanel from "./selectBodyPanel";

export interface CelestialBody {
  id?: string;
  mesh: THREE.Group | THREE.Points;
  orbitGenerator: any;
  orbitLine?: THREE.Line | THREE.Object3D;
  rotationSpeed?: number;
  diameter: number;
  color: string;
  name: string;
  haloSprite?: THREE.Sprite;
  labelSprite?: THREE.Sprite;
  setHaloHighlight?: (highlighted: boolean) => void;
  setLabelHighlight?: (highlighted: boolean) => void;
  updateLOD?: (cameraPosition: THREE.Vector3) => void;
  showOrbit?: () => void;
  hideOrbit?: () => void;
  applyForce?: (
    force: { x: number; y: number; z: number },
    deltaTime: number,
    currentTime: number,
  ) => void;
}

let sceneRef: THREE.Scene | null = null;
let cameraRef: THREE.PerspectiveCamera | null = null;
let celestialBodiesRef: CelestialBody[] = [];
const interactiveObjectsRef: Map<THREE.Object3D, CelestialBody> = new Map();
let halosAndLabelsRef: (() => void)[] = [];
let currentSelectedBody: CelestialBody | null = null;
let currentTimeRef = 0;
let rendererRef: THREE.WebGLRenderer | null = null;
let controlsRef: any = null;

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sceneInitialized, setSceneInitialized] = useState(false);
  const [selectedBody, setSelectedBody] = useState<CelestialBody | null>(null);
  const [forceX, setForceX] = useState("10");
  const [forceY, setForceY] = useState("0");
  const [forceZ, setForceZ] = useState("0");
  const [deltaTime, setDeltaTime] = useState("1");
  const [uiVersion, setUiVersion] = useState(0);
  const [showAsteroidVisualizer, setShowAsteroidVisualizer] = useState(false);
  const [selectedAsteroidId, setSelectedAsteroidId] = useState<string | null>(
    null,
  );

  const {
    asteroids: asteroidsData,
    loading,
    error,
  } = useAsteroidsBulk(1, 1500);

  useEffect(() => {
    if (asteroidsData && sceneInitialized) {
      setIsLoading(false);
    }
  }, [asteroidsData, sceneInitialized]);

  const showOrbitForBody = (body: CelestialBody) => {
    if (body.showOrbit) {
      body.showOrbit();
    } else if (body.orbitLine) {
      // Fallback: directly show the orbit line
      body.orbitLine.visible = true;

      // Also ensure it's highlighted
      if ("material" in body.orbitLine && body.orbitLine.material) {
        const orbitLine = body.orbitLine as any;
        orbitLine.material.opacity = ORBIT_PRESETS.bright.opacity;
        if (orbitLine.material.linewidth !== undefined) {
          orbitLine.material.linewidth = ORBIT_PRESETS.bright.lineWidth;
        }
        if (orbitLine.material.emissiveIntensity !== undefined) {
          orbitLine.material.emissiveIntensity =
            ORBIT_PRESETS.bright.emissiveIntensity;
        }
        orbitLine.material.needsUpdate = true;
      }
    }
  };

  const applyForceToSelectedAsteroid = () => {
    if (!selectedBody || !selectedBody.applyForce) {
      alert("No asteroid selected or force function not available");
      return;
    }

    const force = {
      x: parseFloat(forceX),
      y: parseFloat(forceY),
      z: parseFloat(forceZ),
    };

    const dt = parseFloat(deltaTime);

    if (isNaN(force.x) || isNaN(force.y) || isNaN(force.z) || isNaN(dt)) {
      alert("Please enter valid numbers for force and time");
      return;
    }

    // Apply the force and update the orbit
    selectedBody.applyForce(force, dt, currentTimeRef);

    // Update orbit line geometry after applying force
    if (selectedBody.orbitLine && selectedBody.orbitGenerator) {
      const positions: number[] = [];
      const steps = 360;
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * Math.PI * 2;
        const pos = selectedBody.orbitGenerator.getPositionAtTime(
          currentTimeRef + t * 100,
        );
        positions.push(pos.position.x, pos.position.y, pos.position.z);
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3),
      );

      // Dispose of old geometry and assign new one
      if ((selectedBody.orbitLine as THREE.Line).geometry) {
        (selectedBody.orbitLine as THREE.Line).geometry.dispose();
      }
      (selectedBody.orbitLine as THREE.Line).geometry = geometry;
    }

    setUiVersion((v) => v + 1);
    alert(`Force applied to ${selectedBody.name}. Orbit has been updated.`);
  };

  const clearSelection = () => {
    currentSelectedBody = null;
    setSelectedBody(null);
    setShowAsteroidVisualizer(false);
    setSelectedAsteroidId(null);
  };

  // Add handler for closing the visualizer
  const handleCloseVisualizer = () => {
    setShowAsteroidVisualizer(false);
    setSelectedAsteroidId(null);
    // Optionally keep the asteroid selected in the scene
    // If you want to clear everything, call clearSelection() instead
  };

  useEffect(() => {
    if (!mountRef.current) return;

    const Refcurrent = mountRef.current;
    let animationFrameId: number;
    let renderer: THREE.WebGLRenderer;
    let controls: any;

    const initScene = () => {
      sceneRef = null;
      cameraRef = null;
      celestialBodiesRef = [];
      interactiveObjectsRef.clear();
      halosAndLabelsRef = [];
      currentSelectedBody = null;

      const setup = setupScene(mountRef.current!);
      const scene = setup.scene;
      const camera = setup.camera;
      renderer = setup.renderer;

      sceneRef = scene;
      cameraRef = camera;
      rendererRef = renderer;

      const cameraDistance = getRecommendedCameraDistance();
      camera.position.set(0, cameraDistance * 0.065, 0);
      camera.lookAt(0, 0, 0);

      controls = setupControls(camera, renderer);
      controlsRef = controls;

      addStarsBackground(scene);

      let currentTime = 0;
      const speedMultiplier = 0.1;

      const { sun, update: updateSun } = createSun(camera);
      scene.add(sun);

      const planets = createAllPlanets(camera, halosAndLabelsRef);
      planets.forEach((planet) => {
        scene.add(planet.mesh);
        if (planet.orbitLine) {
          scene.add(planet.orbitLine);
        }

        // Create showOrbit method for planets (no hideOrbit needed)
        const showOrbit = () => {
          if (planet.orbitLine) {
            planet.orbitLine.visible = true;
            // Highlight the orbit
            if ("material" in planet.orbitLine && planet.orbitLine.material) {
              const orbitLine = planet.orbitLine as any;
              orbitLine.material.opacity = ORBIT_PRESETS.bright.opacity;
              if (orbitLine.material.linewidth !== undefined) {
                orbitLine.material.linewidth = ORBIT_PRESETS.bright.lineWidth;
              }
              if (orbitLine.material.emissiveIntensity !== undefined) {
                orbitLine.material.emissiveIntensity =
                  ORBIT_PRESETS.bright.emissiveIntensity;
              }
              orbitLine.material.needsUpdate = true;
            }
          }
        };

        const celestialBody: CelestialBody = {
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
          orbitLine: planet.orbitLine,
          showOrbit,
        };

        celestialBodiesRef.push(celestialBody);

        if (planet.haloSprite) {
          interactiveObjectsRef.set(planet.haloSprite, celestialBody);
        }
        if (planet.labelSprite) {
          interactiveObjectsRef.set(planet.labelSprite, celestialBody);
        }

        planet.mesh.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            interactiveObjectsRef.set(child, celestialBody);
          }
        });

        if (planet.orbitLine) {
          interactiveObjectsRef.set(planet.orbitLine, celestialBody);
        }
      });

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      let hoveredObject: CelestialBody | null = null;

      const highlightObject = (object: CelestialBody, highlighted: boolean) => {
        if (object.setHaloHighlight) {
          object.setHaloHighlight(highlighted);
        }

        if (object.setLabelHighlight) {
          object.setLabelHighlight(highlighted);
        }

        // Highlight the orbit line on hover (but don't change visibility)
        if (
          object.orbitLine &&
          "material" in object.orbitLine &&
          !object.name.toLowerCase().includes("asteroid")
        ) {
          const orbitLine = object.orbitLine as any;
          if (orbitLine.material) {
            if (highlighted) {
              orbitLine.material.opacity = ORBIT_PRESETS.bright.opacity;
              if (orbitLine.material.linewidth !== undefined) {
                orbitLine.material.linewidth = ORBIT_PRESETS.bright.lineWidth;
              }
              if (orbitLine.material.emissiveIntensity !== undefined) {
                orbitLine.material.emissiveIntensity =
                  ORBIT_PRESETS.bright.emissiveIntensity;
              }
            } else {
              // Only revert to standard if this orbit is not currently selected
              if (currentSelectedBody !== object) {
                orbitLine.material.opacity = ORBIT_PRESETS.standard.opacity;
                if (orbitLine.material.linewidth !== undefined) {
                  orbitLine.material.linewidth =
                    ORBIT_PRESETS.standard.lineWidth;
                }
                if (orbitLine.material.emissiveIntensity !== undefined) {
                  orbitLine.material.emissiveIntensity =
                    ORBIT_PRESETS.standard.emissiveIntensity;
                }
              }
            }
            orbitLine.material.needsUpdate = true;
          }
        }

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

        if (object.mesh instanceof THREE.Points) {
          const material = object.mesh.material as THREE.PointsMaterial;
          if (highlighted) {
            material.color = new THREE.Color(0xffff00);
            material.size = 5;
            material.opacity = 1.0;
          } else {
            material.color = new THREE.Color(0x4fc3f7);
            material.size = 3;
            material.opacity = 0.8;
          }
        }
      };

      const onMouseMove = (event: MouseEvent) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);

        const checkObjects = Array.from(interactiveObjectsRef.keys());
        const intersects = raycaster.intersectObjects(checkObjects, true);

        if (intersects.length > 0) {
          const intersectedObject = intersects[0].object;
          let object = interactiveObjectsRef.get(intersectedObject);

          if (!object && intersectedObject.parent) {
            object = interactiveObjectsRef.get(intersectedObject.parent);
          }

          if (object && object !== hoveredObject) {
            if (hoveredObject) {
              highlightObject(hoveredObject, false);
            }
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

      const selectBody = (body: CelestialBody) => {
        console.log("selectBody called with:", body.name);

        showOrbitForBody(body);
        currentSelectedBody = body;
        setSelectedBody(body);

        // Check if it's an asteroid by the presence of applyForce method instead of name
        if (body.id && "applyForce" in body) {
          setSelectedAsteroidId(body.id);
          setShowAsteroidVisualizer(true);
        } else {
          setShowAsteroidVisualizer(false);
          setSelectedAsteroidId(null);
        }
      };

      const onClick = (event: MouseEvent) => {
        raycaster.setFromCamera(mouse, camera);
        const checkObjects = Array.from(interactiveObjectsRef.keys());
        const intersects = raycaster.intersectObjects(checkObjects, true);

        console.log("Click detected, intersects:", intersects.length);

        if (intersects.length > 0) {
          const intersectedObject = intersects[0].object;
          console.log(
            "Clicked object type:",
            intersectedObject.constructor.name,
          );

          let object = interactiveObjectsRef.get(intersectedObject);

          if (!object) {
            let current: THREE.Object3D<THREE.Object3DEventMap> | null =
              intersectedObject;
            while (current && !object) {
              object = interactiveObjectsRef.get(current);
              current = current.parent;
            }
          }

          if (object) {
            console.log(
              "Selected object:",
              object.name,
              "Type:",
              object.mesh.constructor.name,
            );
            console.log("Orbit line available:", !!object.orbitLine);
            console.log("showOrbit available:", !!object.showOrbit);

            const objectPosition = new THREE.Vector3();
            object.mesh.getWorldPosition(objectPosition);

            const isAsteroid = object.name.toLowerCase().includes("asteroid");
            const viewDistance = object.diameter * (isAsteroid ? 1000 : 2);

            const cameraOffset = new THREE.Vector3(
              viewDistance,
              viewDistance * 0.5,
              viewDistance,
            );
            const cameraPosition = objectPosition.clone().add(cameraOffset);

            camera.up.set(0, 0, 1);
            moveCamera(camera, controls, cameraPosition, objectPosition);

            selectBody(object);
          } else {
            console.log("No celestial body found for clicked object");
          }
        } else {
          // Clicked on empty space - clear selection
          console.log("Clicked on empty space - clearing selection");
          clearSelection();
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
      controls.minDistance = 3;
      controls.maxDistance = cameraDistance * 2;

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        currentTime += 360 * speedMultiplier;
        currentTimeRef = currentTime;

        celestialBodiesRef.forEach((body) => {
          const position = body.orbitGenerator.getPositionAtTime(currentTime);
          body.mesh.position.set(
            position.position.x,
            position.position.y,
            position.position.z,
          );

          if (body.rotationSpeed && body.mesh instanceof THREE.Group) {
            const planetMesh = body.mesh.children[0] as THREE.Mesh;
            planetMesh.rotation.y += body.rotationSpeed * speedMultiplier;
          }

          if (body.updateLOD) {
            body.updateLOD(camera.position);
          }
        });

        // CRITICAL: Update all halos and labels every frame
        halosAndLabelsRef.forEach((updateHalo) => updateHalo());

        updateSun();
        controls.update();
        renderWithPostProcessing();
      };

      animate();
      setSceneInitialized(true);

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
        if (Refcurrent && renderer.domElement.parentNode === Refcurrent) {
          Refcurrent.removeChild(renderer.domElement);
        }
        cancelAnimationFrame(animationFrameId);

        sceneRef = null;
        cameraRef = null;
        rendererRef = null;
        controlsRef = null;
        celestialBodiesRef = [];
        interactiveObjectsRef.clear();
        halosAndLabelsRef = [];
        currentSelectedBody = null;
      };
    };

    const cleanup = initScene();
    return cleanup;
  }, []);

  useEffect(() => {
    console.log("selectedBody state changed:", selectedBody?.name);
    console.log("selectedBody orbit methods:", {
      showOrbit: !!selectedBody?.showOrbit,
      hideOrbit: !!selectedBody?.hideOrbit,
      orbitLine: !!selectedBody?.orbitLine,
    });
  }, [selectedBody]);

  useEffect(() => {
    if (
      !asteroidsData ||
      asteroidsData.length === 0 ||
      !sceneInitialized ||
      !sceneRef ||
      !cameraRef
    ) {
      return;
    }

    console.log(`Creating ${asteroidsData.length} asteroids...`);

    try {
      const createdAsteroids = createAsteroids(
        asteroidsData,
        cameraRef,
        halosAndLabelsRef,
        sceneRef,
      );

      createdAsteroids.forEach((asteroid) => {
        sceneRef!.add(asteroid.mesh);

        if (asteroid.orbitLine) {
          console.log("Asteroid orbit line created for:", asteroid.name);
          if (
            !sceneRef!.children.includes(asteroid.orbitLine as THREE.Object3D)
          ) {
            sceneRef!.add(asteroid.orbitLine);
          }
        }

        const asteroidBody: CelestialBody = {
          id: asteroid.id,
          mesh: asteroid.mesh,
          orbitGenerator: asteroid.orbitGenerator,
          diameter: asteroid.diameter,
          color: asteroid.color,
          name: asteroid.name,
          orbitLine: asteroid.orbitLine,
          labelSprite: asteroid.labelSprite,
          setLabelHighlight: asteroid.setLabelHighlight,
          updateLOD: asteroid.updateLOD,
          showOrbit: asteroid.showOrbit,
          hideOrbit: asteroid.hideOrbit,
          applyForce: asteroid.applyForce,
        };

        celestialBodiesRef.push(asteroidBody);

        // Register ALL interactive elements
        if (asteroid.labelSprite) {
          interactiveObjectsRef.set(asteroid.labelSprite, asteroidBody);
        }

        // Register the mesh itself (important for Points objects)
        interactiveObjectsRef.set(asteroid.mesh, asteroidBody);

        if (asteroid.orbitLine) {
          interactiveObjectsRef.set(asteroid.orbitLine, asteroidBody);
        }

        console.log(
          `Registered asteroid: ${asteroid.name} with ${asteroid.labelSprite ? "label" : "no label"}, ${asteroid.orbitLine ? "orbit" : "no orbit"}`,
        );
      });

      console.log(`Successfully created ${createdAsteroids.length} asteroids`);
      console.log("Total celestial bodies:", celestialBodiesRef.length);
      console.log("Total interactive objects:", interactiveObjectsRef.size);
    } catch (err) {
      console.error("Error creating asteroids:", err);
    }
  }, [asteroidsData, sceneInitialized]);

  useEffect(() => {
    console.log("State check:", {
      showAsteroidVisualizer,
      selectedAsteroidId,
      selectedBodyName: selectedBody?.name,
      selectedBodyId: selectedBody?.id,
    });
  }, [showAsteroidVisualizer, selectedAsteroidId, selectedBody]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

      {/* Asteroid Visualizer on the left side */}
      {showAsteroidVisualizer && selectedAsteroidId && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "400px", // Adjust width as needed
            height: "100%",
            zIndex: 1000,
            pointerEvents: "auto",
          }}
        >
          <AsteroidVisualizer
            id={selectedAsteroidId}
            onCloseHandler={handleCloseVisualizer}
          />
        </div>
      )}

      {selectedBody && (
        <SelectedBodyPanel
          selectedBody={selectedBody}
          forceX={forceX}
          forceY={forceY}
          forceZ={forceZ}
          deltaTime={deltaTime}
          setForceX={setForceX}
          setForceY={setForceY}
          setForceZ={setForceZ}
          setDeltaTime={setDeltaTime}
          applyForceToSelectedAsteroid={applyForceToSelectedAsteroid}
          showOrbitForBody={showOrbitForBody}
          clearSelection={clearSelection}
        />
      )}

      {error && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            backgroundColor: "rgba(255, 0, 0, 0.8)",
            color: "white",
            padding: "10px",
            borderRadius: "5px",
            zIndex: 1001,
          }}
        >
          Error: {error}
        </div>
      )}

      {(loading || isLoading) && (
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
          {asteroidsData && (
            <p style={{ fontSize: "14px", marginTop: "10px" }}>
              Loaded {asteroidsData.length} asteroids
            </p>
          )}

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
