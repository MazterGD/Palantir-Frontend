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
    <div className="absolute bottom-4 left-4 sm:bottom-auto sm:top-4 sm:left-auto sm:right-4 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 text-slate-200 p-4 md:p-5 rounded-2xl z-[1001] w-[calc(100vw-32px)] sm:w-[360px] max-w-[360px] border border-slate-500/40 shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_20px_rgba(100,116,139,0.3)] backdrop-blur-xl max-h-[calc(50vh-50px)] sm:max-h-[85vh] overflow-y-auto custom-scrollbar pointer-events-auto animate-[slideInBottom_0.3s_ease-out] sm:animate-[slideInRight_0.3s_ease-out]">
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex-1">
          <h3 className="text-base sm:text-lg md:text-xl font-bold text-white tracking-tight mb-1 drop-shadow-md">
            {selectedBody.name}
          </h3>
          {selectedBody.id && (
            <div className="text-[10px] sm:text-xs text-slate-400 font-mono">ID: {selectedBody.id}</div>
          )}
        </div>
        <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
      </div>

      {"applyForce" in selectedBody && (
        <div className="mt-3 sm:mt-4 md:mt-5 flex items-center flex-col">
          <div className="w-full mb-3 sm:mb-4 pb-2 sm:pb-3 border-b border-slate-700/50">
            <h4 className="font-bold text-xs sm:text-sm md:text-base text-white uppercase tracking-wider">
              Apply Force (Giga Newtons):
            </h4>
            <p className="text-[10px] sm:text-xs text-slate-400 mt-1">Adjust force vectors and time</p>
          </div>
          <div className="text-xs text-slate-400 mb-2">
            1 GN = 1,000,000,000 N. Typical values: 10-1000 GN
          </div>

          <div className="mb-2 sm:mb-3 w-full">
            <label className="block text-[10px] sm:text-xs font-semibold mb-1 sm:mb-1.5 text-slate-300 uppercase tracking-wide">X (GN):</label>
            <input
              type="number"
              value={forceX}
              onChange={(e) => setForceX(e.target.value)}
              className="w-full border rounded-xl p-2 sm:p-2.5 md:p-3 px-3 sm:px-4 bg-slate-800/70 border-slate-600/40 text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-500/60 focus:bg-slate-800/90 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-slate-500/60"
              aria-label="Force X in Giga Newtons"
              placeholder="e.g., 100"
            />
          </div>

          <div className="mb-2 sm:mb-3 w-full">
            <label className="block text-[10px] sm:text-xs font-semibold mb-1 sm:mb-1.5 text-slate-300 uppercase tracking-wide">Y (GN):</label>
            <input
              type="number"
              value={forceY}
              onChange={(e) => setForceY(e.target.value)}
              className="w-full border rounded-xl p-2 sm:p-2.5 md:p-3 px-3 sm:px-4 bg-slate-800/70 border-slate-600/40 text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-500/60 focus:bg-slate-800/90 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-slate-500/60"
              aria-label="Force Y in Giga Newtons"
              placeholder="e.g., 100"
            />
          </div>

          <div className="mb-2 sm:mb-3 w-full">
            <label className="block text-[10px] sm:text-xs font-semibold mb-1 sm:mb-1.5 text-slate-300 uppercase tracking-wide">Z (GN):</label>
            <input
              type="number"
              value={forceZ}
              onChange={(e) => setForceZ(e.target.value)}
              className="w-full border rounded-xl p-2 sm:p-2.5 md:p-3 px-3 sm:px-4 bg-slate-800/70 border-slate-600/40 text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-500/60 focus:bg-slate-800/90 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-slate-500/60"
              aria-label="Force Z in Giga Newtons"
              placeholder="e.g., 100"
            />
          </div>

          <div className="mb-3 sm:mb-4 w-full">
            <label className="block text-[10px] sm:text-xs font-semibold mb-1 sm:mb-1.5 text-slate-300 uppercase tracking-wide">
              Delta Time (s):
            </label>
            <input
              type="number"
              value={deltaTime}
              onChange={(e) => setDeltaTime(e.target.value)}
              className="w-full border rounded-xl p-2 sm:p-2.5 md:p-3 px-3 sm:px-4 bg-slate-800/70 border-slate-600/40 text-white text-xs sm:text-sm font-medium focus:outline-none focus:border-blue-500/60 focus:bg-slate-800/90 focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 hover:border-slate-500/60"
              placeholder="1"
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
          <div className="flex flex-col w-full gap-2 sm:gap-2.5 mt-2">
            <button
              onClick={applyForceToSelectedAsteroid}
              className="w-full rounded-xl p-2.5 sm:p-3 md:p-3.5 text-xs sm:text-sm md:text-base bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold border-none hover:from-blue-700 hover:to-blue-600 active:scale-95 transition-all duration-200 shadow-[0_4px_14px_rgba(59,130,246,0.4)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.6)] flex items-center justify-center gap-2"
              aria-label="Apply Force"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Apply Force
            </button>

            {/* <button
              onClick={() => showOrbitForBody(selectedBody)}
              className="w-full rounded-xl p-2.5 md:p-3 bg-slate-700/60 border border-slate-600/50 text-slate-300 text-xs md:text-sm font-medium hover:bg-slate-600/70 hover:border-slate-500/70 hover:text-white active:scale-95 transition-all duration-200"
              aria-label="Highlight Orbit"
            >
              Highlight Orbit
            </button> */}

            <button
              onClick={clearSelection}
              className="w-full rounded-xl p-2 sm:p-2.5 md:p-3 bg-slate-800/60 border border-red-500/40 text-red-400 text-xs sm:text-xs md:text-sm font-medium hover:bg-red-600/20 hover:border-red-500/70 hover:text-red-300 active:scale-95 transition-all duration-200"
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
