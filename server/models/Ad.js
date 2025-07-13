const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'vehicles',
      'property',
      'electronics',
      'fashion',
      'services',
      'jobs',
      'furniture',
      'books',
      'sports',
      'pets',
      'agriculture',
      'other'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  condition: {
    type: String,
    enum: ['new', 'used', 'refurbished'],
    default: 'used'
  },
  brand: {
    type: String,
    trim: true
  },
  model: {
    type: String,
    trim: true
  },
  year: {
    type: Number,
    min: [1900, 'Year must be after 1900'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  images: [{
    type: String,
    required: [true, 'At least one image is required']
  }],
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  coordinates: {
    latitude: Number,
    longitude: Number
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactPhone: {
    type: String,
    trim: true
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  isNegotiable: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  savedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  tags: [{
    type: String,
    trim: true
  }],
  specifications: {
    type: Map,
    of: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for search functionality
adSchema.index({
  title: 'text',
  description: 'text',
  brand: 'text',
  model: 'text',
  tags: 'text'
});

// Index for location-based queries
adSchema.index({ location: 1 });

// Index for category-based queries
adSchema.index({ category: 1 });

// Index for price range queries
adSchema.index({ price: 1 });

// Index for date-based queries
adSchema.index({ createdAt: -1 });

// Virtual for formatted price
adSchema.virtual('formattedPrice').get(function() {
  if (this.price === 0) return 'Free';
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    minimumFractionDigits: 0,
  }).format(this.price);
});

// Virtual for time ago
adSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffInHours = Math.floor((now - this.createdAt) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}m ago`;
});

// Ensure virtual fields are serialized
adSchema.set('toJSON', { virtuals: true });
adSchema.set('toObject', { virtuals: true });

// Pre-save middleware to update updatedAt
adSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Static method to get featured ads
adSchema.statics.getFeatured = function(limit = 8) {
  return this.find({
    isFeatured: true,
    isApproved: true,
    isActive: true
  })
  .populate('seller', 'name location')
  .sort({ createdAt: -1 })
  .limit(limit);
};

// Static method to search ads
adSchema.statics.search = function(query, filters = {}) {
  const searchQuery = {
    isApproved: true,
    isActive: true
  };

  // Text search
  if (query) {
    searchQuery.$text = { $search: query };
  }

  // Apply filters
  if (filters.category) {
    searchQuery.category = filters.category;
  }
  if (filters.location) {
    searchQuery.location = new RegExp(filters.location, 'i');
  }
  if (filters.minPrice !== undefined) {
    searchQuery.price = { $gte: filters.minPrice };
  }
  if (filters.maxPrice !== undefined) {
    if (searchQuery.price) {
      searchQuery.price.$lte = filters.maxPrice;
    } else {
      searchQuery.price = { $lte: filters.maxPrice };
    }
  }
  if (filters.condition) {
    searchQuery.condition = filters.condition;
  }
  if (filters.brand) {
    searchQuery.brand = new RegExp(filters.brand, 'i');
  }

  return this.find(searchQuery)
    .populate('seller', 'name location')
    .sort({ createdAt: -1 });
};

module.exports = mongoose.model('Ad', adSchema); 