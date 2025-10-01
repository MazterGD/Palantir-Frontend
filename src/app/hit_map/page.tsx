'use client';

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (
      map.current ||
      !mapContainer.current
    )
      return; // initialize map only once

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [79.900756,6.795024], // UOM coordinates
      zoom: 15.5,
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  return (
    <div className="w-full h-screen">
      <div ref={mapContainer} className="w-screen h-screen" />
    </div>
  );
}