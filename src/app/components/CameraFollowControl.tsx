"use client";

import { useState } from "react";
import Image from "next/image";

interface CameraFollowControlProps {
  isFollowing: boolean;
  onToggleFollow: () => void;
  smoothness: number;
  onSmoothnessChange: (value: number) => void;
  lookAhead: number;
  onLookAheadChange: (value: number) => void;
  disabled?: boolean;
}

export default function CameraFollowControl({
  isFollowing,
  onToggleFollow,
  smoothness,
  onSmoothnessChange,
  lookAhead,
  onLookAheadChange,
  disabled = false,
}: CameraFollowControlProps) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="absolute bottom-20 md:bottom-24 right-2 md:right-5 z-10 flex flex-col items-end gap-2">
      {/* Settings Panel */}
      {showSettings && isFollowing && (
        <div className="bg-[rgba(20,20,40,0.9)] border-2 border-[rgba(255,255,255,0.3)] rounded-lg p-4 backdrop-blur-sm shadow-lg mb-2 min-w-[200px]">
          <h3 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Follow Settings
          </h3>
          
          {/* Smoothness Control */}
          <div className="mb-4">
            <label htmlFor="smoothness-slider" className="text-white text-xs mb-2 flex items-center justify-between">
              <span>Smoothness</span>
              <span className="text-[rgba(255,100,100,0.8)] font-mono">{(smoothness * 100).toFixed(0)}%</span>
            </label>
            <input
              id="smoothness-slider"
              type="range"
              min="1"
              max="30"
              value={smoothness * 100}
              onChange={(e) => onSmoothnessChange(Number(e.target.value) / 100)}
              className="w-full h-2 bg-[rgba(255,255,255,0.2)] rounded-lg appearance-none cursor-pointer accent-[rgba(255,100,100,0.8)]"
              aria-label="Camera follow smoothness"
            />
            <div className="flex justify-between text-[10px] text-[rgba(255,255,255,0.5)] mt-1">
              <span>Responsive</span>
              <span>Smooth</span>
            </div>
          </div>

          {/* Look Ahead Control */}
          <div>
            <label htmlFor="lookahead-slider" className="text-white text-xs mb-2 flex items-center justify-between">
              <span>Look Ahead</span>
              <span className="text-[rgba(255,100,100,0.8)] font-mono">{lookAhead.toFixed(1)}s</span>
            </label>
            <input
              id="lookahead-slider"
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={lookAhead}
              onChange={(e) => onLookAheadChange(Number(e.target.value))}
              className="w-full h-2 bg-[rgba(255,255,255,0.2)] rounded-lg appearance-none cursor-pointer accent-[rgba(255,100,100,0.8)]"
              aria-label="Camera look ahead distance"
            />
            <div className="flex justify-between text-[10px] text-[rgba(255,255,255,0.5)] mt-1">
              <span>Current</span>
              <span>Predictive</span>
            </div>
          </div>
        </div>
      )}

      {/* Main Control Button */}
      <div className="flex items-center gap-2">
        {/* Settings Toggle */}
        {isFollowing && (
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`w-10 h-10 md:w-12 md:h-12 rounded-full bg-[rgba(20,20,40,0.7)] border-2 transition-all duration-200 flex items-center justify-center ${
              showSettings
                ? "border-[rgba(255,100,100,0.8)] bg-[rgba(40,20,20,0.8)]"
                : "border-[rgba(255,255,255,0.3)]"
            } hover:border-[rgba(255,255,255,0.5)] backdrop-blur-sm shadow-md`}
            aria-label="Follow Settings"
          >
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        )}

        {/* Follow Toggle Button */}
        <button
          onClick={onToggleFollow}
          disabled={disabled}
          className={`w-12 h-12 md:w-14 md:h-14 rounded-full border-2 transition-all duration-200 flex items-center justify-center backdrop-blur-sm shadow-md ${
            disabled
              ? "bg-[rgba(20,20,40,0.5)] border-[rgba(255,255,255,0.2)] cursor-not-allowed opacity-50"
              : isFollowing
              ? "bg-[rgba(40,20,20,0.8)] border-[rgba(255,100,100,0.8)] shadow-[0_0_15px_rgba(255,100,100,0.3)]"
              : "bg-[rgba(20,20,40,0.7)] border-[rgba(255,255,255,0.3)] hover:border-[rgba(255,255,255,0.5)]"
          }`}
          aria-label={isFollowing ? "Stop Following" : "Follow Selected Object"}
          title={disabled ? "Select an object to follow" : isFollowing ? "Stop Following" : "Follow Selected Object"}
        >
          <div className="relative w-6 h-6 md:w-7 md:h-7">
            {/* Camera Icon with Follow Indicator */}
            <svg
              className={`w-full h-full transition-colors ${
                isFollowing ? "text-[rgba(255,100,100,1)]" : "text-white"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {/* Camera Body */}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
              />
              {/* Camera Lens */}
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            
            {/* Following Indicator - Animated Pulse */}
            {isFollowing && (
              <div className="absolute -top-1 -right-1 w-3 h-3 md:w-3.5 md:h-3.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[rgba(255,100,100,0.7)] animate-ping"></span>
                <span className="relative inline-flex rounded-full h-full w-full bg-[rgba(255,100,100,1)]"></span>
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Status Text */}
      {!disabled && (
        <div
          className={`text-xs px-3 py-1 rounded-full backdrop-blur-sm transition-all duration-200 ${
            isFollowing
              ? "bg-[rgba(40,20,20,0.8)] text-[rgba(255,100,100,1)] border border-[rgba(255,100,100,0.3)]"
              : "bg-[rgba(20,20,40,0.7)] text-white border border-[rgba(255,255,255,0.2)]"
          }`}
        >
          {isFollowing ? "📹 Following" : "Click to follow"}
        </div>
      )}
    </div>
  );
}
