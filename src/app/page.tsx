"use client";
import { useRouter } from "next/navigation";
import { League_Spartan } from "next/font/google";
import { useState } from "react";

const league = League_Spartan({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-league",
});

export default function Home() {
  const router = useRouter();
  const [videoLoaded, setVideoLoaded] = useState(false);

  function clickExplore() {
    router.push("/solar_system");
  }

  function clickImpactMap() {
    router.push("/hit_map");
  }

  function clickAbout() {
    router.push("/about");
  }

  return (
    <main>
      <div
        className={`min-h-screen bg-slate-950 overflow-hidden relative ${league.className}`}
      >
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(150)].map((_, i) => (
            <div
              key={`star-${i}`}
              className="absolute bg-white rounded-full"
              style={{
                width: i % 10 === 0 ? "2px" : "1px",
                height: i % 10 === 0 ? "2px" : "1px",
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <header className="relative z-10 flex justify-between items-center p-6 max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-300">
            Palantir
          </h1>
          <nav className="flex gap-6">
            <button
              onClick={clickAbout}
              className="text-slate-300 hover:text-white transition-all duration-300 font-medium cursor-pointer"
            >
              About
            </button>
          </nav>
        </header>

        <main className="relative z-10 flex flex-col items-center justify-center min-h-[85vh] max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-6xl md:text-8xl font-extrabold mb-8 bg-gradient-to-r from-slate-200 via-blue-200 to-slate-300 bg-clip-text text-transparent drop-shadow-[0_2px_20px_rgba(255,255,255,0.1)]">
            Discover the Cosmos
          </h2>
          <p className="text-md md:text-lg text-slate-300 max-w-3xl mb-16 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)] leading-relaxed">
            Palantir is an interactive platform that simulates Near-Earth
            Objects within a realistic solar system view. Explore planetary
            orbits, visualize asteroid trajectories from NASA data, and analyze
            potential impact scenarios. With detailed properties, orbital
            elements, and impact mapping, Palantir brings space dynamics and
            risk assessment into one intuitive visualization environment.
          </p>
          <div className="flex flex-row gap-4">
            {" "}
            <button
              onClick={clickExplore}
              className="px-6 md:px-12 py-2 rounded-full text-xl font-bold bg-gradient-to-r from-slate-700 via-slate-600 to-blue-700 text-white border-2 border-slate-500/50 hover:from-slate-600 hover:via-slate-500 hover:to-blue-600 hover:border-slate-400/70 transition-all duration-300 shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.5)] hover:scale-110 active:scale-105"
              aria-label="Start Exploring Asteroids"
            >
              Explore
            </button>{" "}
            <button
              onClick={clickImpactMap}
              className="px-6 md:px-12 py-2 rounded-full text-xl font-bold bg-gradient-to-r from-slate-700 via-slate-600 to-blue-700 text-white border-2 border-slate-500/50 hover:from-slate-600 hover:via-slate-500 hover:to-blue-600 hover:border-slate-400/70 transition-all duration-300 shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_50px_rgba(59,130,246,0.5)] hover:scale-110 active:scale-105"
              aria-label="Start Exploring Asteroids"
            >
              Impact Map
            </button>
          </div>
        </main>
{/* Tutorial Video */}
<section className="relative z-10 flex flex-col items-center justify-center pb-16 mt-20 text-center px-4 select-none">
  <h3 className="text-4xl font-semibold text-white mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] ">
    Watch the Tutorial
  </h3>
  <p className="text-slate-300 mb-16 max-w-2xl">
    Watch this short video to learn how to navigate and use the features of Palantir effectively.
  </p>

  {!videoLoaded ? (
    <button
      onClick={() => setVideoLoaded(true)}
      className="px-6 md:px-12 py-3 rounded-full text-lg font-bold bg-gradient-to-r from-slate-700 via-slate-600 to-blue-700 text-white border border-slate-500/50 hover:from-slate-600 hover:via-slate-500 hover:to-blue-600 hover:border-slate-400/70 transition-all duration-300 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] hover:scale-105"
    >
      ▶ Play Tutorial
    </button>
  ) : (
    <div
      onContextMenu={(e) => e.preventDefault()} // disable right-click
      className="relative w-full max-w-3xl"
    >
      <video
        controls
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        preload="none"
        poster="/images/tutorial_poster.jpg" // optional placeholder
        className="w-full rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.6)] pointer-events-auto"
        onContextMenu={(e) => e.preventDefault()} // block right-click menu on video itself
      >
        <source src="/videos/tutorial.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Transparent overlay to block direct interaction like "inspect element" click */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        draggable={false}
      ></div>
    </div>
  )}
</section>

      </div>
    </main>
  );
}
