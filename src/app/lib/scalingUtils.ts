// Fixed proportional scaling utilities with uniform scale across the system

export class ScalingUtils {
  // Universal scale factor: 1 km = 0.000015 scene units
  // This makes Earth ~0.1 units radius (good size for visualization)
  private static UNIVERSAL_SCALE = 0.000015;
  
  // Planet orbit scale: 1 AU = 15 scene units (good spacing for visualization)
  private static PLANET_ORBIT_SCALE = 15;
  
  // Sun scale reduction factor (make sun 10x smaller as requested)
  private static SUN_SCALE_REDUCTION = 10;
  
  // Convert any size from km to scene units (universal scaling)
  static scaleSize(sizeKm: number): number {
    return sizeKm * this.UNIVERSAL_SCALE;
  }
  
  // Convert any orbital distance from km to scene units (universal scaling)
  static scaleOrbitDistance(orbitKm: number): number {
    return orbitKm * this.UNIVERSAL_SCALE;
  }
  
  // Convert planetary orbital distance from AU to scene units
  static scalePlanetOrbit(orbitAU: number): number {
    return orbitAU * this.PLANET_ORBIT_SCALE;
  }
  
  // Get realistic radius with universal scaling (special case for sun)
  static getRealisticRadius(planetName: string, astronomicalData: any): number {
    const data = astronomicalData[planetName];
    if (!data) return 0.5;
    
    let radius = this.scaleSize(data.size.radius);
    
    // Make sun 10x smaller as requested
    if (planetName === 'sun') {
      radius = radius / this.SUN_SCALE_REDUCTION;
    }
    
    return radius;
  }
}

// Helper function to prepare moon data with universal scaling
export function prepareMoonDataForVisualization(moonData: any[]): any[] {
  return moonData.map(moon => ({
    ...moon,
    radius: ScalingUtils.scaleSize(moon.radius),
    orbitRadius: ScalingUtils.scaleOrbitDistance(moon.orbitRadius),
  }));
}
