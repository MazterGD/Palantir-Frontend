export interface ImpactorInput {
  pjDiam: number; // projectile diameter (m)
  pjDens: number; // projectile density (kg/m^3)
  pjVel: number; // initial velocity (km/s)
  pjAngle: number; // impact angle (degrees)
  tgDepth: number; // target depth (m)
  abAltBurst?: number; // airburst altitude (m), default = 0
  imVel: number; // final impact velocity (km/s)
  imDist?: number; // impact distance (m)
}

export interface AsteroidImpactResult {
  mass: number; // kg
  kineticEnergy: number; // J
  energyMegatons: number; // Mt TNT
  impactEnergy: number; // J
  impactMegatons: number; // Mt TNT
  linearMomentum: number; // kg·m/s
  angularMomentum: number; // kg·m^2/s
  seafloorVelocity: number; // km/s
  seafloorEnergy: number; // J
  imFreq: number; // years (impact frequency estimate)
}

export interface FormData {
  name: string;
  id: number;
  diameter: number;
  density: number;
  angle: number;
  velocity: number;
  longitude: number;
  latitude: number;
  depth: number;
  trgt_type: "w" | "s" | "i";
}

export interface AtmosphericEntryInputs {
  pjDens: number; // projectile density (kg/m^3)
  pjDiam: number; // projectile diameter (m)
  pjVel: number; // projectile velocity (km/s)
  pjAngle: number; // impact angle (degrees)
  rhoSurface: number; // air density at surface (kg/m^3)
  dragC: number; // drag coefficient
  scaleHeight: number; // atmospheric scale height (m)
  G: number; // gravitational acceleration (m/s^2)
  fp: number; // shape factor
}

export interface AtmosphericEntryResults {
  abAltBreak: number; // altitude of breakup (m)
  abAltBurst: number; // altitude of atmospheric burst (m)
  imVel: number; // impact velocity at surface (km/s)
}

export interface CraterInputs {
  pjDens: number; // density (kg/m³)
  pjDiam: number; // diameter (m)
  pjVel: number; // velocity at entry (km/s)
  pjAngle: number; // angle (deg)
  abAltBreak: number; // breakup altitude (m)
  tgType: "w" | "s" | "i"; // target type
  tgDens: number; // target density (kg/m³)
  tgDepth: number; // water depth (m)
  crMass: number; // mass (kg)
  imVel: number; // impact velocity (km/s)
}

export interface CraterResults {
  crTsDiam?: number; // transient crater diameter (m)
  crTsDepth?: number; // transient crater depth (m)
  crDiam?: number; // final crater diameter (m)
  crDepth?: number; // final crater depth (m)
  crVol?: number; // crater volume (m^3)
  crVolMelt?: number; // melted volume (m^3)
}
