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
  onZoomChange
}: ControlPanelProps) {
  
  const [isDragging, setIsDragging] = useState(false);
  
  // Handle slider value change
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onZoomChange(Number(e.target.value));
  };
  
  return (
    <>
      {/* Main zoom controls on the right middle */}
      <div className="absolute top-1/2 right-5 flex flex-col gap-2 z-10 items-center -translate-y-1/2">
        <button 
          className="w-[50px] h-[50px] rounded-full bg-[rgba(20,20,40,0.7)] border-2 border-[rgba(255,255,255,0.3)] text-white cursor-pointer flex items-center justify-center transition-all duration-200 ease-in-out shadow-md backdrop-blur-sm hover:bg-[rgba(30,30,60,0.8)] hover:border-[rgba(255,255,255,0.5)] active:translate-y-0" 
          onClick={onZoomIn}
          aria-label="Zoom In"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M18 13h-5v5h-2v-5H6v-2h5V6h2v5h5v2z" fill="currentColor" />
          </svg>
        </button>
        
        <div className="relative w-[40px] h-[180px] flex items-center justify-center bg-[rgba(20,20,40,0.7)] border-2 border-[rgba(255,255,255,0.3)] rounded-[20px] py-2.5 my-1.5 shadow-md backdrop-blur-sm">
          <input
            type="range"
            min="0"
            max="100"
            value={zoomLevel}
            onChange={handleSliderChange}
            className="appearance-none w-[180px] h-1 bg-transparent cursor-pointer relative z-20 rotate-90 origin-center m-0 pointer-events-auto slate-500"
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            aria-label="Zoom Level"
          />
          <div className="absolute left-1/2 top-[15px] bottom-[15px] w-[6px] bg-[rgba(255,255,255,0.2)] rounded-[3px] -translate-x-1/2 z-10 shadow-inner">
            <div 
              className="absolute bottom-0 left-0 w-full rounded-sm bg-gradient-to-t from-[rgba(255, 100, 100, 0.5)] to-[rgb(100,150,255)]" 
              data-height={zoomLevel}
            ></div>
          </div>
        </div>
        
        <button 
          className="w-[50px] h-[50px] rounded-full bg-[rgba(20,20,40,0.7)] border-2 border-[rgba(255,255,255,0.3)] text-white cursor-pointer flex items-center justify-center shadow-md backdrop-blur-sm hover:bg-[rgba(30,30,60,0.8)] hover:border-[rgba(255,255,255,0.5)] active:translate-y-0" 
          onClick={onZoomOut}
          aria-label="Zoom Out"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M18 13H6v-2h12v2z" fill="currentColor" />
          </svg>
        </button>
      </div>
      
      {/* Reset view button at the bottom right */}
      <div className="absolute bottom-5 right-5 z-10">
        <button 
          className="m-0"
          onClick={onResetView}
          aria-label="Reset View"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm1-8h4v2h-6V7h2v5z" fill="currentColor" />
          </svg>
        </button>
      </div>
    </>
  );
}