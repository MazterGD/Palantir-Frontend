"use client";

import { useState, useCallback, useEffect, useRef } from "react";

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
  const sliderRef = useRef<HTMLDivElement>(null);

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
    // Invert the value since we're rotating the slider
    const value = 5001 - parseInt(e.target.value);
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

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLInputElement>) => {
    if (!sliderRef.current) return;
    e.preventDefault();
    const rect = sliderRef.current.getBoundingClientRect();
    const touchY = e.touches[0].clientY;
    const relativeY = Math.max(0, Math.min(1, (touchY - rect.top) / rect.height));
    const value = Math.round(5000 * relativeY) + 1;
    setLocalValue(value);
  }, []);

  return (
    <div className="absolute left-2 md:left-5 top-1/2 -translate-y-[calc(50%+15px)] flex flex-col gap-1.5 md:gap-2 z-10 items-center">
      <div ref={sliderRef} className="relative w-[35px] h-[140px] md:w-[40px] md:h-[180px] flex items-center justify-center bg-[rgba(20,20,40,0.7)] border-2 border-[rgba(255,255,255,0.3)] rounded-[20px] py-2.5 my-1 md:my-1.5 shadow-md backdrop-blur-sm">
        <input
          type="range"
          min="1"
          max="5000"
          value={5001 - localValue}
          onChange={handleSliderChange}
          onMouseDown={handleDragStart}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onTouchStart={handleDragStart}
          onTouchEnd={handleDragEnd}
          onTouchMove={handleTouchMove}
          className="appearance-none w-[140px] md:w-[180px] h-1 bg-transparent cursor-pointer relative z-20 rotate-90 origin-center m-0 pointer-events-auto"
          aria-label="Asteroid Count"
          style={{ 
            background: "transparent",
            accentColor: "white"
          }}
        />
        <div className="absolute left-1/2 top-[15px] bottom-[15px] w-[5px] md:w-[6px] bg-[rgba(255,255,255,0.2)] rounded-[3px] -translate-x-1/2 z-10 shadow-inner">
          <div 
            className="absolute bottom-0 left-0 w-full rounded-sm bg-gradient-to-t from-cyan-400/80 to-purple-500/80"
            style={{ height: `${(localValue / 5000) * 100}%` }}
          ></div>
        </div>
      </div>

      <div className="text-white text-[9px] md:text-[10px] bg-[rgba(20,20,40,0.7)] border border-[rgba(255,255,255,0.3)] rounded-lg px-1.5 md:px-2 py-0.5 md:py-1 backdrop-blur-sm whitespace-nowrap text-center leading-tight">
        {localValue}<br/>ASTEROIDS
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
