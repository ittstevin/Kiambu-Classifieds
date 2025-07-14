const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
  title: { type: String, required: true, index: 'text' },
  description: { type: String, required: true, index: 'text' },
  price: { type: Number, required: true, index: true },
  category: { type: String, required: true, index: true },
  subcategory: { type: String, index: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  location: { type: String, required: true, index: true },
  coordinates: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]
  },
  images: [{ type: String }],
  video: { type: String },
  thumbnail: { type: String },
  condition: { type: String, enum: ['new', 'used', 'refurbished'], index: true },
  brand: { type: String, index: true },
  model: { type: String, index: true },
  year: { type: Number, index: true },
  status: { type: String, enum: ['pending', 'active', 'sold', 'expired', 'rejected'], default: 'pending', index: true },
  isNegotiable: { type: Boolean, default: false },
  featured: { type: Boolean, default: false },
  views: { type: Number, default: 0, index: true },
  saves: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  inquiries: { type: Number, default: 0 },
  flagged: { type: Boolean, default: false },
  flagCount: { type: Number, default: 0 },
  moderatorNotes: { type: String },
  tags: [{ type: String, index: true }],
  searchKeywords: [{ type: String }],
  expiresAt: { type: Date, index: true },
  lastRenewed: { type: Date },
  viewHistory: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now }
  }],
  // Paid promotion fields
  boosted: { type: Boolean, default: false, index: true },
  boostStartDate: { type: Date },
  boostEndDate: { type: Date },
  paymentReference: { type: String },
  promotionHistory: [{
    boostStartDate: Date,
    boostEndDate: Date,
    paymentReference: String,
    amount: Number
  }],
  // Reports and Moderation
  reports: [{
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reason: { type: String, required: true },
    description: { type: String, maxlength: 1000 },
    createdAt: { type: Date, default: Date.now }
  }],
  reportCount: { type: Number, default: 0 },
  // Category-specific details (flexible schema)
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

adSchema.index({ category: 1, status: 1, createdAt: -1 });
adSchema.index({ location: 1, category: 1, price: 1 });
adSchema.index({ seller: 1, status: 1, createdAt: -1 });
adSchema.index({ coordinates: '2dsphere' });
adSchema.index({ price: 1, status: 1 });
adSchema.index({ views: -1, createdAt: -1 });
adSchema.index({ featured: 1, status: 1, createdAt: -1 });
adSchema.index({ boosted: 1, boostEndDate: -1 });
adSchema.index({ reportCount: -1 });

// Method to add report
adSchema.methods.addReport = async function(reportData) {
  this.reports.push(reportData);
  this.reportCount = this.reports.length;
  
  // Auto-flag logic: if 3 or more reports, flag the ad
  if (this.reportCount >= 3) {
    this.flagged = true;
    this.status = 'pending'; // Move to moderation queue
  }
  
  await this.save();
  return this;
};

// Method to increment views
adSchema.methods.incrementViews = async function(userId = null) {
  this.views += 1;
  
  if (userId) {
    // Add to view history if user is logged in
    this.viewHistory.push({ userId, timestamp: new Date() });
    
    // Keep only last 100 view records
    if (this.viewHistory.length > 100) {
      this.viewHistory = this.viewHistory.slice(-100);
    }
  }
  
  await this.save();
  return this;
};

// Method to save/unsave ad
adSchema.methods.toggleSave = async function(userId) {
  const user = await mongoose.model('User').findById(userId);
  if (!user) throw new Error('User not found');
  
  const isSaved = user.savedAds.includes(this._id);
  
  if (isSaved) {
    // Remove from saved ads
    user.savedAds = user.savedAds.filter(id => id.toString() !== this._id.toString());
    this.saves = Math.max(0, this.saves - 1);
  } else {
    // Add to saved ads
    user.savedAds.push(this._id);
    this.saves += 1;
  }
  
  await Promise.all([user.save(), this.save()]);
  return { isSaved: !isSaved, saves: this.saves };
};

// Static method to get category-specific form fields
adSchema.statics.getCategoryFields = function(category) {
  const fieldSchemas = {
    'cars': {
      mileage: { type: Number, required: true },
      year: { type: Number, required: true },
      model: { type: String, required: true },
      fuelType: { type: String, enum: ['petrol', 'diesel', 'electric', 'hybrid'] },
      transmission: { type: String, enum: ['manual', 'automatic'] },
      color: { type: String },
      engineSize: { type: String }
    },
    'electronics': {
      brand: { type: String, required: true },
      model: { type: String, required: true },
      warranty: { type: Boolean, default: false },
      accessories: [{ type: String }],
      originalBox: { type: Boolean, default: false }
    },
    'real-estate': {
      propertyType: { type: String, enum: ['apartment', 'house', 'land', 'commercial'] },
      bedrooms: { type: Number },
      bathrooms: { type: Number },
      squareFeet: { type: Number },
      parking: { type: Boolean, default: false },
      furnished: { type: Boolean, default: false }
    },
    'jobs': {
      jobType: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship'] },
      experience: { type: String, enum: ['entry', 'mid', 'senior', 'executive'] },
      salary: { type: Number },
      location: { type: String, required: true },
      remote: { type: Boolean, default: false }
    },
    'furniture': {
      material: { type: String },
      dimensions: { type: String },
      color: { type: String },
      style: { type: String }
    },
    'fashion': {
      size: { type: String },
      color: { type: String },
      brand: { type: String },
      material: { type: String }
    }
  };
  
  return fieldSchemas[category] || {};
};

// Static method to validate category-specific data
adSchema.statics.validateCategoryData = function(category, data) {
  const fields = this.getCategoryFields(category);
  const errors = [];
  
  for (const [field, config] of Object.entries(fields)) {
    if (config.required && !data[field]) {
      errors.push(`${field} is required for ${category} ads`);
    }
    
    if (data[field] && config.enum && !config.enum.includes(data[field])) {
      errors.push(`${field} must be one of: ${config.enum.join(', ')}`);
    }
  }
  
  return errors;
};

module.exports = mongoose.model('Ad', adSchema); 