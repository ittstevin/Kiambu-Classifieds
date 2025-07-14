const express = require('express');
const router = express.Router();
const Ad = require('../models/Ad');
const { authMiddleware } = require('../middleware/auth');
const paginationHelper = require('../utils/pagination');
const cacheService = require('../services/cacheService');

// GET /api/search
router.get('/', async (req, res) => {
  try {
    const { 
      q, 
      category, 
      location, 
      minPrice, 
      maxPrice, 
      condition,
      page = 1,
      limit = 20,
      sortBy = 'relevance'
    } = req.query;

    // Build search query
    const query = { status: 'active' };
    
    if (q) {
      query.$text = { $search: q };
    }
    
    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseInt(minPrice);
      if (maxPrice) query.price.$lte = parseInt(maxPrice);
    }
    if (condition) query.condition = condition;

    // Create aggregation pipeline for boosted ads priority
    const pipeline = [
      { $match: query },
      {
        $addFields: {
          // Add a score field for sorting
          score: {
            $add: [
              // Boosted ads get highest priority (score 1000)
              { $cond: [{ $eq: ['$boosted', true] }, 1000, 0] },
              // Featured ads get medium priority (score 500)
              { $cond: [{ $eq: ['$featured', true] }, 500, 0] },
              // Recent ads get some priority (score based on days since creation)
              {
                $multiply: [
                  { $subtract: [new Date(), '$createdAt'] },
                  -0.001 // Negative to prioritize newer ads
                ]
              },
              // Views contribute to score
              { $multiply: ['$views', 0.1] },
              // Saves contribute to score
              { $multiply: ['$saves', 0.5] }
            ]
          }
        }
      },
      { $sort: { score: -1, createdAt: -1 } },
      {
        $facet: {
          boosted: [
            { $match: { boosted: true } },
            { $limit: 5 } // Show up to 5 boosted ads at top
          ],
          regular: [
            { $match: { boosted: false } },
            { $skip: (page - 1) * limit },
            { $limit: limit }
          ],
          total: [
            { $count: 'count' }
          ]
        }
      }
    ];

    const results = await Ad.aggregate(pipeline);
    
    // Combine boosted and regular ads
    const boostedAds = results[0]?.boosted || [];
    const regularAds = results[0]?.regular || [];
    const totalCount = results[0]?.total[0]?.count || 0;

    // Combine results with boosted ads first
    const allAds = [...boostedAds, ...regularAds];

    // Add pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrevious = page > 1;

    res.json({
      success: true,
      data: allAds,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNext,
        hasPrevious,
        boostedCount: boostedAds.length,
        regularCount: regularAds.length
      },
      filters: {
        query: q,
        category,
        location,
        minPrice,
        maxPrice,
        condition,
        sortBy
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Search failed' });
  }
});

// GET /api/search/boosted
router.get('/boosted', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const boostedAds = await Ad.find({
      boosted: true,
      status: 'active',
      boostEndDate: { $gt: new Date() } // Only currently boosted ads
    })
    .populate('seller', 'name rating')
    .sort({ boostStartDate: -1 })
    .skip((page - 1) * limit)
    .limit(limit);

    const totalCount = await Ad.countDocuments({
      boosted: true,
      status: 'active',
      boostEndDate: { $gt: new Date() }
    });

    res.json({
      success: true,
      data: boostedAds,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrevious: page > 1
      }
    });

  } catch (error) {
    console.error('Boosted search error:', error);
    res.status(500).json({ error: 'Boosted search failed' });
  }
});

// GET /api/search/suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({ suggestions: [] });
    }

    // Get suggestions from cache first
    const cacheKey = `search_suggestions:${q.toLowerCase()}`;
    let suggestions = await cacheService.get(cacheKey);
    
    if (!suggestions) {
      // Search for similar titles and categories
      const titleSuggestions = await Ad.distinct('title', {
        title: { $regex: q, $options: 'i' },
        status: 'active'
      }).limit(5);

      const categorySuggestions = await Ad.distinct('category', {
        category: { $regex: q, $options: 'i' },
        status: 'active'
      }).limit(3);

      const locationSuggestions = await Ad.distinct('location', {
        location: { $regex: q, $options: 'i' },
        status: 'active'
      }).limit(3);

      suggestions = {
        titles: titleSuggestions,
        categories: categorySuggestions,
        locations: locationSuggestions
      };

      // Cache suggestions for 1 hour
      await cacheService.set(cacheKey, suggestions, 3600);
    }

    res.json({ suggestions });

  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({ error: 'Failed to get search suggestions' });
  }
});

// GET /api/search/trending
router.get('/trending', async (req, res) => {
  try {
    const { category, limit = 10 } = req.query;
    
    const query = { status: 'active' };
    if (category) query.category = category;

    const trendingAds = await Ad.find(query)
      .sort({ views: -1, saves: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .populate('seller', 'name rating');

    res.json({
      success: true,
      data: trendingAds
    });

  } catch (error) {
    console.error('Trending search error:', error);
    res.status(500).json({ error: 'Failed to get trending ads' });
  }
});

module.exports = router; 