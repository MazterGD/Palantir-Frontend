/**
 * Orbit Generator - All orbit-related functionality
 */
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import * as THREE from "three";
import { kmToRenderUnits } from "@/app/lib/scalingUtils"; // NEW import

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface OrbitElements {
  semiMajorAxis: number; // a (kilometers)
  eccentricity: number; // e
  inclination: number; // i (radians)
  ascendingNode: number; // Ω (radians)
  perihelionArgument: number; // ω (radians)
  orbitalPeriod: number; // T (days)
  perihelionTime: number; // time of perihelion (Julian Date)
  meanAnomaly: number; // M at epoch (radians)
  meanMotion: number; // n (radians per day)
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
  minDistance?: number;
  maxDistance?: number;
  fadeNear?: number;
  fadeFar?: number;
}

export interface StateVectors {
  position: Point3D;
  velocity: Point3D;
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
    // julianDate and epoch are in Julian Date -> difference is in days
    const daysSinceEpoch = julianDate - this.elements.epoch;
    const M =
      this.elements.meanAnomaly + this.elements.meanMotion * daysSinceEpoch; // radians
    // Normalize to 0..2PI
    const twoPi = 2 * Math.PI;
    const normalized = ((M % twoPi) + twoPi) % twoPi;
    return normalized;
  }

  private apply3DRotations(points: Point3D[]): Point3D[] {
    // angles are assumed to be provided in radians now
    const incRad = this.elements.inclination;
    const argRad = this.elements.perihelionArgument;
    const nodeRad = this.elements.ascendingNode;

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
      position: rotated, // in kilometers
      time: this.julianToUnix(julianDate), // seconds
      radius: r, // km
    };
  }

  getCurrentStateVectors(julianDate: number): StateVectors {
    const { semiMajorAxis: a, eccentricity: e } = this.elements;

    // Gravitational parameter for the Sun (km³/s²)
    const mu = 1.32712440018e11;

    // Get mean anomaly at the given time
    const M = this.getMeanAnomalyAtTime(julianDate);

    // Solve Kepler's equation
    const E = this.solveKepler(e, M);

    const cosE = Math.cos(E);
    const sinE = Math.sin(E);

    // Position in orbital plane (km)
    const r = a * (1 - e * cosE);
    const x_orbital = a * (cosE - e);
    const y_orbital = a * Math.sqrt(1 - e * e) * sinE;

    // Velocity in orbital plane (km/s)
    const n = this.elements.meanMotion * (1 / 86400); // Convert from rad/day to rad/s
    const factor = (a * n) / (1 - e * cosE);
    const vx_orbital = -factor * sinE;
    const vy_orbital = factor * Math.sqrt(1 - e * e) * cosE;

    // Apply 3D rotations to get heliocentric coordinates
    const position3D = this.apply3DRotations([
      { x: x_orbital, y: y_orbital, z: 0 },
    ])[0];
    const velocity3D = this.apply3DRotations([
      { x: vx_orbital, y: vy_orbital, z: 0 },
    ])[0];

    return {
      position: position3D, // km
      velocity: velocity3D, // km/s
    };
  }

  static fromStateVectors(
    position: Point3D, // km
    velocity: Point3D, // km/s
    epoch: number, // Julian Date
    mu: number = 1.32712440018e11, // km³/s² for the Sun
  ): OrbitElements {
    // Calculate orbital radius and speed
    const r = Math.sqrt(position.x ** 2 + position.y ** 2 + position.z ** 2);
    const v = Math.sqrt(velocity.x ** 2 + velocity.y ** 2 + velocity.z ** 2);

    // Angular momentum vector
    const hx = position.y * velocity.z - position.z * velocity.y;
    const hy = position.z * velocity.x - position.x * velocity.z;
    const hz = position.x * velocity.y - position.y * velocity.x;
    const h = Math.sqrt(hx ** 2 + hy ** 2 + hz ** 2);

    // Node vector
    const nx = -hy;
    const ny = hx;
    const n = Math.sqrt(nx ** 2 + ny ** 2);

    // Specific energy
    const energy = v ** 2 / 2 - mu / r;

    // Semi-major axis
    const a = -mu / (2 * energy);

    // Eccentricity vector
    const rdotv =
      position.x * velocity.x +
      position.y * velocity.y +
      position.z * velocity.z;
    const ex = ((v ** 2 - mu / r) * position.x - rdotv * velocity.x) / mu;
    const ey = ((v ** 2 - mu / r) * position.y - rdotv * velocity.y) / mu;
    const ez = ((v ** 2 - mu / r) * position.z - rdotv * velocity.z) / mu;
    const e = Math.sqrt(ex ** 2 + ey ** 2 + ez ** 2);

    // Inclination (radians)
    const i = Math.acos(Math.min(1, Math.max(-1, hz / h)));

    // Longitude of ascending node (radians)
    let ascendingNode = 0;
    if (n !== 0) {
      ascendingNode = Math.acos(Math.min(1, Math.max(-1, nx / n)));
      if (ny < 0) ascendingNode = 2 * Math.PI - ascendingNode;
    }

    // Argument of perihelion (radians)
    let perihelionArgument = 0;
    if (n !== 0 && e !== 0) {
      const dotProduct = (nx * ex + ny * ey) / (n * e);
      perihelionArgument = Math.acos(Math.min(1, Math.max(-1, dotProduct)));
      if (ez < 0) perihelionArgument = 2 * Math.PI - perihelionArgument;
    } else if (e !== 0) {
      // For equatorial orbits
      perihelionArgument = Math.atan2(ey, ex);
      if (perihelionArgument < 0) perihelionArgument += 2 * Math.PI;
    }

    // True anomaly
    let trueAnomaly = 0;
    if (e !== 0) {
      const dotProduct =
        (ex * position.x + ey * position.y + ez * position.z) / (e * r);
      trueAnomaly = Math.acos(Math.min(1, Math.max(-1, dotProduct)));
      if (rdotv < 0) trueAnomaly = 2 * Math.PI - trueAnomaly;
    } else {
      // For circular orbits
      const cosNu =
        (position.x * Math.cos(ascendingNode) +
          position.y * Math.sin(ascendingNode)) /
        r;
      const sinNu = position.z / (r * Math.sin(i));
      trueAnomaly = Math.atan2(sinNu, cosNu);
      if (trueAnomaly < 0) trueAnomaly += 2 * Math.PI;
    }

    // Eccentric anomaly
    const cosE = (e + Math.cos(trueAnomaly)) / (1 + e * Math.cos(trueAnomaly));
    const sinE =
      (Math.sqrt(1 - e * e) * Math.sin(trueAnomaly)) /
      (1 + e * Math.cos(trueAnomaly));
    let E = Math.atan2(sinE, cosE);
    if (E < 0) E += 2 * Math.PI;

    // Mean anomaly at epoch
    const meanAnomaly = E - e * Math.sin(E);

    // Orbital period (days)
    const orbitalPeriodSeconds = 2 * Math.PI * Math.sqrt(a ** 3 / mu);
    const orbitalPeriodDays = orbitalPeriodSeconds / 86400;

    // Mean motion (radians per day)
    const meanMotion = (2 * Math.PI) / orbitalPeriodDays;

    // Time of perihelion passage
    const timeSincePerihelion = meanAnomaly / meanMotion; // days
    const perihelionTime = epoch - timeSincePerihelion;

    return {
      semiMajorAxis: a,
      eccentricity: e,
      inclination: i,
      ascendingNode,
      perihelionArgument,
      orbitalPeriod: orbitalPeriodDays,
      perihelionTime,
      meanAnomaly,
      meanMotion,
      epoch,
    };
  }
}

// Wrapper class for Three.js compatibility
export class ScaledOrbitGenerator {
  private orbitGenerator: OrbitGenerator;

  constructor(orbitGenerator: OrbitGenerator) {
    this.orbitGenerator = orbitGenerator;
  }

  getPositionAtTime(unixTime: number) {
    const julianDate = unixTime / 86400 + 2440587.5;
    const orbitPosition = this.orbitGenerator.getPositionAtTime(julianDate);

    // Convert kilometers -> render units per coordinate and enforce min via kmToRenderUnits
    return {
      position: {
        x: kmToRenderUnits(orbitPosition.position.x),
        y: kmToRenderUnits(orbitPosition.position.y),
        z: kmToRenderUnits(orbitPosition.position.z),
      },
      radius: kmToRenderUnits(orbitPosition.radius),
      time: orbitPosition.time,
    };
  }

  // Generate an orbit line already converted to render units
  generateOrbitLine(
    camera: THREE.Camera,
    centerObject: THREE.Object3D,
    options: OrbitLineOptions = {},
  ): { line: Line2; update: () => void } {
    const {
      color = "#ffffff",
      opacity = 0.8,
      segments = 360,
      minDistance = 1,
      fadeNear = 200,
    } = options;

    const orbitPoints = this.orbitGenerator.generateOrbit(segments);

    const ruPositions = new Float32Array(orbitPoints.length * 3);
    for (let i = 0; i < orbitPoints.length; i++) {
      const p = orbitPoints[i];
      ruPositions[i * 3] = kmToRenderUnits(p.x);
      ruPositions[i * 3 + 1] = kmToRenderUnits(p.y);
      ruPositions[i * 3 + 2] = kmToRenderUnits(p.z);
    }

    const geometry = new LineGeometry();
    geometry.setPositions(ruPositions);

    const isMobile =
      /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (window.matchMedia && window.matchMedia("(max-width: 768px)").matches);

    const lineW = isMobile ? 1.5 : 3;

    const material = new LineMaterial({
      color: color,
      transparent: true,
      opacity: opacity,
      linewidth: lineW,
    });

    const line = new Line2(geometry, material);
    line.computeLineDistances();

    const baseOpacity = opacity;

    const update = () => {
      const worldPos = centerObject.getWorldPosition(new THREE.Vector3());
      const distance = camera.position.distanceTo(worldPos);

      let currentOpacity = baseOpacity;

      if (distance < Math.max(0, minDistance - fadeNear)) {
        currentOpacity = 0;
      } else if (distance < minDistance) {
        const fadeStart = Math.max(0, minDistance - fadeNear);
        currentOpacity =
          THREE.MathUtils.clamp(
            (distance - fadeStart) / (minDistance - fadeStart),
            0,
            1,
          ) * baseOpacity;
      }

      material.opacity = currentOpacity;
      line.visible = currentOpacity > 0.001;
    };

    return { line, update };
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
  subtle: {
    opacity: 0.5,
    emissiveIntensity: 0.6,
    lineWidth: 0.5,
    segments: 180,
  },
};
