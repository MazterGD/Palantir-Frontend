"use client";

import { useState, useCallback, useEffect } from "react";

interface ControlPanelProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  zoomLevel: number;
  onZoomChange: (value: number) => void;
}

export default function ControlPanel({
  onZoomIn,
  onZoomOut,
  onResetView,
  zoomLevel,
  onZoomChange,
}: ControlPanelProps) {
  const [isDragging, setIsDragging] = useState(false);

  // Logarithmic scale constants
  const MIN_LOG = Math.log(1); // log(1) = 0
  const MAX_LOG = Math.log(1001); // log(1001) for 0-1000 range
  
  // Convert linear slider value (0-1000) to logarithmic position for display
  const linearToLog = (value: number): number => {
    // Add 1 to avoid log(0), then normalize
    const logValue = Math.log(value + 1);
    return ((logValue - MIN_LOG) / (MAX_LOG - MIN_LOG)) * 1000;
  };

  // Convert logarithmic slider position to linear value
  const logToLinear = (logPosition: number): number => {
    // Normalize position back to log range
    const normalizedLog = (logPosition / 1000) * (MAX_LOG - MIN_LOG) + MIN_LOG;
    return Math.round(Math.exp(normalizedLog) - 1);
  };

  // Handle slider value change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const logPosition = Number(e.target.value);
    const linearValue = logToLinear(logPosition);
    onZoomChange(linearValue);
  };
  
  // Get logarithmic position for the current zoom level
  const logPosition = linearToLog(zoomLevel);

  return (
    <>
      {/* Main zoom controls on the right middle */}
      <div className="absolute top-1/2 right-2 md:right-5 flex flex-col gap-1.5 md:gap-2 z-10 items-center -translate-y-1/2">
        <button
          className="w-[40px] h-[40px] md:w-[50px] md:h-[50px] rounded-full bg-[rgba(20,20,40,0.7)] border-2 border-[rgba(255,255,255,0.3)] text-white cursor-pointer flex items-center justify-center transition-all duration-200 ease-in-out shadow-md backdrop-blur-sm hover:bg-[rgba(30,30,60,0.8)] hover:border-[rgba(255,255,255,0.5)] active:translate-y-0"
          onClick={onZoomIn}
          aria-label="Zoom In"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            className="md:w-6 md:h-6"
          >
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M18 13h-5v5h-2v-5H6v-2h5V6h2v5h5v2z" fill="currentColor" />
          </svg>
        </button>

        <div className="relative w-[35px] h-[140px] md:w-[40px] md:h-[180px] flex items-center justify-center bg-[rgba(20,20,40,0.7)] border-2 border-[rgba(255,255,255,0.3)] rounded-[20px] py-2.5 my-1 md:my-1.5 shadow-md backdrop-blur-sm">
          <input
            type="range"
            min="0"
            max="1000"
            value={logPosition}
            onChange={handleSliderChange}
            className="appearance-none w-[140px] md:w-[180px] h-1 bg-transparent cursor-pointer relative z-20 rotate-90 origin-center m-0 pointer-events-auto bg-slate-500"
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            onTouchStart={() => setIsDragging(true)}
            onTouchEnd={() => setIsDragging(false)}
            aria-label="Zoom Level"
          />
          <div className="absolute left-1/2 top-[15px] bottom-[15px] w-[5px] md:w-[6px] bg-[rgba(255,255,255,0.2)] rounded-[3px] -translate-x-1/2 z-10 shadow-inner">
            <div
              className="absolute bottom-0 left-0 w-full rounded-sm bg-[rgba(255, 100, 100, 0.5)]"
              style={{
                height: `${Math.min(100, (logPosition / 1000) * 100)}%`
              }}
            ></div>
          </div>
        </div>

        <button
          className="w-[40px] h-[40px] md:w-[50px] md:h-[50px] rounded-full bg-[rgba(20,20,40,0.7)] border-2 border-[rgba(255,255,255,0.3)] text-white cursor-pointer flex items-center justify-center shadow-md backdrop-blur-sm hover:bg-[rgba(30,30,60,0.8)] hover:border-[rgba(255,255,255,0.5)] active:translate-y-0"
          onClick={onZoomOut}
          aria-label="Zoom Out"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            className="md:w-6 md:h-6"
          >
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M18 13H6v-2h12v2z" fill="currentColor" />
          </svg>
        </button>
      </div>

      {/* Reset view button at the bottom right */}
      <div className="absolute bottom-4 right-2 md:bottom-5 md:right-5 z-10">
        <button className="m-0 w-8 h-8 md:w-auto md:h-auto flex items-center justify-center" onClick={onResetView} aria-label="Reset View">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="20"
            height="20"
            className="md:w-6 md:h-6"
          >
            <path fill="none" d="M0 0h24v24H0z" />
            <path
              d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm1-8h4v2h-6V7h2v5z"
              fill="currentColor"
            />
          </svg>
        </button>
      </div>
    </>
  );
}
