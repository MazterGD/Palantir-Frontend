"use client";

import { useCallback } from "react";
import styles from "./ControlPanel.module.css";

interface ControlPanelProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
}

export default function ControlPanel({ onZoomIn, onZoomOut, onResetView }: ControlPanelProps) {
  return (
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
      <button 
        className={styles.controlButton} 
        onClick={onResetView}
        aria-label="Reset View"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path fill="none" d="M0 0h24v24H0z" />
          <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm1-8h4v2h-6V7h2v5z" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}