const cron = require('node-cron');
const { unboostExpiredAds } = require('../scripts/unboostExpiredAds');

class CronService {
  constructor() {
    this.jobs = new Map();
  }

  async initialize() {
    try {
      console.log('⏰ Initializing cron jobs...');
      
      // Schedule unboost expired ads job - run every hour
      this.scheduleUnboostJob();
      
      // Schedule cache cleanup job - run daily at 2 AM
      this.scheduleCacheCleanupJob();
      
      // Schedule analytics job - run daily at 3 AM
      this.scheduleAnalyticsJob();
      
      console.log('✅ Cron jobs initialized successfully');
    } catch (error) {
      console.error('❌ Cron service initialization failed:', error);
      throw error;
    }
  }

  scheduleUnboostJob() {
    // Run every hour at minute 0
    const job = cron.schedule('0 * * * *', async () => {
      console.log('🕐 Running unboost expired ads job...');
      try {
        await unboostExpiredAds();
        console.log('✅ Unboost job completed successfully');
      } catch (error) {
        console.error('❌ Unboost job failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Africa/Nairobi'
    });

    this.jobs.set('unboost', job);
    console.log('📅 Scheduled unboost job: every hour at minute 0');
  }

  scheduleCacheCleanupJob() {
    // Run daily at 2 AM
    const job = cron.schedule('0 2 * * *', async () => {
      console.log('🧹 Running cache cleanup job...');
      try {
        // TODO: Implement cache cleanup logic
        console.log('✅ Cache cleanup job completed');
      } catch (error) {
        console.error('❌ Cache cleanup job failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Africa/Nairobi'
    });

    this.jobs.set('cacheCleanup', job);
    console.log('📅 Scheduled cache cleanup job: daily at 2 AM');
  }

  scheduleAnalyticsJob() {
    // Run daily at 3 AM
    const job = cron.schedule('0 3 * * *', async () => {
      console.log('📊 Running analytics job...');
      try {
        // TODO: Implement analytics aggregation logic
        console.log('✅ Analytics job completed');
      } catch (error) {
        console.error('❌ Analytics job failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Africa/Nairobi'
    });

    this.jobs.set('analytics', job);
    console.log('📅 Scheduled analytics job: daily at 3 AM');
  }

  // Manually trigger unboost job
  async triggerUnboostJob() {
    console.log('🚀 Manually triggering unboost job...');
    try {
      await unboostExpiredAds();
      console.log('✅ Manual unboost job completed successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Manual unboost job failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Get job status
  getJobStatus() {
    const status = {};
    for (const [name, job] of this.jobs) {
      status[name] = {
        running: job.running,
        lastRun: job.lastDate,
        nextRun: job.nextDate
      };
    }
    return status;
  }

  // Stop all jobs
  stopAllJobs() {
    console.log('🛑 Stopping all cron jobs...');
    for (const [name, job] of this.jobs) {
      job.stop();
      console.log(`✅ Stopped job: ${name}`);
    }
  }

  // Health check
  async healthCheck() {
    try {
      const status = this.getJobStatus();
      const allRunning = Object.values(status).every(job => job.running);
      return allRunning;
    } catch (error) {
      console.error('Cron service health check failed:', error);
      return false;
    }
  }

  // Graceful shutdown
  async shutdown() {
    console.log('🛑 Shutting down cron service...');
    this.stopAllJobs();
    console.log('✅ Cron service shut down successfully');
  }
}

// Export singleton instance
const cronService = new CronService();

module.exports = cronService; 