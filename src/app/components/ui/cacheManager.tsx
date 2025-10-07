// components/ui/cacheManager.tsx
'use client';

import { useState, useEffect } from 'react';
import { 
  getCacheStats, 
  clearAllCache, 
  clearCacheItem, 
  clearExpiredCache 
} from '../../lib/cacheUtils';

export default function CacheManager() {
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalSize: 0,
    entries: [] as Array<{ key: string; age: number; size: number }>
  });

  const refreshStats = () => {
    const newStats = getCacheStats();
    setStats(newStats);
  };

  useEffect(() => {
    if (isOpen) {
      refreshStats();
    }
  }, [isOpen]);

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all cached data?')) {
      clearAllCache();
      refreshStats();
    }
  };

  const handleClearExpired = () => {
    const cleared = clearExpiredCache();
    alert(`Cleared ${cleared} expired cache entries`);
    refreshStats();
  };

  const handleClearItem = (key: string) => {
    if (confirm(`Clear cache for ${key}?`)) {
      clearCacheItem(key);
      refreshStats();
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatAge = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
    return `${Math.floor(seconds / 86400)}d`;
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-all"
        title="Cache Manager"
      >
        <svg 
          className="w-6 h-6" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" 
          />
        </svg>
      </button>

      {/* Cache Manager Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-96 max-h-[600px] flex flex-col border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Cache Manager
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                aria-label="Close cache manager"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                <div className="text-gray-500 dark:text-gray-400">Entries</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {stats.totalEntries}
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 p-2 rounded">
                <div className="text-gray-500 dark:text-gray-400">Size</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {formatBytes(stats.totalSize)}
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex gap-2">
            <button
              onClick={refreshStats}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              Refresh
            </button>
            <button
              onClick={handleClearExpired}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              Clear Expired
            </button>
            <button
              onClick={handleClearAll}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              Clear All
            </button>
          </div>

          {/* Cache Entries List */}
          <div className="flex-1 overflow-y-auto p-4">
            {stats.entries.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                No cache entries
              </div>
            ) : (
              <div className="space-y-2">
                {stats.entries.map((entry, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 dark:bg-gray-700 p-3 rounded hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-mono text-xs text-gray-900 dark:text-white break-all flex-1">
                        {entry.key}
                      </div>
                      <button
                        onClick={() => handleClearItem(entry.key)}
                        className="ml-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                        title="Clear this cache entry"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Age: {formatAge(entry.age)}</span>
                      <span>Size: {formatBytes(entry.size)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
