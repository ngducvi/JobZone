const NodeCache = require('node-cache');

class CacheService {
  /**
   * Initialize NodeCache with custom options.
   * @param {object} options - NodeCache configuration.
   */
  constructor(options = {}) {
    this.cache = new NodeCache({
      stdTTL: options.stdTTL || 60, // Default TTL: 60 seconds
      checkperiod: options.checkperiod || 120, // Cache cleaning period
      useClones: options.useClones || false,
      ...options,
    });
  }

  /**
   * Set a value in the cache.
   * @param {string} key - Cache key.
   * @param {any} value - Cache value.
   * @param {number} ttl - Time-to-live for the cache in seconds (optional).
   * @returns {boolean} - Whether the value was set successfully.
   */
  set(key, value, ttl = 0) {
    return this.cache.set(key, value, ttl);
  }

  /**
   * Get a value from the cache.
   * @param {string} key - Cache key.
   * @returns {any} - Cached value or `undefined` if not found.
   */
  get(key) {
    return this.cache.get(key);
  }

  /**
   * Delete a value from the cache.
   * @param {string} key - Cache key.
   * @returns {number} - Number of deleted entries.
   */
  delete(key) {
    return this.cache.del(key);
  }

  /**
   * Check if a key exists in the cache.
   * @param {string} key - Cache key.
   * @returns {boolean} - Whether the key exists.
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Clear all entries from the cache.
   * @returns {void}
   */
  clear() {
    this.cache.flushAll();
  }

  /**
   * Get statistics about the cache.
   * @returns {object} - Cache statistics.
   */
  stats() {
    return this.cache.getStats();
  }
}

module.exports = new CacheService();
