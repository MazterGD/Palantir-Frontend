'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { FiLayers } from "react-icons/fi";
import { FiPlus,FiMinus } from "react-icons/fi";
import { League_Spartan } from 'next/font/google';

const leagueSpartan = League_Spartan({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
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
      style: '/styles/custom_map.json', // https://tiles.openfreemap.org/styles/positron
      center: [79.900756, 6.795024], // UOM coordinates
      zoom: 13.0,
      maxZoom: 15.5,
      minZoom:1.5,
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Function to toggle layer visibility
  const toggleLayer = (layerId: string, visible: boolean) => {
    if (!map.current) return;
    if (map.current.getLayer(layerId)) {
      map.current.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none');
    }
  };

  // Watch for changes in layersState
  useEffect(() => {
    if (!map.current) return;
    toggleLayer('label_city', layersState.Labels);
    toggleLayer('label_village', layersState.Labels);
    toggleLayer('label_town', layersState.Labels);
    toggleLayer('label_city_capital', layersState.Labels);
    toggleLayer('water_name_line_label', layersState.Labels);
    toggleLayer('water_name_point_label', layersState.Labels);
    toggleLayer('label_country_1', layersState.Labels);
    toggleLayer('label_country_2', layersState.Labels);
    toggleLayer('label_country_3', layersState.Labels);
    toggleLayer('label_state', layersState.Labels);
    toggleLayer('label_other', layersState.Labels); // labels
    toggleLayer('building-3d', layersState.Buildings);
    toggleLayer('building', layersState.Buildings); // buildings
    toggleLayer('highway-shield-non-us', layersState.Roads);
    toggleLayer('highway-name-minor', layersState.Roads);
    toggleLayer('highway-name-major', layersState.Roads); // roads
    toggleLayer('airport', layersState.Airport); // airports
  }, [layersState]);

  return (
    <div className="w-full h-screen relative">
      {/* Controls */}
      <div className="absolute top-10 left-10 flex flex-col gap-2 z-10">
        {/* Zoom Controls */}
        <button
          onClick={() => map.current?.zoomIn()}
          className="bg-gray-500/60 w-10 h-10  px-3 py-1 rounded-xs shadow hover:bg-gray-500/90"
        >
          <FiPlus className='text-white-500 hover:text-white-900' />
        </button>
        <button
          onClick={() => map.current?.zoomOut()}
          className="bg-gray-500/60 w-10 h-10  p-3 py-1 rounded-xs shadow hover:bg-gray-500/90"
        >
          <FiMinus className='text-white-500 hover:text-white-900' />
        </button>

        {/* Layers Toggle */}
        <button
          onClick={() => setShowLayers(!showLayers)}
          className="bg-gray-500/60 w-10 h-10 px-3 py-1 rounded-xs  shadow hover:bg-gray-500/90"
        >
          <FiLayers />
        </button>

        {showLayers && (
          <div className="bg-gray-500/60 px-4 py-2 rounded-xs shadow">
            {Object.entries(layersState).map(([key, value]) => (
              <label key={key} className={`flex items-center gap-2 ${leagueSpartan.className}`}>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={() =>
                    setLayersState((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))
                  }
                />
                {key}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div ref={mapContainer} className="w-screen h-screen" />
    </div>
  );
}
