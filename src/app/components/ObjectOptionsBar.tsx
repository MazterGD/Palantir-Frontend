"use client";

import { GiAsteroid } from "react-icons/gi";
import { FiX } from "react-icons/fi";

interface ObjectOptionsBarProps {
  hasAsteroidData: boolean;
  onSelectAsteroidDetails: () => void;
  onClose: () => void;
}

export default function ObjectOptionsBar({
  hasAsteroidData,
  onSelectAsteroidDetails,
  onClose,
}: ObjectOptionsBarProps) {
  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1100] pointer-events-auto">
      <div className="flex items-center gap-3 bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-md rounded-full px-4 py-2 shadow-2xl border border-slate-700/50">
        {/* Object Details Option */}
        {hasAsteroidData && (
          <button
            onClick={onSelectAsteroidDetails}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 rounded-full transition-all duration-300 text-white group"
            title="View Object Details"
          >
            <GiAsteroid className="text-xl group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">View Details</span>
          </button>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 bg-red-600/20 hover:bg-red-600/40 rounded-full transition-all duration-300 text-white ml-2"
          title="Close"
        >
          <FiX className="text-lg" />
        </button>
      </div>
    </div>
  );
}
