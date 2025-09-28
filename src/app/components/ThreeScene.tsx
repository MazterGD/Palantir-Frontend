"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { setupScene } from "./three/setupScene";
import { setupControls } from "./three/setupControls";
import { addLights } from "./three/addLights";
import { setupPostProcessing } from "./three/PostProcessing";

import { createAllPlanets } from "./three/objects/createPlanet";
import { createSun } from "./three/objects/createSun";
import {
  getRecommendedCameraDistance,
  getSceneBoundaries,
} from "../lib/scalingUtils";

interface CelestialBody {
  mesh: THREE.Group; // Changed to Group to handle axis tilt
  orbitGenerator: any;
  orbitLine?: THREE.Line;
  rotationSpeed?: number;
}

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const { scene, camera, renderer } = setupScene(mountRef.current);
    const controls = setupControls(camera, renderer);

    // Create celestial objects
    const celestialBodies: CelestialBody[] = [];
    let currentTime = 0;
    
    // Speed control: 1.0 = normal, 0.1 = 10x slower, 0.01 = 100x slower
    const speedMultiplier = 0.1;

    // Create Sun
    const { sun, update: updateSun } = createSun();
    scene.add(sun);

    // Create Planets using the updated createPlanet helper
    const planets = createAllPlanets();
    planets.forEach((planet) => {
      // Use pre-created mesh and orbit line
      scene.add(planet.mesh);
      scene.add(planet.orbitLine);

      // Store for animation
      celestialBodies.push({
        mesh: planet.mesh,
        orbitGenerator: planet.orbitGenerator,
        rotationSpeed: planet.rotationSpeed,
      });
    });

    // Add lights
    addLights(scene);
    const { update: renderWithPostProcessing, resize: resizePostProcessing } = setupPostProcessing(
      scene,
      camera,
      renderer
    );

    // Set camera position for realistic scale
    const cameraDistance = getRecommendedCameraDistance();
    const sceneBounds = getSceneBoundaries();

    camera.position.set(0, cameraDistance * 0.3, cameraDistance);
    camera.lookAt(0, 0, 0);

    // Update camera near/far planes for the realistic scale
    camera.near = 1;
    camera.far = sceneBounds.outerBoundary * 2;
    camera.updateProjectionMatrix();

    // Configure controls for large scale
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 10;
    controls.maxDistance = cameraDistance * 2;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Update time (speed up significantly for visualization of realistic orbits)
      // 1 frame = 1 day * speedMultiplier
      currentTime += 360 * speedMultiplier;

      // Update all celestial bodies
      celestialBodies.forEach((body) => {
        // Update orbital position
        const position = body.orbitGenerator.getPositionAtTime(currentTime);
        body.mesh.position.set(
          position.position.x,
          position.position.y,
          position.position.z
        );

        // Update planetary rotation
        if (body.rotationSpeed) {
          // Rotate the planet mesh inside the tilted group around Y-axis
          const planetMesh = body.mesh.children[0] as THREE.Mesh;
          planetMesh.rotation.y += body.rotationSpeed * speedMultiplier;
        }
      });

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
        mountRef.current!.clientHeight
      );
      resizePostProcessing();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} style={{ width: "100%", height: "100vh" }} />;
}
