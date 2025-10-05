import {
  ImpactorInput,
  AsteroidImpactResult,
  AtmosphericEntryInputs,
  AtmosphericEntryResults,
  CraterInputs,
  CraterResults,
} from "./types";

export function calcAsteroidEnergy(imp: ImpactorInput): AsteroidImpactResult {
  // Constants from CraterCalcs
  const R_earth = 6370 * 1000; // Radius of Earth in meters (6370 km)
  const lEarth = 5.86 * Math.pow(10, 33); // Earth angular momentum in (kg m^3)/sec
  const pEarth = 1.794 * Math.pow(10, 32); // Earth linear momentum in (kg * m)/sec

  // Default values for optional parameters
  const abAltBurst = imp.abAltBurst || 0; // Altitude of airburst in meters
  const imVel = imp.imVel || imp.pjVel; // Impact velocity defaults to projectile velocity (km/s)
  const imDist = imp.imDist || 0; // Distance from impact in km

  // --- Mass ---
  // Calculate mass: volume of sphere (π * d^3 / 6) * density
  const mass = ((Math.PI * Math.pow(imp.pjDiam, 3)) / 6) * imp.pjDens;

  // --- Initial energy ---
  // Kinetic energy: 0.5 * mass * (velocity in m/s)^2
  let pjEnergy = 0.5 * mass * Math.pow(imp.pjVel * 1000, 2);
  const energy0_megatons = pjEnergy / (4.186 * Math.pow(10, 15)); // Convert Joules to megatons TNT

  // --- Momentum ---
  // Linear momentum: mass * velocity (m/s)
  let linmom = mass * (imVel * 1000);
  // Angular momentum: mass * velocity (m/s) * cos(angle) * Earth radius
  let angmom =
    mass * (imVel * 1000) * Math.cos((imp.pjAngle * Math.PI) / 180) * R_earth;

  // --- Relativistic correction ---
  // Apply correction if velocity > 0.25 * speed of light (3e5 km/s)
  if (imp.pjVel > 0.25 * 3e5) {
    const beta =
      1 / Math.sqrt(1 - Math.pow(imp.pjVel, 2) / (9 * Math.pow(10, 10)));
    pjEnergy *= beta;
    linmom *= beta;
    angmom *= beta;
  }

  // --- Impact energy ---
  let imEnergy;
  if (abAltBurst > 0) {
    // Energy loss due to airburst: 0.5 * mass * (initial velocity^2 - impact velocity^2)
    imEnergy =
      0.5 * mass * (Math.pow(imp.pjVel * 1000, 2) - Math.pow(imVel * 1000, 2));
  } else {
    // Surface impact energy: 0.5 * mass * impact velocity^2
    imEnergy = 0.5 * mass * Math.pow(imVel * 1000, 2);
  }
  const imMegaton = imEnergy / (4.186 * Math.pow(10, 15)); // Convert Joules to megatons TNT

  // --- Seafloor effects ---
  // Water mass: cross-sectional area * path length through water * water density (1000 kg/m^3)
  const mwater =
    ((Math.PI * Math.pow(imp.pjDiam, 2)) / 4) *
    (imp.tgDepth / Math.sin((imp.pjAngle * Math.PI) / 180)) *
    1000;

  // Velocity at seafloor: accounts for water drag
  const vseafloor =
    imVel *
    Math.exp(
      (-3 * 1000 * 0.877 * imp.tgDepth) /
        (2 * imp.pjDens * imp.pjDiam * Math.sin((imp.pjAngle * Math.PI) / 180)),
    );

  // Energy at seafloor: 0.5 * mass * seafloor velocity^2
  const energy_seafloor = 0.5 * mass * Math.pow(vseafloor * 1000, 2);

  // --- Impact frequency ---
  // Calculate frequency based on energy in megatons
  const megaton_power = Math.floor(Math.log(energy0_megatons) / Math.LN10);
  const scaled_megatons = energy0_megatons / Math.pow(10, megaton_power);
  const imFreq =
    110 * Math.pow(scaled_megatons * Math.pow(10, megaton_power), 0.77);

  console.log(imp);
  console.log({
    kineticEnergy: pjEnergy, // Joules
    energyMegatons: energy0_megatons, // Megatons TNT
    impactEnergy: imEnergy, // Joules
    impactMegatons: imMegaton, // Megatons TNT
    linearMomentum: linmom, // kg·m/s
    angularMomentum: angmom, // kg·m^3/s
    seafloorVelocity: vseafloor, // km/s
    seafloorEnergy: energy_seafloor, // Joules
    imFreq: imFreq, // years
  });

  // Return result object matching AsteroidImpactResult
  return {
    mass: mass, // kg
    kineticEnergy: pjEnergy, // Joules
    energyMegatons: energy0_megatons, // Megatons TNT
    impactEnergy: imEnergy, // Joules
    impactMegatons: imMegaton, // Megatons TNT
    linearMomentum: linmom, // kg·m/s
    angularMomentum: angmom, // kg·m^3/s
    seafloorVelocity: vseafloor, // km/s
    seafloorEnergy: energy_seafloor, // Joules
    imFreq: imFreq, // years
  };
}

export function calculateAtmosphericEntry(
  inputs: AtmosphericEntryInputs,
): AtmosphericEntryResults {
  const {
    pjDens,
    pjDiam,
    pjVel,
    pjAngle,
    rhoSurface,
    dragC,
    scaleHeight,
    G,
    fp,
  } = inputs;

  let abAltBreak = 0;
  let abAltBurst = 0;
  let imVel = 0;

  // Yield strength of projectile in Pa
  const yieldStrength = Math.pow(10, 2.107 + 0.0624 * Math.sqrt(pjDens));

  // Velocity decrement factor
  const av =
    (3 * rhoSurface * dragC * scaleHeight) /
    (2 * pjDens * pjDiam * Math.sin((pjAngle * Math.PI) / 180));

  // Strength ratio
  const rStrength = yieldStrength / Math.pow(rhoSurface * pjVel * 1000, 2);

  const iFactor = 5.437 * av * rStrength;

  // Negligible atmosphere
  if (rhoSurface < 1e-8) {
    abAltBurst = 0;
    imVel = pjVel * Math.sin((pjAngle * Math.PI) / 180);
    return { abAltBreak, abAltBurst, imVel };
  }

  if (iFactor >= 1) {
    // Projectile lands intact
    abAltBurst = 0;
    const tmp = (2 * pjDens * pjDiam * G) / (3 * rhoSurface * dragC);
    const vTerminal = Math.sqrt(tmp);
    const vSurface = pjVel * 1000 * Math.exp(-av);
    imVel = Math.max(vTerminal, vSurface) / 1000; // km/s
  } else {
    // Projectile breaks up
    const altitude1 = -scaleHeight * Math.log(rStrength);
    const omega = 1.308 - 0.314 * iFactor - 1.303 * Math.sqrt(1 - iFactor);
    abAltBreak = altitude1 - omega * scaleHeight;

    const vBU =
      pjVel * 1000 * Math.exp(-av * Math.exp(-abAltBreak / scaleHeight));

    const vFac =
      1.5 *
      Math.sqrt((dragC * rhoSurface) / (2 * pjDens)) *
      Math.exp(-abAltBreak / (2 * scaleHeight));
    const lDisper =
      pjDiam *
      Math.sin((pjAngle * Math.PI) / 180) *
      Math.sqrt(pjDens / (2 * dragC * rhoSurface)) *
      Math.exp(abAltBreak / (2 * scaleHeight));

    const alpha2 = Math.sqrt(fp * fp - 1);
    const altitudePen =
      2 * scaleHeight * Math.log(1 + (alpha2 * lDisper) / (2 * scaleHeight));
    abAltBurst = abAltBreak - altitudePen;

    if (abAltBurst > 0) {
      const expfac =
        (1 / 24) *
        alpha2 *
        (24 +
          8 * alpha2 ** 2 +
          (6 * alpha2 * lDisper) / scaleHeight +
          (3 * alpha2 ** 3 * lDisper) / scaleHeight);
      imVel = (vBU * Math.exp(-expfac * vFac)) / 1000; // km/s
    } else {
      const altitudeScale = scaleHeight / lDisper;
      const integral =
        (altitudeScale ** 3 / 3) *
        (3 * (4 + 1 / altitudeScale ** 2) * Math.exp(abAltBreak / scaleHeight) +
          6 * Math.exp((2 * abAltBreak) / scaleHeight) -
          16 * Math.exp((3 * abAltBreak) / (2 * scaleHeight)) -
          3 / altitudeScale ** 2 -
          2);
      imVel = (vBU * Math.exp(-vFac * integral)) / 1000; // km/s
    }
  }

  return { abAltBreak, abAltBurst, imVel };
}

export function calculateCrater(inputs: CraterInputs): CraterResults {
  // --- Constants ---
  const G = 9.81; // gravitational acceleration (m/s²)
  const scaleHeight = 7160; // atmospheric scale height (m)
  const vEarth = 1.08321e21; // m³ (Earth volume)
  const melt_coeff = 8.9e-21;

  // --- Derived values ---
  const altitudeScale = inputs.abAltBreak / scaleHeight;
  const dispersion =
    inputs.pjDiam *
    Math.sqrt(
      1 +
        4 *
          Math.pow(altitudeScale, 2) *
          Math.pow(Math.exp(inputs.abAltBreak / (2 * scaleHeight)) - 1, 2),
    );

  // Energy at seafloor
  const vseafloor = inputs.imVel; // km/s
  const energy_seafloor = 0.5 * inputs.crMass * Math.pow(vseafloor * 1000, 2);

  // --- Impact angle factor ---
  const anglefac = Math.pow(Math.sin((inputs.pjAngle * Math.PI) / 180), 1 / 3);

  // --- Target properties ---
  let Cd: number, beta: number;
  if (inputs.tgType === "w") {
    // water
    Cd = 1.88;
    beta = 0.22;
  } else if (inputs.tgType === "s") {
    // sedimentary
    Cd = 1.54;
    beta = 0.165;
  } else {
    // igneous
    Cd = 1.6;
    beta = 0.22;
  }

  // --- Transient crater diameter ---
  let crTsDiam =
    Cd *
    Math.pow(inputs.crMass / inputs.tgDens, 1 / 3) *
    Math.pow(
      (1.61 * G * inputs.pjDiam) / Math.pow(vseafloor * 1000, 2),
      -beta,
    ) *
    anglefac;

  if (dispersion >= crTsDiam) {
    crTsDiam /= 2; // fragmentation adjustment
  }

  const crTsDepth = crTsDiam / 2.828;

  // --- Final crater diameter & depth ---
  let crDiam: number;
  let crDepth: number;
  if (crTsDiam * 1.25 >= 3200) {
    // Complex crater
    crDiam = (1.17 * Math.pow(crTsDiam, 1.13)) / 2.8554;
    crDepth = 37 * Math.pow(crDiam, 0.301);
  } else {
    // Simple crater
    crDiam = 1.25 * crTsDiam;

    // Breccia lens volume
    const vbreccia = 0.032 * Math.pow(crDiam, 3);

    // Rim height
    const rimHeightf = (0.07 * Math.pow(crTsDiam, 4)) / Math.pow(crDiam, 3);

    // Breccia thickness
    const crBrecThick =
      2.8 *
      vbreccia *
      ((crTsDepth + rimHeightf) / (crTsDepth * Math.pow(crDiam, 2)));

    // Final depth
    crDepth = crTsDepth + rimHeightf - crBrecThick;
  }

  // --- Crater volume ---
  const crVol = (Math.PI / 24) * Math.pow(crTsDiam / 1000, 3);

  // --- Melt volume ---
  let crVolMelt: number | undefined = undefined;
  if (inputs.imVel >= 12) {
    crVolMelt =
      melt_coeff * energy_seafloor * Math.sin((inputs.pjAngle * Math.PI) / 180);
    if (crVolMelt > vEarth) crVolMelt = vEarth;
  }

  return {
    crTsDiam,
    crTsDepth,
    crDiam,
    crDepth,
    crVol,
    crVolMelt,
  };
}
