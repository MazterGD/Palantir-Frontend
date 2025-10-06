export default function FetchFailed() {
  return (
    <div className="w-full h-full flex items-center justify-center max-w-md  bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-700/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-600/40 overflow-hidden relative">
      <div className="absolute inset-0">
        <div className="w-full h-full rounded-full bg-slate-800/20 animate-pulse-slow"></div>
      </div>

      <div className="relative flex flex-col items-center justify-center text-center p-6">
        <div className="relative w-24 h-24 mb-6 animate-[pulse-glow_2s_ease-in-out_infinite]">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-slate-700 to-slate-600 clip-path-asteroid shadow-[0_0_12px_rgba(100,116,139,0.5)]"></div>
          <div className="absolute top-1/4 left-1/3 w-4 h-4 bg-slate-500 rounded-full"></div>
          <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-slate-400 rounded-full"></div>
        </div>

        <h3 className="text-xl font-semibold text-slate-100 drop-shadow-md mb-2">
          Failed to Fetch Asteroid Data
        </h3>
        <p className="text-sm text-slate-300 mb-6 max-w-xs">
          Something went wrong while retrieving the data. Please try again.
        </p>
      </div>
    </div>
  );
}
