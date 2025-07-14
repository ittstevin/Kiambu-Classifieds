const mongoose = require('mongoose');
const Ad = require('../models/Ad');
require('dotenv').config();

async function unboostExpiredAds() {
  const startTime = new Date();
  console.log('🕐 Starting expired ads unboost process...', startTime.toISOString());

  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to database');

    const now = new Date();
    
    // Find ads that are boosted but have expired
    const expiredAds = await Ad.find({
      boosted: true,
      boostEndDate: { $lt: now }
    }).populate('seller', 'name email phone');

    console.log(`📊 Found ${expiredAds.length} expired boosted ads`);

    if (expiredAds.length === 0) {
      console.log('✅ No expired boosted ads found');
      return;
    }

    // Update expired ads
    const result = await Ad.updateMany(
      { boosted: true, boostEndDate: { $lt: now } },
      { 
        $set: { 
          boosted: false,
          lastUnboosted: now
        }
      }
    );

    console.log(`✅ Unboosted ${result.modifiedCount} expired ads`);

    // Log details for each expired ad
    for (const ad of expiredAds) {
      console.log(`📝 Ad "${ad.title}" (ID: ${ad._id}) unboosted`);
      console.log(`   - Seller: ${ad.seller?.name || 'Unknown'} (${ad.seller?.email || 'No email'})`);
      console.log(`   - Boost ended: ${ad.boostEndDate}`);
      console.log(`   - Total views: ${ad.views}`);
      console.log(`   - Total saves: ${ad.saves}`);
      
      // TODO: Send notification to seller about expired promotion
      // await sendExpiredPromotionNotification(ad);
    }

    // Generate summary report
    const summary = {
      totalExpired: expiredAds.length,
      totalViews: expiredAds.reduce((sum, ad) => sum + ad.views, 0),
      totalSaves: expiredAds.reduce((sum, ad) => sum + ad.saves, 0),
      averageViews: expiredAds.length > 0 ? Math.round(expiredAds.reduce((sum, ad) => sum + ad.views, 0) / expiredAds.length) : 0,
      averageSaves: expiredAds.length > 0 ? Math.round(expiredAds.reduce((sum, ad) => sum + ad.saves, 0) / expiredAds.length) : 0
    };

    console.log('📈 Summary Report:');
    console.log(`   - Total expired ads: ${summary.totalExpired}`);
    console.log(`   - Total views: ${summary.totalViews}`);
    console.log(`   - Total saves: ${summary.totalSaves}`);
    console.log(`   - Average views per ad: ${summary.averageViews}`);
    console.log(`   - Average saves per ad: ${summary.averageSaves}`);

    // Log performance metrics
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    console.log(`⏱️  Process completed in ${duration}ms`);

    // TODO: Send summary report to admin
    // await sendAdminReport(summary);

  } catch (error) {
    console.error('❌ Error unboosting expired ads:', error);
    
    // TODO: Send error notification to admin
    // await sendErrorNotification(error);
    
    process.exit(1);
  } finally {
    // Disconnect from database
    await mongoose.disconnect();
    console.log('✅ Disconnected from database');
  }
}

// Helper function to send notification to seller (placeholder)
async function sendExpiredPromotionNotification(ad) {
  // TODO: Implement SMS/Email notification
  console.log(`📧 Would send notification to ${ad.seller?.email} about expired promotion for "${ad.title}"`);
}

// Helper function to send admin report (placeholder)
async function sendAdminReport(summary) {
  // TODO: Implement admin notification
  console.log('📊 Would send admin report:', summary);
}

// Helper function to send error notification (placeholder)
async function sendErrorNotification(error) {
  // TODO: Implement error notification
  console.log('🚨 Would send error notification:', error.message);
}

// Run the script
if (require.main === module) {
  unboostExpiredAds()
    .then(() => {
      console.log('✅ Expired ads unboost process completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Expired ads unboost process failed:', error);
      process.exit(1);
    });
}

module.exports = { unboostExpiredAds }; 