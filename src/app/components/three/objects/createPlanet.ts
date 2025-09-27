import * as THREE from "three";
import { PLANETS } from "@/app/lib/planetData";
import { OrbitGenerator, ScaledOrbitGenerator, ORBIT_PRESETS } from "../orbitGenerator";

export interface Planet {
  name: string;
  orbitGenerator: ScaledOrbitGenerator;
  diameter: number;
  color: string;
  orbitLine: THREE.Line;
  mesh: THREE.Mesh;
}

const createPlanetMesh = (diameter: number, color: string) => 
  new THREE.Mesh(new THREE.SphereGeometry(diameter / 2, 16, 16), new THREE.MeshPhongMaterial({ color }));

export const createPlanet = (planetName: string) => {
  const name = planetName.toLowerCase() as keyof typeof PLANETS;
  const planetData = PLANETS[name];
  if (!planetData) return null;

  const { diameter, color, ...orbitElements } = planetData;
  const orbitGenerator = new OrbitGenerator(orbitElements);
  const positionScale = 100;
  
  const orbitLine = orbitGenerator.generateOrbitLine({
    color,
    scale: positionScale,
    ...ORBIT_PRESETS.standard
  });

  return {
    name: planetName,
    orbitGenerator: new ScaledOrbitGenerator(orbitGenerator, positionScale),
    diameter: diameter * 0.0001,
    color,
    orbitLine,
    mesh: createPlanetMesh(diameter * 0.0001, color)
  };
};

export const createAllPlanets = () => 
  Object.keys(PLANETS).map(name => createPlanet(name)).filter(Boolean) as Planet[];
