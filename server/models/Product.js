/**
 * Product Model
 * 
 * Defines the schema for products in the clearance marketplace
 * Includes product details, pricing, inventory, and seller information
 */

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // Basic Product Information
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  
  // Product Images
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: String,
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Product Video (optional)
  video: {
    url: String,
    type: String // video/mp4, video/webm, etc.
  },
  
  // Pricing Information
  originalPrice: {
    type: Number,
    required: [true, 'Original price is required'],
    min: [0, 'Price cannot be negative']
  },
  salePrice: {
    type: Number,
    required: [true, 'Sale price is required'],
    min: [0, 'Price cannot be negative']
  },
  discountPercentage: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  
  // Inventory Management
  stock: {
    quantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock cannot be negative']
    },
    reserved: {
      type: Number,
      default: 0,
      min: [0, 'Reserved stock cannot be negative']
    },
    available: {
      type: Number,
      default: function() {
        return this.stock.quantity - this.stock.reserved;
      }
    }
  },
  
  // Product Classification
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  subcategory: {
    type: String,
    trim: true
  },
  brand: {
    type: String,
    trim: true,
    maxlength: [100, 'Brand name cannot exceed 100 characters']
  },
  model: {
    type: String,
    trim: true,
    maxlength: [100, 'Model cannot exceed 100 characters']
  },
  
  // Product Specifications
  specifications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    value: {
      type: String,
      required: true,
      trim: true
    }
  }],
  
  // Physical Properties
  dimensions: {
    length: Number, // in cm
    width: Number,  // in cm
    height: Number, // in cm
    weight: Number  // in grams
  },
  
  // Seller Information
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Seller information is required']
  },
  sellerInfo: {
    companyName: String,
    rating: { type: Number, default: 0 },
    totalProducts: { type: Number, default: 0 }
  },
  
  // Product Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock', 'discontinued', 'pending_approval'],
    default: 'pending_approval'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Clearance Information
  clearanceReason: {
    type: String,
    enum: ['overstock', 'seasonal', 'discontinued', 'damaged_packaging', 'return', 'other'],
    required: [true, 'Clearance reason is required']
  },
  condition: {
    type: String,
    enum: ['new', 'like_new', 'good', 'fair', 'refurbished'],
    default: 'new'
  },
  expiryDate: Date, // For products with expiry dates
  
  // SEO and Search
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  tags: [String],
  keywords: [String],
  
  // Ratings and Reviews
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5']
    },
    count: {
      type: Number,
      default: 0
    },
    distribution: {
      5: { type: Number, default: 0 },
      4: { type: Number, default: 0 },
      3: { type: Number, default: 0 },
      2: { type: Number, default: 0 },
      1: { type: Number, default: 0 }
    }
  },
  
  // Sales Analytics
  analytics: {
    views: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    purchases: { type: Number, default: 0 },
    wishlistAdds: { type: Number, default: 0 },
    cartAdds: { type: Number, default: 0 }
  },
  
  // Shipping Information
  shipping: {
    weight: Number, // in grams
    dimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    freeShipping: {
      type: Boolean,
      default: false
    },
    shippingCost: {
      type: Number,
      default: 0
    },
    processingTime: {
      type: Number,
      default: 1 // days
    }
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  publishedAt: Date,
  lastViewedAt: Date
});

// Indexes for better query performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ seller: 1 });
productSchema.index({ status: 1 });
productSchema.index({ salePrice: 1 });
productSchema.index({ 'ratings.average': -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ slug: 1 });
productSchema.index({ isFeatured: -1, createdAt: -1 });

// Virtual for availability status
productSchema.virtual('isAvailable').get(function() {
  return this.status === 'active' && this.stock.available > 0;
});

// Virtual for discount amount
productSchema.virtual('discountAmount').get(function() {
  return this.originalPrice - this.salePrice;
});

// Pre-save middleware to calculate discount percentage
productSchema.pre('save', function(next) {
  if (this.originalPrice && this.salePrice) {
    this.discountPercentage = Math.round(((this.originalPrice - this.salePrice) / this.originalPrice) * 100);
  }
  
  // Update available stock
  this.stock.available = this.stock.quantity - this.stock.reserved;
  
  // Generate slug from name if not provided
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  
  this.updatedAt = Date.now();
  next();
});

// Static method to find products by category
productSchema.statics.findByCategory = function(categoryId) {
  return this.find({ category: categoryId, status: 'active' });
};

// Static method to find featured products
productSchema.statics.findFeatured = function(limit = 10) {
  return this.find({ isFeatured: true, status: 'active' })
    .limit(limit)
    .sort({ createdAt: -1 });
};

// Static method to search products
productSchema.statics.searchProducts = function(query, options = {}) {
  const {
    category,
    minPrice,
    maxPrice,
    sortBy = 'createdAt',
    sortOrder = -1,
    limit = 20,
    skip = 0
  } = options;
  
  let searchQuery = {
    status: 'active',
    $text: { $search: query }
  };
  
  if (category) searchQuery.category = category;
  if (minPrice) searchQuery.salePrice = { $gte: minPrice };
  if (maxPrice) searchQuery.salePrice = { ...searchQuery.salePrice, $lte: maxPrice };
  
  return this.find(searchQuery)
    .sort({ [sortBy]: sortOrder })
    .limit(limit)
    .skip(skip)
    .populate('category', 'name')
    .populate('seller', 'firstName lastName sellerInfo.companyName');
};

// Method to increment view count
productSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  this.lastViewedAt = Date.now();
  return this.save();
};

// Method to add to cart analytics
productSchema.methods.incrementCartAdds = function() {
  this.analytics.cartAdds += 1;
  return this.save();
};

// Export the model
module.exports = mongoose.model('Product', productSchema);