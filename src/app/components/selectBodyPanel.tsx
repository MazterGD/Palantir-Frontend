import React from "react";
import { CelestialBody } from "./ThreeScene";

interface SelectedBodyPanelProps {
  selectedBody: CelestialBody;
  forceX: string | number;
  forceY: string | number;
  forceZ: string | number;
  deltaTime: string | number;
  setForceX: (value: string) => void;
  setForceY: (value: string) => void;
  setForceZ: (value: string) => void;
  setDeltaTime: (value: string) => void;
  applyForceToSelectedAsteroid: () => void;
  showOrbitForBody: (body: CelestialBody) => void;
  clearSelection: () => void;
}

export default function SelectedBodyPanel({
  selectedBody,
  forceX,
  forceY,
  forceZ,
  deltaTime,
  setForceX,
  setForceY,
  setForceZ,
  setDeltaTime,
  applyForceToSelectedAsteroid,
  showOrbitForBody,
  clearSelection,
}: SelectedBodyPanelProps) {
  return (
    <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-slate-900/95 text-slate-200 p-3 md:p-4 rounded-2xl z-[1001] w-[90vw] max-w-[280px] md:max-w-[320px] border border-slate-600/50 shadow-[0_0_12px_rgba(100,116,139,0.5)] backdrop-blur-md">
      <h3 className="mb-2 text-base md:text-lg font-semibold text-slate-300 drop-shadow-md">
        Selected: {selectedBody.name}
      </h3>
      {selectedBody.id && (
        <div className="mb-3 text-sm opacity-80">ID: {selectedBody.id}</div>
      )}

      {"applyForce" in selectedBody && (
        <div className="mt-4">
          <div className="font-semibold mb-2 text-slate-200">
            Apply Force (Giga Newtons):
          </div>
          <div className="text-xs text-slate-400 mb-2">
            1 GN = 1,000,000,000 N. Typical values: 10-1000 GN
          </div>

          <div className="mb-3">
            <label className="block text-xs mb-1 text-slate-300">X (GN):</label>
            <input
              type="number"
              value={forceX}
              onChange={(e) => setForceX(e.target.value)}
              className="w-full p-2 bg-slate-800/50 border border-slate-600/50 rounded-md text-slate-100 focus:outline-none focus:border-slate-500/70 transition-all duration-200"
              aria-label="Force X in Giga Newtons"
              placeholder="e.g., 100"
            />
          </div>

          <div className="mb-3">
            <label className="block text-xs mb-1 text-slate-300">Y (GN):</label>
            <input
              type="number"
              value={forceY}
              onChange={(e) => setForceY(e.target.value)}
              className="w-full p-2 bg-slate-800/50 border border-slate-600/50 rounded-md text-slate-100 focus:outline-none focus:border-slate-500/70 transition-all duration-200"
              aria-label="Force Y in Giga Newtons"
              placeholder="e.g., 100"
            />
          </div>

          <div className="mb-3">
            <label className="block text-xs mb-1 text-slate-300">Z (GN):</label>
            <input
              type="number"
              value={forceZ}
              onChange={(e) => setForceZ(e.target.value)}
              className="w-full p-2 bg-slate-800/50 border border-slate-600/50 rounded-md text-slate-100 focus:outline-none focus:border-slate-500/70 transition-all duration-200"
              aria-label="Force Z in Giga Newtons"
              placeholder="e.g., 100"
            />
          </div>

          <div className="mb-3 md:mb-4 w-full">
            <label className="block text-xs mb-1 text-slate-300">
              Delta Time (s):
            </label>
            <input
              type="number"
              value={deltaTime}
              onChange={(e) => setDeltaTime(e.target.value)}
              className="w-full border rounded-full p-1.5 md:p-2 pl-3 md:pl-4 bg-slate-800/50 border-slate-600/50 text-slate-100 text-sm focus:outline-none focus:border-slate-500/70 transition-all duration-200"
              aria-label="Delta Time"
              placeholder="e.g., 3600"
            />
            <div className="text-xs text-slate-400 mt-1">
              Suggested: 3600 (1 hour) to 86400 (1 day)
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-xs mb-1 text-slate-300">
              Quick Presets:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setForceX("500");
                  setForceY("0");
                  setForceZ("0");
                  setDeltaTime("86400");
                }}
                className="p-1 text-xs bg-slate-700/50 border border-slate-600/50 rounded hover:bg-slate-600/60"
              >
                500 GN, 1 day
              </button>
              <button
                onClick={() => {
                  setForceX("1000");
                  setForceY("0");
                  setForceZ("0");
                  setDeltaTime("86400");
                }}
                className="p-1 text-xs bg-slate-700/50 border border-slate-600/50 rounded hover:bg-slate-600/60"
              >
                1000 GN, 1 day
              </button>
            </div>
          </div>
          <div className="flex flex-col w-full gap-1.5 md:gap-0">
            <button
              onClick={applyForceToSelectedAsteroid}
              className="w-full border rounded-full p-1.5 md:p-2 pl-3 md:pl-4 text-sm md:text-base bg-gradient-to-r from-slate-500 to-slate-600 text-white font-semibold border-slate-400/60 hover:from-slate-600 hover:to-slate-700 hover:border-slate-300/70 transition-all duration-300 shadow-[0_0_10px_rgba(100,116,139,0.5)] hover:shadow-[0_0_14px_rgba(100,116,139,0.7)]"
              aria-label="Apply Force"
            >
              Apply Force
            </button>

            <button
              onClick={() => showOrbitForBody(selectedBody)}
              className="w-full border rounded-full p-1.5 md:p-2 pl-3 md:pl-4 mt-1.5 md:mt-2 bg-slate-700/50 border-slate-600/50 text-slate-300 text-xs md:text-sm hover:bg-slate-600/60 hover:border-slate-500/70 hover:text-slate-100 transition-all duration-300"
              aria-label="Highlight Orbit"
            >
              Highlight Orbit
            </button>

            <button
              onClick={clearSelection}
              className="w-full border rounded-full p-1.5 md:p-2 pl-3 md:pl-4 mt-1.5 md:mt-2 bg-slate-800/50 border-red-600/50 text-red-400 text-xs md:text-sm hover:bg-red-600/20 hover:border-red-500/70 hover:text-red-300 transition-all duration-300"
              aria-label="Clear Selection"
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
