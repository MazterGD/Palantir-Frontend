import * as THREE from "three";

export interface MoonData {
  name: string;
  radius: number;           // Moon radius in km
  orbitRadius: number;      // Distance from planet center (semi-major axis)
  orbitPeriod: number;      // Orbital period in days
  rotationPeriod: number;   // Rotation period in days
  texture?: string;         // Path to texture file
  color?: number;          // Fallback color if no texture
  inclination?: number;     // Orbital inclination in degrees
  eccentricity?: number;    // Orbital eccentricity (0 = perfect circle)
  longitudeOfAscendingNode?: number; // LOAN in degrees
  argumentOfPeriapsis?: number;      // Argument of periapsis in degrees
}

export interface MoonSystemResult {
  moonGroup: THREE.Group;
  update: () => void;
  moons: {
    name: string;
    mesh: THREE.Mesh;
    orbit: MoonEllipticalOrbit;
    orbitLine?: THREE.Line;
  }[];
}

class MoonEllipticalOrbit {
  private semiMajorAxis: number;
  private eccentricity: number;
  private orbitalPeriod: number;
  private inclination: number;
  private longitudeOfAscendingNode: number;
  private argumentOfPeriapsis: number;
  
  private meanAnomaly: number = 0;
  private meanMotion: number;

  constructor(moonData: MoonData) {
    this.semiMajorAxis = moonData.orbitRadius;
    this.eccentricity = moonData.eccentricity || 0;
    this.orbitalPeriod = moonData.orbitPeriod;
    this.inclination = THREE.MathUtils.degToRad(moonData.inclination || 0);
    this.longitudeOfAscendingNode = THREE.MathUtils.degToRad(moonData.longitudeOfAscendingNode || 0);
    this.argumentOfPeriapsis = THREE.MathUtils.degToRad(moonData.argumentOfPeriapsis || 0);
    
    // Mean motion: radians per time unit
    this.meanMotion = (2 * Math.PI) / (moonData.orbitPeriod * 24); // Convert days to hours for animation speed
    
    // Random starting position
    this.meanAnomaly = Math.random() * 2 * Math.PI;
  }

  // Solve Kepler's equation for eccentric anomaly (Newton-Raphson method)
  private solveKeplerEquation(meanAnomaly: number): number {
    let eccentricAnomaly = meanAnomaly;
    const tolerance = 1e-8;
    let iterations = 0;
    const maxIterations = 100;

    while (iterations < maxIterations) {
      const delta = eccentricAnomaly - this.eccentricity * Math.sin(eccentricAnomaly) - meanAnomaly;
      if (Math.abs(delta) < tolerance) break;
      
      eccentricAnomaly -= delta / (1 - this.eccentricity * Math.cos(eccentricAnomaly));
      iterations++;
    }

    return eccentricAnomaly;
  }

  // Calculate position in orbital plane
  private getOrbitalPlanePosition(eccentricAnomaly: number): THREE.Vector3 {
    const a = this.semiMajorAxis;
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

    // Rotation matrix from orbital plane to 3D space
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

  // Get orbital velocity factor for realistic speed variation
  public getOrbitalVelocity(): number {
    const eccentricAnomaly = this.solveKeplerEquation(this.meanAnomaly);
    const r = this.semiMajorAxis * (1 - this.eccentricity * Math.cos(eccentricAnomaly));
    
    // Vis-viva equation simplified for animation
    const velocityFactor = Math.sqrt(2 / r - 1 / this.semiMajorAxis);
    return velocityFactor;
  }

  // Update orbit
  public update(deltaTime: number = 0.01): void {
    const velocity = this.getOrbitalVelocity();
    this.meanAnomaly += this.meanMotion * deltaTime * velocity;
    
    // Keep angle in range [0, 2π]
    this.meanAnomaly = this.meanAnomaly % (2 * Math.PI);
  }

  // Create orbit path for visualization
  public createOrbitPath(segments: number = 100): THREE.BufferGeometry {
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

export function createMoonSystem(moons: MoonData[], showOrbits: boolean = false): MoonSystemResult {
  const moonSystemGroup = new THREE.Group();
  const moonObjects: { name: string; mesh: THREE.Mesh; orbit: MoonEllipticalOrbit; orbitLine?: THREE.Line }[] = [];

  const textureLoader = new THREE.TextureLoader();

  moons.forEach((moonData) => {
    // Create moon geometry
    const geometry = new THREE.SphereGeometry(moonData.radius*0.1, 32, 32);
    
    // Create material
    let material: THREE.MeshPhongMaterial;
    if (moonData.texture) {
      const texture = textureLoader.load(moonData.texture);
      material = new THREE.MeshPhongMaterial({ map: texture });
    } else {
      material = new THREE.MeshPhongMaterial({ 
        color: moonData.color || 0x888888 
      });
    }

    const moon = new THREE.Mesh(geometry, material);

    // Create elliptical orbit
    const orbit = new MoonEllipticalOrbit(moonData);

    // Create orbit visualization if requested
    let orbitLine: THREE.Line | undefined;
    if (showOrbits) {
      const orbitGeometry = orbit.createOrbitPath();
      const orbitMaterial = new THREE.LineBasicMaterial({ 
        color: 0x666666, 
        transparent: true, 
        opacity: 0.3 
      });
      orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
      moonSystemGroup.add(orbitLine);
    }

    // Add moon to system
    moonSystemGroup.add(moon);

    moonObjects.push({
      name: moonData.name,
      mesh: moon,
      orbit: orbit,
      orbitLine: orbitLine
    });
  });

  const update = () => {
    moonObjects.forEach(({ mesh, orbit }) => {
      // Update orbital position
      orbit.update();
      const position = orbit.getPosition();
      mesh.position.copy(position);
      
      // Axial rotation (most moons are tidally locked)
      // For tidally locked moons, always face the planet
      if (orbit) {
        // Calculate angle to always face planet (tidal locking)
        const angle = Math.atan2(position.z, position.x);
        mesh.rotation.y = angle + Math.PI; // +π to face inward
      }
    });
  };

  return {
    moonGroup: moonSystemGroup,
    update,
    moons: moonObjects
  };
}

// Helper function to add moons to any planet
export function addMoonsToObject(
  planetGroup: THREE.Group, 
  moonData: MoonData[],
  showOrbits: boolean = false
): MoonSystemResult {
  const moonSystem = createMoonSystem(moonData, showOrbits);
  planetGroup.add(moonSystem.moonGroup);
  return moonSystem;
}
