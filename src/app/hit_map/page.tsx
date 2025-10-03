"use client";

import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { FiLayers, FiPlus, FiMinus } from "react-icons/fi";
import { League_Spartan } from "next/font/google";
import * as turf from "@turf/turf";

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

  useEffect(() => {
    if (map.current || !mapContainer.current) return; // initialize map only once

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "/styles/custom_map.json",
      center: [79.900756, 6.795024], // UOM coordinates
      zoom: 13.0,
      maxZoom: 15.5,
      minZoom: 1.5,
    });

    map.current.on("load", () => {
      // Add a circle using Turf.js
      const center: [number, number] = [79.900756, 6.795024]; // lng, lat
      const radius = 1; // in kilometers
      const options = { steps: 64, units: "kilometers" as const };
      const circle = turf.circle(center, radius, options);

      // Add as GeoJSON source
      if (!map.current?.getSource("location-radius")) {
        map.current?.addSource("location-radius", {
          type: "geojson",
          data: circle,
        });
      }

      // Fill layer
      if (!map.current?.getLayer("location-radius")) {
        map.current?.addLayer({
          id: "location-radius",
          type: "fill",
          source: "location-radius",
          paint: {
            "fill-color": "#8CCFFF",
            "fill-opacity": 0.5,
          },
        });
      }

      // Outline layer
      if (!map.current?.getLayer("location-radius-outline")) {
        map.current?.addLayer({
          id: "location-radius-outline",
          type: "line",
          source: "location-radius",
          paint: {
            "line-color": "#60a5fa",
            "line-width": 3,
          },
        });
      }
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Function to toggle layer visibility
  const toggleLayer = (layerId: string, visible: boolean) => {
    if (!map.current) return;
    if (map.current.getLayer(layerId)) {
      map.current.setLayoutProperty(
        layerId,
        "visibility",
        visible ? "visible" : "none",
      );
    }
  };

  // Watch for changes in layersState
  useEffect(() => {
    if (!map.current) return;
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

  return (
    <div className="w-full h-screen relative">
      {/* Controls */}
      <div className="absolute top-10 left-10 flex flex-col gap-2 z-10">
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
              <label
                key={key}
                className={`flex items-center gap-2 ${leagueSpartan.className}`}
              >
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
      <div className={`absolute top-10 right-10 flex flex-col gap-2 z-10 bg-slate-500/50 backdrop-blur-sm p-8 rounded-sm ${leagueSpartan.className}`}>
  <h2 className="text-xl font-semibold mb-4">Asteroid Info</h2>
  <form className="grid grid-cols-2 gap-4">
    {/* Name */}
    <div className="col-span-2">
      <label className="block text-sm font-medium mb-1">Name</label>
      <input
        type="text"
        className="w-full border rounded-sm p-2 focus:ring-2 focus:ring-blue-400"
        required
      />
    </div>

    {/* Neo ID */}
    <div>
      <label className="block text-sm font-medium mb-1">Neo ID</label>
      <input
        type="number"
        className="w-full border rounded-sm p-2 focus:ring-2 focus:ring-blue-400"
        required
      />
    </div>

    {/* Diameter */}
    <div>
      <label className="block text-sm font-medium mb-1">Diameter (m)</label>
      <input
        type="number"
        className="w-full border rounded-sm p-2 focus:ring-2 focus:ring-blue-400"
        required
      />
    </div>

    {/* Density */}
    <div>
      <label className="block text-sm font-medium mb-1">Density (kg/m³)</label>
      <input
        type="number"
        className="w-full border rounded-sm p-2 focus:ring-2 focus:ring-blue-400"
        required
      />
    </div>

    {/* Released Energy */}
    <div>
      <label className="block text-sm font-medium mb-1">
        Released Energy (kt)
      </label>
      <input
        type="number"
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
        className="w-full border rounded-sm p-2 focus:ring-2 focus:ring-blue-400"
        required
      />
    </div>

    {/* Submit button full width */}
    <div className="col-span-2">
      <button
        type="submit"
        className="w-full bg-blue-400 text-white py-2 rounded-sm hover:bg-blue-500"
      >
        Update
      </button>
    </div>
  </form>
</div>


      {/* Map */}
      <div ref={mapContainer} className="w-screen h-screen" />
    </div>
  );
}
