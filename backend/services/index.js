// Modular Service Architecture for Kiambu Classifieds
// Each service handles its own domain with clear separation of concerns

const AuthService = require('./authService');
const AdService = require('./adService');
const ChatService = require('./chatService');
const MediaService = require('./mediaService');
const AnalyticsService = require('./analyticsService');
const NotificationService = require('./notificationService');
const SearchService = require('./searchService');
const CacheService = require('./cacheService');
const CronService = require('./cronService');

class ServiceManager {
  constructor() {
    this.services = {
      auth: new AuthService(),
      ads: new AdService(),
      chat: new ChatService(),
      media: new MediaService(),
      analytics: new AnalyticsService(),
      notifications: new NotificationService(),
      search: new SearchService(),
      cache: CacheService, // Singleton
      cron: CronService // Singleton
    };
  }

  // Initialize all services
  async initialize() {
    try {
      console.log('🚀 Initializing services...');
      
      // Initialize cache first (other services depend on it)
      await this.services.cache.connect();
      
      // Initialize other services
      await Promise.all([
        this.services.auth.initialize(),
        this.services.ads.initialize(),
        this.services.chat.initialize(),
        this.services.media.initialize(),
        this.services.analytics.initialize(),
        this.services.notifications.initialize(),
        this.services.search.initialize()
      ]);
      
      console.log('✅ All services initialized successfully');
    } catch (error) {
      console.error('❌ Service initialization failed:', error);
      throw error;
    }
  }

  // Get service by name
  getService(name) {
    return this.services[name];
  }

  // Health check all services
  async healthCheck() {
    const results = {};
    
    for (const [name, service] of Object.entries(this.services)) {
      try {
        if (typeof service.healthCheck === 'function') {
          results[name] = await service.healthCheck();
        } else {
          results[name] = true;
        }
      } catch (error) {
        results[name] = false;
        console.error(`Health check failed for ${name}:`, error);
      }
    }
    
    return results;
  }

  // Graceful shutdown
  async shutdown() {
    console.log('🛑 Shutting down services...');
    
    try {
      await Promise.all([
        this.services.cache.disconnect(),
        this.services.chat.disconnect(),
        this.services.analytics.disconnect()
      ]);
      
      console.log('✅ Services shut down successfully');
    } catch (error) {
      console.error('❌ Service shutdown failed:', error);
    }
  }
}

// Export singleton instance
const serviceManager = new ServiceManager();

module.exports = serviceManager; 