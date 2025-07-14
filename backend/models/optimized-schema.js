// Optimized MongoDB Schema for Kiambu Classifieds
// Designed for scalability with thousands of concurrent users

const mongoose = require('mongoose');

// User Schema with verification and reputation
const userSchema = new mongoose.Schema({
  // Core fields
  name: { type: String, required: true, index: true },
  email: { type: String, required: true, unique: true, index: true },
  phone: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  
  // Verification fields
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  idVerified: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
  
  // Location and preferences
  location: { type: String, required: true, index: true },
  coordinates: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [longitude, latitude]
  },
  savedCategories: [{ type: String }],
  savedLocations: [{ type: String }],
  
  // Reputation system
  rating: { type: Number, default: 0, min: 0, max: 5 },
  totalRatings: { type: Number, default: 0 },
  successfulTransactions: { type: Number, default: 0 },
  totalTransactions: { type: Number, default: 0 },
  responseRate: { type: Number, default: 0 },
  responseTime: { type: Number, default: 0 }, // in hours
  
  // Account status
  status: { type: String, enum: ['active', 'suspended', 'banned'], default: 'active' },
  role: { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },
  
  // Timestamps
  memberSince: { type: Date, default: Date.now, index: true },
  lastActive: { type: Date, default: Date.now },
  
  // Rate limiting
  adPostCount: { type: Number, default: 0 },
  lastAdPost: { type: Date },
  
  // Preferences
  notificationSettings: {
    email: { type: Boolean, default: true },
    sms: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Geospatial index for location-based queries
userSchema.index({ coordinates: '2dsphere' });
userSchema.index({ location: 1, verified: 1 });
userSchema.index({ rating: -1, totalRatings: -1 });

// Ad Schema with optimization for search and filtering
const adSchema = new mongoose.Schema({
  // Core fields
  title: { type: String, required: true, index: 'text' },
  description: { type: String, required: true, index: 'text' },
  price: { type: Number, required: true, index: true },
  category: { type: String, required: true, index: true },
  subcategory: { type: String, index: true },
  
  // Seller reference
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  
  // Location
  location: { type: String, required: true, index: true },
  coordinates: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  
  // Media
  images: [{ type: String }], // CDN URLs
  video: { type: String }, // CDN URL
  thumbnail: { type: String },
  
  // Details
  condition: { type: String, enum: ['new', 'used', 'refurbished'], index: true },
  brand: { type: String, index: true },
  model: { type: String, index: true },
  year: { type: Number, index: true },
  
  // Status and moderation
  status: { type: String, enum: ['pending', 'active', 'sold', 'expired', 'rejected'], default: 'pending', index: true },
  isNegotiable: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  
  // Engagement metrics
  views: { type: Number, default: 0, index: true },
  saves: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  inquiries: { type: Number, default: 0 },
  
  // Moderation
  flagged: { type: Boolean, default: false },
  flagCount: { type: Number, default: 0 },
  moderatorNotes: { type: String },
  
  // SEO and search
  tags: [{ type: String, index: true }],
  searchKeywords: [{ type: String }],
  
  // Timestamps
  expiresAt: { type: Date, index: true },
  lastRenewed: { type: Date },
  
  // Analytics
  viewHistory: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Compound indexes for common queries
adSchema.index({ category: 1, status: 1, createdAt: -1 });
adSchema.index({ location: 1, category: 1, price: 1 });
adSchema.index({ seller: 1, status: 1, createdAt: -1 });
adSchema.index({ coordinates: '2dsphere' });
adSchema.index({ price: 1, status: 1 });
adSchema.index({ views: -1, createdAt: -1 }); // For trending
adSchema.index({ featured: 1, status: 1, createdAt: -1 });

// Message Schema for real-time chat
const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ad: { type: mongoose.Schema.Types.ObjectId, ref: 'Ad' },
  
  content: { type: String, required: true },
  messageType: { type: String, enum: ['text', 'image', 'offer'], default: 'text' },
  
  // Offer details
  offerAmount: { type: Number },
  offerStatus: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  
  // Message status
  read: { type: Boolean, default: false },
  delivered: { type: Boolean, default: false },
  
  // Moderation
  flagged: { type: Boolean, default: false },
  moderated: { type: Boolean, default: false }
}, {
  timestamps: true
});

messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ ad: 1, createdAt: -1 });

// Conversation Schema for chat organization
const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  ad: { type: mongoose.Schema.Types.ObjectId, ref: 'Ad' },
  
  lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  lastMessageAt: { type: Date, default: Date.now },
  
  unreadCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

conversationSchema.index({ participants: 1 });
conversationSchema.index({ lastMessageAt: -1 });

// Category Schema for dynamic categories
const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  icon: { type: String },
  
  // Subcategories
  subcategories: [{
    name: { type: String },
    slug: { type: String },
    description: { type: String }
  }],
  
  // Statistics
  adCount: { type: Number, default: 0 },
  viewCount: { type: Number, default: 0 },
  
  // SEO
  metaTitle: { type: String },
  metaDescription: { type: String },
  
  // Status
  active: { type: Boolean, default: true },
  featured: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Analytics Schema for performance tracking
const analyticsSchema = new mongoose.Schema({
  // Page views
  pageViews: {
    home: { type: Number, default: 0 },
    category: { type: Number, default: 0 },
    adDetail: { type: Number, default: 0 },
    search: { type: Number, default: 0 }
  },
  
  // User engagement
  userEngagement: {
    newUsers: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 },
    returningUsers: { type: Number, default: 0 }
  },
  
  // Ad performance
  adPerformance: {
    totalAds: { type: Number, default: 0 },
    activeAds: { type: Number, default: 0 },
    soldAds: { type: Number, default: 0 },
    averagePrice: { type: Number, default: 0 }
  },
  
  // Date tracking
  date: { type: Date, required: true, index: true }
}, {
  timestamps: true
});

analyticsSchema.index({ date: 1 });

// Cache Schema for Redis-like functionality
const cacheSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed },
  expiresAt: { type: Date, required: true, index: true }
}, {
  timestamps: true
});

cacheSchema.index({ key: 1 });
cacheSchema.index({ expiresAt: 1 });

module.exports = {
  User: mongoose.model('User', userSchema),
  Ad: mongoose.model('Ad', adSchema),
  Message: mongoose.model('Message', messageSchema),
  Conversation: mongoose.model('Conversation', conversationSchema),
  Category: mongoose.model('Category', categorySchema),
  Analytics: mongoose.model('Analytics', analyticsSchema),
  Cache: mongoose.model('Cache', cacheSchema)
}; 