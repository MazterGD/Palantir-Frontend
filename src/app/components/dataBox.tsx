"use client";
import { useState, useEffect } from "react";
import DataCard from "./ui/dataCard";
import DataRow from "./ui/dataRow";
import LoadingAnimation from "./ui/asteroidLoading";
import { AsteroidType } from "../types/asteriod.type";

export default function AsteroidVisualizer() {
  const [activeTab, setActiveTab] = useState("overview");
  const [asteroidData, setAsteroidData] = useState<AsteroidType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAsteroidData = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = {
          absolute_magnitude_h: 14.99,
          close_approach_data: [
            {
              close_approach_date: "1916-03-16",
              close_approach_date_full: "1916-Mar-16 06:19",
              epoch_date_close_approach: -1697650860000,
              miss_distance: {
                astronomical: 0.0471058106,
                kilometers: 7046928.930383422,
                lunar: 18.3241603234,
                miles: 4378758.591606343,
              },
              orbiting_body: "Mars",
              relative_velocity: {
                kilometers_per_hour: 48319.8957470977,
                kilometers_per_second: 13.4221932631,
                miles_per_hour: 30024.1041101897,
              },
            },
            {
              close_approach_date: "1955-09-16",
              close_approach_date_full: "1955-Sep-16 13:24",
              epoch_date_close_approach: -451046160000,
              miss_distance: {
                astronomical: 0.0755720195,
                kilometers: 11305413.148798466,
                lunar: 29.3975155855,
                miles: 7024857.983670217,
              },
              orbiting_body: "Mars",
              relative_velocity: {
                kilometers_per_hour: 49810.1997348889,
                kilometers_per_second: 13.836166593,
                miles_per_hour: 30950.121051937,
              },
            },
            {
              close_approach_date: "2111-10-21",
              close_approach_date_full: "2111-Oct-21 09:10",
              epoch_date_close_approach: 4474861800000,
              miss_distance: {
                astronomical: 0.0905040533,
                kilometers: 13539213.60004647,
                lunar: 35.2060767337,
                miles: 8412877.22076846,
              },
              orbiting_body: "Mars",
              relative_velocity: {
                kilometers_per_hour: 46485.0548022348,
                kilometers_per_second: 12.9125152228,
                miles_per_hour: 28884.0053019775,
              },
            },
            {
              close_approach_date: "2151-04-22",
              close_approach_date_full: "2151-Apr-22 15:35",
              epoch_date_close_approach: 5721464100000,
              miss_distance: {
                astronomical: 0.0422088402,
                kilometers: 6314352.589090374,
                lunar: 16.4192388378,
                miles: 3923556.761116201,
              },
              orbiting_body: "Mars",
              relative_velocity: {
                kilometers_per_hour: 47916.0974160785,
                kilometers_per_second: 13.31002706,
                miles_per_hour: 29773.1995305628,
              },
            },
            {
              close_approach_date: "2190-10-22",
              close_approach_date_full: "2190-Oct-22 20:17",
              epoch_date_close_approach: 6968060220000,
              miss_distance: {
                astronomical: 0.0537685428,
                kilometers: 8043659.475883836,
                lunar: 20.9159631492,
                miles: 4998098.233419497,
              },
              orbiting_body: "Mars",
              relative_velocity: {
                kilometers_per_hour: 49268.3018496509,
                kilometers_per_second: 13.6856394027,
                miles_per_hour: 30613.4067798567,
              },
            },
          ],
          designation: "3199",
          estimated_diameter: {
            feet: {
              estimated_diameter_max: 19589.5757225583,
              estimated_diameter_min: 8760.724593204,
            },
            kilometers: {
              estimated_diameter_max: 5.9709024892,
              estimated_diameter_min: 2.6702687706,
            },
            meters: {
              estimated_diameter_max: 5970.9024891669,
              estimated_diameter_min: 2670.26877056,
            },
            miles: {
              estimated_diameter_max: 3.7101456506,
              estimated_diameter_min: 1.6592275762,
            },
          },
          id: "2003199",
          is_potentially_hazardous_asteroid: false,
          is_sentry_object: false,
          links: {
            self: "http://api.nasa.gov/neo/rest/v1/neo/2003199?api_key=Z9aqel3Rw2pmyKzSBYyfr1zYbg116TuxmWd7pbmA",
          },
          name: "3199 Nefertiti (1982 RA)",
          name_limited: "Nefertiti",
          nasa_jpl_url:
            "https://ssd.jpl.nasa.gov/tools/sbdb_lookup.html#/?sstr=2003199",
          neo_reference_id: "2003199",
          orbital_data: {
            aphelion_distance: 2.021950184944472,
            ascending_node_longitude: 339.9726769895601,
            data_arc_in_days: 15656,
            eccentricity: 0.2841004688454785,
            epoch_osculation: 2461000.5,
            equinox: "J2000",
            first_observation_date: "1982-09-13",
            inclination: 32.95969660343363,
            jupiter_tisserand_invariant: 4.19,
            last_observation_date: "2025-07-25",
            mean_anomaly: 278.4918307872764,
            mean_motion: 0.4988234977179076,
            minimum_orbit_intersection: 0.215221,
            observations_used: 4138,
            orbit_class: {
              orbit_class_description:
                "Near-Earth asteroid orbits similar to that of 1221 Amor",
              orbit_class_range: "1.017 AU < q (perihelion) < 1.3 AU",
              orbit_class_type: "AMO",
            },
            orbit_determination_date: "2025-07-26 06:20:51",
            orbit_id: "499",
            orbit_uncertainty: "0",
            orbital_period: 721.6981590622372,
            perihelion_argument: 53.43862249625661,
            perihelion_distance: 1.127258516400192,
            perihelion_time: 2461163.900821304,
            semi_major_axis: 1.574604350672332,
          },
        };
        setAsteroidData(data);
      } catch (error) {
        console.error("Error fetching asteroid data:", error);
        setError("Failed to load asteroid data");
      } finally {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        setLoading(false);
      }
    };
    fetchAsteroidData();
  }, []);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-black p-8 flex items-center justify-center">
        <div className="w-full max-w-md bg-gradient-to-br from-red-900/40 via-purple-900/30 to-blue-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-red-500/30 p-8 text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Error Loading Data
          </h2>
          <p className="text-purple-200 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  if (!asteroidData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-black p-8 flex items-center justify-center">
      <div className="w-full max-w-md h-[80vh] bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-blue-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-500/30 overflow-hidden relative">
        {loading ? (
          <LoadingAnimation />
        ) : (
          <div>
            <button
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
