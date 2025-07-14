const express = require('express');
const router = express.Router();
const Ad = require('../models/Ad');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/auth');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// GET /api/ads
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      location, 
      minPrice, 
      maxPrice,
      condition,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const query = { status: 'active' };
    
    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }
    if (condition) query.condition = condition;

    const sort = {};
    sort[sortBy] = order === 'desc' ? -1 : 1;

    const ads = await Ad.find(query)
      .populate('seller', 'name averageRating totalRatings')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Ad.countDocuments(query);

    res.json({
      success: true,
      data: ads,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrevious: page > 1
      }
    });
  } catch (error) {
    console.error('Get ads error:', error);
    res.status(500).json({ error: 'Failed to get ads' });
  }
});

// GET /api/ads/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ad ID' });
    }

    const ad = await Ad.findById(id)
      .populate('seller', 'name email phone averageRating totalRatings memberSince')
      .populate('reports.reporter', 'name');

    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    // Increment views
    await ad.incrementViews(userId);

    res.json({
      success: true,
      data: ad
    });
  } catch (error) {
    console.error('Get ad error:', error);
    res.status(500).json({ error: 'Failed to get ad' });
  }
});

// POST /api/ads
router.post('/', authMiddleware, upload.array('images', 10), async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
      subcategory,
      location,
      condition,
      isNegotiable,
      details
    } = req.body;

    // Validate category-specific data
    const validationErrors = Ad.validateCategoryData(category, details);
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }

    // Check user's posting limit
    const user = await User.findById(req.user.id);
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    if (user.subscription.tier === 'free' && user.adPostCount >= 5) {
      return res.status(429).json({ 
        error: 'Daily posting limit reached. Upgrade to post more ads.' 
      });
    }

    // Process uploaded images
    const images = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];

    const ad = new Ad({
      title,
      description,
      price: parseInt(price),
      category,
      subcategory,
      seller: req.user.id,
      location,
      condition,
      isNegotiable: isNegotiable === 'true',
      images,
      details: details ? JSON.parse(details) : {},
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    await ad.save();

    // Update user's ad count
    user.adPostCount += 1;
    user.lastAdPost = now;
    await user.save();

    res.status(201).json({
      success: true,
      message: 'Ad created successfully',
      data: ad
    });
  } catch (error) {
    console.error('Create ad error:', error);
    res.status(500).json({ error: 'Failed to create ad' });
  }
});

// PUT /api/ads/:id
router.put('/:id', authMiddleware, upload.array('images', 10), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ad ID' });
    }

    const ad = await Ad.findById(id);
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    if (ad.seller.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to edit this ad' });
    }

    // Update fields
    const updateData = { ...req.body };
    if (req.files) {
      updateData.images = req.files.map(file => `/uploads/${file.filename}`);
    }

    // Validate category-specific data if category changed
    if (updateData.category && updateData.details) {
      const validationErrors = Ad.validateCategoryData(updateData.category, updateData.details);
      if (validationErrors.length > 0) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validationErrors 
        });
      }
    }

    const updatedAd = await Ad.findByIdAndUpdate(id, updateData, { new: true })
      .populate('seller', 'name averageRating totalRatings');

    res.json({
      success: true,
      message: 'Ad updated successfully',
      data: updatedAd
    });
  } catch (error) {
    console.error('Update ad error:', error);
    res.status(500).json({ error: 'Failed to update ad' });
  }
});

// DELETE /api/ads/:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ad ID' });
    }

    const ad = await Ad.findById(id);
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    if (ad.seller.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this ad' });
    }

    await Ad.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Ad deleted successfully'
    });
  } catch (error) {
    console.error('Delete ad error:', error);
    res.status(500).json({ error: 'Failed to delete ad' });
  }
});

// POST /api/ads/:id/report
router.post('/:id/report', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, description } = req.body;
    const reporterId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ad ID' });
    }

    const ad = await Ad.findById(id);
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    // Check if user is reporting their own ad
    if (ad.seller.toString() === reporterId) {
      return res.status(400).json({ error: 'Cannot report your own ad' });
    }

    // Add report
    const reportData = {
      reporter: reporterId,
      reason,
      description
    };

    await ad.addReport(reportData);

    res.json({
      success: true,
      message: 'Report submitted successfully',
      data: {
        reportCount: ad.reportCount,
        flagged: ad.flagged
      }
    });
  } catch (error) {
    console.error('Report ad error:', error);
    res.status(500).json({ error: 'Failed to submit report' });
  }
});

// POST /api/ads/:id/toggle-save
router.post('/:id/toggle-save', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ad ID' });
    }

    const ad = await Ad.findById(id);
    if (!ad) {
      return res.status(404).json({ error: 'Ad not found' });
    }

    const result = await ad.toggleSave(userId);

    res.json({
      success: true,
      message: result.isSaved ? 'Ad saved' : 'Ad removed from saved',
      data: result
    });
  } catch (error) {
    console.error('Toggle save error:', error);
    res.status(500).json({ error: 'Failed to toggle save' });
  }
});

// GET /api/ads/categories/:category/fields
router.get('/categories/:category/fields', async (req, res) => {
  try {
    const { category } = req.params;
    const fields = Ad.getCategoryFields(category);

    res.json({
      success: true,
      data: {
        category,
        fields
      }
    });
  } catch (error) {
    console.error('Get category fields error:', error);
    res.status(500).json({ error: 'Failed to get category fields' });
  }
});

module.exports = router; 