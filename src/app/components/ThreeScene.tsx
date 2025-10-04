"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { setupScene } from "./three/setupScene";
import { setupControls } from "./three/setupControls";
import { addLights } from "./three/addLights";
import { setupPostProcessing } from "./three/postProcessing";
import { createAllPlanets } from "./three/objects/createPlanet";
import { createSun } from "./three/objects/createSun";
import { createAsteroids } from "./three/objects/createAsteroid";
import { useAsteroidsBulk } from "../hooks/useAsteroidsBulk";
import {
  getRecommendedCameraDistance,
  getSceneBoundaries,
} from "../lib/scalingUtils";
import { addStarsBackground } from "./three/createBackground";

interface CelestialBody {
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
    currentTime: number
  ) => void;
}

let sceneRef: THREE.Scene | null = null;
let cameraRef: THREE.PerspectiveCamera | null = null;
let celestialBodiesRef: CelestialBody[] = [];
let interactiveObjectsRef: Map<THREE.Object3D, CelestialBody> = new Map();
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
  const [forceX, setForceX] = useState("1000");
  const [forceY, setForceY] = useState("0");
  const [forceZ, setForceZ] = useState("0");
  const [deltaTime, setDeltaTime] = useState("1");
  const [uiVersion, setUiVersion] = useState(0);

  const { asteroids: asteroidsData, loading } = useAsteroidsBulk(1, 1500);

  useEffect(() => {
    if (asteroidsData && sceneInitialized) {
      setIsLoading(false);
    }
  }, [asteroidsData, sceneInitialized]);

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

    selectedBody.applyForce(force, dt, currentTimeRef);

    if (selectedBody.orbitLine && selectedBody.orbitGenerator) {
      const positions: number[] = [];
      const steps = 360;
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * Math.PI * 2;
        const pos = selectedBody.orbitGenerator.getPositionAtTime(
          currentTimeRef + t * 100
        );
        positions.push(pos.position.x, pos.position.y, pos.position.z);
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3)
      );
      (selectedBody.orbitLine as THREE.Line).geometry.dispose();
      (selectedBody.orbitLine as THREE.Line).geometry = geometry;
    }

    setUiVersion((v) => v + 1);
    alert(`Force applied to ${selectedBody.name}`);
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
        scene.add(planet.orbitLine);

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

        interactiveObjectsRef.set(planet.orbitLine, celestialBody);
      });

      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();

      // ✅ track mouse for raycasting
      renderer.domElement.addEventListener("mousemove", (event) => {
        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      });

      const selectBody = (body: CelestialBody) => {
        if (currentSelectedBody?.hideOrbit) {
          currentSelectedBody.hideOrbit();
        }
        if (body.showOrbit) body.showOrbit();

        currentSelectedBody = body;
        setSelectedBody(body);
      };

      const onClick = (event: MouseEvent) => {
        raycaster.setFromCamera(mouse, camera);
        const checkObjects = Array.from(interactiveObjectsRef.keys());
        const intersects = raycaster.intersectObjects(checkObjects, true);

        if (intersects.length > 0) {
          const intersectedObject = intersects[0].object;

          let object = interactiveObjectsRef.get(intersectedObject);

          if (!object) {
            let current: THREE.Object3D | null = intersectedObject;
            while (current && !object) {
              object = interactiveObjectsRef.get(current);
              current = current.parent;
            }
          }

          if (object) {
            selectBody(object);
          }
        }
      };

      renderer.domElement.addEventListener("click", onClick);
      addLights(scene);

      const { update: renderWithPostProcessing, resize: resizePostProcessing } =
        setupPostProcessing(scene, camera, renderer);

      const sceneBounds = getSceneBoundaries();
      camera.near = 1;
      camera.far = sceneBounds.outerBoundary * 2;
      camera.updateProjectionMatrix();

      controls.enableDamping = true;

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        currentTime += 360 * speedMultiplier;
        currentTimeRef = currentTime;

        celestialBodiesRef.forEach((body) => {
          const position = body.orbitGenerator.getPositionAtTime(currentTime);
          body.mesh.position.set(
            position.position.x,
            position.position.y,
            position.position.z
          );
        });

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
          mountRef.current!.clientHeight
        );
        resizePostProcessing();
      };
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
        renderer.dispose();
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
    if (
      !asteroidsData ||
      asteroidsData.length === 0 ||
      !sceneInitialized ||
      !sceneRef ||
      !cameraRef
    ) {
      return;
    }

    try {
      const createdAsteroids = createAsteroids(
        asteroidsData,
        cameraRef,
        halosAndLabelsRef,
        sceneRef
      );

      createdAsteroids.forEach((asteroid) => {
        sceneRef!.add(asteroid.mesh);

        if (asteroid.orbitLine) {
          if (!sceneRef!.children.includes(asteroid.orbitLine as THREE.Object3D)) {
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
        interactiveObjectsRef.set(asteroid.mesh, asteroidBody);
        if (asteroid.labelSprite) {
          interactiveObjectsRef.set(asteroid.labelSprite, asteroidBody);
        }
        if (asteroid.orbitLine) {
          interactiveObjectsRef.set(asteroid.orbitLine, asteroidBody);
        }
      });
    } catch (err) {
      console.error("Error creating asteroids:", err);
    }
  }, [asteroidsData, sceneInitialized]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100vh" }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

      {selectedBody && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            color: "white",
            padding: "15px",
            borderRadius: "8px",
            zIndex: 1001,
            fontSize: "14px",
            minWidth: "300px",
            border: "2px solid #4fc3f7",
          }}
        >
          <h3 style={{ margin: "0 0 10px 0", color: "#4fc3f7" }}>
            Selected: {selectedBody.name}
          </h3>

          <div style={{ marginBottom: "10px", fontSize: "12px", opacity: 0.8 }}>
            ID: {selectedBody.id || "N/A"}
          </div>

          {"applyForce" in selectedBody && (
            <div style={{ marginTop: "15px" }}>
              <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
                Apply Force (N):
              </div>

              <label>X:</label>
              <input
                type="number"
                value={forceX}
                onChange={(e) => setForceX(e.target.value)}
              />

              <label>Y:</label>
              <input
                type="number"
                value={forceY}
                onChange={(e) => setForceY(e.target.value)}
              />

              <label>Z:</label>
              <input
                type="number"
                value={forceZ}
                onChange={(e) => setForceZ(e.target.value)}
              />

              <label>Delta Time (s):</label>
              <input
                type="number"
                value={deltaTime}
                onChange={(e) => setDeltaTime(e.target.value)}
              />

              <button onClick={applyForceToSelectedAsteroid}>Apply Force</button>
            </div>
          )}
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
            justifyContent: "center",
            alignItems: "center",
            color: "white",
          }}
        >
          <p>Loading asteroid data...</p>
        </div>
      )}
    </div>
  );
}
