/**
 * Order Routes
 * 
 * Handles order management:
 * - Create new order
 * - Get order details
 * - Update order status
 * - Cancel order
 * - Return order
 * - Order tracking
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private
 */
router.post('/', auth, [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Order must contain at least one item'),
  body('items.*.product')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('items.*.quantity')
    .isInt({ min: 1 })
    .withMessage('Quantity must be at least 1'),
  body('shippingAddress.firstName')
    .trim()
    .notEmpty()
    .withMessage('First name is required'),
  body('shippingAddress.lastName')
    .trim()
    .notEmpty()
    .withMessage('Last name is required'),
  body('shippingAddress.email')
    .isEmail()
    .withMessage('Valid email is required'),
  body('shippingAddress.phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Valid Indian phone number is required'),
  body('shippingAddress.street')
    .trim()
    .notEmpty()
    .withMessage('Street address is required'),
  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required'),
  body('shippingAddress.state')
    .trim()
    .notEmpty()
    .withMessage('State is required'),
  body('shippingAddress.pincode')
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage('Valid Indian pincode is required'),
  body('payment.method')
    .isIn(['cod', 'online', 'wallet', 'upi'])
    .withMessage('Valid payment method is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { items, shippingAddress, billingAddress, payment, customerNotes } = req.body;

    // Validate and process order items
    const processedItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product)
        .populate('seller', 'firstName lastName sellerInfo.companyName');

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.product} not found`
        });
      }

      if (product.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: `Product "${product.name}" is not available`
        });
      }

      if (product.stock.available < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for product "${product.name}". Available: ${product.stock.available}`
        });
      }

      const itemTotal = product.salePrice * item.quantity;
      const discount = (product.originalPrice - product.salePrice) * item.quantity;

      processedItems.push({
        product: product._id,
        seller: product.seller._id,
        name: product.name,
        image: product.images[0]?.url,
        quantity: item.quantity,
        price: product.salePrice,
        originalPrice: product.originalPrice,
        discount: discount,
        total: itemTotal
      });

      subtotal += itemTotal;

      // Reserve stock
      product.stock.reserved += item.quantity;
      await product.save();
    }

    // Calculate totals
    const shippingCost = subtotal >= 500 ? 0 : 50; // Free shipping above ₹500
    const tax = Math.round(subtotal * 0.18); // 18% GST
    const total = subtotal + shippingCost + tax;

    // Create order
    const order = new Order({
      customer: req.user.userId,
      items: processedItems,
      subtotal,
      shippingCost,
      tax,
      total,
      shippingAddress,
      billingAddress: billingAddress || shippingAddress,
      payment: {
        method: payment.method,
        status: payment.method === 'cod' ? 'pending' : 'pending'
      },
      customerNotes
    });

    await order.save();

    // Add initial timeline entry
    await order.addTimelineEntry('pending', 'Order placed successfully', req.user.userId);

    // Populate order for response
    await order.populate('items.product', 'name images');
    await order.populate('customer', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/orders/:id
 * @desc    Get order details
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name images')
      .populate('customer', 'firstName lastName email')
      .populate('items.seller', 'firstName lastName sellerInfo.companyName');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user has permission to view this order
    if (order.customer._id.toString() !== req.user.userId && req.user.userType !== 'admin') {
      // Check if user is a seller of any item in this order
      const isSellerOfItem = order.items.some(item => 
        item.seller._id.toString() === req.user.userId
      );

      if (!isSellerOfItem) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this order'
        });
      }
    }

    res.json({
      success: true,
      data: { order }
    });

  } catch (error) {
    console.error('Get order error:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while fetching order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status (sellers and admin only)
 * @access  Private
 */
router.put('/:id/status', auth, [
  body('status')
    .isIn(['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'])
    .withMessage('Invalid order status'),
  body('message')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Message cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, message, trackingNumber } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check permissions
    const isSellerOfItem = order.items.some(item => 
      item.seller.toString() === req.user.userId
    );

    if (req.user.userType !== 'admin' && !isSellerOfItem) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update this order'
      });
    }

    // Update order status
    const statusMessage = message || `Order status updated to ${status}`;
    await order.addTimelineEntry(status, statusMessage, req.user.userId);

    // Update shipping info if tracking number provided
    if (trackingNumber && status === 'shipped') {
      order.shipping.trackingNumber = trackingNumber;
      order.shipping.shippedAt = new Date();
    }

    if (status === 'delivered') {
      order.shipping.deliveredAt = new Date();
    }

    await order.save();

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/orders/:id/cancel
 * @desc    Cancel order (customer only, within allowed time)
 * @access  Private
 */
router.post('/:id/cancel', auth, [
  body('reason')
    .trim()
    .notEmpty()
    .withMessage('Cancellation reason is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { reason } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order
    if (order.customer.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own orders'
      });
    }

    // Check if order can be cancelled
    if (!['pending', 'confirmed'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    // Update order
    order.cancellation = {
      reason,
      requestedAt: new Date(),
      approvedAt: new Date()
    };

    await order.addTimelineEntry('cancelled', `Order cancelled by customer. Reason: ${reason}`, req.user.userId);

    // Release reserved stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock.reserved -= item.quantity;
        await product.save();
      }
    }

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/orders/:id/track
 * @desc    Track order status
 * @access  Public (with order number)
 */
router.get('/:id/track', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .select('orderNumber status timeline shipping createdAt')
      .populate('customer', 'firstName lastName');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        status: order.status,
        timeline: order.timeline,
        shipping: order.shipping,
        createdAt: order.createdAt,
        customerName: order.customer.firstName + ' ' + order.customer.lastName
      }
    });

  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while tracking order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;