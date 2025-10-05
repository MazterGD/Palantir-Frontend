import { OrbitElements } from "../components/three/orbitGenerator";
import { saveToCache, loadFromCache } from './cacheUtils';

export const J2000_EPOCH = 2451545.0;

interface AsteroidData extends OrbitElements {
  diameter: number;
  color: string;
}



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
    throw new Error('Failed to fetch asteroid names from API');
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
    throw new Error(`Failed to fetch details for asteroid: ${asteroidName}`);
  }
}