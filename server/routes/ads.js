const express = require('express');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const Ad = require('../models/Ad');
const auth = require('../middleware/auth');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.originalname.split('.').pop());
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// @route   POST /api/ads
// @desc    Create a new ad
// @access  Private
router.post('/', auth, upload.array('images', 10), [
  body('title').trim().isLength({ min: 5, max: 100 }).withMessage('Title must be between 5 and 100 characters'),
  body('description').trim().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category').isIn(['vehicles', 'property', 'electronics', 'fashion', 'services', 'jobs', 'furniture', 'books', 'sports', 'pets', 'agriculture', 'other']).withMessage('Invalid category'),
  body('location').trim().notEmpty().withMessage('Location is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'At least one image is required' });
    }

    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);

    const adData = {
      ...req.body,
      images: imageUrls,
      seller: req.user.id,
      contactPhone: req.body.contactPhone || req.user.phone,
      contactEmail: req.body.contactEmail || req.user.email
    };

    const ad = new Ad(adData);
    await ad.save();

    res.status(201).json({
      message: 'Ad created successfully',
      ad
    });
  } catch (error) {
    console.error('Create ad error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/ads
// @desc    Get all ads with pagination and filters
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const filters = {};
    if (req.query.category) filters.category = req.query.category;
    if (req.query.location) filters.location = new RegExp(req.query.location, 'i');
    if (req.query.minPrice) filters.price = { $gte: parseInt(req.query.minPrice) };
    if (req.query.maxPrice) {
      if (filters.price) {
        filters.price.$lte = parseInt(req.query.maxPrice);
      } else {
        filters.price = { $lte: parseInt(req.query.maxPrice) };
      }
    }
    if (req.query.condition) filters.condition = req.query.condition;
    if (req.query.brand) filters.brand = new RegExp(req.query.brand, 'i');

    filters.status = 'approved';
    filters.isActive = true;

    const ads = await Ad.find(filters)
      .populate('seller', 'name location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Ad.countDocuments(filters);

    res.json({
      ads,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get ads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/ads/featured
// @desc    Get featured ads
// @access  Public
router.get('/featured', async (req, res) => {
  try {
    const ads = await Ad.getFeatured(8);
    res.json(ads);
  } catch (error) {
    console.error('Get featured ads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/ads/search
// @desc    Search ads
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { q, category, location, minPrice, maxPrice, condition, brand, page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;

    const filters = {};
    if (category) filters.category = category;
    if (location) filters.location = new RegExp(location, 'i');
    if (minPrice) filters.price = { $gte: parseInt(minPrice) };
    if (maxPrice) {
      if (filters.price) {
        filters.price.$lte = parseInt(maxPrice);
      } else {
        filters.price = { $lte: parseInt(maxPrice) };
      }
    }
    if (condition) filters.condition = condition;
    if (brand) filters.brand = new RegExp(brand, 'i');

    filters.status = 'approved';
    filters.isActive = true;

    let query = Ad.find(filters);
    
    if (q) {
      query = Ad.search(q, filters);
    }

    const ads = await query
      .populate('seller', 'name location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Ad.countDocuments(filters);

    res.json({
      ads,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Search ads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/ads/category/:category
// @desc    Get ads by category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const filters = { category, status: 'approved', isActive: true };
    
    // Apply additional filters
    if (req.query.location) filters.location = new RegExp(req.query.location, 'i');
    if (req.query.minPrice) filters.price = { $gte: parseInt(req.query.minPrice) };
    if (req.query.maxPrice) {
      if (filters.price) {
        filters.price.$lte = parseInt(req.query.maxPrice);
      } else {
        filters.price = { $lte: parseInt(req.query.maxPrice) };
      }
    }
    if (req.query.condition) filters.condition = req.query.condition;
    if (req.query.brand) filters.brand = new RegExp(req.query.brand, 'i');

    const ads = await Ad.find(filters)
      .populate('seller', 'name location')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Ad.countDocuments(filters);

    res.json({
      ads,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Get category ads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/ads/:id
// @desc    Get ad by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id)
      .populate('seller', 'name location phone email')
      .populate('savedBy', 'name');

    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    // Increment views
    ad.views += 1;
    await ad.save();

    res.json(ad);
  } catch (error) {
    console.error('Get ad error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/ads/:id
// @desc    Update ad
// @access  Private
router.put('/:id', auth, upload.array('images', 10), async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    
    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    // Check if user owns the ad
    if (ad.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const updateData = { ...req.body };
    
    // Handle new images if uploaded
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map(file => `/uploads/${file.filename}`);
      updateData.images = newImageUrls;
    }

    const updatedAd = await Ad.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('seller', 'name location');

    res.json({
      message: 'Ad updated successfully',
      ad: updatedAd
    });
  } catch (error) {
    console.error('Update ad error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/ads/:id
// @desc    Delete ad
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    
    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    // Check if user owns the ad
    if (ad.seller.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await Ad.findByIdAndDelete(req.params.id);

    res.json({ message: 'Ad deleted successfully' });
  } catch (error) {
    console.error('Delete ad error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/ads/:id/save
// @desc    Save/unsave ad
// @access  Private
router.post('/:id/save', auth, async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    
    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    const savedIndex = ad.savedBy.indexOf(req.user.id);
    
    if (savedIndex > -1) {
      // Remove from saved
      ad.savedBy.splice(savedIndex, 1);
      await ad.save();
      res.json({ saved: false, message: 'Ad removed from favorites' });
    } else {
      // Add to saved
      ad.savedBy.push(req.user.id);
      await ad.save();
      res.json({ saved: true, message: 'Ad saved to favorites' });
    }
  } catch (error) {
    console.error('Save ad error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/ads/saved
// @desc    Get user's saved ads
// @access  Private
router.get('/saved', auth, async (req, res) => {
  try {
    const ads = await Ad.find({ savedBy: req.user.id, status: 'approved', isActive: true })
      .populate('seller', 'name location')
      .sort({ createdAt: -1 });

    res.json(ads);
  } catch (error) {
    console.error('Get saved ads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/ads/:id/similar
// @desc    Get similar ads
// @access  Public
router.get('/:id/similar', async (req, res) => {
  try {
    const ad = await Ad.findById(req.params.id);
    
    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    const similarAds = await Ad.find({
      category: ad.category,
      _id: { $ne: ad._id },
      isApproved: true,
      isActive: true
    })
    .populate('seller', 'name location')
    .sort({ createdAt: -1 })
    .limit(4);

    res.json(similarAds);
  } catch (error) {
    console.error('Get similar ads error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/ads/:id/contact
// @desc    Contact seller
// @access  Private
router.post('/:id/contact', auth, [
  body('message').trim().isLength({ min: 10, max: 500 }).withMessage('Message must be between 10 and 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }

    const ad = await Ad.findById(req.params.id).populate('seller', 'name email phone');
    
    if (!ad) {
      return res.status(404).json({ message: 'Ad not found' });
    }

    // Here you would typically send an email or save the message
    // For now, we'll just return success
    res.json({ 
      message: 'Message sent to seller successfully',
      seller: {
        name: ad.seller.name,
        email: ad.seller.email,
        phone: ad.seller.phone || ad.contactPhone
      }
    });
  } catch (error) {
    console.error('Contact seller error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 