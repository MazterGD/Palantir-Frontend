"use client";
import { useState } from "react";
import DataCard from "./ui/dataCard";
import DataRow from "./ui/dataRow";
import LoadingAnimation from "./ui/asteroidLoading";
import { useAsteroidOne } from "../hooks/useAsteroidOne";

interface AsteroidVisualizerProps {
  id: string;
  onClose: () => void;
}

{
  /* Example  for usage : <AsteroidVisualizer id="2003199" onClose={() => {}} /> */
}
export default function AsteroidVisualizer({
  id,
  onClose,
}: AsteroidVisualizerProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const {
    asteroid: asteroidData,
    loading: loading,
    error: error,
  } = useAsteroidOne(id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-black p-8 flex items-center justify-center">
      <div className="w-full max-w-md h-[80vh] bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-blue-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-500/30 overflow-hidden relative">
        {loading || !asteroidData ? (
          <LoadingAnimation />
        ) : (
          <div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-purple-800/50 hover:bg-purple-700/70 border border-purple-500/30 hover:border-purple-400/50 transition-all group"
              aria-label="Close"
            >
              <svg
                className="w-5 h-5 text-purple-200 group-hover:text-white transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>

            <div className="bg-gradient-to-r from-purple-800/50 to-indigo-800/50 p-6 border-b border-purple-500/30">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                <h1 className="text-2xl font-bold text-white">
                  {asteroidData.name_limited}
                </h1>
              </div>
              <p className="text-purple-200 text-sm">
                {asteroidData.designation}
              </p>
              <div className="mt-3 flex gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    asteroidData.is_potentially_hazardous_asteroid
                      ? "bg-red-500/30 text-red-200 border border-red-400/50"
                      : "bg-green-500/30 text-green-200 border border-green-400/50"
                  }`}
                >
                  {asteroidData.is_potentially_hazardous_asteroid
                    ? "HAZARDOUS"
                    : "SAFE"}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/30 text-blue-200 border border-blue-400/50">
                  {asteroidData.orbital_data.orbit_class.orbit_class_type}
                </span>
              </div>
            </div>

            <div className="flex border-b border-purple-500/30 bg-black/20">
              {["overview", "approaches", "orbital"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-3 text-sm font-medium transition-all ${
                    activeTab === tab
                      ? "text-cyan-300 border-b-2 border-cyan-400 bg-purple-500/10"
                      : "text-purple-300 hover:text-white hover:bg-purple-500/5"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="p-6 overflow-y-auto h-[calc(80vh-220px)] custom-scrollbar">
              {activeTab === "overview" && (
                <div className="space-y-4">
                  <DataCard title="Physical Properties">
                    <DataRow
                      label="Absolute Magnitude"
                      value={asteroidData.absolute_magnitude_h.toFixed(2)}
                      unit="H"
                    />
                    <DataRow
                      label="Diameter (min)"
                      value={asteroidData.estimated_diameter.kilometers.estimated_diameter_min.toFixed(
                        2,
                      )}
                      unit="km"
                    />
                    <DataRow
                      label="Diameter (max)"
                      value={asteroidData.estimated_diameter.kilometers.estimated_diameter_max.toFixed(
                        2,
                      )}
                      unit="km"
                    />
                  </DataCard>

                  <DataCard title="Orbit Classification">
                    <p className="text-purple-100 text-sm leading-relaxed">
                      {
                        asteroidData.orbital_data.orbit_class
                          .orbit_class_description
                      }
                    </p>
                  </DataCard>

                  <DataCard title="Quick Stats">
                    <DataRow
                      label="Orbital Period"
                      value={(
                        asteroidData.orbital_data.orbital_period / 365.25
                      ).toFixed(2)}
                      unit="years"
                    />
                    <DataRow
                      label="Eccentricity"
                      value={asteroidData.orbital_data.eccentricity.toFixed(4)}
                      unit=""
                    />
                    <DataRow
                      label="Inclination"
                      value={asteroidData.orbital_data.inclination.toFixed(2)}
                      unit="°"
                    />
                  </DataCard>
                </div>
              )}

              {activeTab === "approaches" && (
                <div className="space-y-3">
                  {asteroidData.close_approach_data.map((approach, idx) => (
                    <div
                      key={idx}
                      className="bg-gradient-to-br from-purple-800/20 to-indigo-800/20 rounded-2xl p-4 border border-purple-500/20 hover:border-cyan-400/40 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-cyan-300 font-semibold">
                          {approach.close_approach_date_full}
                        </span>
                        <span className="px-2 py-1 bg-red-500/20 text-red-200 text-xs rounded-full border border-red-400/30">
                          {approach.orbiting_body}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-purple-300">Miss Distance</span>
                          <span className="text-white font-medium">
                            {approach.miss_distance.astronomical.toFixed(4)} AU
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-300">Distance (km)</span>
                          <span className="text-white font-medium">
                            {(
                              approach.miss_distance.kilometers / 1000000
                            ).toFixed(2)}
                            M km
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-300">Velocity</span>
                          <span className="text-white font-medium">
                            {approach.relative_velocity.kilometers_per_second.toFixed(
                              2,
                            )}{" "}
                            km/s
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "orbital" && (
                <div className="space-y-4">
                  <DataCard title="Orbital Elements">
                    <DataRow
                      label="Semi-major Axis"
                      value={asteroidData.orbital_data.semi_major_axis.toFixed(
                        4,
                      )}
                      unit="AU"
                    />
                    <DataRow
                      label="Eccentricity"
                      value={asteroidData.orbital_data.eccentricity.toFixed(6)}
                      unit=""
                    />
                    <DataRow
                      label="Inclination"
                      value={asteroidData.orbital_data.inclination.toFixed(4)}
                      unit="°"
                    />
                    <DataRow
                      label="Perihelion"
                      value={asteroidData.orbital_data.perihelion_distance.toFixed(
                        4,
                      )}
                      unit="AU"
                    />
                    <DataRow
                      label="Aphelion"
                      value={asteroidData.orbital_data.aphelion_distance.toFixed(
                        4,
                      )}
                      unit="AU"
                    />
                  </DataCard>

                  <DataCard title="Orbital Period">
                    <DataRow
                      label="Period (days)"
                      value={asteroidData.orbital_data.orbital_period.toFixed(
                        2,
                      )}
                      unit="days"
                    />
                    <DataRow
                      label="Period (years)"
                      value={(
                        asteroidData.orbital_data.orbital_period / 365.25
                      ).toFixed(2)}
                      unit="years"
                    />
                  </DataCard>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
