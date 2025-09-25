/**
 * Elliptical Orbit Generator
 * TypeScript implementation based on Keplerian orbital mechanics
 * Converted from R implementation by Daniel A. O'Neil
 */

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface OrbitalElements {
  /** Semi-major axis (in astronomical units or desired distance units) */
  semiMajorAxis: number;
  /** Eccentricity (0 = circle, 0-1 = ellipse, 1 = parabola) */
  eccentricity: number;
  /** Inclination in radians (tilt of orbit plane) */
  inclination: number;
  /** Longitude of ascending node in radians (ω) */
  longitudeOfAscendingNode: number;
  /** Right Ascension of Ascending Node in radians (Ω) */
  rightAscensionOfAscendingNode: number;
  /** Orbital period in seconds */
  orbitalPeriod: number;
  /** Time of periapsis passage in seconds */
  timeOfPeriapsisPassage: number;
}

export interface OrbitPoint {
  position: Vector3D;
  time: number;
  trueAnomaly: number;
  radius: number;
}

export class EllipticalOrbitGenerator {
  private elements: OrbitalElements;
  private meanMotion: number; // n = 2π/T

  constructor(elements: OrbitalElements) {
    this.elements = elements;
    this.meanMotion = (2 * Math.PI) / elements.orbitalPeriod;
  }

  /**
   * Generate a flat 2D ellipse before 3D transformations
   */
  private generateFlatEllipse(numPoints: number = 80): Vector3D[] {
    const { semiMajorAxis: a, eccentricity: e } = this.elements;
    const semiMinorAxis = a * Math.sqrt(1 - e * e);
    const points: Vector3D[] = [];

    for (let i = 0; i < numPoints; i++) {
      const u = (-Math.PI + (2 * Math.PI * i) / (numPoints - 1));
      const x = a * Math.cos(u) - e;
      const y = a * Math.sqrt(1 - e * e) * Math.sin(u);
      const z = 0;
      
      points.push({ x, y, z });
    }

    return points;
  }

  /**
   * Rotate a 3D point around an axis
   */
  private rotate3D(point: Vector3D, angle: number, axisX: number, axisY: number, axisZ: number): Vector3D {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const oneMinusCos = 1 - cos;

    // Normalize the axis vector
    const magnitude = Math.sqrt(axisX * axisX + axisY * axisY + axisZ * axisZ);
    const ux = axisX / magnitude;
    const uy = axisY / magnitude;
    const uz = axisZ / magnitude;

    // Rodrigues' rotation formula
    const rotationMatrix = [
      [cos + ux * ux * oneMinusCos, ux * uy * oneMinusCos - uz * sin, ux * uz * oneMinusCos + uy * sin],
      [uy * ux * oneMinusCos + uz * sin, cos + uy * uy * oneMinusCos, uy * uz * oneMinusCos - ux * sin],
      [uz * ux * oneMinusCos - uy * sin, uz * uy * oneMinusCos + ux * sin, cos + uz * uz * oneMinusCos]
    ];

    return {
      x: rotationMatrix[0][0] * point.x + rotationMatrix[0][1] * point.y + rotationMatrix[0][2] * point.z,
      y: rotationMatrix[1][0] * point.x + rotationMatrix[1][1] * point.y + rotationMatrix[1][2] * point.z,
      z: rotationMatrix[2][0] * point.x + rotationMatrix[2][1] * point.y + rotationMatrix[2][2] * point.z
    };
  }

  /**
   * Apply 3D rotations using Keplerian parameters
   */
  private apply3DRotations(points: Vector3D[]): Vector3D[] {
    const { inclination, longitudeOfAscendingNode, rightAscensionOfAscendingNode } = this.elements;
    
    return points.map(point => {
      // Step 1: Pitch (Inclination) - rotate around Y-axis
      let rotatedPoint = this.rotate3D(point, inclination, 0, 1, 0);
      
      // Step 2: Yaw (Longitude of ascending node) - rotate around Z-axis
      rotatedPoint = this.rotate3D(rotatedPoint, longitudeOfAscendingNode, 0, 0, 1);
      
      // Step 3: Roll (RAAN) - rotate around X-axis
      rotatedPoint = this.rotate3D(rotatedPoint, rightAscensionOfAscendingNode, 1, 0, 0);
      
      return rotatedPoint;
    });
  }

  /**
   * Marc Murison's algorithm for solving Kepler's equation
   */
  private keplerStart3(e: number, M: number): number {
    const t34 = e * e;
    const t35 = e * t34;
    const t33 = Math.cos(M);

    return M + (-0.5 * t35 + e + (t34 + 1.5 * t33 * t35) * t33) * Math.sin(M);
  }

  private eps3(e: number, M: number, x: number): number {
    const t1 = Math.cos(x);
    const t2 = -1 + e * t1;
    const t3 = Math.sin(x);
    const t4 = e * t3;
    const t5 = -x + t4 + M;
    const t6 = t5 / (0.5 * t5 * t4 / t2 + t2);
    
    return t5 / ((0.5 * t3 - (1/6) * t1 * t6) * e * t6 + t2);
  }

  /**
   * Solve Kepler's equation iteratively
   */
  private solveKepler(e: number, M: number): number {
    const tolerance = 1.0e-14;
    const maxIterations = 100;
    
    const MNorm = M % (2 * Math.PI);
    let E0 = this.keplerStart3(e, MNorm);
    let dE = tolerance + 1;
    let count = 0;

    while (dE > tolerance && count < maxIterations) {
      const E = E0 - this.eps3(e, MNorm, E0);
      dE = Math.abs(E - E0);
      E0 = E;
      count++;
    }

    if (count >= maxIterations) {
      console.warn('Kepler equation solver failed to converge');
    }

    return E0;
  }

  /**
   * Propagate orbit to get position at specific time
   */
  private propagateOrbit(time: number): OrbitPoint {
    const { semiMajorAxis: a, eccentricity: e, timeOfPeriapsisPassage: tau } = this.elements;
    
    // Calculate mean anomaly
    const M = this.meanMotion * (time - tau);
    
    // Solve Kepler's equation for eccentric anomaly
    const E = this.solveKepler(e, M);
    const cosE = Math.cos(E);
    
    // Calculate radius and position in orbital plane
    const r = a * (1 - e * cosE);
    const x = r * ((cosE - e) / (1 - e * cosE));
    const y = r * ((Math.sqrt(1 - e * e) * Math.sin(E)) / (1 - e * cosE));
    const z = 0;
    
    // Apply 3D rotations
    let position = { x, y, z };
    position = this.rotate3D(position, this.elements.inclination, 0, 1, 0);
    position = this.rotate3D(position, this.elements.longitudeOfAscendingNode, 0, 0, 1);
    position = this.rotate3D(position, this.elements.rightAscensionOfAscendingNode, 1, 0, 0);
    
    // Calculate true anomaly
    const trueAnomaly = Math.atan2(
      Math.sqrt(1 - e * e) * Math.sin(E),
      cosE - e
    );
    
    return {
      position,
      time,
      trueAnomaly,
      radius: r
    };
  }

  /**
   * Generate complete orbital trajectory
   */
  generateOrbitTrajectory(numPoints: number = 80): Vector3D[] {
    const flatEllipse = this.generateFlatEllipse(numPoints);
    return this.apply3DRotations(flatEllipse);
  }

  /**
   * Generate orbit points over time with propagation
   */
  generateOrbitOverTime(startTime: number, endTime: number, timeSteps: number): OrbitPoint[] {
    const points: OrbitPoint[] = [];
    const deltaTime = (endTime - startTime) / (timeSteps - 1);
    
    for (let i = 0; i < timeSteps; i++) {
      const time = startTime + i * deltaTime;
      points.push(this.propagateOrbit(time));
    }
    
    return points;
  }

  /**
   * Get position at specific time
   */
  getPositionAtTime(time: number): OrbitPoint {
    return this.propagateOrbit(time);
  }

  /**
   * Calculate orbital velocity at given position
   */
  getVelocityAtTime(time: number, deltaTime: number = 1): Vector3D {
    const pos1 = this.propagateOrbit(time - deltaTime / 2);
    const pos2 = this.propagateOrbit(time + deltaTime / 2);
    
    return {
      x: (pos2.position.x - pos1.position.x) / deltaTime,
      y: (pos2.position.y - pos1.position.y) / deltaTime,
      z: (pos2.position.z - pos1.position.z) / deltaTime
    };
  }

  /**
   * Get focus point (where the central body is located)
   */
  getFocusPoint(): Vector3D {
    const { semiMajorAxis: a, eccentricity: e } = this.elements;
    const c = e * a;
    let focus = { x: -c, y: 0, z: 0 };
    
    // Apply same rotations as orbit
    focus = this.rotate3D(focus, this.elements.inclination, 0, 1, 0);
    focus = this.rotate3D(focus, this.elements.longitudeOfAscendingNode, 0, 0, 1);
    focus = this.rotate3D(focus, this.elements.rightAscensionOfAscendingNode, 1, 0, 0);
    
    return focus;
  }

  /**
   * Update orbital elements
   */
  updateElements(newElements: Partial<OrbitalElements>): void {
    this.elements = { ...this.elements, ...newElements };
    this.meanMotion = (2 * Math.PI) / this.elements.orbitalPeriod;
  }

  /**
   * Get current orbital elements
   */
  getElements(): OrbitalElements {
    return { ...this.elements };
  }
}

// Utility functions for unit conversion
export const DegreesToRadians = (degrees: number): number => degrees * Math.PI / 180;
export const RadiansToDegrees = (radians: number): number => radians * 180 / Math.PI;

// Example usage and factory functions
export function createEarthOrbit(): EllipticalOrbitGenerator {
  return new EllipticalOrbitGenerator({
    semiMajorAxis: 1.0, // 1 AU
    eccentricity: 0.0167, // Earth's eccentricity
    inclination: DegreesToRadians(0), // Earth's orbit is reference plane
    longitudeOfAscendingNode: DegreesToRadians(0),
    rightAscensionOfAscendingNode: DegreesToRadians(0),
    orbitalPeriod: 365.25 * 24 * 3600, // seconds in a year
    timeOfPeriapsisPassage: 0
  });
}

export function createMarsOrbit(): EllipticalOrbitGenerator {
  return new EllipticalOrbitGenerator({
    semiMajorAxis: 1.524, // AU
    eccentricity: 0.0934,
    inclination: DegreesToRadians(1.85),
    longitudeOfAscendingNode: DegreesToRadians(49.57),
    rightAscensionOfAscendingNode: DegreesToRadians(286.5),
    orbitalPeriod: 687 * 24 * 3600, // Martian year in seconds
    timeOfPeriapsisPassage: 0
  });
}
