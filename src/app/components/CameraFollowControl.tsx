"use client";

import { useState } from "react";

interface CameraFollowControlProps {
  isFollowing: boolean;
  onToggleFollow: () => void;
  smoothness: number;
  onSmoothnessChange: (value: number) => void;
  lookAhead: number;
  onLookAheadChange: (value: number) => void;
  disabled?: boolean;
  rotationAngles?: { horizontal: number; vertical: number };
  onResetRotation?: () => void;
}

export default function CameraFollowControl({
  isFollowing,
  onToggleFollow,
  smoothness,
  onSmoothnessChange,
  lookAhead,
  onLookAheadChange,
  disabled = false,
  rotationAngles,
  onResetRotation,
}: CameraFollowControlProps) {
  const [showControls, setShowControls] = useState(false);

  return (
    <div className="absolute top-[calc(50%-280px)] right-2 md:right-5 flex flex-col gap-1.5 md:gap-2 z-10 items-center">
      {/* Rotation Controls Panel - Shows on button click */}
      {showControls && isFollowing && (
        <div className="absolute right-full mr-3 top-0 bg-[rgba(20,20,40,0.95)] border-2 border-[rgba(100,180,255,0.4)] rounded-xl p-4 backdrop-blur-md shadow-2xl min-w-[240px] animate-in slide-in-from-right">
          <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-[rgba(100,180,255,1)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-[rgba(100,180,255,1)]">Rotation Controls</span>
          </h3>
          
          {/* Current Rotation Display */}
          {rotationAngles && (
            <div className="mb-3 p-2 bg-[rgba(100,180,255,0.1)] rounded-lg border border-[rgba(100,180,255,0.3)]">
              <div className="text-[10px] text-[rgba(255,255,255,0.7)] mb-1">Current Angle:</div>
              <div className="flex gap-3 text-xs text-[rgba(100,180,255,1)] font-mono">
                <div>H: {rotationAngles.horizontal.toFixed(0)}°</div>
                <div>V: {rotationAngles.vertical.toFixed(0)}°</div>
              </div>
            </div>
          )}

          {/* Keyboard Controls */}
          <div className="mb-3">
            <div className="text-[11px] text-[rgba(255,255,255,0.9)] font-semibold mb-2">Keyboard:</div>
            <div className="space-y-2">
              {/* Arrow keys in keyboard layout */}
              <div className="flex flex-col items-center gap-0.5">
                <div className="flex justify-center">
                  <kbd className="px-2 py-1 bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] rounded text-white font-mono text-xs">↑</kbd>
                </div>
                <div className="flex gap-0.5">
                  <kbd className="px-2 py-1 bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] rounded text-white font-mono text-xs">←</kbd>
                  <kbd className="px-2 py-1 bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] rounded text-white font-mono text-xs">↓</kbd>
                  <kbd className="px-2 py-1 bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] rounded text-white font-mono text-xs">→</kbd>
                </div>
              </div>
              <div className="text-center text-[10px] text-[rgba(255,255,255,0.6)]">Rotate view</div>
              
              {/* Reset key */}
              <div className="flex items-center justify-center gap-2 text-[10px] pt-1">
                <kbd className="px-2 py-1 bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] rounded text-white font-mono">R</kbd>
                <span className="text-[rgba(255,255,255,0.6)]">Reset rotation</span>
              </div>
            </div>
          </div>

          {/* Touch Controls */}
          <div className="mb-2">
            <div className="text-[11px] text-[rgba(255,255,255,0.9)] font-semibold mb-2">Touch:</div>
            <div className="text-[10px] text-[rgba(255,255,255,0.6)]">
              Two-finger swipe to rotate view
            </div>
          </div>

          {/* Reset Button */}
          {onResetRotation && (
            <button
              onClick={onResetRotation}
              className="w-full mt-3 px-3 py-1.5 bg-[rgba(100,180,255,0.2)] hover:bg-[rgba(100,180,255,0.3)] border border-[rgba(100,180,255,0.4)] hover:border-[rgba(100,180,255,0.6)] rounded-lg text-[11px] text-[rgba(100,180,255,1)] font-semibold transition-all duration-200"
            >
              Reset Rotation
            </button>
          )}
        </div>
      )}

      {/* Main Follow Toggle Button - Positioned above zoom controls */}
      <button
        onClick={onToggleFollow}
        disabled={disabled}
        className={`w-[40px] h-[40px] md:w-[50px] md:h-[50px] rounded-full border-2 transition-all duration-300 flex items-center justify-center backdrop-blur-sm shadow-lg relative group ${
          disabled
            ? "bg-[rgba(20,20,40,0.5)] border-[rgba(255,255,255,0.2)] cursor-not-allowed opacity-50"
            : isFollowing
            ? "bg-[rgba(20,40,60,0.9)] border-[rgba(100,180,255,0.9)] shadow-[0_0_20px_rgba(100,180,255,0.5)] hover:shadow-[0_0_30px_rgba(100,180,255,0.7)]"
            : "bg-[rgba(20,20,40,0.7)] border-[rgba(255,255,255,0.3)] hover:border-[rgba(100,180,255,0.6)] hover:bg-[rgba(20,30,50,0.8)]"
        }`}
        aria-label={isFollowing ? "Stop Following" : "Follow Selected Object"}
        title={disabled ? "Select an object to follow" : isFollowing ? "Stop Following" : "Follow Selected Object"}
      >
        <div className="relative w-5 h-5 md:w-6 md:h-6">
          {/* Target/Crosshair Icon */}
          <svg
            className={`w-full h-full transition-all duration-300 ${
              isFollowing ? "text-[rgba(100,180,255,1)] animate-pulse" : "text-white group-hover:text-[rgba(100,180,255,0.8)]"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={isFollowing ? 2.5 : 2}
          >
            {/* Outer Circle */}
            <circle cx="12" cy="12" r="9" strokeLinecap="round" strokeLinejoin="round" />
            {/* Inner Circle */}
            <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
            {/* Crosshair Lines */}
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3M12 18v3M3 12h3M18 12h3" />
            {/* Directional Arrows (when following) */}
            {isFollowing && (
              <>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 12l-2-2m2 2l-2 2M17 12l2-2m-2 2l2 2M12 7l-2-2m2 2l2-2M12 17l-2 2m2 2l2-2" opacity="0.6" />
              </>
            )}
          </svg>
          
          {/* Active Indicator Ring */}
          {isFollowing && (
            <div className="absolute inset-0 rounded-full border-2 border-[rgba(100,180,255,0.4)] animate-ping"></div>
          )}
        </div>

        {/* Tooltip on hover */}
        {!disabled && (
          <div className="absolute right-full mr-2 px-2 py-1 bg-[rgba(20,20,40,0.95)] border border-[rgba(255,255,255,0.2)] rounded text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {isFollowing ? "Stop Follow" : "Follow Object"}
          </div>
        )}
      </button>

      {/* Rotation Controls Toggle Button */}
      {isFollowing && (
        <button
          onClick={() => setShowControls(!showControls)}
          className={`w-[40px] h-[40px] md:w-[50px] md:h-[50px] rounded-full border-2 transition-all duration-200 flex items-center justify-center backdrop-blur-sm shadow-md relative group ${
            showControls
              ? "bg-[rgba(20,40,60,0.9)] border-[rgba(100,180,255,0.8)]"
              : "bg-[rgba(20,20,40,0.7)] border-[rgba(255,255,255,0.3)] hover:border-[rgba(100,180,255,0.5)]"
          }`}
          aria-label="Rotation Controls"
          title="Show Rotation Controls"
        >
          <svg 
            className={`w-5 h-5 transition-all duration-300 ${
              showControls ? "text-[rgba(100,180,255,1)]" : "text-white group-hover:text-[rgba(100,180,255,0.8)]"
            }`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>

          {/* Tooltip */}
          <div className="absolute right-full mr-2 px-2 py-1 bg-[rgba(20,20,40,0.95)] border border-[rgba(255,255,255,0.2)] rounded text-[10px] text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Controls
          </div>
        </button>
      )}
    </div>
  );
}
