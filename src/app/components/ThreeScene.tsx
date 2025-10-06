"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";

import { setupScene } from "./three/setupScene";
import { setupControls } from "./three/setupControls";
import { addLights } from "./three/addLights";
import { setupPostProcessing } from "./three/postProcessing";
import { ORBIT_PRESETS, ScaledOrbitGenerator } from "./three/orbitGenerator";
import { createAllPlanets } from "./three/objects/createPlanet";
import { createSun } from "./three/objects/createSun";
import { createAsteroids } from "./three/objects/createAsteroid";
import { moveCamera } from "./three/cameraUtils";
import { CameraFollowController } from "./three/cameraFollow";
import { useAsteroidsBulk } from "../hooks/useAsteroidsBulk";
import {
  getRecommendedCameraDistance,
  getSceneBoundaries,
  speedScale,
} from "../lib/scalingUtils";
import { addStarsBackground } from "./three/createBackground";
import ControlPanel from "./ControlPanel";
import AsteroidVisualizer from "./dataBox";
import SearchUI from "./SearchUI";
import ObjectOptionsBar from "./ObjectOptionsBar";
import CameraFollowControl from "./CameraFollowControl";
import { useAsteroidSelection } from "../lib/useAsteroidSelection";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RiResetRightLine } from "react-icons/ri";
import { IoIosPause } from "react-icons/io";
import { FaPlay } from "react-icons/fa";
import { League_Spartan } from "next/font/google";

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export interface CelestialBody {
  id?: string;
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
let currentSelectedAsteroid: CelestialBody | null = null;
let currentFocusedBody: CelestialBody | null = null;
let rendererRef: THREE.WebGLRenderer | null = null;
let controlsRef: OrbitControls | null = null;
let cameraFollowControllerRef: CameraFollowController | null = null;

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sceneInitialized, setSceneInitialized] = useState(false);
  const [selectedBody, setSelectedBody] = useState<CelestialBody | null>(null);
  const [celestialBodiesMap, setCelestialBodiesMap] = useState<Map<string, CelestialBody>>(new Map());
  const [forceX, setForceX] = useState("10");
  const [forceY, setForceY] = useState("0");
  const [forceZ, setForceZ] = useState("0");
  const [deltaTime, setDeltaTime] = useState("1");
  const [showAsteroidVisualizer, setShowAsteroidVisualizer] = useState(false);
  const [showOptionsBar, setShowOptionsBar] = useState(false);
  const [selectedAsteroidId, setSelectedAsteroidId] = useState<string | null>(
    null,
  );

  const [speedMultiplier, setSpeedMultiplier] = useState(21);
  const [isPaused, setIsPaused] = useState(false);
  const [currentDate, setCurrentDate] = useState<Date | null>(null);
  const [selectedDateTime, setSelectedDateTime] = useState<string>("");
  const [showDateTimePicker, setShowDateTimePicker] = useState(false);
  const [zoomLevel, setZoomLevel] = useState<number>(50);
  const [isCameraFollowing, setIsCameraFollowing] = useState(false);
  const [followSmoothness, setFollowSmoothness] = useState(0.1);
  const [followLookAhead, setFollowLookAhead] = useState(0);

  const currentSpeedOption = speedScale[speedMultiplier] || speedScale[21];

  const speedMultiplierRef = useRef(speedMultiplier);
  const isPausedRef = useRef(isPaused);
  const currentTimeRef = useRef(0);
  const startDateRef = useRef(new Date());

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

  useEffect(() => {
    speedMultiplierRef.current = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDateTime(now.toISOString().slice(0, 16));
  }, []);

  useEffect(() => {
    if (!currentDate) return;
    const interval = setInterval(() => {
      if (!isPausedRef.current) {
        const days = currentTimeRef.current;
        const newDate = new Date(
          startDateRef.current.getTime() + days * 24 * 60 * 60 * 1000,
        );
        setCurrentDate(newDate);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [currentDate]);

  const handleSliderChange = useCallback((value: number) => {
    setSpeedMultiplier(value);
  }, []);

  const getCurrentSpeedDisplay = useCallback(() => {
    return currentSpeedOption.label;
  }, [currentSpeedOption]);

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

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const resetTime = useCallback(() => {
    currentTimeRef.current = 0;
    setSpeedMultiplier(21);
    setIsPaused(false);
    const now = new Date();
    startDateRef.current = now;
    setCurrentDate(now);

    celestialBodiesRef.forEach((body) => {
      const position = body.orbitGenerator.getPositionAtTime(0);
      body.mesh.position.set(
        position.position.x,
        position.position.y,
        position.position.z,
      );
    });
  }, []);

  const setSimulationDateTime = useCallback(() => {
    const selectedDate = new Date(selectedDateTime);
    const now = new Date();
    const timeDiff =
      (selectedDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    currentTimeRef.current = timeDiff;
    startDateRef.current = now;
    setCurrentDate(selectedDate);
    setSpeedMultiplier(21);

    celestialBodiesRef.forEach((body) => {
      const position = body.orbitGenerator.getPositionAtTime(timeDiff);
      body.mesh.position.set(
        position.position.x,
        position.position.y,
        position.position.z,
      );
    });
  }, [selectedDateTime]);

  const showOrbitForBody = (body: CelestialBody) => {
    if (body.showOrbit) {
      body.showOrbit();
    } else if (body.orbitLine) {
      body.orbitLine.visible = true;
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

    // Convert current time (days) to unix time (seconds)
    const currentUnixTime =
      startDateRef.current.getTime() / 1000 + currentTimeRef.current * 86400;

    selectedBody.applyForce(force, dt, currentUnixTime);

    if (selectedBody.orbitLine && selectedBody.orbitGenerator) {
      const positions: number[] = [];
      const steps = 360;
      for (let i = 0; i <= steps; i++) {
        const t =
          (i / steps) *
          selectedBody.orbitGenerator.getPositionAtTime(currentUnixTime).time;
        const pos = selectedBody.orbitGenerator.getPositionAtTime(
          currentUnixTime + t,
        );
        positions.push(pos.position.x, pos.position.y, pos.position.z);
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(positions, 3),
      );

      if ((selectedBody.orbitLine as THREE.Line).geometry) {
        (selectedBody.orbitLine as THREE.Line).geometry.dispose();
      }
      (selectedBody.orbitLine as THREE.Line).geometry = geometry;
    }

    alert(`Force applied to ${selectedBody.name}. Orbit has been updated.`);
  };

  const clearSelection = () => {
    if (currentSelectedAsteroid) {
      currentSelectedAsteroid.hideOrbit?.();
      currentSelectedAsteroid = null;
    }
    currentSelectedBody = null;
    currentFocusedBody = null;
    setSelectedBody(null);
    setShowAsteroidVisualizer(false);
    setShowOptionsBar(false);
    setSelectedAsteroidId(null);
    
    // Disable camera follow when clearing selection
    if (cameraFollowControllerRef) {
      cameraFollowControllerRef.setEnabled(false);
      cameraFollowControllerRef.setTarget(null);
    }
    setIsCameraFollowing(false);
    
    // Reset minimum distance back to sun's surface
    if (controlsRef) {
      const sceneBounds = getSceneBoundaries();
      controlsRef.minDistance = sceneBounds.innerBoundary;
    }
  };

  const handleOpenDetails = () => {
    setShowOptionsBar(false);
    setShowAsteroidVisualizer(true);
  };

  const handleCloseVisualizer = () => {
    if (currentSelectedAsteroid) {
      currentSelectedAsteroid.hideOrbit?.();
      currentSelectedAsteroid = null;
    }
    setShowAsteroidVisualizer(false);
    setShowOptionsBar(true);
    setSelectedAsteroidId(null);
    currentSelectedBody = null;
    currentFocusedBody = null;
    setSelectedBody(null);
    
    // Reset minimum distance back to sun's surface
    if (controlsRef) {
      const sceneBounds = getSceneBoundaries();
      controlsRef.minDistance = sceneBounds.innerBoundary;
    }
  };

  // Camera follow handlers
  const handleToggleCameraFollow = useCallback(() => {
    if (!cameraFollowControllerRef || !currentFocusedBody || !controlsRef) return;
    
    const newFollowState = !isCameraFollowing;
    setIsCameraFollowing(newFollowState);
    
    if (newFollowState) {
      // Enable following
      cameraFollowControllerRef.setEnabled(true);
      cameraFollowControllerRef.setTarget(currentFocusedBody);
      cameraFollowControllerRef.updateOptions({
        smoothness: followSmoothness,
        lookAhead: followLookAhead,
      });
      // Reduce damping for more responsive following
      controlsRef.enableDamping = false;
    } else {
      // Disable following
      cameraFollowControllerRef.setEnabled(false);
      // Restore damping
      controlsRef.enableDamping = true;
      controlsRef.dampingFactor = 0.05;
    }
  }, [isCameraFollowing, followSmoothness, followLookAhead]);

  const handleSmoothnessChange = useCallback((value: number) => {
    setFollowSmoothness(value);
    if (cameraFollowControllerRef) {
      cameraFollowControllerRef.updateOptions({ smoothness: value });
    }
  }, []);

  const handleLookAheadChange = useCallback((value: number) => {
    setFollowLookAhead(value);
    if (cameraFollowControllerRef) {
      cameraFollowControllerRef.updateOptions({ lookAhead: value });
    }
  }, []);

  useEffect(() => {
    if (!mountRef.current) return;

    const Refcurrent = mountRef.current;
    let animationFrameId: number;

    const setup = setupScene(mountRef.current);
    const scene = setup.scene;
    const camera = setup.camera;
    const renderer = setup.renderer;

    sceneRef = scene;
    cameraRef = camera;
    rendererRef = renderer;

    const cameraDistance = getRecommendedCameraDistance();
    const sceneBounds = getSceneBoundaries();
    
    // Use the properly scaled camera distance directly
    camera.position.set(
      0,
      (-cameraDistance),
      cameraDistance * 0.045,
    );
    camera.lookAt(0, 0, 0);
    camera.up.set(0, 0, 1);

    const controls = setupControls(camera, renderer);
    controlsRef = controls;

    // Initialize camera follow controller
    cameraFollowControllerRef = new CameraFollowController(camera, controls, {
      enabled: false,
      smoothness: 0.1,
      lookAhead: 0,
    });

    celestialBodiesRef = [];
    interactiveObjectsRef.clear();
    halosAndLabelsRef = [];
    currentSelectedBody = null;
    currentSelectedAsteroid = null;

    addStarsBackground(scene);
    currentTimeRef.current = 0;

    const { sun, update: updateSun } = createSun(camera);
    scene.add(sun);

    const planets = createAllPlanets(camera, halosAndLabelsRef);
    planets.forEach((planet) => {
      scene.add(planet.mesh);
      if (planet.orbitLine) {
        scene.add(planet.orbitLine);
      }

      const showOrbit = () => {
        if (planet.orbitLine) {
          planet.orbitLine.visible = true;
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

      // Add to map for search functionality
      setCelestialBodiesMap(prev => {
        const newMap = new Map(prev);
        if (planet.id) {
          newMap.set(planet.id, celestialBody);
        }
        return newMap;
      });

      if (planet.haloSprite) {
        interactiveObjectsRef.set(planet.haloSprite, celestialBody);
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

      if (object.orbitLine && "material" in object.orbitLine) {
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
            if (currentSelectedBody !== object) {
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
      const isAsteroid = body.id && "applyForce" in body;

      if (isAsteroid) {
        if (currentSelectedAsteroid && currentSelectedAsteroid !== body) {
          currentSelectedAsteroid.hideOrbit?.();
        }

        showOrbitForBody(body);
        currentSelectedAsteroid = body;
        setSelectedAsteroidId(body.id!);
        setShowAsteroidVisualizer(false);
        setShowOptionsBar(true);
      } else {
        if (currentSelectedAsteroid) {
          currentSelectedAsteroid.hideOrbit?.();
          currentSelectedAsteroid = null;
        }

        showOrbitForBody(body);
        setShowAsteroidVisualizer(false);
        setShowOptionsBar(true);
        setSelectedAsteroidId(null);
      }

      currentSelectedBody = body;
      currentFocusedBody = body;
      setSelectedBody(body);
      
      // Update camera follow target (if following is enabled, it will automatically follow the new body)
      if (cameraFollowControllerRef) {
        cameraFollowControllerRef.setTarget(body);
        // Update offset distances based on body size
        const bodyRadius = body.diameter / 2;
        const isAsteroid = body.id && "applyForce" in body;
        const baseDistance = bodyRadius * (isAsteroid ? 10000 : 3);
        cameraFollowControllerRef.updateOptions({
          offsetDistance: baseDistance,
          offsetHeight: baseDistance * 0.5,
        });
      }
      
      // Update minimum distance based on the focused body's size
      if (controlsRef) {
        const bodyRadius = body.diameter / 2;
        // Set minimum distance to 1.5x the body's radius (safety margin to prevent clipping)
        controlsRef.minDistance = Math.max(0.1, bodyRadius * 1.5);
      }
    };

    const onClick = (event: MouseEvent) => {
      raycaster.setFromCamera(mouse, camera);
      const checkObjects = Array.from(interactiveObjectsRef.keys());
      const intersects = raycaster.intersectObjects(checkObjects, true);

      if (intersects.length > 0) {
        const intersectedObject = intersects[0].object;
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
          const objectPosition = new THREE.Vector3();
          object.mesh.getWorldPosition(objectPosition);

          const isAsteroid = object.id && "applyForce" in object;
          const viewDistance = object.diameter * (isAsteroid ? 10000 : 2);

          const cameraOffset = new THREE.Vector3(
            viewDistance,
            viewDistance * 0.5,
            viewDistance,
          );
          const cameraPosition = objectPosition.clone().add(cameraOffset);

          camera.up.set(0, 0, 1);
          moveCamera(camera, controls, cameraPosition, objectPosition);

          selectBody(object);
        }
      } else {
        clearSelection();
      }
    };

    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("click", onClick);

    addLights(scene);
    const { update: renderWithPostProcessing, resize: resizePostProcessing } =
      setupPostProcessing(scene, camera, renderer);

    // Use scene boundaries for camera settings
    camera.near = 1;
    camera.far = sceneBounds.outerBoundary * 2;
    camera.updateProjectionMatrix();

    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = sceneBounds.innerBoundary; // Stop at sun's surface
    const maxDistance = cameraDistance * 1.5; // Use the properly scaled distance directly
    controls.maxDistance = Infinity; // No maximum zoom out limit

    const updateSliderFromCamera = debounce(() => {
      const currentDistance = camera.position.distanceTo(controls.target);
      // Use focused body's minimum distance if available
      let minZoomDistance = sceneBounds.innerBoundary;
      if (currentFocusedBody) {
        const bodyRadius = currentFocusedBody.diameter / 2;
        minZoomDistance = Math.max(0.1, bodyRadius * 1.5);
      }

      let newSliderValue: number;

      // Reverse the logic from handleZoomChange
      // 0-500: linear from minZoomDistance (sun's surface) to cameraDistance
      // 500-1000: exponential beyond cameraDistance
      if (currentDistance <= cameraDistance) {
        // Linear range: minZoomDistance to cameraDistance maps to 0-500
        const normalizedDistance = (currentDistance - minZoomDistance) / (cameraDistance - minZoomDistance);
        newSliderValue = Math.max(0, normalizedDistance * 500);
      } else {
        // Exponential range: beyond cameraDistance maps to 500-1000
        // Reverse the exponential: targetDistance = cameraDistance * 2^(exponent-1)
        // Where exponent ranges from 1 to 5
        const ratio = currentDistance / cameraDistance;
        const exponent = Math.log2(ratio) + 1;
        const normalizedValue = Math.min(1, (exponent - 1) / 4); // Clamp to prevent overflow
        newSliderValue = 500 + normalizedValue * 500;
      }

      // Clamp to reasonable range to prevent slider overflow
      newSliderValue = Math.max(0, Math.min(1000, newSliderValue));

      if (Math.abs(newSliderValue - zoomLevel) > 1) {
        setZoomLevel(Math.round(newSliderValue));
      }
    }, 50);

    controls.addEventListener("change", updateSliderFromCamera);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      if (!isPausedRef.current) {
        const currentSpeed = speedScale[speedMultiplierRef.current];
        const daysPerSecond = currentSpeed
          ? currentSpeed.daysPerSecond
          : 1 / 86400;

        // Advance time
        currentTimeRef.current += daysPerSecond / 60;

        celestialBodiesRef.forEach((body) => {
          // Convert days to unix time for orbit calculation
          const unixTime =
            startDateRef.current.getTime() / 1000 +
            currentTimeRef.current * 86400;
          const position = body.orbitGenerator.getPositionAtTime(unixTime);

          body.mesh.position.set(
            position.position.x,
            position.position.y,
            position.position.z,
          );

          if (body.rotationSpeed && body.mesh instanceof THREE.Group) {
            const planetMesh = body.mesh.children[0] as THREE.Mesh;
            const rotationAmount =
              body.rotationSpeed * Math.abs(daysPerSecond) * 0.01;

            if (daysPerSecond >= 0) {
              planetMesh.rotation.y += rotationAmount;
            } else {
              planetMesh.rotation.y -= rotationAmount;
            }
          }

          if (body.updateLOD) {
            body.updateLOD(camera.position);
          }
        });
      }

      halosAndLabelsRef.forEach((updateHalo) => updateHalo());
      updateSun();
      
      // Update camera follow controller
      if (cameraFollowControllerRef) {
        cameraFollowControllerRef.update(currentTimeRef.current);
      }
      
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
      controls.removeEventListener("change", updateSliderFromCamera);
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
      cameraFollowControllerRef = null;
      celestialBodiesRef = [];
      interactiveObjectsRef.clear();
      halosAndLabelsRef = [];
      currentSelectedBody = null;
      currentSelectedAsteroid = null;
    };
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

    const createdAsteroids = createAsteroids(
      asteroidsData,
      cameraRef,
      halosAndLabelsRef,
      sceneRef,
    );

    createdAsteroids.forEach((asteroid) => {
      sceneRef!.add(asteroid.mesh);

      if (
        asteroid.orbitLine &&
        !sceneRef!.children.includes(asteroid.orbitLine as THREE.Object3D)
      ) {
        sceneRef!.add(asteroid.orbitLine);
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

      // Add to map for search functionality with multiple key formats
      setCelestialBodiesMap(prev => {
        const newMap = new Map(prev);
        if (asteroid.id) {
          // Add by ID (e.g., "14033")
          newMap.set(asteroid.id, asteroidBody);
          
          // Also add by "asteroid_ID" format for search compatibility
          newMap.set(`asteroid_${asteroid.id}`, asteroidBody);
          
          // Add by name if available (e.g., "14033 Example")
          if (asteroid.name) {
            newMap.set(asteroid.name, asteroidBody);
            // Add by sanitized name format used in SearchUI
            const sanitizedName = asteroid.name.replace(/[^a-zA-Z0-9]/g, '_');
            newMap.set(`asteroid_${sanitizedName}`, asteroidBody);
          }
          
          // Log first few additions for debugging
          if (newMap.size <= 15) {
            console.log(`Added asteroid to map with keys: ${asteroid.id}, asteroid_${asteroid.id}, ${asteroid.name}`);
          }
        }
        return newMap;
      });

      // if (asteroid.labelSprite) {
      //   interactiveObjectsRef.set(asteroid.labelSprite, asteroidBody);
      // }
      interactiveObjectsRef.set(asteroid.mesh, asteroidBody);
      // if (asteroid.orbitLine) {
      //   interactiveObjectsRef.set(asteroid.orbitLine, asteroidBody);
      // }
    });
  }, [asteroidsData, sceneInitialized]);

  // Use the asteroid selection hook for search functionality
  const { handleCelestialBodySelection } = useAsteroidSelection({
    camera: cameraRef,
    controls: controlsRef,
    celestialBodiesMap,
  });

  // Handler for when a celestial body is selected in the search UI
  const handleSelectCelestialBody = async (bodyId: string, type: string) => {
    await handleCelestialBodySelection(bodyId, type);
  };

  const handleZoomIn = () => {
    if (controlsRef && cameraRef) {
      // Zoom in by 5% of the current position or minimum 10 units
      const step = Math.max(10, zoomLevel * 0.05);
      const newZoomLevel = Math.max(0, zoomLevel - step);
      
      // Check if new zoom would be below surface
      const sceneBounds = getSceneBoundaries();
      let minZoomDistance = sceneBounds.innerBoundary;
      if (currentFocusedBody) {
        const bodyRadius = currentFocusedBody.diameter / 2;
        minZoomDistance = Math.max(0.1, bodyRadius * 1.5);
      }
      
      const cameraDistanceForReset = getRecommendedCameraDistance();
      const normalizedValue = newZoomLevel / 500;
      const testDistance = minZoomDistance + (cameraDistanceForReset - minZoomDistance) * normalizedValue;
      
      // Only apply zoom if it's at or above the surface
      if (testDistance >= minZoomDistance || newZoomLevel >= 0) {
        setZoomLevel(newZoomLevel);
        handleZoomChange(newZoomLevel);
      }
    }
  };

  const handleZoomOut = () => {
    if (controlsRef && cameraRef) {
      // Zoom out by 5% of the current position or minimum 10 units
      const step = Math.max(10, zoomLevel * 0.05);
      const newZoomLevel = Math.min(1000, zoomLevel + step);
      setZoomLevel(newZoomLevel);
      handleZoomChange(newZoomLevel);
    }
  };

  const handleResetView = () => {
    if (controlsRef && cameraRef) {
      const cameraDistance = getRecommendedCameraDistance();
      const angleFromY = 50 * (Math.PI / 180);
      const azimuthalAngle = 45 * (Math.PI / 180);

      const x =
        cameraDistance *
        Math.sin(angleFromY) *
        Math.cos(azimuthalAngle);
      const y = cameraDistance * Math.cos(angleFromY);
      const z =
        cameraDistance *
        Math.sin(angleFromY) *
        Math.sin(azimuthalAngle);

      const newPosition = new THREE.Vector3(x, y, z);
      const originTarget = new THREE.Vector3(0, 0, 0);

      cameraRef.up.set(0, 0, 1);
      moveCamera(cameraRef, controlsRef, newPosition, originTarget, 1000);
      setZoomLevel(500); // Reset to middle position (cameraDistance position)
    }
  };

  const handleZoomChange = (value: number) => {
    if (controlsRef && cameraRef) {
      setZoomLevel(value);

      const sceneBounds = getSceneBoundaries();
      // Use focused body's minimum distance if available, otherwise use sun's surface
      let minZoomDistance = sceneBounds.innerBoundary;
      if (currentFocusedBody) {
        const bodyRadius = currentFocusedBody.diameter / 2;
        minZoomDistance = Math.max(0.1, bodyRadius * 1.5);
      }
      
      const cameraDistanceForReset = getRecommendedCameraDistance();
      const baseMaxDistance = cameraDistanceForReset * 1.5;

      let targetDistance;

      // Map slider value (0-1000) to camera distance
      // 0-500: zoom from minZoomDistance (sun's surface) to cameraDistanceForReset (normal view)
      // 500-1000: zoom from cameraDistanceForReset to far distances (exponential beyond baseMaxDistance)
      if (value <= 500) {
        // Linear zoom from minZoomDistance to cameraDistanceForReset
        const normalizedValue = value / 500;
        targetDistance =
          minZoomDistance +
          (cameraDistanceForReset - minZoomDistance) * normalizedValue;
      } else {
        // Exponential zoom beyond cameraDistanceForReset
        const normalizedValue = (value - 500) / 500;
        // Use exponential scaling for smooth far-distance zooming
        const exponent = 1 + normalizedValue * 4; // Scale from 1x to 5x exponentially
        targetDistance = cameraDistanceForReset * Math.pow(2, exponent - 1);
      }
      
      // Enforce minimum distance limit - cannot go below surface
      targetDistance = Math.max(targetDistance, minZoomDistance);

      const directionVector = new THREE.Vector3()
        .subVectors(cameraRef.position, controlsRef.target)
        .normalize();

      const updatedPosition = new THREE.Vector3()
        .copy(controlsRef.target)
        .add(directionVector.multiplyScalar(targetDistance));

      moveCamera(
        cameraRef,
        controlsRef,
        updatedPosition,
        controlsRef.target,
        500,
      );
    }
  };

  return (
    <div
      className={`relative w-full h-screen ${leagueSpartan.className} uppercase`}
    >
      <div ref={mountRef} className="w-full h-full" />

      <ControlPanel
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onResetView={handleResetView}
        zoomLevel={zoomLevel}
        onZoomChange={handleZoomChange}
      />

      {/* Camera Follow Control */}
      <CameraFollowControl
        isFollowing={isCameraFollowing}
        onToggleFollow={handleToggleCameraFollow}
        smoothness={followSmoothness}
        onSmoothnessChange={handleSmoothnessChange}
        lookAhead={followLookAhead}
        onLookAheadChange={handleLookAheadChange}
        disabled={!selectedBody && !currentFocusedBody}
      />

      {/* Options Bar - appears at top when object is selected */}
      {showOptionsBar && !showAsteroidVisualizer && (selectedAsteroidId || selectedBody) && (
        <ObjectOptionsBar
          hasAsteroidData={!!selectedAsteroidId || !!selectedBody}
          onSelectAsteroidDetails={handleOpenDetails}
          onClose={clearSelection}
        />
      )}

      {showAsteroidVisualizer && (selectedAsteroidId || selectedBody) && (
        <div className="absolute top-0 left-0 pointer-events-none z-[1000]">
          <AsteroidVisualizer
            id={selectedAsteroidId || selectedBody?.id || ""}
            onCloseHandler={handleCloseVisualizer}
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
          />
        </div>
      )}

      {error && (
        <div className="absolute top-2.5 right-2.5 bg-red-800/80 text-white p-2.5 rounded-md z-[1001]">
          Error: {error}
        </div>
      )}

      {(loading || isLoading) && (
        <div className="absolute top-0 left-0 w-full h-full bg-black flex flex-col justify-center items-center text-white text-lg z-[1000]">
          <div className="w-[50px] h-[50px] border-[5px] border-gray-300 border-t-blue-500 rounded-full animate-spin mb-5" />
          <p>Loading asteroid data...</p>
        </div>
      )}

      <div className="absolute bottom-4 md:bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center p-3 md:p-8 rounded-4xl w-[95%] sm:w-[90%] md:w-[600px] max-w-[95vw] backdrop-blur-sm">
        <div className="flex items-center w-full mb-2 md:mb-4">
          <div className="relative flex items-center justify-center bg-[rgba(20,20,40,0.7)] border-2 border-[rgba(255,255,255,0.3)] rounded-[20px] py-2 md:py-4 my-1 md:my-1.5 shadow-md backdrop-blur-sm w-full px-2 md:px-4">
            <input
              type="range"
              min="0"
              max={speedScale.length - 1}
              value={speedMultiplier}
              onChange={(e) => handleSliderChange(parseInt(e.target.value))}
              className="w-full h-1 appearance-none bg-gray-800 rounded-lg outline-none time-slider border-2 border-[rgba(255,255,255,0.3)]"
              style={{ accentColor: "white" }}
            />
          </div>
        </div>

        <div className="flex flex-wrap place-content-between justify-center gap-2 md:gap-3 w-full">
          <div className="hover:bg-gray-500/50 p-1 md:p-2 rounded-xl text-center flex-shrink-0">
            <span
              className="text-gray-300 font-medium text-xs md:text-lg cursor-pointer hover:text-gray-100 duration-300"
              onClick={() => setShowDateTimePicker(true)}
            >
              {currentDate ? formatSimulationDate(currentDate) : "Loading..."}
            </span>
          </div>
          <button
            onClick={togglePause}
            className={`px-3 md:px-6 py-1.5 md:py-2 rounded-xl font-bold transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 bg-gray-500/40 hover:bg-gray-500/60 text-white ${isPaused ? "pause-button-paused" : "pause-button-playing"} flex-shrink-0`}
          >
            {isPaused ? <FaPlay className="text-sm md:text-base" /> : <IoIosPause className="text-sm md:text-base" />}
          </button>
          <button
            onClick={resetTime}
            className="px-3 md:px-6 py-1.5 md:py-2 rounded-xl font-bold transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-95 bg-gray-500/40 hover:bg-red-500/60 text-white flex-shrink-0"
          >
            <RiResetRightLine className="text-sm md:text-base" />
          </button>
          <span className="text-gray-300 font-medium text-xs md:text-lg cursor-pointer duration-300 my-1 md:m-2 mx-2 md:mx-4 flex-shrink-0">
            {isPaused ? "Paused" : getCurrentSpeedDisplay()}
          </span>
        </div>

        {showDateTimePicker && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-2xl shadow-xl max-w-xl w-full mx-4">
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
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => setShowDateTimePicker(false)}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-700 text-white rounded-md font-medium transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      setSimulationDateTime();
                      setShowDateTimePicker(false);
                    }}
                    className="px-4 py-2 bg-gray-500 hover:bg-gray-700 text-white rounded-md font-medium transition-colors duration-200"
                  >
                    Jump
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Search UI - always rendered, manages its own visibility */}
      <SearchUI onSelectBody={handleSelectCelestialBody} />
    </div>
  );
}
