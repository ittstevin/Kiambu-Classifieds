// Advanced Pagination Utility for Kiambu Classifieds
// Supports both offset-based and cursor-based pagination

class PaginationHelper {
  constructor() {
    this.defaultLimit = 20;
    this.maxLimit = 100;
  }

  // Offset-based pagination (for simple queries)
  createOffsetPagination(page = 1, limit = this.defaultLimit) {
    const offset = (page - 1) * limit;
    const normalizedLimit = Math.min(limit, this.maxLimit);
    
    return {
      offset,
      limit: normalizedLimit,
      page: parseInt(page),
      hasNext: true // Will be updated after query
    };
  }

  // Cursor-based pagination (for better performance)
  createCursorPagination(cursor = null, limit = this.defaultLimit, sortBy = 'createdAt') {
    const normalizedLimit = Math.min(limit, this.maxLimit);
    
    return {
      cursor,
      limit: normalizedLimit,
      sortBy,
      hasNext: true // Will be updated after query
    };
  }

  // Build MongoDB query with pagination
  buildMongoQuery(pagination, filters = {}) {
    const query = { ...filters };
    
    if (pagination.cursor) {
      // Cursor-based pagination
      const sortOrder = pagination.sortBy === 'createdAt' ? -1 : 1;
      query[pagination.sortBy] = {
        $lt: pagination.cursor
      };
    }
    
    return {
      query,
      options: {
        limit: pagination.limit + 1, // +1 to check if there's a next page
        sort: { [pagination.sortBy]: -1 }
      }
    };
  }

  // Process pagination results
  processResults(results, pagination) {
    const hasNext = results.length > pagination.limit;
    const items = hasNext ? results.slice(0, pagination.limit) : results;
    
    let nextCursor = null;
    if (hasNext && items.length > 0) {
      const lastItem = items[items.length - 1];
      nextCursor = lastItem[pagination.sortBy];
    }
    
    return {
      items,
      pagination: {
        ...pagination,
        hasNext,
        nextCursor,
        total: items.length
      }
    };
  }

  // Build response with metadata
  buildResponse(data, pagination, totalCount = null) {
    const response = {
      data,
      pagination: {
        currentPage: pagination.page || 1,
        limit: pagination.limit,
        hasNext: pagination.hasNext,
        nextCursor: pagination.nextCursor,
        total: totalCount || data.length
      }
    };

    // Add offset-based pagination info if available
    if (pagination.page) {
      response.pagination.totalPages = Math.ceil(response.pagination.total / pagination.limit);
      response.pagination.hasPrevious = pagination.page > 1;
      response.pagination.previousPage = pagination.page > 1 ? pagination.page - 1 : null;
      response.pagination.nextPage = pagination.hasNext ? pagination.page + 1 : null;
    }

    return response;
  }

  // Infinite scroll pagination for frontend
  createInfiniteScrollParams(lastId = null, limit = this.defaultLimit) {
    return {
      cursor: lastId,
      limit,
      sortBy: '_id'
    };
  }

  // Search pagination with relevance scoring
  createSearchPagination(query, filters = {}, page = 1, limit = this.defaultLimit) {
    return {
      query,
      filters,
      page: parseInt(page),
      limit: Math.min(limit, this.maxLimit),
      sort: { score: { $meta: 'textScore' } }
    };
  }

  // Category-based pagination
  createCategoryPagination(category, subcategory = null, page = 1, limit = this.defaultLimit) {
    const filters = { category };
    if (subcategory) filters.subcategory = subcategory;
    
    return {
      filters,
      pagination: this.createOffsetPagination(page, limit)
    };
  }

  // Location-based pagination with geospatial queries
  createLocationPagination(coordinates, radius = 50, page = 1, limit = this.defaultLimit) {
    return {
      filters: {
        coordinates: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: coordinates
            },
            $maxDistance: radius * 1000 // Convert km to meters
          }
        }
      },
      pagination: this.createOffsetPagination(page, limit)
    };
  }

  // Price range pagination
  createPricePagination(minPrice = 0, maxPrice = null, page = 1, limit = this.defaultLimit) {
    const filters = { price: { $gte: minPrice } };
    if (maxPrice) filters.price.$lte = maxPrice;
    
    return {
      filters,
      pagination: this.createOffsetPagination(page, limit)
    };
  }

  // Date range pagination
  createDatePagination(startDate = null, endDate = null, page = 1, limit = this.defaultLimit) {
    const filters = {};
    
    if (startDate || endDate) {
      filters.createdAt = {};
      if (startDate) filters.createdAt.$gte = new Date(startDate);
      if (endDate) filters.createdAt.$lte = new Date(endDate);
    }
    
    return {
      filters,
      pagination: this.createCursorPagination(null, limit, 'createdAt')
    };
  }

  // Trending ads pagination
  createTrendingPagination(days = 7, page = 1, limit = this.defaultLimit) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return {
      filters: {
        createdAt: { $gte: startDate },
        status: 'active',
        views: { $gt: 0 }
      },
      pagination: this.createCursorPagination(null, limit, 'views')
    };
  }

  // User ads pagination
  createUserAdsPagination(userId, status = 'active', page = 1, limit = this.defaultLimit) {
    const filters = { seller: userId };
    if (status !== 'all') filters.status = status;
    
    return {
      filters,
      pagination: this.createCursorPagination(null, limit, 'createdAt')
    };
  }

  // Saved ads pagination
  createSavedAdsPagination(userId, page = 1, limit = this.defaultLimit) {
    return {
      filters: { savedBy: userId },
      pagination: this.createCursorPagination(null, limit, 'savedAt')
    };
  }

  // Admin moderation pagination
  createModerationPagination(status = 'pending', page = 1, limit = this.defaultLimit) {
    return {
      filters: { status },
      pagination: this.createCursorPagination(null, limit, 'createdAt')
    };
  }

  // Analytics pagination
  createAnalyticsPagination(startDate, endDate, metric = 'views', page = 1, limit = this.defaultLimit) {
    return {
      filters: {
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      },
      pagination: this.createCursorPagination(null, limit, 'date'),
      aggregation: [
        { $match: { date: { $gte: new Date(startDate), $lte: new Date(endDate) } } },
        { $group: { _id: '$date', [metric]: { $sum: `$${metric}` } } },
        { $sort: { _id: -1 } }
      ]
    };
  }

  // Cache key for paginated results
  createCacheKey(endpoint, params) {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    
    return `pagination:${endpoint}:${sortedParams}`;
  }

  // Validate pagination parameters
  validatePagination(params) {
    const errors = [];
    
    if (params.page && (params.page < 1 || !Number.isInteger(parseInt(params.page)))) {
      errors.push('Page must be a positive integer');
    }
    
    if (params.limit && (params.limit < 1 || params.limit > this.maxLimit)) {
      errors.push(`Limit must be between 1 and ${this.maxLimit}`);
    }
    
    if (params.cursor && typeof params.cursor !== 'string') {
      errors.push('Cursor must be a string');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Parse pagination from request query
  parseFromRequest(req) {
    const { page, limit, cursor, sortBy } = req.query;
    
    if (cursor) {
      return this.createCursorPagination(cursor, parseInt(limit), sortBy);
    } else {
      return this.createOffsetPagination(parseInt(page), parseInt(limit));
    }
  }
}

// Export singleton instance
const paginationHelper = new PaginationHelper();

module.exports = paginationHelper; 