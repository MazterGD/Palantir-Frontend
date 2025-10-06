// Orbit manager
import type { CelestialBody } from "../ThreeScene";
import * as THREE from "three";

export class AsteroidOrbitManager {
  private static currentAsteroid: CelestialBody | null = null;
  private static scene: THREE.Scene | null = null;
  private static halosAndLabels: (() => void)[] = [];

  static initialize(scene: THREE.Scene, halosAndLabels: (() => void)[]) {
    this.scene = scene;
    this.halosAndLabels = halosAndLabels;
  }

  /** Show orbit for a clicked asteroid (and hide previous one) */
  static showOrbit(asteroid: CelestialBody) {
    // Hide previous orbit if exists and it's not the same asteroid
    if (this.currentAsteroid && this.currentAsteroid !== asteroid) {
      this.hideCurrentOrbit();
    }

    asteroid.showOrbit?.();
    this.currentAsteroid = asteroid;
  }

  /** Hide the current asteroid's orbit completely */
  private static hideCurrentOrbit() {
    if (this.currentAsteroid) {
      this.currentAsteroid.hideOrbit?.();
      this.currentAsteroid = null;
    }
  }

  /** Clear the current asteroid's orbit */
  static clearOrbit() {
    this.hideCurrentOrbit();
  }

  /** Get the current selected asteroid */
  static getCurrentAsteroid(): CelestialBody | null {
    return this.currentAsteroid;
  }

  /** Check if the given asteroid is currently selected */
  static isCurrentAsteroid(asteroid: CelestialBody): boolean {
    return this.currentAsteroid === asteroid;
  }
}
