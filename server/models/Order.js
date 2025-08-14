/**
 * Order Model
 * 
 * Defines the schema for customer orders in the marketplace
 * Includes order items, shipping, payment, and status tracking
 */

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  // Order Identification
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  
  // Customer Information
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Customer is required']
  },
  
  // Order Items
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    image: String,
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative']
    },
    originalPrice: {
      type: Number,
      required: true
    },
    discount: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    }
  }],
  
  // Order Totals
  subtotal: {
    type: Number,
    required: true,
    min: [0, 'Subtotal cannot be negative']
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: [0, 'Shipping cost cannot be negative']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  total: {
    type: Number,
    required: true,
    min: [0, 'Total cannot be negative']
  },
  
  // Shipping Information
  shippingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  
  // Billing Information
  billingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  
  // Order Status
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed',
      'processing',
      'shipped',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'returned',
      'refunded'
    ],
    default: 'pending'
  },
  
  // Payment Information
  payment: {
    method: {
      type: String,
      enum: ['cod', 'online', 'wallet', 'upi'],
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    transactionId: String,
    paymentGateway: String,
    paidAt: Date,
    refundedAt: Date,
    refundAmount: Number
  },
  
  // Shipping Information
  shipping: {
    method: {
      type: String,
      enum: ['standard', 'express', 'overnight'],
      default: 'standard'
    },
    carrier: String,
    trackingNumber: String,
    estimatedDelivery: Date,
    shippedAt: Date,
    deliveredAt: Date
  },
  
  // Order Timeline
  timeline: [{
    status: {
      type: String,
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Notes and Comments
  customerNotes: String,
  adminNotes: String,
  
  // Cancellation/Return Information
  cancellation: {
    reason: String,
    requestedAt: Date,
    approvedAt: Date,
    refundAmount: Number
  },
  
  return: {
    reason: String,
    requestedAt: Date,
    approvedAt: Date,
    returnTrackingNumber: String,
    refundAmount: Number
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
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customer: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'items.seller': 1 });
orderSchema.index({ 'payment.status': 1 });

// Pre-save middleware to generate order number and update timestamps
orderSchema.pre('save', function(next) {
  // Generate order number if not exists
  if (!this.orderNumber) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `CC${timestamp}${random}`;
  }
  
  this.updatedAt = Date.now();
  next();
});

// Method to add timeline entry
orderSchema.methods.addTimelineEntry = function(status, message, updatedBy = null) {
  this.timeline.push({
    status,
    message,
    timestamp: new Date(),
    updatedBy
  });
  
  this.status = status;
  return this.save();
};

// Method to calculate totals
orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
  this.total = this.subtotal + this.shippingCost + this.tax - this.discount;
  return this;
};

// Static method to get orders by customer
orderSchema.statics.getByCustomer = function(customerId, options = {}) {
  const { status, limit = 20, skip = 0 } = options;
  
  let query = { customer: customerId };
  if (status) query.status = status;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('items.product', 'name images')
    .populate('customer', 'firstName lastName email');
};

// Static method to get orders by seller
orderSchema.statics.getBySeller = function(sellerId, options = {}) {
  const { status, limit = 20, skip = 0 } = options;
  
  let query = { 'items.seller': sellerId };
  if (status) query.status = status;
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip)
    .populate('items.product', 'name images')
    .populate('customer', 'firstName lastName email');
};

// Export the model
module.exports = mongoose.model('Order', orderSchema);