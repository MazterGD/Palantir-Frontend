"use client";

import { useState } from "react";
import DataCard from "./ui/dataCard";
import DataRow from "./ui/dataRow";
import LoadingAnimation from "./ui/asteroidLoading";
import { useAsteroidOne } from "../hooks/useAsteroidOne";
import FetchFailed from "./ui/fetchFailed";
import { useRouter } from "next/navigation";
import { GiAsteroid } from "react-icons/gi";
import { MdOutlineRocketLaunch } from "react-icons/md";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
import { CelestialBody } from "./ThreeScene";

interface AsteroidVisualizerProps {
  id: string;
  onCloseHandler: () => void;
  selectedBody?: CelestialBody | null;
  forceX?: string | number;
  forceY?: string | number;
  forceZ?: string | number;
  deltaTime?: string | number;
  setForceX?: (value: string) => void;
  setForceY?: (value: string) => void;
  setForceZ?: (value: string) => void;
  setDeltaTime?: (value: string) => void;
  applyForceToSelectedAsteroid?: () => void;
}

export default function AsteroidVisualizer({
  id,
  onCloseHandler,
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
}: AsteroidVisualizerProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("overview");
  const [showForceControls, setShowForceControls] = useState(false);
  const [location, setLocation] = useState<{
    long: number;
    lat: number;
  }>({ long: 79.900756, lat: 6.795024 });
  const {
    asteroid: asteroidData,
    loading,
    error: errorData,
  } = useAsteroidOne(id);

  // Helper to format dates
  const formatDate = (dateStr:any) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Helper to format epoch date
  const formatEpochDate = (epoch:any) => {
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
    <div className="absolute top-4 left-4 w-[calc(100vw-32px)] sm:w-[400px] max-w-[400px] h-[calc(90vh-40px)] sm:h-[90vh] max-h-[90vh] bg-gradient-to-br from-slate-900/98 via-slate-800/96 to-slate-900/98 backdrop-blur-3xl rounded-2xl shadow-[0_12px_48px_rgba(0,0,0,0.7),0_0_32px_rgba(100,116,139,0.5)] border border-slate-500/50 overflow-hidden z-[1100] transition-all duration-500 pointer-events-auto animate-[slideInLeft_0.3s_ease-out]">
      {loading ? (
        <LoadingAnimation />
      ) : asteroidData != null ? (
        <div className="h-full flex flex-col">
          {/* Quick Access Force Controls Button - Top Right */}
          {selectedBody && "applyForce" in selectedBody && (
            <button
              onClick={() => setShowForceControls(!showForceControls)}
              className="absolute top-4 right-16 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-blue-600/80 hover:bg-blue-500/90 border border-blue-400/50 hover:border-blue-300/70 transition-all duration-200 group shadow-lg hover:shadow-blue-500/50 animate-pulse hover:animate-none"
              aria-label="Toggle Force Controls"
              title={showForceControls ? "Hide Force Controls" : "Show Force Controls"}
            >
              <MdOutlineRocketLaunch className="text-lg text-white group-hover:rotate-12 transition-transform" />
            </button>
          )}

          <button
            onClick={onCloseHandler}
            className="absolute top-4 right-4 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-slate-800/80 hover:bg-slate-700/90 border border-slate-600/50 hover:border-slate-500/70 transition-all duration-200 group shadow-lg"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="bg-gradient-to-r from-slate-900/90 to-slate-800/90 p-4 sm:p-6 border-b border-slate-600/30 shadow-xl">
            <div className="flex items-center gap-3 mb-2 sm:mb-3">
              <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.6)]"></div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight drop-shadow-lg">
                {asteroidData.name_limited
                  ? asteroidData.name_limited
                  : asteroidData.name}
              </h1>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm font-medium opacity-90 tracking-wide mb-3 sm:mb-4">
              {asteroidData.designation}
            </p>
            <div className="flex gap-2 flex-wrap">
              <span
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center text-[10px] sm:text-xs font-semibold tracking-wide uppercase ${
                  asteroidData.is_potentially_hazardous_asteroid
                    ? "bg-red-600/60 text-red-100 border border-red-500/70 shadow-[0_0_10px_rgba(239,68,68,0.3)]"
                    : "bg-green-600/60 text-green-100 border border-green-500/70 shadow-[0_0_10px_rgba(34,197,94,0.3)]"
                } transition-all duration-200`}
              >
                {asteroidData.is_potentially_hazardous_asteroid
                  ? "⚠ Hazardous"
                  : "✓ Safe"}
              </span>
              <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full flex items-center text-[10px] sm:text-xs font-semibold tracking-wide uppercase bg-slate-700/60 text-slate-200 border border-slate-600/60 hover:bg-slate-600/70 transition-all duration-200">
                {asteroidData.orbital_data.orbit_class.orbit_class_type}
              </span>

              <a
                href={`hit_map?name=${asteroidData?.name}&id=${asteroidData?.id}&diameter=${asteroidData?.estimated_diameter.meters.estimated_diameter_max}&density=${4000}&energy=${0}&angle=${1}&velocity=${10}&long=${location?.long}&lat=${location?.lat}&depth=${0}&trgt_type=${""}`}
                className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-gradient-to-r from-blue-600 to-blue-500 text-white border-none hover:from-blue-700 hover:to-blue-600 transition-all duration-200 cursor-pointer shadow-[0_4px_14px_rgba(59,130,246,0.4)] hover:shadow-[0_6px_20px_rgba(59,130,246,0.6)] active:scale-95 flex items-center gap-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wide"
              >
                <GiAsteroid className="text-sm sm:text-base" />
                <span>See Impact</span>
              </a>
            </div>
          </div>
          <div className="flex border-b border-slate-600/40 bg-slate-900/40">
            {["overview", "approaches", "orbital", "observation"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 sm:py-3 text-[10px] sm:text-sm font-semibold tracking-wide uppercase transition-all duration-200 ${
                  activeTab === tab
                    ? "text-white border-b-2 border-blue-400 bg-slate-800/30 shadow-[0_2px_8px_rgba(59,130,246,0.3)]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/20"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          <div className="p-3 sm:p-5 overflow-y-auto flex-1 custom-scrollbar">
            {activeTab === "overview" && (
              <div className="space-y-3 sm:space-y-5">
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
                  <p className="text-slate-300 text-xs leading-relaxed mb-3">
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
              <div className="space-y-2 sm:space-y-3">
                {asteroidData.close_approach_data.map((approach, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-slate-800/40 to-slate-900/40 rounded-xl p-3 sm:p-4 border border-slate-600/30 hover:border-slate-500/50 transition-all duration-200 shadow-lg"
                  >
                    <div className="flex items-center justify-between mb-2 sm:mb-3 pb-2 border-b border-slate-700/40">
                      <span className="text-slate-200 font-semibold text-xs sm:text-sm">
                        {formatDate(approach.close_approach_date)}
                      </span>
                      <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 bg-slate-700/60 text-slate-200 text-[10px] sm:text-xs font-semibold rounded-full border border-slate-600/50 uppercase tracking-wide">
                        {approach.orbiting_body}
                      </span>
                    </div>

                    <div className="space-y-2">
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
              <div className="space-y-3 sm:space-y-5">
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
              <div className="space-y-3 sm:space-y-5">
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

          {/* Force Controls Section - Expandable */}
          {selectedBody && "applyForce" in selectedBody && (
            <div className="mt-4 border-t-2 border-blue-500/30 pt-4 bg-gradient-to-b from-blue-950/30 to-transparent px-2 pb-2 rounded-lg">
              <button
                onClick={() => setShowForceControls(!showForceControls)}
                className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-slate-950/90 to-slate-900/90 hover:from-slate-950 hover:to-slate-900 rounded-xl transition-all duration-200 border-2 border-blue-500/40 hover:border-blue-400/60 group shadow-xl hover:shadow-blue-500/30"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600/30 rounded-lg group-hover:bg-blue-600/40 transition-colors shadow-inner">
                    <MdOutlineRocketLaunch className="text-2xl text-blue-300 group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />
                  </div>
                  <div className="text-left">
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      Force Controls
                      {!showForceControls && <span className="text-[10px] px-2 py-0.5 bg-blue-600/30 rounded-full text-blue-200 border border-blue-500/30">Click to expand</span>}
                    </h4>
                    <p className="text-xs text-slate-300 mt-0.5">Apply force vectors to {selectedBody.name}</p>
                  </div>
                </div>
                {showForceControls ? (
                  <FiChevronUp className="text-xl text-blue-300 group-hover:text-blue-200 transition-colors" />
                ) : (
                  <FiChevronDown className="text-xl text-blue-300 group-hover:text-blue-200 transition-colors animate-bounce" />
                )}
              </button>

              {showForceControls && (
                <div className="mt-4 space-y-3 animate-[slideInBottom_0.3s_ease-out]">
                  <div className="p-4 bg-gradient-to-br from-slate-950/95 to-slate-900/95 rounded-xl border-2 border-blue-500/30 shadow-2xl shadow-blue-900/20">
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b border-blue-500/30">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <p className="text-xs text-slate-200 font-semibold">ADJUST FORCE VECTORS (N) AND TIME</p>
                    </div>
                    
                    <div className="space-y-3">{/* Force inputs remain the same */}
                      <div>
                        <label className="block text-[10px] font-semibold mb-1 text-slate-200 uppercase tracking-wide">Force X:</label>
                        <input
                          type="number"
                          value={forceX}
                          onChange={(e) => setForceX?.(e.target.value)}
                          className="w-full border rounded-lg p-2 px-3 bg-slate-950/90 border-slate-600/50 text-white text-xs font-medium focus:outline-none focus:border-blue-400/80 focus:bg-slate-950 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-slate-500/70 shadow-inner"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold mb-1 text-slate-200 uppercase tracking-wide">Force Y:</label>
                        <input
                          type="number"
                          value={forceY}
                          onChange={(e) => setForceY?.(e.target.value)}
                          className="w-full border rounded-lg p-2 px-3 bg-slate-950/90 border-slate-600/50 text-white text-xs font-medium focus:outline-none focus:border-blue-400/80 focus:bg-slate-950 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-slate-500/70 shadow-inner"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold mb-1 text-slate-200 uppercase tracking-wide">Force Z:</label>
                        <input
                          type="number"
                          value={forceZ}
                          onChange={(e) => setForceZ?.(e.target.value)}
                          className="w-full border rounded-lg p-2 px-3 bg-slate-950/90 border-slate-600/50 text-white text-xs font-medium focus:outline-none focus:border-blue-400/80 focus:bg-slate-950 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-slate-500/70 shadow-inner"
                          placeholder="0"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-semibold mb-1 text-slate-200 uppercase tracking-wide">Delta Time (s):</label>
                        <input
                          type="number"
                          value={deltaTime}
                          onChange={(e) => setDeltaTime?.(e.target.value)}
                          className="w-full border rounded-lg p-2 px-3 bg-slate-950/90 border-slate-600/50 text-white text-xs font-medium focus:outline-none focus:border-blue-400/80 focus:bg-slate-950 focus:ring-2 focus:ring-blue-500/30 transition-all duration-200 hover:border-slate-500/70 shadow-inner"
                          placeholder="1"
                        />
                      </div>

                      <button
                        onClick={applyForceToSelectedAsteroid}
                        className="w-full mt-4 rounded-xl p-3.5 text-base bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600 text-white font-bold border-2 border-blue-400/50 hover:from-blue-700 hover:via-blue-600 hover:to-blue-700 hover:border-blue-300/70 active:scale-95 transition-all duration-200 shadow-[0_8px_24px_rgba(59,130,246,0.5)] hover:shadow-[0_12px_32px_rgba(59,130,246,0.7)] flex items-center justify-center gap-3 animate-pulse hover:animate-none"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span className="text-base">Apply Force</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <FetchFailed />
      )}
    </div>
  );
}
