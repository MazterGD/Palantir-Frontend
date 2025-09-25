"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { setupScene } from "./three/setupScene";
import { setupControls } from "./three/setupControls";
import { addLights } from "./three/addLights";
import { setupBloom } from "./three/setupBloom";

// Step 1: Import your solar system files
import { createAllPlanets } from "./three/objects/createPlanet";
import { createAllMoons } from "./three/objects/createMoon";
import { scaleSunSize } from "../lib/scalingUtils";
import { createSun } from "./three/objects/createSun";

interface CelestialBody {
  mesh: THREE.Mesh;
  orbitGenerator: any;
  orbitLine?: THREE.Line;
}

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const { scene, camera, renderer } = setupScene(mountRef.current);
    const controls = setupControls(camera, renderer);

    // Step 2: Create celestial objects
    const celestialBodies: CelestialBody[] = [];
    let currentTime = 0;

    // Create Sun
    const { sun, update: updateSun } = createSun();
    scene.add(sun);

    // Create Planets
    const planets = createAllPlanets();
    planets.forEach(planet => {
      // Create planet mesh
      const radius = planet.diameter / 2;
      const geometry = new THREE.SphereGeometry(radius, 16, 16);
      const material = new THREE.MeshPhongMaterial({ 
        color: planet.color || 0xcccccc 
      });
      const mesh = new THREE.Mesh(geometry, material);
      
      
      // Add to scene
      scene.add(mesh);
      scene.add(planet.orbitLine);
      
      // Store for animation
      celestialBodies.push({
        mesh,
        orbitGenerator: planet.orbitGenerator,
      });
    });

    // Step 3: Add lights
    addLights(scene);
    const { update: renderWithBloom, resize: resizeBloom } = setupBloom(
      scene,
      camera,
      renderer
    );

    // Step 4: Set camera position
    camera.position.set(0, 500, 1000);
    camera.lookAt(0, 0, 0);

    // Step 5: Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Update time (speed up for visualization)
      currentTime += 86400; // 1 day per frame

      // Update all celestial bodies
      celestialBodies.forEach(body => {
        const position = body.orbitGenerator.getPositionAtTime(currentTime);
        body.mesh.position.set(position.position.x, position.position.y, position.position.z);
      });

      // Rotate sun
      updateSun();

      controls.update();
      renderWithBloom();
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
      resizeBloom();
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
