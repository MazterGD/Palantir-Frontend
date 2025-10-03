import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { CelestialBody } from "../types";
import { moveCamera } from "./CameraController";
import { ORBIT_PRESETS } from "../orbit/OrbitGenerator";

export function highlightCelestialBody(object: CelestialBody, highlighted: boolean) {
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
          orbitLine.material.emissiveIntensity = ORBIT_PRESETS.bright.emissiveIntensity;
        }
      } else {
        if (object.name.toLowerCase().includes("asteroid")) {
          orbitLine.material.opacity = ORBIT_PRESETS.subtle.opacity;
          if (orbitLine.material.linewidth !== undefined) {
            orbitLine.material.linewidth = ORBIT_PRESETS.subtle.lineWidth;
          }
          if (orbitLine.material.emissiveIntensity !== undefined) {
            orbitLine.material.emissiveIntensity = ORBIT_PRESETS.subtle.emissiveIntensity;
          }
        } else {
          orbitLine.material.opacity = ORBIT_PRESETS.standard.opacity;
          if (orbitLine.material.linewidth !== undefined) {
            orbitLine.material.linewidth = ORBIT_PRESETS.standard.lineWidth;
          }
          if (orbitLine.material.emissiveIntensity !== undefined) {
            orbitLine.material.emissiveIntensity = ORBIT_PRESETS.standard.emissiveIntensity;
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
    const baseSize = object.diameter * 5;
    material.size = highlighted ? baseSize * 1.5 : baseSize;
    material.opacity = highlighted ? 1.0 : 0.9;
  }
}

export function handleCelestialClick(
  object: CelestialBody,
  camera: THREE.Camera,
  controls: OrbitControls
) {
  const objectPosition = new THREE.Vector3();
  object.mesh.getWorldPosition(objectPosition);

  const viewDistance = object.diameter;
  const cameraOffset = new THREE.Vector3(
    viewDistance,
    viewDistance * 0.5,
    viewDistance,
  );
  const cameraPosition = objectPosition.clone().add(cameraOffset);

  camera.up.set(0, 0, 1);
  moveCamera(camera, controls, cameraPosition, objectPosition);
}
