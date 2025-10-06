"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { FiLayers, FiPlus, FiMinus } from "react-icons/fi";
import { League_Spartan } from "next/font/google";
import * as turf from "@turf/turf";
import { useSearchParams } from "next/navigation";
import {
  calcAsteroidEnergy,
  calculateAtmosphericEntry,
  calculateCrater,
} from "./calculate";
import {
  FormData,
  AsteroidImpactResult,
  AtmosphericEntryResults,
  CraterResults,
} from "./types";
import ImpactTable from "./table";
import MobileDrawer from "./mobile_drawer";

const leagueSpartan = League_Spartan({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  // UI toggle for layers panel
  const [showLayers, setShowLayers] = useState(false);
  const [layersState, setLayersState] = useState({
    Labels: true,
    Buildings: true,
    Roads: true,
    Airport: true,
  });

  const searchParams = useSearchParams();

  const neoName = searchParams.get("name") || "Custom Asteroid";
  const neoId = searchParams.get("id") || "136478";
  const diameter = searchParams.get("diameter") || "30"; // in meters
  const density = searchParams.get("density") || "4000"; // kg/m³ (typical rocky asteroid)
  const angle = searchParams.get("angle") || "45"; // degrees
  const velocity = searchParams.get("velocity") || "16"; // km/s
  const longitude = searchParams.get("long") || "79.900756";
  const latitude = searchParams.get("lat") || "6.795024";
  const depth = searchParams.get("depth") || "0";
  const trgt_type = searchParams.get("trgt_type") || "s";

  const [formData, setFormData] = useState<FormData>({
    name: neoName,
    id: parseInt(neoId),
    diameter: Number(diameter),
    density: Number(density),
    angle: Number(angle),
    velocity: Number(velocity),
    longitude: Number(longitude),
    latitude: Number(latitude),
    depth: Number(depth),
    trgt_type: trgt_type as "w" | "s" | "i", // "w" | "s" | "i";
  });

  const [energyParams, setEnergyParams] = useState<AsteroidImpactResult>({
    mass: 0, // kg
    kineticEnergy: 0, // J
    energyMegatons: 0, // Mt TNT
    impactEnergy: 0, // J
    impactMegatons: 0, // Mt TNT
    linearMomentum: 0, // kg·m/s
    angularMomentum: 0, // kg·m^2/s
    seafloorVelocity: 0, // km/s
    seafloorEnergy: 0, // J
    imFreq: 0,
  });

  // Watch for changes in layersState
  useEffect(() => {
    const mapRef = map.current;
    if (!mapRef || !mapRef.isStyleLoaded()) return;
    toggleLayer("label_city", layersState.Labels);
    toggleLayer("label_village", layersState.Labels);
    toggleLayer("label_town", layersState.Labels);
    toggleLayer("label_city_capital", layersState.Labels);
    toggleLayer("water_name_line_label", layersState.Labels);
    toggleLayer("water_name_point_label", layersState.Labels);
    toggleLayer("label_country_1", layersState.Labels);
    toggleLayer("label_country_2", layersState.Labels);
    toggleLayer("label_country_3", layersState.Labels);
    toggleLayer("label_state", layersState.Labels);
    toggleLayer("label_other", layersState.Labels); // labels
    toggleLayer("building-3d", layersState.Buildings);
    toggleLayer("building", layersState.Buildings); // buildings
    toggleLayer("highway_motorway_subtle", layersState.Roads);
    toggleLayer("highway_motorway_casing", layersState.Roads);
    toggleLayer("highway_major_subtle", layersState.Roads);
    toggleLayer("highway_major_inner", layersState.Roads);
    toggleLayer("highway_major_casing", layersState.Roads);
    toggleLayer("highway_minor", layersState.Roads);
    toggleLayer("highway-shield-non-us", layersState.Roads);
    toggleLayer("highway-name-minor", layersState.Roads);
    toggleLayer("highway-name-major", layersState.Roads); // roads
    toggleLayer("aeroway-runway", layersState.Airport); // airports
    toggleLayer("aeroway-runway-casing", layersState.Airport);
    toggleLayer("aeroway-taxiway", layersState.Airport);
    toggleLayer("airport", layersState.Airport);
  }, [layersState]);

  // Initialize Map at the begining
  useEffect(() => {
    if (map.current || !mapContainer.current) return; // initialize map only once

    const crater_params = getCraterParameters();

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "/styles/custom_map.json",
      center: [formData.longitude, formData.latitude], // UOM coordinates
      zoom: 13.0,
      maxZoom: 15.5,
      minZoom: 1.5,
    });

    const circleRadius = crater_params.crDiam ? crater_params.crDiam / 1000 : 0;

    map.current.on("load", () => {
      createCircle(
        map.current!,
        [formData.longitude, formData.latitude],
        circleRadius,
      );
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  function getTMParamsCalc() {
    return calculateAtmosphericEntry({
      pjDens: formData.density, // projectile density (kg/m^3)
      pjDiam: formData.diameter, // projectile diameter (m)
      pjVel: formData.velocity, // projectile velocity (km/s)
      pjAngle: formData.angle, // impact angle (degrees)
      rhoSurface: 1.225, // kg/m^3, air density at sea level
      dragC: 1.0, // dimensionless, typical drag coefficient for a blunt object
      scaleHeight: 8500, // m, atmospheric scale height (approximate)
      G: 9.81, // m/s^2, gravitational acceleration
      fp: 1.0, // dimensionless shape factor, usually 1 for spheres
    });
  }
  
  function getCraterParameters() {
    const aTMParamsCalc = getTMParamsCalc();

    const energyParamsCalc = calcAsteroidEnergy({
      pjDiam: formData.diameter,
      pjDens: formData.density,
      pjAngle: formData.angle,
      pjVel: formData.velocity,
      tgDepth: formData.depth,
      imVel:aTMParamsCalc.imVel,
      abAltBurst:aTMParamsCalc.abAltBurst
    });
    setEnergyParams(energyParamsCalc);
    const craterParamsCalc = calculateCrater({
      pjDens: formData.density, // density (kg/m³)
      pjDiam: formData.diameter, // diameter (m)
      pjVel: formData.velocity, // velocity at entry (km/s)
      pjAngle: formData.angle, // angle (deg)
      abAltBreak: aTMParamsCalc.abAltBreak, // breakup altitude (m)
      tgType: formData.trgt_type, // target type
      tgDens: 2700, // target density (kg/m³)
      tgDepth: formData.depth, // water depth (m)
      crMass: energyParamsCalc.mass, // mass (kg)
      imVel: aTMParamsCalc.imVel, // impact velocity (km/s)
    });

    return craterParamsCalc;
  }

  // For creating the crater circle
  function createCircle(
    map: maplibregl.Map,
    center: [number, number],
    radius: number,
  ) {
    const options = { steps: 64, units: "kilometers" as const };
    const circle = turf.circle(center, radius, options);

    // Add GeoJSON source
    if (!map.getSource("location-radius")) {
      map.addSource("location-radius", {
        type: "geojson",
        data: circle,
      });
    } else {
      // update existing source if circle already exists
      (map.getSource("location-radius") as maplibregl.GeoJSONSource).setData(
        circle,
      );
    }

    // Fill layer
    if (!map.getLayer("location-radius")) {
      map.addLayer({
        id: "location-radius",
        type: "fill",
        source: "location-radius",
        paint: {
          "fill-color": "#aa7e58ff",
          "fill-opacity": 0.5,
        },
      });
    }

    // Outline layer
    if (!map.getLayer("location-radius-outline")) {
      map.addLayer({
        id: "location-radius-outline",
        type: "line",
        source: "location-radius",
        paint: {
          "line-color": "#b2743dff",
          "line-width": 3,
        },
      });
    }
  }

  // Function to toggle layer visibility
  function toggleLayer(layerId: string, visible: boolean) {
    if (!map.current) return;
    if (map.current.getLayer(layerId)) {
      map.current.setLayoutProperty(
        layerId,
        "visibility",
        visible ? "visible" : "none",
      );
    }
  }

  function handleSubmit() {
    console.log("handle sumit pressed");
    if (!map.current || !mapContainer.current) return;

    const crater_params = getCraterParameters();
    console.log(crater_params);
    const circleRadius = crater_params.crDiam ? crater_params.crDiam / 1000 : 0;

    console.log("Drawing crater");

    // Remove existing layers and source if they exist
    if (map.current.getLayer("location-radius")) {
      map.current.removeLayer("location-radius");
    }
    if (map.current.getLayer("location-radius-outline")) {
      map.current.removeLayer("location-radius-outline");
    }
    if (map.current.getSource("location-radius")) {
      map.current.removeSource("location-radius");
    }

    map.current.flyTo({
      center: [formData.longitude, formData.latitude],
      zoom: 13,
      duration: 1000,
    });
    createCircle(
      map.current!,
      [Number(formData.longitude), Number(formData.latitude)],
      circleRadius,
    );
  }

  return (
    <div className={`w-full h-screen relative  ${leagueSpartan.className}`}>
      <div className="w-screen absolute top-10 z-10  flex justify-center text-white">
        <div className="text-center text-2xl md:text-4xl bg-slate-500/40 rounded-xs p-2 backdrop-blur-xs">
          <h2>Asteroid Crater Map</h2>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-10 left-10 flex flex-col gap-2 z-10 text-white">
        {/* Zoom Controls */}
        <button
          onClick={() => map.current?.zoomIn()}
          className="bg-slate-500/60 backdrop-blur-xs  w-10 h-10 px-3 py-1 rounded-sm shadow hover:bg-slate-500/90"
        >
          <FiPlus className="text-white-500 hover:text-white-900" />
        </button>
        <button
          onClick={() => map.current?.zoomOut()}
          className="bg-slate-500/60 backdrop-blur-xs  w-10 h-10 p-3 py-1 rounded-sm shadow hover:bg-slate-500/90"
        >
          <FiMinus className="text-white-500 hover:text-white-900" />
        </button>

        {/* Layers Toggle */}
        <button
          onClick={() => setShowLayers(!showLayers)}
          className="bg-slate-500/60 backdrop-blur-xs  w-10 h-10 px-3 py-1 rounded-sm shadow hover:bg-slate-500/90"
        >
          <FiLayers />
        </button>

        {showLayers && (
          <div className="bg-slate-500/60 backdrop-blur-xs  px-4 py-2 rounded-sm shadow">
            {Object.entries(layersState).map(([key, value]) => (
              <label key={key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() =>
                    setLayersState((prev) => ({
                      ...prev,
                      [key]: !prev[key as keyof typeof prev],
                    }))
                  }
                />
                {key}
              </label>
            ))}
          </div>
        )}
      </div>
      <div className={`absolute top-0 right-0 z-10 ${leagueSpartan.className}`}>
        <div className="hidden md:block absolute top-10 right-10">
          <div className="h-[90vh] w-[25vw] overflow-scroll scroll-smooth flex flex-col gap-2 hide-scrollbar">
            <div className="flex flex-col gap-2 bg-slate-500/50 backdrop-blur-sm p-8 rounded-sm">
              <h2 className="text-2xl font-bold  mb-4">Asteroid Info</h2>
              <form className="grid grid-cols-2 gap-4">
                {/* Name */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full border rounded-sm p-2 focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>

                {/* Neo ID */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Neo ID
                  </label>
                  <input
                    type="number"
                    value={formData.id}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        id: parseInt(e.target.value),
                      }))
                    }
                    className="w-full border rounded-sm p-2 focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>

                {/* Diameter */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Diameter (m)
                  </label>
                  <input
                    type="number"
                    value={formData.diameter}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        diameter: Number(e.target.value),
                      }))
                    }
                    className="w-full border rounded-sm p-2 focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>

                {/* Density */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Density (kg/m³)
                  </label>
                  <input
                    type="number"
                    value={formData.density}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        density: Number(e.target.value),
                      }))
                    }
                    className="w-full border rounded-sm p-2 focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>

                {/* Trajectory Angle */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Trajectory Angle (°)
                  </label>
                  <input
                    type="number"
                    value={formData.angle}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        angle: Number(e.target.value),
                      }))
                    }
                    className="w-full border rounded-sm p-2 focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>

                {/* Projectile Velocity */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">
                    Projectile Velocity (km/s)
                  </label>
                  <input
                    type="number"
                    value={formData.velocity}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        velocity: Number(e.target.value),
                      }))
                    }
                    className="w-full border rounded-sm p-2 focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                {/* Latitude */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Impact Location (Lat)
                  </label>
                  <input
                    type="number"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        latitude: Number(e.target.value),
                      }))
                    }
                    className="w-full border rounded-sm p-2 focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>

                {/* Longititude */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Impact Location (long)
                  </label>
                  <input
                    type="number"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        longitude: Number(e.target.value),
                      }))
                    }
                    className="w-full border rounded-sm p-2 focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Target Type
                  </label>
                  <select
                    value={formData.trgt_type}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        trgt_type: e.target.value as "w" | "s" | "i",
                      }))
                    }
                    className="w-full border rounded-sm p-2 focus:ring-2 focus:ring-blue-400"
                    required
                  >
                    <option value="w" className="text-gray-900">
                      Water
                    </option>
                    <option value="s" className="text-gray-900">
                      Sedimentary
                    </option>
                    <option value="i" className="text-gray-900">
                      Igneous
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Depth
                  </label>
                  <input
                    type="number"
                    disabled={formData.trgt_type != "w"}
                    value={formData.depth}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        depth: Number(e.target.value),
                      }))
                    }
                    className="w-full border rounded-sm p-2 focus:ring-2 focus:ring-blue-400"
                    required
                  />
                </div>

                {/* Submit button full width */}
                <div className="col-span-2">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="w-full bg-blue-400 text-white py-2 rounded-sm hover:bg-blue-500"
                  >
                    Update
                  </button>
                </div>
              </form>
            </div>
            <div className="flex flex-col gap-2 bg-slate-500/50 backdrop-blur-sm p-8 rounded-sm">
              {energyParams && <ImpactTable data={energyParams} />}
            </div>
          </div>
        </div>
        <div className="md:hidden fixed bottom-0 left-0 w-full">
          <MobileDrawer>
            <div className="h-[90vh] overflow-scroll scroll-smooth flex flex-col gap-2 hide-scrollbar">
              <div className="flex flex-col gap-2 bg-slate-500/50 backdrop-blur-sm p-8 rounded-xs">
                <h2 className="text-2xl font-bold  mb-4">Asteroid Info</h2>
                <form className="grid grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full border rounded-sm p-2 focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>

                  {/* Neo ID */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Neo ID
                    </label>
                    <input
                      type="number"
                      value={formData.id}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          id: parseInt(e.target.value),
                        }))
                      }
                      className="w-full border rounded-sm p-2 focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>

                  {/* Diameter */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Diameter (m)
                    </label>
                    <input
                      type="number"
                      value={formData.diameter}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          diameter: Number(e.target.value),
                        }))
                      }
                      className="w-full border rounded-sm p-2 focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>

                  {/* Density */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Density (kg/m³)
                    </label>
                    <input
                      type="number"
                      value={formData.density}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          density: Number(e.target.value),
                        }))
                      }
                      className="w-full border rounded-sm p-2 focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>

                  {/* Trajectory Angle */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Trajectory Angle (°)
                    </label>
                    <input
                      type="number"
                      value={formData.angle}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          angle: Number(e.target.value),
                        }))
                      }
                      className="w-full border rounded-sm p-2 focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>

                  {/* Projectile Velocity */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Projectile Velocity (km/s)
                    </label>
                    <input
                      type="number"
                      value={formData.velocity}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          velocity: Number(e.target.value),
                        }))
                      }
                      className="w-full border rounded-sm p-2 focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>
                  {/* Latitude */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Impact Location (Lat)
                    </label>
                    <input
                      type="number"
                      value={formData.latitude}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          latitude: Number(e.target.value),
                        }))
                      }
                      className="w-full border rounded-sm p-2 focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>

                  {/* Longititude */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Impact Location (long)
                    </label>
                    <input
                      type="number"
                      value={formData.longitude}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          longitude: Number(e.target.value),
                        }))
                      }
                      className="w-full border rounded-sm p-2 focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Target Type
                    </label>
                    <select
                      value={formData.trgt_type}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          trgt_type: e.target.value as "w" | "s" | "i",
                        }))
                      }
                      className="w-full border rounded-sm p-2 focus:ring-2 focus:ring-blue-400"
                      required
                    >
                      <option value="w" className="text-gray-900">
                        Water
                      </option>
                      <option value="s" className="text-gray-900">
                        Sedimentary
                      </option>
                      <option value="i" className="text-gray-900">
                        Igneous
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Depth
                    </label>
                    <input
                      type="number"
                      disabled={formData.trgt_type != "w"}
                      value={formData.depth}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          depth: Number(e.target.value),
                        }))
                      }
                      className="w-full border rounded-sm p-2 focus:ring-2 focus:ring-blue-400"
                      required
                    />
                  </div>

                  {/* Submit button full width */}
                  <div className="col-span-2">
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="w-full bg-blue-400 text-white py-2 rounded-sm hover:bg-blue-500"
                    >
                      Update
                    </button>
                  </div>
                </form>
              </div>
              <div className="flex flex-col gap-2 bg-slate-500/50 backdrop-blur-sm p-8 rounded-sm">
                {energyParams && <ImpactTable data={energyParams} />}
              </div>
            </div>{" "}
          </MobileDrawer>
        </div>{" "}
      </div>

      {/* Map */}
      <div ref={mapContainer} className="w-screen h-screen" />
    </div>
  );
}
