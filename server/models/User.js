/**
 * User Model
 * 
 * Defines the schema for users in the system (both customers and sellers)
 * Includes authentication fields, profile information, and user preferences
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email address'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  
  // User Type and Status
  userType: {
    type: String,
    enum: ['customer', 'seller', 'admin'],
    default: 'customer'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  // Contact Information
  phone: {
    type: String,
    trim: true,
    match: [/^[6-9]\d{9}$/, 'Please enter a valid Indian phone number']
  },
  
  // Address Information
  address: {
    street: String,
    city: String,
    state: String,
    pincode: {
      type: String,
      match: [/^[1-9][0-9]{5}$/, 'Please enter a valid Indian pincode']
    },
    country: {
      type: String,
      default: 'India'
    }
  },
  
  // Profile Information
  avatar: {
    type: String,
    default: null
  },
  dateOfBirth: Date,
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say']
  },
  
  // Shopping Preferences (for customers)
  preferences: {
    categories: [String],
    priceRange: {
      min: Number,
      max: Number
    },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      push: { type: Boolean, default: true }
    }
  },
  
  // Seller Information (if userType is 'seller')
  sellerInfo: {
    companyName: String,
    companyType: String,
    registrationNumber: String,
    gstNumber: String,
    panNumber: String,
    establishedYear: Number,
    contactPerson: String,
    designation: String,
    businessCategory: String,
    productCategories: [String],
    manufacturingCapacity: String,
    warehouseLocation: String,
    bankDetails: {
      bankName: String,
      accountNumber: String,
      ifscCode: String,
      accountHolderName: String
    },
    documents: [String], // Array of document file paths
    isVerified: { type: Boolean, default: false },
    applicationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    appliedAt: Date,
    approvedAt: Date,
    rejectedAt: Date,
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: String,
    rating: { type: Number, default: 0 },
    totalSales: { type: Number, default: 0 }
  },
  
  // Authentication & Security
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  
  // Social Authentication
  socialAuth: {
    googleId: String,
    facebookId: String,
    provider: String
  },
  
  // Wishlist and Cart
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  
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

// Indexes for better query performance
userSchema.index({ email: 1 });
userSchema.index({ userType: 1 });
userSchema.index({ 'sellerInfo.isVerified': 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    // Hash password with salt rounds of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update updatedAt
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Export the model
module.exports = mongoose.model('User', userSchema);