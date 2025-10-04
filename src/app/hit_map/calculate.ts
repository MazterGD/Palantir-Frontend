import {
  ImpactorInput,
  AsteroidImpactResult,
  AtmosphericEntryInputs,
  AtmosphericEntryResults,
  CraterInputs,
  CraterResults,
} from "./types";

export function calcAsteroidEnergy(imp: ImpactorInput): AsteroidImpactResult {
  const R_earth = 6.371e6; // radius of Earth in meters
  const LEarth = 7.07e33; // Earth angular momentum (approx)
  const PEarth = 2.66e34; // Earth linear momentum (approx)

  const abAltBurst = imp.abAltBurst ?? 0;
  const imVel = imp.imVel ?? imp.pjVel;
  const imDist = imp.imDist ?? 0;

  // --- Mass ---
  const mass = ((Math.PI * Math.pow(imp.pjDiam, 3)) / 6) * imp.pjDens;

  // --- Initial energy ---
  let pjEnergy = 0.5 * mass * Math.pow(imp.pjVel * 1000, 2);
  let energy0_megatons = pjEnergy / 4.186e15; // J → Mt TNT

  // --- Momentum ---
  let linmom = mass * (imVel * 1000);
  let angmom =
    mass * (imVel * 1000) * Math.cos((imp.pjAngle * Math.PI) / 180) * R_earth;

  // --- Relativistic correction ---
  if (imp.pjVel > 0.25 * 3e5) {
    const beta = 1 / Math.sqrt(1 - Math.pow(imp.pjVel, 2) / 9e10);
    pjEnergy *= beta;
    linmom *= beta;
    angmom *= beta;
  }

  // --- Impact energy ---
  let imEnergy: number;
  let imMegaton: number;

  if (abAltBurst > 0) {
    imEnergy =
      0.5 * mass * (Math.pow(imp.pjVel * 1000, 2) - Math.pow(imVel * 1000, 2));
  } else {
    imEnergy = 0.5 * mass * Math.pow(imVel * 1000, 2);
  }
  imMegaton = imEnergy / 4.186e15;

  // --- Seafloor effects ---
  const mwater =
    ((Math.PI * Math.pow(imp.pjDiam, 2)) / 4) *
    (imp.tgDepth / Math.sin((imp.pjAngle * Math.PI) / 180)) *
    1000;

  const vseafloor =
    imVel *
    Math.exp(
      (-3 * 1000 * 0.877 * imp.tgDepth) /
        (2 * imp.pjDens * imp.pjDiam * Math.sin((imp.pjAngle * Math.PI) / 180)),
    );

  const energy_seafloor = 0.5 * mass * Math.pow(vseafloor * 1000, 2);

  // --- Impact frequency ---
  const megaton_power = Math.floor(Math.log(energy0_megatons) / Math.LN10);
  const scaled_megatons = energy0_megatons / Math.pow(10, megaton_power);
  const imFreq =
    110 * Math.pow(scaled_megatons * Math.pow(10, megaton_power), 0.77);

  return {
    mass,
    kineticEnergy: pjEnergy,
    energyMegatons: energy0_megatons,
    impactEnergy: imEnergy,
    impactMegatons: imMegaton,
    linearMomentum: linmom,
    angularMomentum: angmom,
    seafloorVelocity: vseafloor,
    seafloorEnergy: energy_seafloor,
    imFreq,
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
    const dispersion = inputs.pjDiam * Math.sqrt(
        1 + 4 * Math.pow(altitudeScale, 2) *
        Math.pow(Math.exp(inputs.abAltBreak / (2 * scaleHeight)) - 1, 2)
    );

    // Energy at seafloor
    const vseafloor = inputs.imVel; // km/s
    const energy_seafloor = 0.5 * inputs.crMass * Math.pow(vseafloor * 1000, 2);

    // --- Impact angle factor ---
    const anglefac = Math.pow(Math.sin(inputs.pjAngle * Math.PI / 180), 1 / 3);

    // --- Target properties ---
    let Cd: number, beta: number;
    if (inputs.tgType === "w") {      // water
        Cd = 1.88; beta = 0.22;
    } else if (inputs.tgType === "s") { // sedimentary
        Cd = 1.54; beta = 0.165;
    } else {                          // igneous
        Cd = 1.6; beta = 0.22;
    }

    // --- Transient crater diameter ---
    let crTsDiam =
        Cd *
        Math.pow(inputs.crMass / inputs.tgDens, 1 / 3) *
        Math.pow((1.61 * G * inputs.pjDiam) / Math.pow(vseafloor * 1000, 2), -beta) *
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
        const rimHeightf = 0.07 * Math.pow(crTsDiam, 4) / Math.pow(crDiam, 3);

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
        crVolMelt = melt_coeff * energy_seafloor * Math.sin(inputs.pjAngle * Math.PI / 180);
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
