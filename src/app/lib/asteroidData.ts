import { OrbitElements } from "../components/three/orbitGenerator";
import { FALLBACK_ASTEROID_NAMES, generateFallbackAsteroidDetails } from './apiUtils';
import { saveToCache, loadFromCache } from './cacheUtils';

export const J2000_EPOCH = 2451545.0;

interface AsteroidData extends OrbitElements {
  diameter: number;
  color: string;
}

const createAsteroid = (
  data: Omit<AsteroidData, "epoch" | "perihelionTime"> & {
    perihelionTime?: number;
  },
): AsteroidData => ({
  ...data,
  epoch: J2000_EPOCH,
  perihelionTime: data.perihelionTime ?? J2000_EPOCH,
});

// Data for some notable asteroids in the asteroid belt
export const ASTEROIDS = {
  ceres: createAsteroid({
    semiMajorAxis: 2.7691,
    eccentricity: 0.0758,
    inclination: 10.593,
    ascendingNode: 80.3932,
    perihelionArgument: 72.5898,
    orbitalPeriod: 1681.63,
    meanAnomaly: 95.9895,
    meanMotion: 0.2140,
    diameter: 939,
    color: "#888888"
  }),
  vesta: createAsteroid({
    semiMajorAxis: 2.3615,
    eccentricity: 0.0887,
    inclination: 7.1402,
    ascendingNode: 103.8570,
    perihelionArgument: 151.1985,
    orbitalPeriod: 1325.75,
    meanAnomaly: 103.4558,
    meanMotion: 0.2715,
    diameter: 525,
    color: "#A69880"
  }),
  pallas: createAsteroid({
    semiMajorAxis: 2.7721,
    eccentricity: 0.2310,
    inclination: 34.8366,
    ascendingNode: 173.0962,
    perihelionArgument: 309.9303,
    orbitalPeriod: 1685.08,
    meanAnomaly: 77.3863,
    meanMotion: 0.2136,
    diameter: 512,
    color: "#9A9A9A"
  }),
  hygiea: createAsteroid({
    semiMajorAxis: 3.1428,
    eccentricity: 0.1168,
    inclination: 3.8398,
    ascendingNode: 283.2287,
    perihelionArgument: 312.2087,
    orbitalPeriod: 2033.94,
    meanAnomaly: 306.5513,
    meanMotion: 0.1770,
    diameter: 430,
    color: "#7A7A7A"
  }),
};

export const getAsteroid = (name: keyof typeof ASTEROIDS) => ASTEROIDS[name];

// Texture paths for asteroids
export const ASTEROID_TEXTURES: Record<string, { color: string }> = {
  ceres: { color: "/textures/Asteroids/ceres.jpg" },
  vesta: { color: "/textures/Asteroids/vesta.jpg" },
  pallas: { color: "/textures/Asteroids/pallas.jpg" },
  hygiea: { color: "/textures/Asteroids/hygiea.jpg" },
};

// Extended interface for detailed asteroid information for API responses
export interface AsteroidDetailedInfo {
  name: string;
  diameter: number; // in km
  rotation_period?: number; // in hours
  orbit_period?: number; // in Earth days
  distance_from_sun?: number; // in AU (Astronomical Units)
  composition?: string;
  discovery_date?: string;
  discovered_by?: string;
  classification?: string;
}

// Minimal fallback data structure - only used in case of network errors
// Not populated with mock values as we're now relying solely on the API
export const FALLBACK_ASTEROID_DATA: AsteroidDetailedInfo = {
  name: "Unknown Asteroid",
  diameter: 10,
  classification: "Could not retrieve data from API"
};

// API base URL - can be configured based on environment
// Use internal Next.js API routes to avoid CORS issues
const API_BASE_URL = '/api/asteroids';

// Default timeout for API requests
const DEFAULT_TIMEOUT = 15000; // Increased timeout for render.com free tier instances

// Max retry attempts for API requests
const MAX_RETRIES = 2;

// Helper function to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof window.document !== 'undefined';

/**
 * Retries a fetch request a specified number of times with exponential backoff
 */
async function fetchWithRetry<T>(
  url: string, 
  options: RequestInit = {}, 
  retries = MAX_RETRIES, 
  timeout = DEFAULT_TIMEOUT
): Promise<T> {
  let lastError: Error = new Error("Failed to fetch");
  
  const fetchOptions = {
    ...options,
    headers: {
      ...options.headers,
      'Accept': 'application/json',
    }
  };
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
      if (attempt > 0) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`Retry attempt ${attempt} after ${delay}ms delay...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
      
      return await response.json() as T;
    } catch (error) {
      clearTimeout(timeoutId);
      lastError = error as Error;
      
      console.warn(`Fetch attempt ${attempt + 1} failed:`, lastError.message);
      
      if (attempt >= retries || (error instanceof DOMException && error.name === 'AbortError')) {
        break;
      }
    }
  }
  
  throw lastError;
}

// Helper to extract name from various formats
const extractName = (item: any): string => 
  typeof item === 'string' ? item : item.name || '';

// Function to handle asteroid response regardless of source
function handleAsteroidResponse(data: any, sourceUrl: string): { names: string[] } {
  const extractNames = (items: any[]) => items.map(extractName).filter(Boolean);
  
  let asteroidNames: string[] = [];
  
  if (Array.isArray(data)) {
    asteroidNames = extractNames(data);
  } else if (data && typeof data === 'object') {
    // Try different possible data structures
    const possibleArrays = [
      data.names,
      data.data,
      data.asteroids,
      data.near_earth_objects && Object.values(data.near_earth_objects).flat()
    ];
    
    for (const arr of possibleArrays) {
      if (Array.isArray(arr) && arr.length > 0) {
        asteroidNames = extractNames(arr);
        break;
      }
    }
  }
  
  if (asteroidNames.length > 0) {
    console.log(`Retrieved ${asteroidNames.length} asteroid names from ${sourceUrl}`);
    return { names: asteroidNames };
  }
  
  throw new Error('Invalid or empty asteroid data');
}

// Function to fetch asteroid names from API
export async function fetchAsteroidNames(): Promise<{ names: string[] }> {
  const CACHE_KEY = 'asteroid_names';
  
  // Try to load from cache first
  const cachedData = loadFromCache<{ names: string[] }>(CACHE_KEY, {
    ttl: 24 * 60 * 60 * 1000, // 24 hours
  });
  
  if (cachedData && cachedData.names && cachedData.names.length > 0) {
    console.log(`✓ Loaded ${cachedData.names.length} asteroid names from cache`);
    return cachedData;
  }
  
  // Network status check
  if (isBrowser && !navigator.onLine) {
    console.warn('Network status check: Device appears to be offline');
  }
  
  try {
    // Use internal Next.js API route (no CORS issues)
    const url = `${API_BASE_URL}/names`;
    console.log(`Fetching asteroid names from: ${url}`);
    
    const data = await fetchWithRetry<any>(url);
    const result = handleAsteroidResponse(data, API_BASE_URL);
    
    // Save successful result to cache
    if (result.names && result.names.length > 0) {
      saveToCache(CACHE_KEY, result);
      console.log(`✓ Cached ${result.names.length} asteroid names`);
    }
    
    return result;
  } catch (error) {
    console.error(`Failed to fetch asteroid names:`, error);
    console.warn('Using fallback asteroid data');
    return { names: FALLBACK_ASTEROID_NAMES };
  }
}

// Fetch detailed data for a specific asteroid
export async function fetchAsteroidDetails(asteroidName: string): Promise<AsteroidDetailedInfo> {
  const CACHE_KEY = `asteroid_details_${asteroidName}`;
  
  // Try to load from cache first
  const cachedData = loadFromCache<AsteroidDetailedInfo>(CACHE_KEY, {
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 days - details change less frequently
  });
  
  if (cachedData) {
    console.log(`✓ Loaded details for ${asteroidName} from cache`);
    return cachedData;
  }
  
  try {
    // Use internal Next.js API route (no CORS issues)
    const url = `${API_BASE_URL}/details/${encodeURIComponent(asteroidName)}`;
    console.log(`Fetching asteroid details for ${asteroidName} from: ${url}`);
    
    const data = await fetchWithRetry<any>(url);
    
    if (data && typeof data === 'object') {
      const result: AsteroidDetailedInfo = {
        name: data.name || data.asteroid_name || asteroidName,
        diameter: data.diameter || data.size || (data.radius ? data.radius * 2 : 10),
        rotation_period: data.rotation_period || data.rotation || data.rotationPeriod,
        orbit_period: data.orbit_period || data.orbital_period || data.orbitPeriod,
        distance_from_sun: data.distance_from_sun || data.distance || data.semi_major_axis,
        composition: data.composition || data.composition_type || data.spectral_type,
        discovery_date: data.discovery_date || data.discovered,
        discovered_by: data.discovered_by || data.discoverer,
        classification: data.classification || data.class || data.type
      };
      
      // Save successful result to cache
      saveToCache(CACHE_KEY, result);
      console.log(`✓ Cached details for ${asteroidName}`);
      
      return result;
    }
    
    throw new Error('Invalid asteroid data format');
  } catch (error) {
    console.error(`Failed to fetch asteroid details for ${asteroidName}:`, error);
    return generateFallbackAsteroidDetails(asteroidName);
  }
}