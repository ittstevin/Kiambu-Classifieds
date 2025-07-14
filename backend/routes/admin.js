const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Ad = require('../models/Ad');
const { authMiddleware } = require('../middleware/auth');
const mongoose = require('mongoose');

// Admin middleware - check if user is admin
const adminMiddleware = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin' && req.user.role !== 'moderator') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    res.status(500).json({ error: 'Admin verification failed' });
  }
};

// GET /api/admin/dashboard
router.get('/dashboard', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const [
      totalUsers,
      totalAds,
      pendingAds,
      flaggedAds,
      reportedUsers,
      boostedAds,
      recentReports
    ] = await Promise.all([
      User.countDocuments(),
      Ad.countDocuments(),
      Ad.countDocuments({ status: 'pending' }),
      Ad.countDocuments({ flagged: true }),
      User.countDocuments({ reportCount: { $gt: 0 } }),
      Ad.countDocuments({ boosted: true, boostEndDate: { $gt: new Date() } }),
      Ad.find({ 'reports.0': { $exists: true } })
        .populate('reports.reporter', 'name email')
        .populate('seller', 'name email')
        .sort({ 'reports.createdAt': -1 })
        .limit(10)
    ]);

    res.json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalAds,
          pendingAds,
          flaggedAds,
          reportedUsers,
          boostedAds
        },
        recentReports
      }
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to load admin dashboard' });
  }
});

// GET /api/admin/reports
router.get('/reports', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { type = 'all', page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (type === 'ads') {
      query = { 'reports.0': { $exists: true } };
    } else if (type === 'users') {
      query = { reportCount: { $gt: 0 } };
    }
    
    const [reportedAds, reportedUsers] = await Promise.all([
      Ad.find({ 'reports.0': { $exists: true } })
        .populate('reports.reporter', 'name email')
        .populate('seller', 'name email')
        .sort({ reportCount: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      User.find({ reportCount: { $gt: 0 } })
        .populate('reports.reporter', 'name email')
        .select('name email reportCount status reports')
        .sort({ reportCount: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
    ]);

    res.json({
      success: true,
      data: {
        reportedAds,
        reportedUsers,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil((reportedAds.length + reportedUsers.length) / limit)
        }
      }
    });
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to get reports' });
  }
});

// POST /api/admin/ads/:adId/approve
router.post('/ads/:adId/approve', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { adId } = req.params;
    const { notes } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(adId)) {
      return res.status(400).json({ error: 'Invalid ad ID' });
    }
    
    const ad = await Ad.findById(adId);
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    
    ad.status = 'active';
    ad.flagged = false;
    if (notes) ad.moderatorNotes = notes;
    
    await ad.save();
    
    res.json({
      success: true,
      message: 'Ad approved successfully',
      data: { ad }
    });
  } catch (error) {
    console.error('Approve ad error:', error);
    res.status(500).json({ error: 'Failed to approve ad' });
  }
});

// POST /api/admin/ads/:adId/reject
router.post('/ads/:adId/reject', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { adId } = req.params;
    const { reason, notes } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(adId)) {
      return res.status(400).json({ error: 'Invalid ad ID' });
    }
    
    const ad = await Ad.findById(adId);
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    
    ad.status = 'rejected';
    ad.flagged = false;
    if (notes) ad.moderatorNotes = notes;
    
    await ad.save();
    
    res.json({
      success: true,
      message: 'Ad rejected successfully',
      data: { ad }
    });
  } catch (error) {
    console.error('Reject ad error:', error);
    res.status(500).json({ error: 'Failed to reject ad' });
  }
});

// POST /api/admin/ads/:adId/ban
router.post('/ads/:adId/ban', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { adId } = req.params;
    const { reason } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(adId)) {
      return res.status(400).json({ error: 'Invalid ad ID' });
    }
    
    const ad = await Ad.findById(adId);
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    
    ad.status = 'rejected';
    ad.flagged = true;
    ad.moderatorNotes = `Banned: ${reason}`;
    
    await ad.save();
    
    res.json({
      success: true,
      message: 'Ad banned successfully',
      data: { ad }
    });
  } catch (error) {
    console.error('Ban ad error:', error);
    res.status(500).json({ error: 'Failed to ban ad' });
  }
});

// POST /api/admin/users/:userId/ban
router.post('/users/:userId/ban', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, duration = 'permanent' } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.status = 'banned';
    if (duration !== 'permanent') {
      const banExpiry = new Date();
      banExpiry.setDate(banExpiry.getDate() + parseInt(duration));
      user.banExpiry = banExpiry;
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'User banned successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ error: 'Failed to ban user' });
  }
});

// POST /api/admin/users/:userId/suspend
router.post('/users/:userId/suspend', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, duration = 7 } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.status = 'suspended';
    const suspendExpiry = new Date();
    suspendExpiry.setDate(suspendExpiry.getDate() + parseInt(duration));
    user.suspendExpiry = suspendExpiry;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'User suspended successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Suspend user error:', error);
    res.status(500).json({ error: 'Failed to suspend user' });
  }
});

// POST /api/admin/users/:userId/activate
router.post('/users/:userId/activate', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.status = 'active';
    user.banExpiry = undefined;
    user.suspendExpiry = undefined;
    
    await user.save();
    
    res.json({
      success: true,
      message: 'User activated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Activate user error:', error);
    res.status(500).json({ error: 'Failed to activate user' });
  }
});

// GET /api/admin/analytics
router.get('/analytics', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));
    
    const [
      newUsers,
      newAds,
      totalRevenue,
      categoryStats,
      locationStats
    ] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: daysAgo } }),
      Ad.countDocuments({ createdAt: { $gte: daysAgo } }),
      Ad.aggregate([
        { $match: { boosted: true, boostStartDate: { $gte: daysAgo } } },
        { $group: { _id: null, total: { $sum: 100 } } } // Assuming Ksh 100 per boost
      ]),
      Ad.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Ad.aggregate([
        { $group: { _id: '$location', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ])
    ]);
    
    res.json({
      success: true,
      data: {
        period: `${period} days`,
        newUsers,
        newAds,
        totalRevenue: totalRevenue[0]?.total || 0,
        categoryStats,
        locationStats
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Failed to load analytics' });
  }
});

module.exports = router; 