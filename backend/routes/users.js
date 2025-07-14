const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Ad = require('../models/Ad');
const { authMiddleware } = require('../middleware/auth');
const mongoose = require('mongoose');

// GET /api/users/:userId/ratings
router.get('/:userId/ratings', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const user = await User.findById(userId)
      .populate('ratings.reviewer', 'name')
      .populate('ratings.ad', 'title images')
      .select('ratings averageRating totalRatings');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Paginate ratings
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const ratings = user.ratings.slice(startIndex, endIndex);
    
    res.json({
      success: true,
      data: {
        ratings,
        averageRating: user.averageRating,
        totalRatings: user.totalRatings,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(user.ratings.length / limit),
          hasNext: endIndex < user.ratings.length,
          hasPrevious: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get user ratings error:', error);
    res.status(500).json({ error: 'Failed to get user ratings' });
  }
});

// POST /api/users/:userId/rate
router.post('/:userId/rate', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { rating, comment, adId, transactionType } = req.body;
    const reviewerId = req.user.id;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(adId)) {
      return res.status(400).json({ error: 'Invalid ad ID' });
    }
    
    // Validate rating
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }
    
    // Check if user is rating themselves
    if (userId === reviewerId) {
      return res.status(400).json({ error: 'Cannot rate yourself' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Verify ad exists
    const ad = await Ad.findById(adId);
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    
    // Add rating
    const ratingData = {
      reviewer: reviewerId,
      rating,
      comment,
      ad: adId,
      transactionType
    };
    
    await user.addRating(ratingData);
    
    res.json({
      success: true,
      message: 'Rating added successfully',
      data: {
        averageRating: user.averageRating,
        totalRatings: user.totalRatings
      }
    });
  } catch (error) {
    console.error('Add rating error:', error);
    res.status(500).json({ error: 'Failed to add rating' });
  }
});

// POST /api/users/:userId/report
router.post('/:userId/report', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, description, adId } = req.body;
    const reporterId = req.user.id;
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    // Check if user is reporting themselves
    if (userId === reporterId) {
      return res.status(400).json({ error: 'Cannot report yourself' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Add report
    const reportData = {
      reporter: reporterId,
      reason,
      description,
      ad: adId
    };
    
    await user.addReport(reportData);
    
    res.json({
      success: true,
      message: 'Report submitted successfully',
      data: {
        reportCount: user.reportCount,
        status: user.status
      }
    });
  } catch (error) {
    console.error('Add report error:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// POST /api/users/:userId/save-ad
router.post('/:userId/save-ad', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { adId } = req.body;
    
    if (userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(adId)) {
      return res.status(400).json({ error: 'Invalid ad ID' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if ad is already saved
    if (user.savedAds.includes(adId)) {
      return res.status(400).json({ error: 'Ad already saved' });
    }
    
    // Verify ad exists
    const ad = await Ad.findById(adId);
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }
    
    user.savedAds.push(adId);
    await user.save();
    
    res.json({
      success: true,
      message: 'Ad saved successfully',
      data: {
        savedAdsCount: user.savedAds.length
      }
    });
  } catch (error) {
    console.error('Save ad error:', error);
    res.status(500).json({ error: 'Failed to save ad' });
  }
});

// DELETE /api/users/:userId/save-ad/:adId
router.delete('/:userId/save-ad/:adId', authMiddleware, async (req, res) => {
  try {
    const { userId, adId } = req.params;
    
    if (userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Remove ad from saved ads
    user.savedAds = user.savedAds.filter(id => id.toString() !== adId);
    await user.save();
    
    res.json({
      success: true,
      message: 'Ad removed from saved ads',
      data: {
        savedAdsCount: user.savedAds.length
      }
    });
  } catch (error) {
    console.error('Remove saved ad error:', error);
    res.status(500).json({ error: 'Failed to remove saved ad' });
  }
});

// GET /api/users/:userId/saved-ads
router.get('/:userId/saved-ads', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    
    if (userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const user = await User.findById(userId).populate({
      path: 'savedAds',
      options: {
        skip: (page - 1) * limit,
        limit: parseInt(limit),
        sort: { createdAt: -1 }
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const totalCount = user.savedAds.length;
    
    res.json({
      success: true,
      data: {
        ads: user.savedAds,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalCount,
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrevious: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get saved ads error:', error);
    res.status(500).json({ error: 'Failed to get saved ads' });
  }
});

// POST /api/users/:userId/search-history
router.post('/:userId/search-history', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { query, filters } = req.body;
    
    if (userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Add to search history (keep only last 20 searches)
    user.searchHistory.unshift({ query, filters });
    if (user.searchHistory.length > 20) {
      user.searchHistory = user.searchHistory.slice(0, 20);
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Search history saved'
    });
  } catch (error) {
    console.error('Save search history error:', error);
    res.status(500).json({ error: 'Failed to save search history' });
  }
});

// GET /api/users/:userId/search-history
router.get('/:userId/search-history', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    const user = await User.findById(userId).select('searchHistory');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      success: true,
      data: user.searchHistory
    });
  } catch (error) {
    console.error('Get search history error:', error);
    res.status(500).json({ error: 'Failed to get search history' });
  }
});

module.exports = router; 