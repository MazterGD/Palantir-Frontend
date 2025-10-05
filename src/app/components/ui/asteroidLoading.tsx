export default function LoadingAnimation() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full max-w-md h-full bg-gradient-to-br from-slate-900/40 via-slate-800/30 to-slate-700/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-500/30 overflow-hidden relative flex items-center justify-center">
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-slate-300 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `orbit ${5 + Math.random() * 5}s linear infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="relative flex items-center justify-center w-full h-full">
          <div className="absolute inset-0 -m-8">
            <div className="w-full h-full rounded-full bg-slate-800/20 animate-pulse-slow"></div>
          </div>

          {/* Central Asteroid */}
          <div className="relative w-48 h-48 animate-spin-slow">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 opacity-90 clip-path-asteroid shadow-lg shadow-slate-900/50"></div>
            <div className="absolute top-1/4 left-1/3 w-6 h-6 bg-slate-500 rounded-full"></div>
            <div className="absolute bottom-1/4 right-1/4 w-4 h-4 bg-slate-400 rounded-full"></div>
            <div className="absolute top-1/2 left-1/4 w-3 h-3 bg-slate-300 rounded-full"></div>
          </div>

          {/* Orbiting Particles */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="absolute inset-0 -m-4">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-400/40 animate-orbit-ping"></div>
              </div>
              <div className="absolute inset-0 -m-2">
                <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-300/40 animate-orbit-ping-slow"></div>
              </div>

              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-600 via-slate-500 to-slate-400 animate-pulse"></div>
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-slate-700 to-slate-800"></div>
              </div>
            </div>
          </div>

          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-12 text-center whitespace-nowrap">
            <h3 className="text-xl font-semibold text-white mb-2">
              Tracking Asteroid Data
            </h3>
            <div className="flex items-center justify-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full bg-slate-300 animate-bounce"
                style={{ animationDelay: "0s" }}
              ></div>
              <div
                className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                style={{ animationDelay: "0.15s" }}
              ></div>
              <div
                className="w-2 h-2 rounded-full bg-slate-500 animate-bounce"
                style={{ animationDelay: "0.3s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
