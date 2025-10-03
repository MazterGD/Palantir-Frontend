import * as THREE from "three";
import { ScaledOrbitGenerator } from "./orbit/OrbitGenerator";

export interface CelestialBody {
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

export interface Planet extends CelestialBody {
  rotationPeriod: number;
  axisTilt: number;
  rings?: THREE.Group;
}

export interface Asteroid extends CelestialBody {
  id: string;
  isPotentiallyHazardous?: boolean;
}
