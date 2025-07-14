const Redis = require('ioredis');
const config = require('../config');

class CacheService {
  constructor() {
    this.redis = new Redis({
      host: config.redis.host || 'localhost',
      port: config.redis.port || 6379,
      password: config.redis.password,
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      showFriendlyErrorStack: true
    });

    this.defaultTTL = 3600; // 1 hour
    this.shortTTL = 300; // 5 minutes
    this.longTTL = 86400; // 24 hours
  }

  // Connect to Redis
  async connect() {
    try {
      await this.redis.connect();
      console.log('✅ Redis connected successfully');
    } catch (error) {
      console.error('❌ Redis connection failed:', error);
    }
  }

  // Basic cache operations
  async set(key, value, ttl = this.defaultTTL) {
    try {
      const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
      await this.redis.setex(key, ttl, serializedValue);
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async get(key) {
    try {
      const value = await this.redis.get(key);
      if (!value) return null;
      
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async del(key) {
    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async exists(key) {
    try {
      return await this.redis.exists(key);
    } catch (error) {
      console.error('Cache exists error:', error);
      return false;
    }
  }

  // Trending ads cache
  async cacheTrendingAds(category = null, limit = 20) {
    const key = category ? `trending:${category}` : 'trending:all';
    const ttl = this.shortTTL; // 5 minutes for trending data
    
    try {
      // This would be populated by a background job
      const trendingAds = await this.getTrendingAdsFromDB(category, limit);
      await this.set(key, trendingAds, ttl);
      return trendingAds;
    } catch (error) {
      console.error('Cache trending ads error:', error);
      return [];
    }
  }

  async getTrendingAds(category = null) {
    const key = category ? `trending:${category}` : 'trending:all';
    let trendingAds = await this.get(key);
    
    if (!trendingAds) {
      trendingAds = await this.cacheTrendingAds(category);
    }
    
    return trendingAds;
  }

  // User session cache
  async cacheUserSession(userId, sessionData) {
    const key = `session:${userId}`;
    return await this.set(key, sessionData, this.longTTL);
  }

  async getUserSession(userId) {
    const key = `session:${userId}`;
    return await this.get(key);
  }

  async invalidateUserSession(userId) {
    const key = `session:${userId}`;
    return await this.del(key);
  }

  // Search results cache
  async cacheSearchResults(query, filters, results) {
    const key = `search:${this.hashQuery(query, filters)}`;
    return await this.set(key, results, this.shortTTL);
  }

  async getSearchResults(query, filters) {
    const key = `search:${this.hashQuery(query, filters)}`;
    return await this.get(key);
  }

  // Category cache
  async cacheCategories(categories) {
    return await this.set('categories:all', categories, this.longTTL);
  }

  async getCategories() {
    let categories = await this.get('categories:all');
    if (!categories) {
      // Fetch from database and cache
      categories = await this.getCategoriesFromDB();
      await this.cacheCategories(categories);
    }
    return categories;
  }

  // Ad detail cache
  async cacheAdDetail(adId, adData) {
    const key = `ad:${adId}`;
    return await this.set(key, adData, this.defaultTTL);
  }

  async getAdDetail(adId) {
    const key = `ad:${adId}`;
    return await this.get(key);
  }

  async invalidateAdCache(adId) {
    const key = `ad:${adId}`;
    return await this.del(key);
  }

  // Rate limiting
  async incrementRateLimit(key, window = 3600) {
    const current = await this.redis.incr(key);
    if (current === 1) {
      await this.redis.expire(key, window);
    }
    return current;
  }

  async checkRateLimit(key, limit) {
    const current = await this.redis.get(key);
    return parseInt(current) < limit;
  }

  // Analytics cache
  async cacheAnalytics(date, data) {
    const key = `analytics:${date}`;
    return await this.set(key, data, this.longTTL);
  }

  async getAnalytics(date) {
    const key = `analytics:${date}`;
    return await this.get(key);
  }

  // Real-time counters
  async incrementCounter(key, amount = 1) {
    return await this.redis.incrby(key, amount);
  }

  async getCounter(key) {
    const value = await this.redis.get(key);
    return value ? parseInt(value) : 0;
  }

  // Cache warming
  async warmCache() {
    try {
      console.log('🔥 Warming cache...');
      
      // Cache categories
      const categories = await this.getCategoriesFromDB();
      await this.cacheCategories(categories);
      
      // Cache trending ads
      await this.cacheTrendingAds();
      
      // Cache popular searches
      await this.cachePopularSearches();
      
      console.log('✅ Cache warmed successfully');
    } catch (error) {
      console.error('❌ Cache warming failed:', error);
    }
  }

  // Cache statistics
  async getCacheStats() {
    try {
      const info = await this.redis.info();
      const keys = await this.redis.dbsize();
      
      return {
        keys,
        info: info.split('\r\n').reduce((acc, line) => {
          const [key, value] = line.split(':');
          if (key && value) acc[key] = value;
          return acc;
        }, {})
      };
    } catch (error) {
      console.error('Cache stats error:', error);
      return null;
    }
  }

  // Utility methods
  hashQuery(query, filters) {
    const combined = JSON.stringify({ query, filters });
    return require('crypto').createHash('md5').update(combined).digest('hex');
  }

  // Mock database methods (replace with actual DB calls)
  async getTrendingAdsFromDB(category, limit) {
    // This would query the database for trending ads
    return [];
  }

  async getCategoriesFromDB() {
    // This would query the database for categories
    return [];
  }

  async cachePopularSearches() {
    // Cache popular search terms
    const popularSearches = [
      'phone', 'car', 'house', 'laptop', 'furniture'
    ];
    
    for (const search of popularSearches) {
      const results = await this.getSearchResultsFromDB(search);
      await this.cacheSearchResults(search, {}, results);
    }
  }

  async getSearchResultsFromDB(query, filters) {
    // This would query the database for search results
    return [];
  }

  // Cleanup expired cache entries
  async cleanup() {
    try {
      const keys = await this.redis.keys('*');
      const now = Date.now();
      
      for (const key of keys) {
        const ttl = await this.redis.ttl(key);
        if (ttl === -1) { // No expiration set
          await this.redis.expire(key, this.defaultTTL);
        }
      }
      
      console.log('🧹 Cache cleanup completed');
    } catch (error) {
      console.error('Cache cleanup error:', error);
    }
  }

  // Health check
  async healthCheck() {
    try {
      await this.redis.ping();
      return true;
    } catch (error) {
      console.error('Redis health check failed:', error);
      return false;
    }
  }

  // Graceful shutdown
  async disconnect() {
    try {
      await this.redis.quit();
      console.log('✅ Redis disconnected');
    } catch (error) {
      console.error('Redis disconnect error:', error);
    }
  }
}

// Singleton instance
const cacheService = new CacheService();

module.exports = cacheService; 