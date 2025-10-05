"use client";

import { useState } from "react";
import DataCard from "./ui/dataCard";
import DataRow from "./ui/dataRow";
import LoadingAnimation from "./ui/asteroidLoading";
import { useAsteroidOne } from "../hooks/useAsteroidOne";
import FetchFailed from "./ui/fetchFailed";

interface AsteroidVisualizerProps {
  id: string;
  onCloseHandler: () => void;
}

export default function AsteroidVisualizer({
  id,
  onCloseHandler,
}: AsteroidVisualizerProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const {
    asteroid: asteroidData,
    loading,
    error: errorData,
  } = useAsteroidOne(id);

  function handleSeeImpact() {
    console.log("See impact is clicked");
  }

  // Calculate impact data (simplified for demonstration)
  const impactData = asteroidData
    ? {
        mass: 6.336e15, // kg
        kineticEnergy: 4.405e22, // J
        energyMegatons: 1.052e7, // Mt TNT
        impactEnergy: 4.405e22, // J
        impactMegatons: 1.052e7, // Mt TNT
        linearMomentum: 2.362e19, // kg·m/s
        angularMomentum: 1.505e26, // kg·m²/s
        seafloorVelocity: 3.728, // km/s
        seafloorEnergy: 4.405e22, // J
        imFreq: 1e-7, // years^-1
      }
    : null;

  // Helper to format dates
  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper to format epoch date
  const formatEpochDate = (epoch) => {
    if (!epoch) return "N/A";
    const date = new Date(epoch * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="w-full max-w-sm h-[85vh] bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-700/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-slate-600/40 overflow-hidden relative transition-all duration-500">
      {loading ? (
        <LoadingAnimation />
      ) : asteroidData != null ? (
        <div>
          <button
            onClick={onCloseHandler}
            className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-slate-700/60 hover:bg-slate-600/80 border border-slate-500/50 hover:border-slate-400/70 transition-all duration-300 group"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6 text-slate-300 group-hover:text-white transition-colors"
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

          <div className="bg-gradient-to-r from-slate-900/80 to-slate-800/80 p-6 border-b border-slate-600/40 shadow-white/50">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-5 h-5 bg-slate-400 rounded-full animate-pulse shadow-white/50"></div>
              <h1 className="text-4xl font-extrabold text-white tracking-tight drop-shadow-lg">
                {asteroidData.name_limited}
              </h1>
            </div>
            <p className="text-slate-300 text-sm font-medium opacity-90 tracking-wide">
              {asteroidData.designation}
            </p>
            <div className="mt-5 flex gap-3">
              <span
                className={`px-4 py-1 rounded-full flex items-center text-xs font-semibold tracking-wide ${
                  asteroidData.is_potentially_hazardous_asteroid
                    ? "bg-red-600/50 text-red-100 border border-red-500/60 shadow-white/50]"
                    : "bg-green-600/50 text-green-100 border border-green-500/60 shadow-white/50"
                } transition-all duration-200 hover:scale-105`}
              >
                {asteroidData.is_potentially_hazardous_asteroid
                  ? "HAZARDOUS"
                  : "SAFE"}
              </span>
              <span className="px-4 py-1 rounded-full flex items-center text-xs font-semibold tracking-wide bg-slate-600/50 text-slate-100 border border-slate-500/60 hover:bg-slate-500/60 hover:scale-105 transition-all duration-200">
                {asteroidData.orbital_data.orbit_class.orbit_class_type}
              </span>
              <div className="flex-1 flex justify-end">
                <button
                  onClick={handleSeeImpact}
                  className="px-6 py-1 rounded-full flex items-center text-sm font-semibold bg-gradient-to-r from-slate-500 to-slate-600 text-white border border-slate-400/60 hover:from-slate-600 hover:to-slate-700 hover:border-slate-300/70 transition-all duration-300 gap-2 cursor-pointer shadow-white/30 hover:shadow-white/80"
                  title="View calculated impact parameters"
                  aria-label="View impact data"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  See Impact
                </button>
              </div>
            </div>
          </div>
          <div className="flex border-b border-slate-600/50 bg-slate-900/30">
            {["overview", "approaches", "orbital", "observation"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-sm font-semibold tracking-wide transition-all duration-300 ${
                  activeTab === tab
                    ? "text-slate-200 border-b-2 border-slate-400 bg-slate-800/20 shadow-white/50"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-700/10"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-6 overflow-y-auto h-[calc(85vh-240px)] custom-scrollbar">
            {activeTab === "overview" && (
              <div className="space-y-6">
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
                  <p className="text-slate-300 text-sm leading-relaxed mb-3">
                    {
                      asteroidData.orbital_data.orbit_class
                        .orbit_class_description
                    }
                  </p>
                  <DataRow
                    label="Orbit Class Type"
                    value={
                      asteroidData.orbital_data.orbit_class.orbit_class_type
                    }
                    unit=""
                  />
                  <DataRow
                    label="Orbit Range"
                    value={
                      asteroidData.orbital_data.orbit_class.orbit_class_range
                    }
                    unit=""
                  />
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
                  <DataRow
                    label="JPL URL"
                    value={
                      <a
                        href={asteroidData.nasa_jpl_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-300 hover:text-slate-100 transition-colors"
                      >
                        View on JPL
                      </a>
                    }
                    unit=""
                  />
                </DataCard>
              </div>
            )}

            {activeTab === "approaches" && (
              <div className="space-y-4">
                {asteroidData.close_approach_data.map((approach, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-slate-800/30 to-slate-700/30 rounded-xl p-5 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-300 shadow-white/50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-slate-200 font-semibold">
                        {formatDate(approach.close_approach_date)}
                      </span>
                      <span className="px-3 py-1 bg-slate-600/50 text-slate-200 text-xs rounded-full border border-slate-500/40">
                        {approach.orbiting_body}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      <DataRow
                        label="Miss Distance (AU)"
                        value={approach.miss_distance.astronomical.toFixed(4)}
                        unit="AU"
                      />
                      <DataRow
                        label="Miss Distance (km)"
                        value={(
                          approach.miss_distance.kilometers / 1000000
                        ).toFixed(2)}
                        unit="M km"
                      />
                      <DataRow
                        label="Velocity"
                        value={approach.relative_velocity.kilometers_per_second.toFixed(
                          2,
                        )}
                        unit="km/s"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "orbital" && (
              <div className="space-y-6">
                <DataCard title="Orbital Elements">
                  <DataRow
                    label="Semi-major Axis"
                    value={asteroidData.orbital_data.semi_major_axis.toFixed(4)}
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
                    label="Perihelion Distance"
                    value={asteroidData.orbital_data.perihelion_distance.toFixed(
                      4,
                    )}
                    unit="AU"
                  />
                  <DataRow
                    label="Aphelion Distance"
                    value={asteroidData.orbital_data.aphelion_distance.toFixed(
                      4,
                    )}
                    unit="AU"
                  />
                  <DataRow
                    label="Perihelion Argument"
                    value={asteroidData.orbital_data.perihelion_argument.toFixed(
                      4,
                    )}
                    unit="°"
                  />
                  <DataRow
                    label="Ascending Node"
                    value={asteroidData.orbital_data.ascending_node_longitude.toFixed(
                      4,
                    )}
                    unit="°"
                  />
                  <DataRow
                    label="Mean Anomaly"
                    value={asteroidData.orbital_data.mean_anomaly.toFixed(4)}
                    unit="°"
                  />
                  <DataRow
                    label="Mean Motion"
                    value={(
                      asteroidData.orbital_data.mean_motion * 360
                    ).toFixed(6)}
                    unit="°/day"
                  />
                  <DataRow
                    label="Minimum Orbit Intersection"
                    value={asteroidData.orbital_data.minimum_orbit_intersection.toFixed(
                      6,
                    )}
                    unit="AU"
                  />
                  <DataRow
                    label="Jupiter Tisserand Invariant"
                    value={asteroidData.orbital_data.jupiter_tisserand_invariant.toFixed(
                      3,
                    )}
                    unit=""
                  />
                </DataCard>

                <DataCard title="Orbital Period">
                  <DataRow
                    label="Period (days)"
                    value={asteroidData.orbital_data.orbital_period.toFixed(2)}
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

                <DataCard title="Reference Data">
                  <DataRow
                    label="Epoch Osculation"
                    value={formatEpochDate(
                      parseInt(
                        String(asteroidData.orbital_data.epoch_osculation),
                      ) - 2451545.0,
                    )}
                    unit=""
                  />
                  <DataRow
                    label="Equinox"
                    value={asteroidData.orbital_data.equinox}
                    unit=""
                  />
                  <DataRow
                    label="Perihelion Time"
                    value={formatEpochDate(
                      asteroidData.orbital_data.perihelion_time - 2451545.0,
                    )}
                    unit=""
                  />
                  <DataRow
                    label="Orbit ID"
                    value={asteroidData.orbital_data.orbit_id}
                    unit=""
                  />
                  <DataRow
                    label="Orbit Uncertainty"
                    value={asteroidData.orbital_data.orbit_uncertainty}
                    unit=""
                  />
                </DataCard>
              </div>
            )}

            {activeTab === "observation" && (
              <div className="space-y-6">
                <DataCard title="Observation Data">
                  <DataRow
                    label="First Observation"
                    value={formatDate(
                      asteroidData.orbital_data.first_observation_date,
                    )}
                    unit=""
                  />
                  <DataRow
                    label="Last Observation"
                    value={formatDate(
                      asteroidData.orbital_data.last_observation_date,
                    )}
                    unit=""
                  />
                  <DataRow
                    label="Data Arc"
                    value={(
                      asteroidData.orbital_data.data_arc_in_days / 365.25
                    ).toFixed(2)}
                    unit="years"
                  />
                  <DataRow
                    label="Observations Used"
                    value={asteroidData.orbital_data.observations_used.toLocaleString()}
                    unit=""
                  />
                  <DataRow
                    label="Orbit Determination"
                    value={formatDate(
                      asteroidData.orbital_data.orbit_determination_date,
                    )}
                    unit=""
                  />
                </DataCard>
              </div>
            )}
          </div>
        </div>
      ) : (
        <FetchFailed />
      )}
    </div>
  );
}
