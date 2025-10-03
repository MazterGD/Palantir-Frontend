export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface OrbitElements {
  semiMajorAxis: number;
  eccentricity: number;
  inclination: number;
  ascendingNode: number;
  perihelionArgument: number;
  orbitalPeriod: number;
  perihelionTime: number;
  meanAnomaly: number;
  meanMotion: number;
  epoch: number;
}

export interface OrbitPosition {
  position: Point3D;
  time: number;
  radius: number;
}

export interface OrbitLineOptions {
  color?: string;
  opacity?: number;
  emissiveIntensity?: number;
  lineWidth?: number;
  segments?: number;
  scale?: number;
}
