import { ASTRONOMICAL_DATA } from "@/app/lib/planetData";
import * as THREE from "three";

export interface OrbitalData {
  semiMajorAxis: number; // Semi-major axis in AU
  eccentricity: number; // Orbital eccentricity (0 = circle, 1 = parabola)
  orbitalPeriod: number; // Orbital period in Earth years
  inclination: number; // Orbital inclination in degrees
  longitudeOfAscendingNode: number; // LOAN in degrees
  argumentOfPeriapsis: number; // Argument of periapsis in degrees
}

export class EllipticalOrbit {
  private semiMajorAxis: number;
  private eccentricity: number;
  private orbitalPeriod: number;
  private inclination: number;
  private longitudeOfAscendingNode: number;
  private argumentOfPeriapsis: number;

  private meanAnomaly: number = 0;
  private meanMotion: number;
  private scaleFactor: number;

  constructor(orbitalData: OrbitalData, scaleFactor: number = 10) {
    this.semiMajorAxis = orbitalData.semiMajorAxis;
    this.eccentricity = orbitalData.eccentricity;
    this.orbitalPeriod = orbitalData.orbitalPeriod;
    this.inclination = THREE.MathUtils.degToRad(orbitalData.inclination);
    this.longitudeOfAscendingNode = THREE.MathUtils.degToRad(
      orbitalData.longitudeOfAscendingNode
    );
    this.argumentOfPeriapsis = THREE.MathUtils.degToRad(
      orbitalData.argumentOfPeriapsis
    );

    this.meanMotion = (2 * Math.PI) / (orbitalData.orbitalPeriod * 365.25); // radians per day
    this.scaleFactor = scaleFactor;

    // Random starting position
    this.meanAnomaly = Math.random() * 2 * Math.PI;
  }

  // Solve Kepler's equation for eccentric anomaly
  private solveKeplerEquation(meanAnomaly: number): number {
    let eccentricAnomaly = meanAnomaly;
    const tolerance = 1e-8;
    let iterations = 0;
    const maxIterations = 100;

    while (iterations < maxIterations) {
      const delta =
        eccentricAnomaly -
        this.eccentricity * Math.sin(eccentricAnomaly) -
        meanAnomaly;
      if (Math.abs(delta) < tolerance) break;

      eccentricAnomaly -=
        delta / (1 - this.eccentricity * Math.cos(eccentricAnomaly));
      iterations++;
    }

    return eccentricAnomaly;
  }

  // Calculate position in orbital plane
  private getOrbitalPlanePosition(eccentricAnomaly: number): THREE.Vector3 {
    const a = this.semiMajorAxis * this.scaleFactor;
    const e = this.eccentricity;

    const x = a * (Math.cos(eccentricAnomaly) - e);
    const y = a * Math.sqrt(1 - e * e) * Math.sin(eccentricAnomaly);

    return new THREE.Vector3(x, 0, y);
  }

  // Transform from orbital plane to 3D space
  private transform3D(position: THREE.Vector3): THREE.Vector3 {
    const cosLAN = Math.cos(this.longitudeOfAscendingNode);
    const sinLAN = Math.sin(this.longitudeOfAscendingNode);
    const cosAOP = Math.cos(this.argumentOfPeriapsis);
    const sinAOP = Math.sin(this.argumentOfPeriapsis);
    const cosInc = Math.cos(this.inclination);
    const sinInc = Math.sin(this.inclination);

    // Rotation matrix from orbital plane to ecliptic
    const P11 = cosLAN * cosAOP - sinLAN * sinAOP * cosInc;
    const P12 = -cosLAN * sinAOP - sinLAN * cosAOP * cosInc;
    const P21 = sinLAN * cosAOP + cosLAN * sinAOP * cosInc;
    const P22 = -sinLAN * sinAOP + cosLAN * cosAOP * cosInc;
    const P31 = sinAOP * sinInc;
    const P32 = cosAOP * sinInc;

    return new THREE.Vector3(
      P11 * position.x + P12 * position.z,
      P31 * position.x + P32 * position.z,
      P21 * position.x + P22 * position.z
    );
  }

  // Get current position
  public getPosition(): THREE.Vector3 {
    const eccentricAnomaly = this.solveKeplerEquation(this.meanAnomaly);
    const orbitalPosition = this.getOrbitalPlanePosition(eccentricAnomaly);
    return this.transform3D(orbitalPosition);
  }

  // Get orbital velocity (for realistic orbital speed variation)
  public getOrbitalVelocity(): number {
    const eccentricAnomaly = this.solveKeplerEquation(this.meanAnomaly);
    const r =
      this.semiMajorAxis * (1 - this.eccentricity * Math.cos(eccentricAnomaly));

    // Vis-viva equation: v² = GM(2/r - 1/a)
    // Simplified for animation speed variation
    const velocityFactor = Math.sqrt(2 / r - 1 / this.semiMajorAxis);
    return velocityFactor;
  }

  // Update orbit
  public update(deltaTime: number = 1): void {
    const velocity = this.getOrbitalVelocity();
    this.meanAnomaly += this.meanMotion * deltaTime * velocity * 0.01; // Scale for animation

    // Keep angle in range [0, 2π]
    this.meanAnomaly = this.meanAnomaly % (2 * Math.PI);
  }

  // Create orbit path for visualization
  public createOrbitPath(segments: number = 200): THREE.BufferGeometry {
    const points: THREE.Vector3[] = [];

    for (let i = 0; i <= segments; i++) {
      const meanAnom = (i / segments) * 2 * Math.PI;
      const eccAnom = this.solveKeplerEquation(meanAnom);
      const orbitalPos = this.getOrbitalPlanePosition(eccAnom);
      const worldPos = this.transform3D(orbitalPos);
      points.push(worldPos);
    }

    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    return geometry;
  }
}

// Helper function to create realistic planet sizes
export function getRealisticRadius(
  planetName: string,
  scaleFactor: number = 0.0001
): number {
  const data = ASTRONOMICAL_DATA[planetName];
  if (!data) return 0.5;

  // Scale radius: actual km * scale factor, with minimum for visibility
  const scaledRadius = data.size.radius * scaleFactor;
  return Math.max(scaledRadius, 0.1); // Minimum 0.1 units for visibility
}
