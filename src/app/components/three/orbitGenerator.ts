/**
 * Orbit Generator - All orbit-related functionality
 */
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
// import * as THREE from "three";

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface OrbitElements {
  semiMajorAxis: number; // a (AU)
  eccentricity: number; // e
  inclination: number; // i (degrees)
  ascendingNode: number; // Ω (degrees)
  perihelionArgument: number; // ω (degrees)
  orbitalPeriod: number; // T (days)
  perihelionTime: number; // time of perihelion (Julian Date)
  meanAnomaly: number; // M at epoch (degrees)
  meanMotion: number; // n (degrees/day)
  epoch: number; // reference time (Julian Date)
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

export class OrbitGenerator {
  private elements: OrbitElements;

  constructor(elements: OrbitElements) {
    this.elements = elements;
  }

  private toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }

  private julianToUnix(jd: number): number {
    return (jd - 2440587.5) * 86400;
  }

  private rotatePoint(
    point: Point3D,
    angle: number,
    axisX: number,
    axisY: number,
    axisZ: number,
  ): Point3D {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const oneMinusCos = 1 - cos;

    const magnitude = Math.sqrt(axisX * axisX + axisY * axisY + axisZ * axisZ);
    const ux = axisX / magnitude;
    const uy = axisY / magnitude;
    const uz = axisZ / magnitude;

    const rotMatrix = [
      [
        cos + ux * ux * oneMinusCos,
        ux * uy * oneMinusCos - uz * sin,
        ux * uz * oneMinusCos + uy * sin,
      ],
      [
        uy * ux * oneMinusCos + uz * sin,
        cos + uy * uy * oneMinusCos,
        uy * uz * oneMinusCos - ux * sin,
      ],
      [
        uz * ux * oneMinusCos - uy * sin,
        uz * uy * oneMinusCos + ux * sin,
        cos + uz * uz * oneMinusCos,
      ],
    ];

    return {
      x:
        rotMatrix[0][0] * point.x +
        rotMatrix[0][1] * point.y +
        rotMatrix[0][2] * point.z,
      y:
        rotMatrix[1][0] * point.x +
        rotMatrix[1][1] * point.y +
        rotMatrix[1][2] * point.z,
      z:
        rotMatrix[2][0] * point.x +
        rotMatrix[2][1] * point.y +
        rotMatrix[2][2] * point.z,
    };
  }

  private solveKepler(e: number, M: number): number {
    const tolerance = 1.0e-14;
    const maxIterations = 100;

    const MNorm = M % (2 * Math.PI);
    let E0 = MNorm + e * Math.sin(MNorm);
    let dE = tolerance + 1;
    let count = 0;

    while (dE > tolerance && count < maxIterations) {
      const eps = (E0 - e * Math.sin(E0) - MNorm) / (1 - e * Math.cos(E0));
      const E = E0 - eps;
      dE = Math.abs(E - E0);
      E0 = E;
      count++;
    }

    return E0;
  }

  private getMeanAnomalyAtTime(julianDate: number): number {
    const daysSinceEpoch = julianDate - this.elements.epoch;
    const meanAnomalyDegrees =
      this.elements.meanAnomaly + this.elements.meanMotion * daysSinceEpoch;
    return this.toRadians(meanAnomalyDegrees % 360);
  }

  private apply3DRotations(points: Point3D[]): Point3D[] {
    const incRad = this.toRadians(this.elements.inclination);
    const argRad = this.toRadians(this.elements.perihelionArgument);
    const nodeRad = this.toRadians(this.elements.ascendingNode);

    return points.map((point) => {
      let rotated = this.rotatePoint(point, argRad, 0, 0, 1);
      rotated = this.rotatePoint(rotated, incRad, 1, 0, 0);
      rotated = this.rotatePoint(rotated, nodeRad, 0, 0, 1);
      return rotated;
    });
  }

  generateOrbit(numPoints: number = 100): Point3D[] {
    const { semiMajorAxis: a, eccentricity: e } = this.elements;
    const points: Point3D[] = [];

    for (let i = 0; i < numPoints; i++) {
      const u = -Math.PI + (2 * Math.PI * i) / (numPoints - 1);
      const x = a * (Math.cos(u) - e);
      const y = a * Math.sqrt(1 - e * e) * Math.sin(u);
      const z = 0;
      points.push({ x, y, z });
    }

    return this.apply3DRotations(points);
  }

  getPositionAtTime(julianDate: number): OrbitPosition {
    const { semiMajorAxis: a, eccentricity: e } = this.elements;

    const M = this.getMeanAnomalyAtTime(julianDate);
    const E = this.solveKepler(e, M);
    const cosE = Math.cos(E);

    const r = a * (1 - e * cosE);
    const x = r * ((cosE - e) / (1 - e * cosE));
    const y = r * ((Math.sqrt(1 - e * e) * Math.sin(E)) / (1 - e * cosE));
    const z = 0;

    const rotated = this.apply3DRotations([{ x, y, z }])[0];

    return {
      position: rotated,
      time: this.julianToUnix(julianDate),
      radius: r,
    };
  }

  generateOrbitLine(options: OrbitLineOptions = {}): Line2 {
    const {
      color = "#ffffff",
      opacity = 0.8,
      segments = 360,
      scale = 1,
    } = options;

    // Generate orbit points
    const orbitPoints = this.generateOrbit(segments);

    // Convert to Three.js format with scaling
    const positions = new Float32Array(orbitPoints.length * 3);
    for (let i = 0; i < orbitPoints.length; i++) {
      const point = orbitPoints[i];
      positions[i * 3] = point.x * scale;
      positions[i * 3 + 1] = point.y * scale;
      positions[i * 3 + 2] = point.z * scale;
    }

    // Create Line2 object
    const geometry = new LineGeometry();
    geometry.setPositions(positions);

    const material = new LineMaterial({
      color: color,
      transparent: opacity < 1,
      opacity: opacity,
      linewidth: 3,
    });

    return new Line2(geometry, material);
  }
}

// Wrapper class for Three.js compatibility
export class ScaledOrbitGenerator {
  private orbitGenerator: OrbitGenerator;
  private scale: number;

  constructor(orbitGenerator: OrbitGenerator, scale: number = 100) {
    this.orbitGenerator = orbitGenerator;
    this.scale = scale;
  }

  getPositionAtTime(unixTime: number) {
    const julianDate = unixTime / 86400 + 2440587.5;
    const orbitPosition = this.orbitGenerator.getPositionAtTime(julianDate);

    return {
      position: {
        x: orbitPosition.position.x * this.scale,
        y: orbitPosition.position.y * this.scale,
        z: orbitPosition.position.z * this.scale,
      },
      radius: orbitPosition.radius * this.scale,
      time: orbitPosition.time,
    };
  }
}

// Orbit line presets
export const ORBIT_PRESETS = {
  standard: {
    opacity: 0.7,
    emissiveIntensity: 0.3,
    lineWidth: 2,
    segments: 360,
  },
  bright: { opacity: 0.9, emissiveIntensity: 0.6, lineWidth: 3, segments: 360 },
  subtle: { opacity: 0.1, emissiveIntensity: 0.1, lineWidth: 0.5, segments: 180 },
};
