/**
 * Performance monitoring utility for React components and Three.js rendering
 * Tracks render counts, render times, and frame rates
 */

import React from 'react';

interface RenderMetrics {
  count: number;
  lastRenderTime: number;
  totalRenderTime: number;
  averageRenderTime: number;
}

class PerformanceMonitor {
  private renderMetrics: Map<string, RenderMetrics> = new Map();
  private frameCount: number = 0;
  private lastFrameTime: number = performance.now();
  private fps: number = 60;
  private fpsHistory: number[] = [];
  private readonly FPS_HISTORY_SIZE = 60;

  /**
   * Track a component render
   */
  trackRender(componentName: string, renderTime: number = 0): void {
    const existing = this.renderMetrics.get(componentName);
    
    if (existing) {
      const newTotalTime = existing.totalRenderTime + renderTime;
      const newCount = existing.count + 1;
      
      this.renderMetrics.set(componentName, {
        count: newCount,
        lastRenderTime: renderTime,
        totalRenderTime: newTotalTime,
        averageRenderTime: newTotalTime / newCount
      });
    } else {
      this.renderMetrics.set(componentName, {
        count: 1,
        lastRenderTime: renderTime,
        totalRenderTime: renderTime,
        averageRenderTime: renderTime
      });
    }
  }

  /**
   * Track a frame in the animation loop
   */
  trackFrame(): number {
    this.frameCount++;
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastFrameTime;
    
    if (deltaTime > 0) {
      this.fps = 1000 / deltaTime;
      
      // Keep FPS history for smoothing
      this.fpsHistory.push(this.fps);
      if (this.fpsHistory.length > this.FPS_HISTORY_SIZE) {
        this.fpsHistory.shift();
      }
    }
    
    this.lastFrameTime = currentTime;
    return this.fps;
  }

  /**
   * Get average FPS from recent frames
   */
  getAverageFPS(): number {
    if (this.fpsHistory.length === 0) return 60;
    
    const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.fpsHistory.length);
  }

  /**
   * Get current FPS
   */
  getCurrentFPS(): number {
    return Math.round(this.fps);
  }

  /**
   * Get render statistics for a component
   */
  getComponentMetrics(componentName: string): RenderMetrics | null {
    return this.renderMetrics.get(componentName) || null;
  }

  /**
   * Get all render statistics
   */
  getAllMetrics(): Map<string, RenderMetrics> {
    return new Map(this.renderMetrics);
  }

  /**
   * Get total frame count
   */
  getTotalFrames(): number {
    return this.frameCount;
  }

  /**
   * Reset all metrics
   */
  reset(): void {
    this.renderMetrics.clear();
    this.frameCount = 0;
    this.fpsHistory = [];
    this.lastFrameTime = performance.now();
    this.fps = 60;
  }

  /**
   * Log performance summary to console
   */
  logSummary(): void {
    console.group('🔍 Performance Summary');
    console.log(`FPS: ${this.getCurrentFPS()} (avg: ${this.getAverageFPS()})`);
    console.log(`Total Frames: ${this.frameCount}`);
    console.log('\n📊 Component Renders:');
    
    const sortedMetrics = Array.from(this.renderMetrics.entries())
      .sort((a, b) => b[1].count - a[1].count);
    
    sortedMetrics.forEach(([name, metrics]) => {
      console.log(`  ${name}:`);
      console.log(`    Renders: ${metrics.count}`);
      console.log(`    Avg Time: ${metrics.averageRenderTime.toFixed(2)}ms`);
      console.log(`    Last Time: ${metrics.lastRenderTime.toFixed(2)}ms`);
    });
    
    console.groupEnd();
  }

  /**
   * Check if performance is below acceptable threshold
   */
  isPerformancePoor(fpsThreshold: number = 30): boolean {
    return this.getAverageFPS() < fpsThreshold;
  }

  /**
   * Get performance grade (A-F)
   */
  getPerformanceGrade(): string {
    const avgFps = this.getAverageFPS();
    
    if (avgFps >= 55) return 'A';
    if (avgFps >= 45) return 'B';
    if (avgFps >= 35) return 'C';
    if (avgFps >= 25) return 'D';
    return 'F';
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook to track component renders
 */
export function useRenderTracking(componentName: string) {
  if (process.env.NODE_ENV === 'development') {
    const startTime = performance.now();
    
    // Track on unmount (end of render)
    setTimeout(() => {
      const renderTime = performance.now() - startTime;
      performanceMonitor.trackRender(componentName, renderTime);
    }, 0);
  }
}

/**
 * HOC to track component renders
 */
export function withRenderTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName?: string
): React.ComponentType<P> {
  const name = componentName || Component.displayName || Component.name || 'Unknown';
  
  return function TrackedComponent(props: P) {
    useRenderTracking(name);
    return <Component {...props} />;
  };
}

/**
 * Frame rate limiter for Three.js animations
 */
export class FrameRateLimiter {
  private lastFrameTime: number = 0;
  private targetFPS: number;
  private frameInterval: number;

  constructor(targetFPS: number = 60) {
    this.targetFPS = targetFPS;
    this.frameInterval = 1000 / targetFPS;
  }

  /**
   * Check if enough time has passed to render the next frame
   */
  shouldRenderFrame(currentTime: number): boolean {
    if (currentTime - this.lastFrameTime >= this.frameInterval) {
      this.lastFrameTime = currentTime;
      return true;
    }
    return false;
  }

  /**
   * Update target FPS
   */
  setTargetFPS(fps: number): void {
    this.targetFPS = fps;
    this.frameInterval = 1000 / fps;
  }

  /**
   * Get current target FPS
   */
  getTargetFPS(): number {
    return this.targetFPS;
  }

  /**
   * Reset the limiter
   */
  reset(): void {
    this.lastFrameTime = 0;
  }
}

/**
 * Adaptive frame rate limiter that adjusts based on performance
 */
export class AdaptiveFrameRateLimiter extends FrameRateLimiter {
  private performanceCheckInterval: number = 5000; // Check every 5 seconds
  private lastPerformanceCheck: number = 0;
  private minFPS: number = 30;
  private maxFPS: number = 60;

  constructor(targetFPS: number = 60, minFPS: number = 30, maxFPS: number = 60) {
    super(targetFPS);
    this.minFPS = minFPS;
    this.maxFPS = maxFPS;
  }

  /**
   * Automatically adjust target FPS based on current performance
   */
  adjustBasedOnPerformance(currentTime: number): void {
    if (currentTime - this.lastPerformanceCheck < this.performanceCheckInterval) {
      return;
    }

    this.lastPerformanceCheck = currentTime;
    const currentFPS = performanceMonitor.getAverageFPS();
    
    // If performance is poor, reduce target FPS
    if (currentFPS < this.getTargetFPS() * 0.8) {
      const newTargetFPS = Math.max(this.minFPS, this.getTargetFPS() - 5);
      this.setTargetFPS(newTargetFPS);
      console.log(`⚠️ Reduced target FPS to ${newTargetFPS} due to performance`);
    }
    // If performance is good, try increasing FPS
    else if (currentFPS > this.getTargetFPS() * 0.95 && this.getTargetFPS() < this.maxFPS) {
      const newTargetFPS = Math.min(this.maxFPS, this.getTargetFPS() + 5);
      this.setTargetFPS(newTargetFPS);
      console.log(`✅ Increased target FPS to ${newTargetFPS}`);
    }
  }
}
