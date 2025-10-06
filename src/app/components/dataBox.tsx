"use client";

import { useState } from "react";
import DataCard from "./ui/dataCard";
import DataRow from "./ui/dataRow";
import LoadingAnimation from "./ui/asteroidLoading";
import { useAsteroidOne } from "../hooks/useAsteroidOne";
import FetchFailed from "./ui/fetchFailed";
import { useRouter } from "next/navigation";
import { GiAsteroid } from "react-icons/gi";

interface AsteroidVisualizerProps {
  id: string;
  onCloseHandler: () => void;
}

export default function AsteroidVisualizer({
  id,
  onCloseHandler,
}: AsteroidVisualizerProps) {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("overview");
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
    <div className="absolute top-4 left-4 w-[calc(100vw-32px)] sm:w-[360px] max-w-[360px] h-[calc(50vh-50px)] sm:h-[85vh] max-h-[85vh] bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_24px_rgba(100,116,139,0.3)] border border-slate-600/30 overflow-hidden z-[1000] transition-all duration-500 pointer-events-auto animate-[slideInLeft_0.3s_ease-out]">
      {loading ? (
        <LoadingAnimation />
      ) : asteroidData != null ? (
        <div className="h-full flex flex-col">
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
        </div>
      ) : (
        <FetchFailed />
      )}
    </div>
  );
}
