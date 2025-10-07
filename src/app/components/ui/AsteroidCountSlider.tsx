"use client";

import { useState, useCallback, useEffect } from "react";

interface AsteroidCountSliderProps {
  asteroidCount: number;
  onAsteroidCountChange: (value: number) => void;
}

export default function AsteroidCountSlider({
  asteroidCount,
  onAsteroidCountChange,
}: AsteroidCountSliderProps) {
  const [localValue, setLocalValue] = useState(asteroidCount);
  const [isDragging, setIsDragging] = useState(false);

  // Update local value when prop changes (from external updates)
  useEffect(() => {
    setLocalValue(asteroidCount);
  }, [asteroidCount]);

  // Debounced update to parent
  const debouncedUpdate = useCallback(
    debounce((value: number) => {
      onAsteroidCountChange(value);
    }, 500), // Wait 500ms after drag ends
    [onAsteroidCountChange]
  );

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    setLocalValue(value);
  }, []);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    // Update parent with final value when dragging ends
    debouncedUpdate(localValue);
  }, [localValue, debouncedUpdate]);

  return (
    <div className="absolute bottom-32 right-5 flex flex-col gap-2 z-10 items-center">
      <div className="text-white text-xs bg-[rgba(20,20,40,0.7)] border border-[rgba(255,255,255,0.3)] rounded-lg px-3 py-1 backdrop-blur-sm">
        {localValue} Asteroids {isDragging && "(Dragging)"}
      </div>

      <div className="relative flex items-center justify-center bg-[rgba(20,20,40,0.7)] border-2 border-[rgba(255,255,255,0.3)] rounded-[20px] py-4 my-1.5 shadow-md backdrop-blur-sm w-[200px] px-4">
        <div className="absolute left-4 right-4 h-[6px] bg-[rgba(255,255,255,0.2)] rounded-[3px] z-10 shadow-inner">
          <div 
            className="absolute left-0 top-0 h-full rounded-sm bg-gradient-to-r from-cyan-400/80 to-purple-500/80"
            style={{ width: `${(localValue / 5000) * 100}%` }}
          ></div>
        </div>
        
        <input
          type="range"
          min="1"
          max="5000"
          value={localValue}
          onChange={handleSliderChange}
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
          className="w-full h-2 appearance-none rounded-lg outline-none cursor-pointer relative z-20 bg-transparent"
          aria-label="Asteroid Count"
          style={{ 
            background: "transparent"
          }}
        />
        
        <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-xs text-white/70">
          <span>1</span>
          <span>5000</span>
        </div>
      </div>
    </div>
  );
}

// Debounce utility function (add this at the bottom of the file or import it)
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  return function (...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
