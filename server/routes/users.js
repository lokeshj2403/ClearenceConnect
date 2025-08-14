/**
 * User Routes
 * 
 * Handles user profile and account management:
 * - Get user profile
 * - Update user profile
 * - Change password
 * - Manage wishlist
 * - Get user orders
 * - Account settings
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

/**
 * @route   GET /api/users/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate('wishlist', 'name images salePrice originalPrice discountPercentage')
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', [auth, upload.single('avatar')], [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please enter a valid Indian phone number'),
  body('address.pincode')
    .optional()
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage('Please enter a valid Indian pincode')
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

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Handle avatar upload
    if (req.file) {
      req.body.avatar = `/uploads/${req.file.filename}`;
    }

    // Update user fields
    const allowedUpdates = [
      'firstName', 'lastName', 'phone', 'dateOfBirth', 'gender',
      'address', 'avatar', 'preferences'
    ];

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'address' && typeof req.body[field] === 'object') {
          user.address = { ...user.address, ...req.body[field] };
        } else if (field === 'preferences' && typeof req.body[field] === 'object') {
          user.preferences = { ...user.preferences, ...req.body[field] };
        } else {
          user[field] = req.body[field];
        }
      }
    });

    await user.save();

    // Remove sensitive information
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: userResponse }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   PUT /api/users/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put('/change-password', auth, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Password confirmation does not match');
      }
      return true;
    })
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

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.userId).select('+password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while changing password',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/users/wishlist
 * @desc    Get user's wishlist
 * @access  Private
 */
router.get('/wishlist', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate({
        path: 'wishlist',
        populate: {
          path: 'seller',
          select: 'firstName lastName sellerInfo.companyName'
        }
      });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        wishlist: user.wishlist,
        total: user.wishlist.length
      }
    });

  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching wishlist',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   POST /api/users/wishlist/:productId
 * @desc    Add product to wishlist
 * @access  Private
 */
router.post('/wishlist/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if product is already in wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Product is already in wishlist'
      });
    }

    // Add to wishlist
    user.wishlist.push(productId);
    await user.save();

    // Update product analytics
    await product.incrementWishlistAdds();

    res.json({
      success: true,
      message: 'Product added to wishlist successfully'
    });

  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding to wishlist',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   DELETE /api/users/wishlist/:productId
 * @desc    Remove product from wishlist
 * @access  Private
 */
router.delete('/wishlist/:productId', auth, async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove from wishlist
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();

    res.json({
      success: true,
      message: 'Product removed from wishlist successfully'
    });

  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing from wishlist',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/users/orders
 * @desc    Get user's orders
 * @access  Private
 */
router.get('/orders', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const orders = await Order.getByCustomer(req.user.userId, {
      status,
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit)
    });

    // Get total count
    let countQuery = { customer: req.user.userId };
    if (status) countQuery.status = status;
    const total = await Order.countDocuments(countQuery);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalOrders: total,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * @route   GET /api/users/dashboard
 * @desc    Get user dashboard data
 * @access  Private
 */
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user with basic info
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get order statistics
    const orderStats = await Order.aggregate([
      { $match: { customer: userId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$total' }
        }
      }
    ]);

    // Get recent orders
    const recentOrders = await Order.find({ customer: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('items.product', 'name images');

    // Get wishlist count
    const wishlistCount = user.wishlist.length;

    res.json({
      success: true,
      data: {
        user: {
          name: user.fullName,
          email: user.email,
          userType: user.userType,
          avatar: user.avatar,
          memberSince: user.createdAt
        },
        stats: {
          orders: orderStats,
          wishlistCount,
          totalSpent: orderStats.reduce((sum, stat) => sum + (stat.totalAmount || 0), 0)
        },
        recentOrders
      }
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;