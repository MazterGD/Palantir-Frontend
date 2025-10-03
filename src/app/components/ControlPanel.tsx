"use client";

import { useState, useCallback, useEffect } from "react";
import styles from "./ControlPanel.module.css";
import "./SliderFill.module.css"; // Import slider fill styles

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
      <div className={styles.controlPanel}>
        <button 
          className={styles.controlButton} 
          onClick={onZoomIn}
          aria-label="Zoom In"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path fill="none" d="M0 0h24v24H0z" />
            <path d="M18 13h-5v5h-2v-5H6v-2h5V6h2v5h5v2z" fill="currentColor" />
          </svg>
        </button>
        
        <div className={styles.sliderContainer}>
          <input
            type="range"
            min="0"
            max="100"
            value={zoomLevel}
            onChange={handleSliderChange}
            className={styles.zoomSlider}
            onMouseDown={() => setIsDragging(true)}
            onMouseUp={() => setIsDragging(false)}
            onMouseLeave={() => setIsDragging(false)}
            aria-label="Zoom Level"
          />
          <div className={styles.sliderTrack}>
            <div 
              className={styles.sliderFill} 
              data-height={zoomLevel}
            ></div>
          </div>
        </div>
        
        <button 
          className={styles.controlButton} 
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
      <div className={styles.resetButtonContainer}>
        <button 
          className={`${styles.controlButton} ${styles.resetButton}`}
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