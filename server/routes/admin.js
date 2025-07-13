const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Ad = require('../models/Ad');
const User = require('../models/User');

// Admin middleware - check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get dashboard stats
router.get('/dashboard', auth, adminAuth, async (req, res) => {
  try {
    const pendingCount = await Ad.countDocuments({ status: 'pending' });
    const approvedCount = await Ad.countDocuments({ status: 'approved' });
    const rejectedCount = await Ad.countDocuments({ status: 'rejected' });
    const totalUsers = await User.countDocuments();

    res.json({
      pendingCount,
      approvedCount,
      rejectedCount,
      totalUsers
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending ads
router.get('/ads/pending', auth, adminAuth, async (req, res) => {
  try {
    const ads = await Ad.find({ status: 'pending' })
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });

    res.json({ ads });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get approved ads
router.get('/ads/approved', auth, adminAuth, async (req, res) => {
  try {
    const ads = await Ad.find({ status: 'approved' })
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });

    res.json({ ads });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get rejected ads
router.get('/ads/rejected', auth, adminAuth, async (req, res) => {
  try {
    const ads = await Ad.find({ status: 'rejected' })
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });

    res.json({ ads });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve an ad
router.patch('/ads/:adId/approve', auth, adminAuth, async (req, res) => {
  try {
    const ad = await Ad.findByIdAndUpdate(
      req.params.adId,
      { 
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: req.user._id
      },
      { new: true }
    );

    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    res.json({ message: 'Ad approved successfully', ad });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Reject an ad
router.patch('/ads/:adId/reject', auth, adminAuth, async (req, res) => {
  try {
    const { reason } = req.body;
    
    const ad = await Ad.findByIdAndUpdate(
      req.params.adId,
      { 
        status: 'rejected',
        rejectionReason: reason,
        rejectedAt: new Date(),
        rejectedBy: req.user._id
      },
      { new: true }
    );

    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    res.json({ message: 'Ad rejected successfully', ad });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all users (admin only)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const users = await User.find({})
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 