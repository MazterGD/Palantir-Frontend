"use client";

import MapView from "./map_view";

import { Suspense } from "react";

export default function HitMapPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MapView />
    </Suspense>
  );
}