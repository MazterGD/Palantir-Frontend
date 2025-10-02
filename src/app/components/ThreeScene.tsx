"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { setupScene } from "./three/setupScene";
import { setupControls } from "./three/setupControls";
import { addLights } from "./three/addLights";
import { setupPostProcessing } from "./three/postProcessing";
import { ScaledOrbitGenerator } from "./three/orbitGenerator";
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
  orbitLine?: THREE.Line;
  rotationSpeed?: number;
}

export default function ThreeScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  
  // Load asteroid data
  const { asteroid: asteroidData } = useAsteroid('3297389');

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
      });
    });

    // Raycaster setup for interactions
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let hoveredObject: any = null;

    // Create mapping of interactive objects
    const interactiveObjects: Map<THREE.Object3D, any> = new Map();
    
    // Map planet sprites and meshes
    planets.forEach((planet) => {
      if (planet.haloSprite) interactiveObjects.set(planet.haloSprite, planet);
      if (planet.labelSprite) interactiveObjects.set(planet.labelSprite, planet);
      planet.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          interactiveObjects.set(child, planet);
        }
      });
    });

    // Helper function to highlight celestial objects
    const highlightPlanet = (object: any, highlighted: boolean) => {
      // Highlight halo with yellow color
      if (object.setHaloHighlight) {
        object.setHaloHighlight(highlighted);
      }
      
      // Highlight label with yellow color
      if (object.setLabelHighlight) {
        object.setLabelHighlight(highlighted);
      }
      
      // Highlight orbit line
      if (object.orbitLine && object.orbitLine.material) {
        object.orbitLine.material.opacity = highlighted ? 1.0 : 0.7;
        object.orbitLine.material.linewidth = highlighted ? 5 : 3;
      }
      
      // Handle planet mesh
      if (object.mesh && object.mesh instanceof THREE.Group) {
        object.mesh.traverse((child: any) => {
          if (child instanceof THREE.Mesh && child.material) {
            child.material.emissive = new THREE.Color(object.color);
            child.material.emissiveIntensity = highlighted ? 0.3 : 0;
          }
        });
      }
      
      // Handle asteroid point
      if (object.point && object.point instanceof THREE.Points) {
        const material = object.point.material as THREE.PointsMaterial;
        material.size = highlighted ? material.size * 1.5 : object.diameter * 5;
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
            highlightPlanet(hoveredObject, false);
          }
          // Highlight new object
          highlightPlanet(object, true);
          hoveredObject = object;
        }
        renderer.domElement.style.cursor = 'pointer';
      } else {
        if (hoveredObject) {
          highlightPlanet(hoveredObject, false);
          hoveredObject = null;
        }
        renderer.domElement.style.cursor = 'default';
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
          const targetMesh = object.mesh || object.point;
          const position = targetMesh.position.clone();
          const viewDistance = object.diameter * 5;
          const cameraPosition = position.clone();
          cameraPosition.y += viewDistance;
          cameraPosition.z += viewDistance;
          
          moveCamera(camera, controls, cameraPosition, position);
        }
      }
    };

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);

    // Add asteroid when data is loaded
    if (asteroidData) {
      const asteroid = createAsteroid(asteroidData, camera, halos_and_labels);
      
      // Add to scene
      scene.add(asteroid.point);
      scene.add(asteroid.orbitLine);
      
      // Add to animation loop
      celestialBodies.push({
        mesh: asteroid.point,
        orbitGenerator: asteroid.orbitGenerator,
      });
      
      // Add to interactive objects
      if (asteroid.haloSprite) {
        interactiveObjects.set(asteroid.haloSprite, {
          ...asteroid,
          mesh: asteroid.point,
          diameter: asteroid.diameter,
        });
      }
      if (asteroid.labelSprite) {
        interactiveObjects.set(asteroid.labelSprite, {
          ...asteroid, 
          mesh: asteroid.point,
          diameter: asteroid.diameter,
        });
      }
      
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
    controls.minDistance = 10;
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

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('click', onClick);
      controls.dispose();
      renderer.dispose();
      if (Refcurrent) {
        Refcurrent.removeChild(renderer.domElement);
      }
    };
  }, [asteroidData]);

  return <div ref={mountRef} style={{ width: "100%", height: "100vh" }} />;
}
