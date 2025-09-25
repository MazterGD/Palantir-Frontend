import { MOONS, getMoonsByPlanet, getMoonByName, moonToOrbitalElementsKm } from '@/app/lib/moonData';
import { EllipticalOrbitGenerator, DegreesToRadians } from '../orbitGenerator';
import { scaleMoonSize, getScaledMoonElements } from '@/app/lib/scalingUtils';

export interface Moon {
  name: string;
  parent: string;
  orbitGenerator: EllipticalOrbitGenerator;
  diameter: number; // scaled render units
  color?: string;
}

export function createMoon(moonName: string): Moon | null {
  const moonData = getMoonByName(moonName);
  if (!moonData) {
    return null;
  }

  // Convert to orbital elements and scale
  const orbitalElements = moonToOrbitalElementsKm(moonData, DegreesToRadians);
  const scaledElements = getScaledMoonElements(orbitalElements);
  
  // Create orbit generator
  const orbitGenerator = new EllipticalOrbitGenerator(scaledElements);
  
  // Scale physical properties
  const scaledDiameter = scaleMoonSize(moonData.diameter);

  return {
    name: moonData.name,
    parent: moonData.parent,
    orbitGenerator,
    diameter: scaledDiameter,
    color: getMoonColor(moonName)
  };
}

export function createMoonsForPlanet(planetName: string): Moon[] {
  const moons = getMoonsByPlanet(planetName);
  return moons
    .map(moonData => createMoon(moonData.name))
    .filter(moon => moon !== null) as Moon[];
}

export function createAllMoons(): Moon[] {
  return Object.values(MOONS)
    .flat()
    .map(moonData => createMoon(moonData.name))
    .filter(moon => moon !== null) as Moon[];
}

function getMoonColor(moonName: string): string {
  const colors: Record<string, string> = {
    moon: '#C0C0C0',
    phobos: '#8C7853',
    deimos: '#8C7853',
    io: '#FFFF99',
    europa: '#B3D9FF',
    ganymede: '#8B7D6B',
    callisto: '#4B4B4B',
    mimas: '#E0E0E0',
    enceladus: '#FFFFFF',
    tethys: '#E0E0E0',
    dione: '#E0E0E0',
    rhea: '#D0D0D0',
    titan: '#FFA500',
    iapetus: '#696969',
    miranda: '#D0D0D0',
    ariel: '#E0E0E0',
    umbriel: '#808080',
    titania: '#D0D0D0',
    oberon: '#C0C0C0',
    triton: '#FFB6C1'
  };
  
  return colors[moonName.toLowerCase()] || '#CCCCCC';
}
