/**
 * Seller Authentication Middleware
 * 
 * Verifies that the authenticated user is a seller
 * Should be used after the main auth middleware
 */

const User = require('../models/User');

/**
 * Seller authentication middleware
 * Checks if authenticated user is a seller
 * Must be used after auth middleware
 */
const sellerAuth = async (req, res, next) => {
  try {
    // Check if user is authenticated (should be set by auth middleware)
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Get full user details
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if user is a seller
    if (user.userType !== 'seller') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Seller account required.'
      });
    }

    // Check if seller is verified (optional - can be removed if unverified sellers should have access)
    if (!user.sellerInfo?.isVerified) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Seller account is not verified yet. Please wait for admin approval.'
      });
    }

    // Attach seller info to request
    req.seller = {
      sellerId: user._id,
      companyName: user.sellerInfo.companyName,
      isVerified: user.sellerInfo.isVerified,
      rating: user.sellerInfo.rating || 0
    };

    next();

  } catch (error) {
    console.error('Seller auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during seller authentication',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = sellerAuth;