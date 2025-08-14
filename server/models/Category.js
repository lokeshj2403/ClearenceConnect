/**
 * Category Model
 * 
 * Defines the schema for product categories in the marketplace
 * Supports hierarchical categories with parent-child relationships
 */

const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  // Basic Category Information
  name: {
    type: String,
    required: [true, 'Category name is required'],
    trim: true,
    unique: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Category Hierarchy
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  level: {
    type: Number,
    default: 0 // 0 for root categories, 1 for subcategories, etc.
  },
  
  // Category Display
  icon: {
    type: String, // Icon class name or URL
    default: 'ri-folder-line'
  },
  image: {
    type: String, // Category image URL
    default: null
  },
  color: {
    type: String, // Hex color code for category theme
    default: '#FF4C4C'
  },
  
  // SEO and URL
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  
  // Category Status
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  // Category Metrics
  productCount: {
    type: Number,
    default: 0
  },
  
  // Display Order
  sortOrder: {
    type: Number,
    default: 0
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for better performance
categorySchema.index({ name: 1 });
categorySchema.index({ slug: 1 });
categorySchema.index({ parent: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ isFeatured: -1, sortOrder: 1 });

// Virtual for full path (breadcrumb)
categorySchema.virtual('fullPath').get(function() {
  // This would need to be populated with parent data
  return this.name;
});

// Pre-save middleware to generate slug and update timestamps
categorySchema.pre('save', function(next) {
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

// Static method to get root categories
categorySchema.statics.getRootCategories = function() {
  return this.find({ parent: null, isActive: true })
    .sort({ sortOrder: 1, name: 1 });
};

// Static method to get subcategories
categorySchema.statics.getSubcategories = function(parentId) {
  return this.find({ parent: parentId, isActive: true })
    .sort({ sortOrder: 1, name: 1 });
};

// Static method to get featured categories
categorySchema.statics.getFeatured = function(limit = 10) {
  return this.find({ isFeatured: true, isActive: true })
    .limit(limit)
    .sort({ sortOrder: 1 });
};

// Method to get category hierarchy
categorySchema.methods.getHierarchy = async function() {
  const hierarchy = [this];
  let current = this;
  
  while (current.parent) {
    current = await this.constructor.findById(current.parent);
    if (current) {
      hierarchy.unshift(current);
    } else {
      break;
    }
  }
  
  return hierarchy;
};

// Method to get all descendants
categorySchema.methods.getDescendants = async function() {
  const descendants = [];
  
  const findChildren = async (parentId) => {
    const children = await this.constructor.find({ parent: parentId });
    for (const child of children) {
      descendants.push(child);
      await findChildren(child._id);
    }
  };
  
  await findChildren(this._id);
  return descendants;
};

// Export the model
module.exports = mongoose.model('Category', categorySchema);