const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
  
  // Ratings and Reviews
  ratings: [{
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
    ad: { type: mongoose.Schema.Types.ObjectId, ref: 'Ad' },
    transactionType: { type: String, enum: ['buy', 'sell'], required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  
  // Reports and Moderation
  reports: [{
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    description: { type: String, maxlength: 1000 },
    ad: { type: mongoose.Schema.Types.ObjectId, ref: 'Ad' },
    createdAt: { type: Date, default: Date.now }
  }],
  reportCount: { type: Number, default: 0 },
  
  // Account status
  status: { type: String, enum: ['active', 'suspended', 'banned'], default: 'active' },
  role: { type: String, enum: ['user', 'admin', 'moderator'], default: 'user' },
  
  // Subscription
  subscription: {
    tier: { type: String, enum: ['free', 'gold', 'platinum'], default: 'free' },
    expiresAt: { type: Date },
    features: [{ type: String }]
  },
  
  // Favorites
  savedAds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ad' }],
  
  // Search history
  searchHistory: [{
    query: { type: String },
    filters: { type: mongoose.Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now }
  }],
  
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
userSchema.index({ averageRating: -1, totalRatings: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to update average rating
userSchema.methods.updateAverageRating = function() {
  if (this.ratings.length === 0) {
    this.averageRating = 0;
    this.totalRatings = 0;
  } else {
    const totalRating = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
    this.averageRating = totalRating / this.ratings.length;
    this.totalRatings = this.ratings.length;
  }
};

// Method to add rating
userSchema.methods.addRating = async function(ratingData) {
  // Check if user has already rated this user for this ad
  const existingRating = this.ratings.find(rating => 
    rating.reviewer.toString() === ratingData.reviewer.toString() && 
    rating.ad.toString() === ratingData.ad.toString()
  );
  
  if (existingRating) {
    // Update existing rating
    existingRating.rating = ratingData.rating;
    existingRating.comment = ratingData.comment;
    existingRating.transactionType = ratingData.transactionType;
  } else {
    // Add new rating
    this.ratings.push(ratingData);
  }
  
  this.updateAverageRating();
  await this.save();
  return this;
};

// Method to add report
userSchema.methods.addReport = async function(reportData) {
  this.reports.push(reportData);
  this.reportCount = this.reports.length;
  
  // Auto-ban logic: if 3 or more reports, suspend account
  if (this.reportCount >= 3) {
    this.status = 'suspended';
  }
  
  await this.save();
  return this;
};

module.exports = mongoose.model('User', userSchema); 