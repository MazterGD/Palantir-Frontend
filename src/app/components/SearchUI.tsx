"use client";

import { useState, useEffect, useRef } from "react";
import { PLANETS } from "../lib/planetData";

// Base celestial bodies data - only planets from our solar system (no hardcoded asteroids)
const BASE_CELESTIAL_BODIES = [
  // Planets from our solar system
  ...Object.keys(PLANETS).map(key => ({
    id: key,
    name: key.charAt(0).toUpperCase() + key.slice(1),
    type: "planet"
  })),
];

interface SearchUIProps {
  onSelectBody: (bodyId: string, type: string) => Promise<void>;
}

/**
 * SearchUI - Complete search component with visibility management
 * Includes search button, panel, keyboard shortcuts, and search functionality
 */

const SearchUI: React.FC<SearchUIProps> = ({ onSelectBody }) => {
  // Visibility state
  const [showSearchUI, setShowSearchUI] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Array<{ id: string, name: string, type: string }>>([]); 
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Data state
  const [allCelestialBodies, setAllCelestialBodies] = useState<Array<{ id: string, name: string, type: string }>>(BASE_CELESTIAL_BODIES);
  const [isLoadingAsteroids, setIsLoadingAsteroids] = useState(false);
  
  // Load asteroid data exclusively from API - no mock data fallbacks
  useEffect(() => {
    const loadAsteroidData = async () => {
      setIsLoadingAsteroids(true);
      
      try {
        console.log('Starting to fetch asteroid data...');
        
        // Check network status first
        if (!navigator.onLine) {
          console.error('No internet connection detected');
          throw new Error('Your device appears to be offline. Please check your internet connection.');
        }
        
        // Import the fetchAsteroidNames function
        const { fetchAsteroidNames } = await import('../lib/asteroidData');
        
        // Fetch asteroid names from the API (or cache)
        console.log('Calling fetchAsteroidNames()...');
        const result = await fetchAsteroidNames();
        
        if (!result.names || result.names.length === 0) {
          throw new Error('No asteroid names returned from API');
        }
        
        // Create asteroid objects from the fetched data
        const asteroidObjects = result.names.map((name: string) => ({
          id: `asteroid_${name.replace(/[^a-zA-Z0-9]/g, '_')}`,
          name,
          type: 'asteroid'
        }));
        
        // Update state with all celestial bodies
        setAllCelestialBodies([...BASE_CELESTIAL_BODIES, ...asteroidObjects]);
        
        console.log(`Loaded ${asteroidObjects.length} asteroids successfully`);      } catch (error) {
        console.error('Error loading asteroid data from API:', error);
        
        // Still update the state with whatever celestial bodies we have
        // This ensures we at least show the planets and moons even if asteroid data failed
        setAllCelestialBodies([...BASE_CELESTIAL_BODIES]);
        
        // Show a small non-disruptive error message to the user
        const errorMessage = error instanceof Error ? error.message : 'Failed to load asteroid data';
        
        // Only add an error indicator rather than a full alert
        if (document && !document.getElementById('asteroid-error-indicator')) {
          const errorIndicator = document.createElement('div');
          errorIndicator.id = 'asteroid-error-indicator';
          errorIndicator.className = 'absolute top-2.5 right-[50px] bg-red-600/80 text-white py-1.5 px-2 rounded text-xs z-[9999]';
          errorIndicator.title = errorMessage;
          errorIndicator.textContent = '!'; // Just a small indicator
          
          document.body.appendChild(errorIndicator);
          
          // Remove after 5 seconds
          setTimeout(() => {
            if (errorIndicator.parentNode) {
              errorIndicator.parentNode.removeChild(errorIndicator);
            }
          }, 5000);
        }
      } finally {
        setIsLoadingAsteroids(false);
      }
    };
    
    loadAsteroidData();
  }, []);
  
  // Filter suggestions based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSuggestions([]);
      return;
    }
    
    // Filter bodies and prioritize asteroids
    const filtered = allCelestialBodies.filter((body: { id: string, name: string, type: string }) => 
      body.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      body.type.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    // Separate asteroids from other bodies
    const asteroids = filtered.filter(body => body.type === 'asteroid');
    const others = filtered.filter(body => body.type !== 'asteroid');
    
    // Put asteroids first in the results, then other celestial bodies
    const filteredSuggestions = [...asteroids, ...others].slice(0, 10); // Limit to top 10 results
    
    setSuggestions(filteredSuggestions);
    setSelectedIndex(filteredSuggestions.length > 0 ? 0 : -1);
  }, [searchQuery, allCelestialBodies]);
  
  // Focus on input when component is mounted
  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  }, []);
  
  // Handle keyboard shortcuts (Spacebar to open, Escape to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open search UI when spacebar is pressed and not in an input field
      if (e.key === " " && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        setShowSearchUI(true);
      }
      
      // Close on escape
      if (e.key === "Escape") {
        setShowSearchUI(false);
        setSearchQuery("");
      }
    };
    
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
  
  // Handle clicks outside the search panel to close it
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showSearchUI && 
          searchContainerRef.current && 
          !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearchUI(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSearchUI]);

  // Focus the search input when the search UI is shown
  useEffect(() => {
    if (showSearchUI) {
      const timeoutId = setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
      
      return () => clearTimeout(timeoutId);
    }
  }, [showSearchUI]);
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      handleSelectBody(suggestions[selectedIndex].id, suggestions[selectedIndex].type);
    }
  };
  
  const handleSelectBody = async (id: string, type: string) => {
    setShowSearchUI(false);
    setSearchQuery("");
    await onSelectBody(id, type);
  };

  // Toggle search UI visibility
  const toggleSearchUI = () => {
    setShowSearchUI(prevState => !prevState);
  };

  return (
    <>
      {/* Search Button */}
      <button 
        onClick={toggleSearchUI}
        className="fixed top-4 right-4 bg-slate-900/75 backdrop-blur border-none rounded-full w-10 h-10 flex items-center justify-center cursor-pointer z-[100] shadow-[0_2px_10px_rgba(0,0,0,0.2)] hover:bg-slate-900/90 transition-colors"
        aria-label="Open search"
      >
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="text-white"
        >
          <path 
            d="M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />
        </svg>
      </button>
      
      {/* Search UI Panel */}
      {showSearchUI && (
        <div ref={searchContainerRef} className="fixed top-0 right-0 p-4 z-[1000] w-full max-w-[400px]">
          <div className={`bg-slate-900/95 backdrop-blur-xl rounded-xl p-4 text-white transition-all duration-300 ${
            searchQuery 
              ? 'border border-white/25 shadow-[0_10px_25px_rgba(0,0,0,0.5),0_0_15px_rgba(66,153,225,0.4)]' 
              : 'border border-white/10 shadow-[0_10px_25px_rgba(0,0,0,0.5)]'
          }`}>
            {/* Search Input */}
            <div className="flex items-center relative">
              <svg 
                className={`absolute left-2.5 w-5 h-5 pointer-events-none transition-colors duration-300 ${
                  searchQuery ? 'text-white/90 animate-pulse' : 'text-white/70'
                }`}
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                ref={inputRef}
                className="search-input w-full py-3 px-4 pl-10 bg-white/10 text-white border-none rounded-lg text-base outline-none placeholder:text-white/50"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search for planets and asteroids..."
                autoFocus
              />
            </div>
            
            {isLoadingAsteroids && (
              <div className="p-2.5 text-center text-gray-500 text-sm">
                Loading data...
              </div>
            )}
            
            {suggestions.length > 0 && (
              <ul className="mt-3 max-h-[300px] overflow-y-auto">
                {suggestions.map((body, index) => (
                  <li 
                    key={body.id}
                    className={`flex justify-between py-2 px-4 rounded-md cursor-pointer transition-colors duration-150 ${
                      index === selectedIndex ? 'bg-white/10' : 'bg-transparent hover:bg-white/5'
                    }`}
                    onClick={() => handleSelectBody(body.id, body.type)}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <span className="font-medium">{body.name}</span>
                    <span className="text-white/50 text-[0.85rem]">{body.type}</span>
                  </li>
                ))}
              </ul>
            )}
            
            {!isLoadingAsteroids && searchQuery.trim() !== "" && suggestions.length === 0 && (
              <div className="p-2.5 text-center text-gray-500 text-sm">
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default SearchUI;