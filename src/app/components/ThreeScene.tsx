"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { setupScene } from "./three/setupScene";
import { setupControls } from "./three/setupControls";
import { addLights } from "./three/addLights";
import { setupPostProcessing } from "./three/postProcessing";
import { ScaledOrbitGenerator } from "./three/orbitGenerator";
import { createAllPlanets, Planet } from "./three/objects/createPlanet";
import { createSun } from "./three/objects/createSun";
import { createAsteroid, Asteroid } from "./three/objects/createAsteroid";
import { moveCamera } from "./three/cameraUtils";
import { useAsteroid } from "../hooks/useAsteroid";
import {
  getRecommendedCameraDistance,
  getSceneBoundaries,
} from "../lib/scalingUtils";
import { addStarsBackground } from "./three/createBackground";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";

interface CelestialBody extends Planet {
  orbitGenerator: ScaledOrbitGenerator;
}

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load asteroid data
  const { asteroid: asteroidData } = useAsteroid("3297389");

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
        ...planet,
        orbitGenerator: planet.orbitGenerator,
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
      if (planet.haloSprite) interactiveObjects.set(planet.haloSprite, planet);
      if (planet.labelSprite)
        interactiveObjects.set(planet.labelSprite, planet);
      planet.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          interactiveObjects.set(child, planet);
        }
      });
    });

    // Helper function to highlight celestial objects
    const highlightPlanet = (planet: CelestialBody, highlighted: boolean) => {
      // Highlight halo with yellow color
      if (planet.setHaloHighlight) {
        planet.setHaloHighlight(highlighted);
      }

      // Highlight label with yellow color
      if (planet.setLabelHighlight) {
        planet.setLabelHighlight(highlighted);
      }

      // Highlight orbit line
      if (planet.orbitLine && planet.orbitLine.material) {
        const mat = planet.orbitLine.material as LineMaterial;
        mat.opacity = highlighted ? 1.0 : 0.7;
        mat.linewidth = highlighted ? 5 : 3;
      }

      // Handle planet mesh
      if (planet.mesh && planet.mesh instanceof THREE.Group) {
        planet.mesh.traverse((child: any) => {
          if (child instanceof THREE.Mesh && child.material) {
            child.material.emissive = new THREE.Color(planet.color);
            child.material.emissiveIntensity = highlighted ? 0.3 : 0;
          }
        });
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
        let planet = interactiveObjects.get(intersectedObject);

        // Check parent objects if direct mapping not found
        if (!planet && intersectedObject.parent) {
          planet = interactiveObjects.get(intersectedObject.parent);
        }

        if (planet && planet !== hoveredObject) {
          // Unhighlight previous object
          if (hoveredObject) {
            highlightPlanet(hoveredObject, false);
          }
          // Highlight new object
          highlightPlanet(planet, true);
          hoveredObject = planet;
        }
        renderer.domElement.style.cursor = "pointer";
      } else {
        if (hoveredObject) {
          highlightPlanet(hoveredObject, false);
          hoveredObject = null;
        }
        renderer.domElement.style.cursor = "default";
      }
    };

// Click handler - SUN SIDE WITH HORIZONTAL ORBIT
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
      // Get the actual world position of the planet center
      const planetPosition = new THREE.Vector3();
      planet.mesh.getWorldPosition(planetPosition);
      
      const viewDistance = planet.diameter;
      
      // Calculate direction FROM Sun TO planet (Sun is at 0,0,0)
      const sunToPlanetDirection = planetPosition.clone().normalize();
      
      // Position camera between Sun and planet (so we see the lit side)
      const cameraPosition = planetPosition.clone().add(
        sunToPlanetDirection.multiplyScalar(-viewDistance) // Negative to go toward Sun
      );
      
      // CRITICAL: Calculate proper up vector to make orbit appear horizontal
      // Get the orbital plane normal
      const currentPos = planet.orbitGenerator.getPositionAtTime(currentTime);
      const futurePos = planet.orbitGenerator.getPositionAtTime(currentTime + 1);
      
      const pos1 = new THREE.Vector3(currentPos.position.x, currentPos.position.y, currentPos.position.z);
      const pos2 = new THREE.Vector3(futurePos.position.x, futurePos.position.y, futurePos.position.z);
      
      // Calculate velocity vector (tangent to orbit)
      const velocity = new THREE.Vector3().subVectors(pos2, pos1).normalize();
      
      // Orbital plane normal = radiusVector × velocity
      const radiusVector = pos1.clone().normalize();
      const orbitalNormal = new THREE.Vector3().crossVectors(radiusVector, velocity).normalize();
      
      // If orbital normal calculation fails, fall back to Y-up
      let upVector = new THREE.Vector3(0, 1, 0);
      if (orbitalNormal.length() > 0.1) {
        upVector = orbitalNormal;
      }
      
      moveCamera(camera, controls, cameraPosition, planetPosition, upVector);
    }
  }
};

    renderer.domElement.addEventListener("mousemove", onMouseMove);
    renderer.domElement.addEventListener("click", onClick);

    // Add asteroid when data is loaded
    // if (asteroidData) {
    //   const asteroid = createAsteroid(asteroidData, camera, halos_and_labels);

    //   // Add to scene
    //   scene.add(asteroid.point);
    //   scene.add(asteroid.orbitLine);

    //   // Create asteroid celestial body
    //   const asteroidBody: CelestialBody = {
    //     name: asteroid.name,
    //     orbitGenerator: asteroid.orbitGenerator,
    //     diameter: asteroid.diameter,
    //     color: asteroid.color,
    //     orbitLine: asteroid.orbitLine,
    //     mesh: asteroid.point,
    //     rotationPeriod: 0,
    //     axisTilt: 0,
    //     rotationSpeed: 0,
    //     haloSprite: asteroid.haloSprite,
    //     labelSprite: asteroid.labelSprite,
    //     setHaloHighlight: asteroid.setHaloHighlight,
    //     setLabelHighlight: asteroid.setLabelHighlight,
    //   };

    //   // Add to animation loop
    //   celestialBodies.push(asteroidBody);

    //   // Add to interactive objects
    //   if (asteroid.haloSprite) {
    //     interactiveObjects.set(asteroid.haloSprite, asteroidBody);
    //   }
    //   if (asteroid.labelSprite) {
    //     interactiveObjects.set(asteroid.labelSprite, asteroidBody);
    //   }

    //   asteroids.push(asteroid);
    // }

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

    console.log("Scene initialized");
    setIsLoading(true);

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
  }, []);

  return (
    isLoading ? (
      <div ref={mountRef} style={{ width: "100%", height: "100vh" }} />
    ) : (
      <div>nothing</div>
    )
  );
}
