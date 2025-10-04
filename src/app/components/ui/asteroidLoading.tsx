export default function LoadingAnimation() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-full max-w-md h-[80vh] bg-gradient-to-br from-purple-900/40 via-indigo-900/30 to-blue-900/40 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-500/30 overflow-hidden relative flex items-center justify-center">
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-px h-px bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 3}s`,
              }}
            />
          ))}
        </div>

        <div className="relative flex items-center justify-center w-full h-full">
          <div className="absolute inset-0 -m-8">
            <div className="w-full h-full rounded-full bg-purple-500/10 animate-pulse-slow"></div>
          </div>

          <div className="relative w-48 h-48 animate-spin-slow">
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-purple-400/30"></div>

            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 shadow-lg shadow-purple-500/50"></div>
            </div>
          </div>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              <div className="absolute inset-0 -m-4">
                <div className="w-20 h-20 rounded-full border-2 border-purple-400/40 animate-ping-slow"></div>
              </div>
              <div className="absolute inset-0 -m-2">
                <div className="w-20 h-20 rounded-full border-2 border-cyan-400/40 animate-ping-slower"></div>
              </div>

              <div className="relative w-20 h-20">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 via-indigo-500 to-cyan-500 animate-pulse"></div>
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700"></div>

                <div className="absolute top-4 left-3 w-2 h-2 rounded-full bg-indigo-900/60"></div>
                <div className="absolute bottom-5 right-4 w-3 h-3 rounded-full bg-indigo-900/50"></div>
                <div className="absolute top-8 right-5 w-1.5 h-1.5 rounded-full bg-indigo-900/70"></div>
              </div>
            </div>
          </div>

          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-12 text-center whitespace-nowrap">
            <h3 className="text-xl font-semibold text-white mb-2">
              Loading Asteroid Data
            </h3>
            <div className="flex items-center justify-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"
                style={{ animationDelay: "0s" }}
              ></div>
              <div
                className="w-2 h-2 rounded-full bg-purple-400 animate-bounce"
                style={{ animationDelay: "0.15s" }}
              ></div>
              <div
                className="w-2 h-2 rounded-full bg-pink-400 animate-bounce"
                style={{ animationDelay: "0.3s" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
