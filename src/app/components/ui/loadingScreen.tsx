import React from "react";

export default function LoadingScreen() {
  return (
    <div className="inset-0 bg-gradient-to-b from-black via-gray-900 to-black flex items-center justify-center z-50">
      <div className="text-center relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse opacity-60"></div>
          <div
            className="absolute top-1/3 right-1/3 w-1 h-1 bg-blue-300 rounded-full animate-pulse opacity-40"
            style={{ animationDelay: "0.5s" }}
          ></div>
          <div
            className="absolute bottom-1/4 left-1/3 w-0.5 h-0.5 bg-purple-300 rounded-full animate-pulse opacity-50"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute top-1/2 right-1/4 w-0.5 h-0.5 bg-white rounded-full animate-pulse opacity-70"
            style={{ animationDelay: "1.5s" }}
          ></div>
        </div>

        <div className="relative w-40 h-40 mx-auto mb-8">
          {/* Outer orbit ring */}
          <div className="absolute inset-0 border-2 border-blue-500/20 rounded-full"></div>

          {/* Middle orbit ring with slower rotation */}
          <div
            className="absolute inset-3 border-2 border-purple-500/30 rounded-full animate-spin"
            style={{ animationDuration: "4s" }}
          ></div>

          {/* Inner spinning ring */}
          <div
            className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin"
            style={{ animationDuration: "2s" }}
          ></div>

          {/* Center glow effect */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></div>
          </div>

          {/* Orbiting planet */}
          <div
            className="absolute inset-0 animate-spin"
            style={{ animationDuration: "3s" }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full shadow-lg shadow-cyan-400/50"></div>
          </div>
        </div>

        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 animate-pulse">
          Loading
        </h2>
        <p className="text-sm text-gray-500 animate-pulse">
          Initializing celestial bodies...
        </p>
      </div>
    </div>
  );
}
