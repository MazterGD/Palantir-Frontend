/**
 * Request deduplication utility
 * Prevents multiple identical requests from being sent simultaneously
 */

type PendingRequest<T> = Promise<T>;

class RequestDeduplicator {
  private pendingRequests: Map<string, PendingRequest<any>> = new Map();

  /**
   * Execute a request with deduplication
   * If the same request is already in flight, return the existing promise
   */
  async dedupe<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
    // Check if there's already a pending request with this key
    if (this.pendingRequests.has(key)) {
      console.log(`🔄 Request deduped: ${key}`);
      return this.pendingRequests.get(key) as Promise<T>;
    }

    // Create a new request
    const requestPromise = requestFn()
      .finally(() => {
        // Clean up after the request completes (success or failure)
        this.pendingRequests.delete(key);
      });

    // Store the pending request
    this.pendingRequests.set(key, requestPromise);

    return requestPromise;
  }

  /**
   * Clear a specific pending request
   */
  clear(key: string): void {
    this.pendingRequests.delete(key);
  }

  /**
   * Clear all pending requests
   */
  clearAll(): void {
    this.pendingRequests.clear();
  }

  /**
   * Get the number of pending requests
   */
  getPendingCount(): number {
    return this.pendingRequests.size;
  }
}

// Export a singleton instance
export const requestDeduplicator = new RequestDeduplicator();

/**
 * Higher-order function for deduplicating fetch requests
 */
export async function deduplicatedFetch<T = any>(
  url: string,
  options?: RequestInit
): Promise<T> {
  const key = `${url}_${JSON.stringify(options || {})}`;
  
  return requestDeduplicator.dedupe(key, async () => {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  });
}
