"use client";

import { useEffect, useRef } from "react";
import { setupScene } from "./three/setupScene";
import { setupControls } from "./three/setupControls";
import { addLights } from "./three/addLights";
import { createSun } from "./three/objects/createSun";
import { createEarth } from "./three/objects/createEarth";
import {
  createJupiter,
  createMars,
  createMercury,
  createSaturn,
  createVenus,
} from "./three/objects/planetConfig";
import { setupBloom } from "./three/setupBloom";

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const { scene, camera, renderer } = setupScene(mountRef.current);
    const controls = setupControls(camera, renderer);

    // Create celestial objects
    const { sun, update: updateSun } = createSun();
    const { planet: mercury, update: updateMercury } = createMercury();
    const { planet: venus, update: updateVenus } = createVenus();
    const { earth, update: updateEarth } = createEarth();
    const { planet: mars, update: updateMars } = createMars();
    const { planet: jupiter, update: updateJupiter } = createJupiter();
    const { planet: saturn, update: updateSaturn } = createSaturn();

    // Add all objects to scene
    scene.add(sun);
    scene.add(mercury);
    scene.add(venus);
    scene.add(earth);
    scene.add(mars);
    scene.add(jupiter);
    scene.add(saturn);

    addLights(scene);
    const { update: renderWithBloom, resize: resizeBloom } = setupBloom(
      scene,
      camera,
      renderer
    );

    camera.position.set(0, 10, 25);
    camera.lookAt(0, 0, 0);

    const animate = () => {
      requestAnimationFrame(animate);

      // Update planets
      updateSun();
      updateMercury();
      updateVenus();
      updateEarth();
      updateMars();
      updateJupiter();
      updateSaturn();

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
