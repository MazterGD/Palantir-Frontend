"use client";
import Image from "next/image";

export default function AboutSection() {
  return (
    <section className="relative z-10 py-16 bg-slate-900/50">
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(100)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-slate-300 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${1.5 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 1.5}s`,
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4">
        <h3 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(100,116,139,0.3)]">
          About Asteroid Explorer
        </h3>

        <div className="mb-20">
          <h4 className="text-3xl font-semibold text-slate-200 text-center mb-8">
            Our Project
          </h4>
          <p className="text-slate-300 text-xl max-w-4xl mx-auto text-center leading-relaxed">
            <b>Palantir</b> is a 3D simulation platform for Near-Earth Objects,
            enabling visualization of planetary orbits and asteroid trajectories
            using NASA data. The tool provides detailed physical properties,
            orbital elements, and impact modeling, including crater, shock wave,
            and tsunami effects, helping users explore space dynamics and assess
            potential asteroid hazards accurately.
          </p>
        </div>

        <div className="mb-20">
          <h4 className="text-3xl font-semibold text-slate-200 text-center mb-10">
            Meet Our Team
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {[
              {
                name: "Thimali Dananjaya",
                bio: "The organizer and editor-in-chief, steering documentation and project flow with stellar precision and a passion for astronomy.",
                image: "/team/1.jpg",
              },
              {
                name: "Rashmika Dushan",
                bio: "The code navigator who blends front-end brilliance with numbers, transforming data into interactive journeys through the stars.",
                image: "/team/2.jpg",
              },
              {
                name: "Geeneth Punchihewa",
                bio: "A 3D web crafter fluent in Next.js and logic, turning calculations into cosmic visuals that sparkle with precision.",
                image: "/team/3.jpg",
              },
              {
                name: "Tharusha Dinujaya",
                bio: "The backend developer behind the curtain, crafting robust Flask backends to support the team’s interstellar ambitions.",
                image: "/team/4.jpeg",
              },
              {
                name: "Anuda Wewalage",
                bio: "The wordsmith of the team, mastering editing, documentation, and supply chain flow while gazing curiously at the cosmos.",
                image: "/team/5.jpg",
              },
              {
                name: "Theekshana Udara",
                bio: "A creative UI developer weaving Tailwind and Three.js magic to build sleek, celestial interfaces that feel alive.",
                image: "/team/6.jpg",
              },
            ].map((member, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 p-6 rounded-xl border border-slate-600/50 shadow-[0_0_12px_rgba(100,116,139,0.5)] backdrop-blur-md hover:shadow-[0_0_18px_rgba(100,116,139,0.7)] hover:border-slate-500/70 transition-all duration-300 animate-[float-card_5s_ease-in-out_infinite]"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                <div className="mb-5 flex items-center justify-center overflow-hidden rounded-lg">
                  <Image
                    src={member.image || "/placeholder.svg"}
                    alt={member.name}
                    width={192}
                    height={192}
                    className="w-56 h-56 object-cover rounded-lg hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h5 className="text-xl font-semibold text-slate-100 mb-2">
                  {member.name}
                </h5>
                <p className="text-slate-400 text-base leading-relaxed text-justify">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-3xl font-semibold text-slate-200 text-center mb-10">
            References
          </h4>
          <div className="flex flex-col items-center gap-6 max-w-4xl mx-auto">
            {[
              {
                title:
                  "NASA Near-Earth Object (NEO) Web Service Application Programming Interface (API)",
                url: "https://api.nasa.gov/",
                description:
                  "The NASA NEO API provides asteroid data for modeling trajectories, calculating impact probabilities, and simulating deflection strategies with real-time integration.",
              },
              {
                title:
                  "U.S. Geological Survey (USGS) National Earthquake Information Center (NEIC) Earthquake Catalog",
                url: "https://earthquake.usgs.gov/earthquakes/search/",
                description:
                  "The USGS NEIC catalog offers global earthquake data for modeling asteroid impact effects, visualizing ground shaking, and analyzing environmental consequences.",
              },
              {
                title: "USGS National Map Training Videos",
                url: "https://www.usgs.gov/programs/national-geospatial-program/national-map-training",
                description:
                  "The National Map Training page provides instructional videos to help users understand and use U.S. Geological Survey geospatial products and services.",
              },
              {
                title: "Approximate Positions of the Planets",
                url: "https://ssd.jpl.nasa.gov/planets/approx_pos.html",
                description:
                  "This NASA resource provides planetary orbital parameters and formulas useful for modeling asteroid trajectories, understanding orbital mechanics, and creating accurate simulations.",
              },
              {
                title: "Small-Body Database Query Tool",
                url: "https://ssd.jpl.nasa.gov/tools/sbdb_query.html",
                description:
                  "NASA’s Small-Body Database Query tool provides NEO data, enabling asteroid trajectory modeling, impact simulations, and realistic visualizations using real orbital parameters.",
              },
              {
                title: "Elliptical Orbit Simulator",
                url: "https://nasa.github.io/mission-viz/RMarkdown/Elliptical_Orbit_Design.html",
                description:
                  "This NASA tutorial teaches orbit simulation using Keplerian parameters in R, helping participants model asteroid trajectories like Impactor-2025 effectively.",
              },
              {
                title:
                  "Eyes on Asteroids - NASA/Jet Propulsion Laboratory (JPL)",
                url: "https://eyes.nasa.gov/apps/asteroids/",
                description:
                  "This NASA/JPL orrery visualizes 3D asteroid trajectories, inspiring participants to design interactive, user-friendly visualizations of Impactor-2025 and impact risks.",
              },
            ].map((ref, index) => (
              <div
                key={index}
                className="w-full bg-gradient-to-r from-slate-900/80 to-slate-800/80 p-6 rounded-xl border border-slate-600/50 shadow-[0_0_12px_rgba(100,116,139,0.5)] backdrop-blur-md hover:shadow-[0_0_18px_rgba(100,116,139,0.7)] hover:border-slate-500/70 transition-all duration-300"
              >
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-200 text-lg font-semibold hover:text-slate-100 transition-all duration-300"
                >
                  {ref.title}
                </a>
                <p className="text-slate-300 text-base mt-2 leading-relaxed">
                  {ref.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
