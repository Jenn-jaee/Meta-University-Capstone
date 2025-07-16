// Custom LRU Cache Implementation
// A simple in-memory cache with LRU eviction policy and TTL support

class CustomCache {
  constructor(options = {}) {
    this.maxSize = options.max || 1000;
    this.defaultTTL = options.ttl || 300000; // 5 minutes in milliseconds
    this.cache = new Map();
    this.accessOrder = []; // Track LRU order
  }

  // Get a value from the cache
  // Returns the cached value or undefined if not found/expired
  get(key) {
    const item = this.cache.get(key);
    if (!item) {
      return undefined;
    }

    // Check if the item has expired
    if (item.expiry && Date.now() > item.expiry) {
      this.delete(key);
      return undefined;
    }

    // Update access order for LRU
    this._updateAccessOrder(key);
    return item.value;
  }

  // Set a value in the cache with optional TTL
  set(key, value, ttl = this.defaultTTL) {
    // Evict if at capacity and this is a new key
    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this._evictLRU();
    }

    const expiry = ttl ? Date.now() + ttl : null;
    this.cache.set(key, { value, expiry });
    this._updateAccessOrder(key);
    return true;
  }

  // Delete a value from the cache
  // Supports wildcard deletion with * at the end of key
  delete(key) {
    // Support for wildcard deletion (e.g., "feed:123:cursor:*")
    if (key.endsWith('*')) {
      const prefix = key.slice(0, -1);
      let deleted = false;

      for (const cacheKey of this.cache.keys()) {
        if (cacheKey.startsWith(prefix)) {
          this._removeFromAccessOrder(cacheKey);
          this.cache.delete(cacheKey);
          deleted = true;
        }
      }

      return deleted;
    }

    // Standard key deletion
    const deleted = this.cache.delete(key);
    if (deleted) {
      this._removeFromAccessOrder(key);
    }
    return deleted;
  }

  // Clear the entire cache
  clear() {
    this.cache.clear();
    this.accessOrder = [];
  }

  // Get the current size of the cache
  size() {
    return this.cache.size;
  }

  // Update the access order for LRU tracking
  _updateAccessOrder(key) {
    this._removeFromAccessOrder(key);
    this.accessOrder.push(key);
  }

  // Remove a key from the access order array
  _removeFromAccessOrder(key) {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
  }

  // Evict the least recently used item
  _evictLRU() {
    if (this.accessOrder.length > 0) {
      const oldest = this.accessOrder.shift();
      this.cache.delete(oldest);
    }
  }
}

// Export a singleton instance with desired configuration
module.exports = new CustomCache({
  max: 1000, // Maximum number of items in cache
  ttl: 300000 // 5 minutes TTL for each entry
});
